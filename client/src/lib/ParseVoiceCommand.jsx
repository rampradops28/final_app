import { speakText } from "./SpeechSynthesis";

// -----------------------------
// Normalizers & helpers
// -----------------------------
const UNIT_ALIASES = {
  kg: ["kg", "kgs", "kilogram", "kilograms"],
  g: ["g", "gram", "grams"],
  piece: ["piece", "pieces", "pc", "pcs", "item", "items", "unit", "units"],
  packet: ["packet", "packets", "pkt"],
  box: ["box", "boxes"],
  liter: ["l", "liter", "liters", "litre", "litres"],
};

function normalizeUnit(u) {
  if (!u) return undefined;
  const s = String(u).toLowerCase();
  for (const [canon, list] of Object.entries(UNIT_ALIASES)) {
    if (list.includes(s)) return canon;
  }
  return s;
}

function parseNumberLike(s) {
  if (s == null) return undefined;
  const n = Number(String(s).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function extractPrice(text) {
  // matches: 120, 120.50, rs 120, ₹120, 120 rupees
  const m = text.match(/(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)(?:\s*rupees?)?/i);
  if (!m) return undefined;
  return parseNumberLike(m[1]);
}

function cap(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// -----------------------------
// Structured intents
// -----------------------------
// Each intent returns: { intent, entities, success, confidence, message }

const intents = [
  {
    name: "add_item",
    test: (t) => /\b(add|insert|put|include)\b/.test(t),
    extract: (t) => {
      // Patterns tried in order
      // 1) add <name> <qty> <unit> <price>
      //    example: add potato 1 piece 50
      let m = t.match(/add\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|grams?|g|pieces?|items?|units?|piece|packets?|packet|boxes?|box|liters?|liter|litres?|litre|l)\s+(\d+(?:\.\d+)?)/i);
      if (!m) {
        // 2) add <name> <qty> <unit?> for <price> (rupees)
        m = t.match(/add\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|grams?|g|pieces?|items?|units?|piece|packets?|packet|boxes?|box|liters?|liter|litres?|litre|l)?\s+(?:for\s+)?(?:(?:rs\.?|₹)?\s*)?(\d+(?:\.\d+)?)(?:\s*rupees?)?/i);
      }
      if (!m) {
        // 3) add <name> for <price>
        m = t.match(/add\s+(.+?)\s+(?:for\s+)?(?:(?:rs\.?|₹)?\s*)?(\d+(?:\.\d+)?)(?:\s*rupees?)?/i);
        if (m) {
          const name = m[1].trim();
          const rate = parseNumberLike(m[2]);
          return {
            name: cap(name),
            quantityRaw: "1 piece",
            quantityNumber: 1,
            unit: "piece",
            rateNumber: rate,
            message: `Added 1 piece of ${cap(name)} for ₹${rate}`,
          };
        }
      }
      if (!m) return null;

      const [, name, qtyStr, unitRaw, priceStr] = m;
      const qty = parseNumberLike(qtyStr) ?? 1;
      const unit = normalizeUnit(unitRaw) || "piece";
      const rate = parseNumberLike(priceStr) ?? extractPrice(t);
      if (!rate) return null;
      const itemName = cap(name.trim());
      return {
        name: itemName,
        quantityRaw: `${qty} ${unit}`,
        quantityNumber: qty,
        unit,
        rateNumber: rate,
        // Message in required structure
        message: `Add ${itemName} ${qty} ${unit} ₹${rate}`,
      };
    },
  },
  {
    name: "remove_item",
    test: (t) => /\b(remove|delete)\b/.test(t),
    extract: (t) => {
      const m = t.match(/(?:remove|delete)\s+(.+)/i);
      if (!m) return null;
      const name = cap(m[1].trim());
      return { name, message: `Removed ${name} from bill` };
    },
  },
  {
    name: "reset_bill",
    test: (t) => /(reset|clear).*(bill|cart)/.test(t),
    extract: () => ({ message: "Bill has been reset" }),
  },
  {
    name: "generate_invoice",
    test: (t) => /(generate|create|make).*(invoice|bill|pdf)/.test(t),
    extract: () => ({ message: "Generating invoice" }),
  },
  {
    name: "get_total",
    test: (t) => /(total|amount|sum|balance)/.test(t),
    extract: () => ({ message: "Getting total amount" }),
  },
  {
    name: "learning_mode",
    test: (t) => /(learn|study)/.test(t),
    extract: () => ({ message: "Switching to learning mode" }),
  },
  {
    name: "stop_listening",
    test: (t) => /(stop|pause).*(listen|listening)?/.test(t),
    extract: () => ({ message: "Stopping voice recognition" }),
  },
  {
    name: "list_items",
    test: (t) => /(list|show|display).*(items|bill|cart)/.test(t),
    extract: () => ({ message: "Listing current bill items" }),
  },
  {
    name: "remove_last",
    test: (t) => /(remove|delete).*(last|previous)\s*(item)?/.test(t),
    extract: () => ({ message: "Removed last item" }),
  },
  {
    name: "help",
    test: (t) => /(help|what can you do|commands)/.test(t),
    extract: () => ({ message: "You can say: add item, remove item, list items, clear bill, get total, generate invoice." }),
  },
];

export function parseVoiceCommand(command) {
  const text = String(command || "").toLowerCase().trim();
  for (const intent of intents) {
    if (!intent.test(text)) continue;
    const entities = intent.extract(text);
    if (entities) {
      return {
        intent: intent.name,
        entities,
        success: true,
        confidence: 0.9,
        message: entities.message,
      };
    }
  }

  return {
    intent: "unknown",
    entities: {},
    success: false,
    confidence: 0.2,
    message: `Command "${command}" not recognized`,
  };
}

export function handleVoiceCommand(command, context, settings) {
  const result = parseVoiceCommand(command);
  const shouldSpeak = settings?.voiceFeedback !== false;

  const getOrderSummary = () => {
    try {
      const items = context?.billItems || [];
      const count = items.length;
      if (count === 0) return "Your order is empty.";
      const parts = items.slice(0, 5).map((it, idx) => {
        const name = it?.name ?? "item";
        const qty = it?.quantity ?? "1";
        const rate = typeof it?.rate === "number" ? it.rate : Number(it?.rate) || 0;
        return `${idx + 1}) ${qty} ${name} at ₹${rate}`;
      });
      const more = items.length > 5 ? ` and ${items.length - 5} more items` : "";
      const total = typeof context?.totalAmount === "number" ? context.totalAmount : Number(context?.totalAmount) || 0;
      return `You now have ${count} ${count === 1 ? "item" : "items"}: ${parts.join(", ")}${more}. Total is ₹${total.toFixed(2)}.`;
    } catch (_) {
      return "";
    }
  };

  switch (result.intent) {
    case "add_item": {
      const e = result.entities;
      if (e?.name && e?.quantityRaw && typeof e?.rateNumber === "number") {
        context.addItem(e.name, e.quantityRaw, e.rateNumber);
        if (shouldSpeak) speakText(`${result.message || "Item added to bill"}. ${getOrderSummary()}`);
      }
      break;
    }

    case "remove_item": {
      const e = result.entities;
      if (e?.name) {
        context.removeItem("", e.name);
        if (shouldSpeak) speakText(`${result.message || "Item removed from bill"}. ${getOrderSummary()}`);
      }
      break;
    }

    case "reset_bill":
      context.clearBill();
      if (shouldSpeak) speakText(`${result.message || "Bill has been reset"}. ${getOrderSummary()}`);
      break;

    case "generate_invoice":
      context.generateInvoice();
      if (shouldSpeak) speakText(result.message || "Generating invoice");
      break;

    case "get_total":
      if (shouldSpeak) speakText(`Total amount is ₹${context.totalAmount.toFixed(2)}`);
      break;

    case "stop_listening":
      context.stopListening();
      if (shouldSpeak) speakText("Voice recognition stopped");
      break;

    case "learning_mode":
      if (shouldSpeak) speakText("Switching to learning assistant mode");
      break;

    case "list_items": {
      const msg = result.message || "Here are your items";
      const sum = getOrderSummary();
      if (shouldSpeak) speakText(`${msg}. ${sum}`);
      break;
    }

    case "remove_last": {
      const items = context?.billItems || [];
      const last = items[items.length - 1];
      if (last?.id) {
        context.removeItem(last.id);
        if (shouldSpeak) speakText(`${result.message || "Removed last item"}. ${getOrderSummary()}`);
      } else if (shouldSpeak) {
        speakText("No items to remove");
      }
      break;
    }

    case "help":
      if (shouldSpeak)
        speakText(
          "Try: add potato 1 piece 50, remove potato, list items, clear bill, get total, generate invoice, stop listening."
        );
      break;

    default:
      if (shouldSpeak) speakText("Command not recognized. Please try again.");
      break;
  }

  return result;
}
