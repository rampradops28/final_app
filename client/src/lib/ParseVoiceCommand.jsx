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
      // 1) add <name> <qty> <unit> <price>[ rs|₹]
      //    example: add tomato 50 piece 5
      let m = t.match(/add\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|grams?|g|pieces?|items?|units?|piece|packets?|packet|packs?|pack|boxes?|box|pcs?|pc|pkts?|pkt|liters?|liter|litres?|litre|l)\s+(\d+(?:\.\d+)?)(?:\s*(?:rs\.?|₹))?/i);
      if (m) {
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
          message: `Add ${itemName} ${qty} ${unit} ₹${rate}`,
        };
      }

      // 2) add <name> <qty> <unit> (for)? (rs|₹)? <price>[ rs|₹]
      m = t.match(/add\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|grams?|g|pieces?|items?|units?|piece|packets?|packet|packs?|pack|boxes?|box|pcs?|pc|pkts?|pkt|liters?|liter|litres?|litre|l)\s+(?:for\s+)?(?:(?:rs\.?|₹)?\s*)?(\d+(?:\.\d+)?)(?:\s*(?:rs\.?|₹))?/i);
      if (m) {
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
          message: `Add ${itemName} ${qty} ${unit} ₹${rate}`,
        };
      }

      // 3) add <name> (rs|₹)? <price>[ rs|₹] <qty> <unit>  (price-first)
      m = t.match(/add\s+(.+?)\s+(?:(?:rs\.?|₹)?\s*)?(\d+(?:\.\d+)?)(?:\s*(?:rs\.?|₹))?\s+(\d+(?:\.\d+)?)\s*(kg|grams?|g|pieces?|items?|units?|piece|packets?|packet|packs?|pack|boxes?|box|pcs?|pc|pkts?|pkt|liters?|liter|litres?|litre|l)/i);
      if (m) {
        const [, name, priceStr, qtyStr, unitRaw] = m;
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
          message: `Add ${itemName} ${qty} ${unit} ₹${rate}`,
        };
      }

      // 4) add <name> <price>[ rs|₹] <qty> <unit>  (no explicit marker order)
      m = t.match(/add\s+(.+?)\s+(\d+(?:\.\d+)?)(?:\s*(?:rs\.?|₹))?\s+(\d+(?:\.\d+)?)\s*(kg|grams?|g|pieces?|items?|units?|piece|packets?|packet|packs?|pack|boxes?|box|pcs?|pc|pkts?|pkt|liters?|liter|litres?|litre|l)/i);
      if (m) {
        const [, name, n1, n2, unitRaw] = m;
        // Heuristic: the number closest to the unit is quantity
        const qty = parseNumberLike(n2) ?? 1;
        const unit = normalizeUnit(unitRaw) || "piece";
        const rate = parseNumberLike(n1) ?? extractPrice(t);
        if (!rate) return null;
        const itemName = cap(name.trim());
        return {
          name: itemName,
          quantityRaw: `${qty} ${unit}`,
          quantityNumber: qty,
          unit,
          rateNumber: rate,
          message: `Add ${itemName} ${qty} ${unit} ₹${rate}`,
        };
      }

      // 5) add <name> for <price>[ rs|₹] (defaults to 1 piece)
      m = t.match(/add\s+(.+?)\s+(?:for\s+)?(?:(?:rs\.?|₹)?\s*)?(\d+(?:\.\d+)?)(?:\s*(?:rs\.?|₹)|\s*rupees?)?/i);
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

      return null;
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

// --------------------------------------------------
// Grocery dictionary + fuzzy matching (EN + TA)
// --------------------------------------------------
const EN_PRODUCTS = [
  "tomato","potato","onion","carrot","cabbage","cauliflower","spinach","coriander","ginger","garlic",
  "chilli","capsicum","cucumber","brinjal","lady finger","okra","beetroot","pumpkin","bottle gourd","bitter gourd",
  "apple","banana","orange","grapes","mango","papaya","pomegranate","watermelon","guava",
  "rice","wheat","atta","flour","sugar","salt","oil","ghee","butter","milk","curd","paneer","cheese",
  "egg","bread","biscuit","noodles","pasta","tea","coffee","masala","turmeric","cumin","mustard","pepper",
  "dal","toor dal","urad dal","chana dal","green gram","black gram","chickpea","sooji","rava","poha",
  "soap","shampoo","toothpaste","detergent"
];

