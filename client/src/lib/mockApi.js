// Frontend-only mock API. Stores data in localStorage per userId+sessionId.
// It returns real Response objects so existing fetch handling continues to work.

function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function errorResponse(status = 400, message = "Bad Request") {
  return new Response(message, { status });
}

function loadStore() {
  try {
    const raw = localStorage.getItem("__mock_billing_store__");
    return raw ? JSON.parse(raw) : { bills: {}, billMeta: {} };
  } catch {
    return { bills: {}, billMeta: {} };
  }
}

function saveStore(store) {
  localStorage.setItem("__mock_billing_store__", JSON.stringify(store));
}

function keyFor(userId, sessionId) {
  return `${userId}::${sessionId}`;
}

function randomId(prefix = "id_") {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// --------- Route handlers ---------
async function handleAuth(method, url, body) {
  if (method === "POST" && url === "/api/auth/login") {
    const { username } = body || {};
    const user = { id: randomId("user_"), name: username || "User" };
    const sessionId = randomId("sess_");
    return jsonResponse({ user, sessionId });
  }

  return errorResponse(404, "Not Found");
}

async function handleBillItems(method, url, body) {
  const store = loadStore();

  // GET /api/bill-items/:userId/:sessionId
  const getMatch = url.match(/^\/api\/bill-items\/([^/]+)\/([^/]+)$/);
  if (method === "GET" && getMatch) {
    const [, userId, sessionId] = getMatch;
    const k = keyFor(userId, sessionId);
    const items = store.bills[k] || [];
    return jsonResponse(items);
  }

  // POST /api/bill-items
  if (method === "POST" && url === "/api/bill-items") {
    const { userId, sessionId, name, quantity, rate, amount } = body || {};
    if (!userId || !sessionId || !name) return errorResponse(400, "Missing fields");
    const k = keyFor(userId, sessionId);
    const item = {
      id: randomId("itm_"),
      name,
      quantity,
      rate,
      amount,
    };
    store.bills[k] = store.bills[k] || [];
    store.bills[k].push(item);
    saveStore(store);
    return jsonResponse(item, { status: 201 });
  }

  // DELETE /api/bill-items/:id
  const delById = url.match(/^\/api\/bill-items\/([^/]+)$/);
  if (method === "DELETE" && delById) {
    const [, id] = delById;
    let removed = false;
    for (const k of Object.keys(store.bills)) {
      const before = store.bills[k].length;
      store.bills[k] = store.bills[k].filter((it) => it.id !== id);
      if (store.bills[k].length !== before) removed = true;
    }
    saveStore(store);
    return removed ? new Response(null, { status: 204 }) : errorResponse(404, "Not Found");
  }

  // DELETE /api/bill-items/:userId/:sessionId/clear
  const clearMatch = url.match(/^\/api\/bill-items\/([^/]+)\/([^/]+)\/clear$/);
  if (method === "DELETE" && clearMatch) {
    const [, userId, sessionId] = clearMatch;
    const k = keyFor(userId, sessionId);
    if (store.bills[k]) {
      store.bills[k] = [];
      saveStore(store);
      return new Response(null, { status: 204 });
    }
    return errorResponse(404, "Not Found");
  }

  return errorResponse(404, "Not Found");
}

async function handleBill(method, url, body) {
  // POST /api/bill
  if (method === "POST" && url === "/api/bill") {
    const { userId, sessionId, customerPhone, totalAmount, status } = body || {};
    if (!userId || !sessionId) return errorResponse(400, "Missing fields");
    const store = loadStore();
    const k = keyFor(userId, sessionId);
    store.billMeta[k] = { customerPhone: customerPhone || null, totalAmount: totalAmount || 0, status: status || "active", updatedAt: Date.now() };
    saveStore(store);
    return jsonResponse({ success: true });
  }
  return errorResponse(404, "Not Found");
}

// --------- Router ---------
export default async function mockApiRequest(method, url, data) {
  const body = data ?? null;

  if (url.startsWith("/api/auth/")) return handleAuth(method, url, body);
  if (url.startsWith("/api/bill-items")) return handleBillItems(method, url, body);
  if (url.startsWith("/api/bill")) return handleBill(method, url, body);

  return errorResponse(404, "Not Found");
}

export async function mockApiGet(url) {
  return mockApiRequest("GET", url, null);
}