// Tamil canonical → English mapping (with common transliterations)
const TA_TO_EN = {
  "தக்காளி": "tomato",
  "உருளைக்கிழங்கு": "potato",
  "வெங்காயம்": "onion",
  "காரட்": "carrot",
  "முட்டைகோஸ்": "cabbage",
  "பீட்ரூட்": "beetroot",
  "பூசணிக்காய்": "pumpkin",
  "பாகற்காய்": "bitter gourd",
  "சப்ஸிகம்": "capsicum",
  "வெள்ளரிக்காய்": "cucumber",
  "கத்தரிக்காய்": "brinjal",
  "வெந்தயம்": "fenugreek",
  "அரிசி": "rice",
  "கோதுமை": "wheat",
  "மாவு": "flour",
  "சர்க்கரை": "sugar",
  "உப்பு": "salt",
  "எண்ணெய்": "oil",
  "பால்": "milk",
  "முட்டை": "egg",
  "வாழைப்பழம்": "banana",
  "ஆப்பிள்": "apple",
};

const TA_TRANSLIT_TO_EN = {
  "thakkali": "tomato",
  "urulaikilangu": "potato",
  "venkayam": "onion",
  "kaarat": "carrot",
  "muttaikose": "cabbage",
  "vellarikkai": "cucumber",
  "katharikkai": "brinjal",
  "arisi": "rice",
  "gothumai": "wheat",
  "sarkkarai": "sugar",
  "uppu": "salt",
  "ennai": "oil",
  "paal": "milk",
  "mutta": "egg",
  "vaazhaipazham": "banana",
};

const CORRECTIONS = {
  // Frequent English mis-hearings
  "character": "carrot",
  "tomoto": "tomato",
  "pototo": "potato",
  "onian": "onion",
  // Tamil-ish to English
  "thakali": "tomato",
  "urulai kilangu": "potato",
};

function levenshtein(a, b) {
  const s = a.toLowerCase();
  const t = b.toLowerCase();
  const m = s.length, n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

function normalizeProductName(rawName, languageMode = "mixed") {
  if (!rawName) return rawName;
  let name = String(rawName).toLowerCase().trim();
  if (CORRECTIONS[name]) name = CORRECTIONS[name];

  const mode = languageMode === "ta-IN" ? "ta" : languageMode === "en-US" ? "en" : "mixed";

  // Direct Tamil canonical
  if (mode !== "en" && TA_TO_EN[name]) return TA_TO_EN[name];
  // Direct transliteration
  if (mode !== "en" && TA_TRANSLIT_TO_EN[name]) return TA_TRANSLIT_TO_EN[name];

  const candidates = new Set(EN_PRODUCTS);
  if (mode !== "en") {
    Object.values(TA_TO_EN).forEach((v) => candidates.add(v));
  }

  // Token-wise search: pick best candidate by min normalized distance
  let best = { item: name, score: Infinity };
  for (const cand of candidates) {
    const dist = levenshtein(name, cand);
    const norm = dist / Math.max(3, Math.max(name.length, cand.length));
    if (norm < best.score) best = { item: cand, score: norm };
  }

  // Threshold to avoid wild mismatches (tuneable)
  if (best.score <= 0.45) return best.item;
  return name;
}

function preprocess(text, languageMode = "mixed") {
  let t = String(text || "").toLowerCase().trim();
  // Light-weight corrections on whole text
  t = t.replace(/\bcharacter\b/g, "carrot");
  t = t.replace(/\btomoto\b/g, "tomato");
  // Maintain original otherwise
  return t;
}

export function parseVoiceCommand(command, options = {}) {
  const languageMode = options.languageMode || "mixed";
  const text = preprocess(command, languageMode);
  for (const intent of intents) {
    if (!intent.test(text)) continue;
    // Wrap extractor to post-normalize product names where applicable
    const entities = intent.extract(text);
    if (entities) {
      if (entities.name) {
        entities.name = cap(normalizeProductName(entities.name, languageMode));
      }
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
  const result = parseVoiceCommand(command, { languageMode: settings?.languageMode || "mixed" });
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
      } else if (context?.toast) {
        context.toast({ title: "Wrong command", description: "Try: add tomato 1 piece 5", variant: "destructive" });
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
      if (context?.toast) context.toast({ title: "Wrong command", description: "Say 'help' to hear supported commands", variant: "destructive" });
      break;
  }

  return result;
}
