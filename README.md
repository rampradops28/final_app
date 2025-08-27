# VoiceBill Pro

A full‑stack voice-enabled billing app. Speak natural commands to add/remove items, generate invoices, and get totals. Includes a structured command parser, Tailwind UI, and an Express backend.

## Key Features

- **Voice commands**: Add/remove items, reset bill, get totals, generate invoice.
- **Structured parser**: Intent/entity extraction for robust command parsing.
- **Voice feedback toggle**: When enabled, the assistant repeats orders after updates.
- **Modern UI**: Tailwind CSS with reusable components (tables, tabs, inputs, etc.).
- **PDF generation**: Create and download invoice PDFs.
- **Stats & SMS (stub)**: Quick stats panel and SMS integration placeholder.
- **Dev flexibility**: Single-server (Express + Vite middleware) or dual-server with Vite proxy.

## Tech Stack

- **Frontend**: Vite + React, Tailwind CSS, lucide-react icons
- **State/Networking**: @tanstack/react-query
- **Voice**: Web Speech API (recognition + synthesis)
- **Validation**: Zod (pure)
- **Backend**: Node.js + Express, in-memory storage (demo)
- **Build/Dev**: Vite (ESM), PostCSS, Autoprefixer

## Project Structure

```
voice_app_replit/
├─ client/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ ui/                 # Minimal UI primitives (table, tabs, button, card, label, input, switch)
│  │  │  ├─ BillingInterface.jsx
│  │  │  ├─ VoiceControlPanel.jsx
│  │  │  ├─ LearningAssistant.jsx
│  │  │  └─ …
│  │  ├─ hooks/
│  │  │  ├─ useAuth.js
│  │  │  ├─ useBilling.js / UseBilling.jsx (naming may vary)
│  │  │  └─ useVoiceRecognition.js
│  │  ├─ lib/
│  │  │  ├─ ParseVoiceCommand.jsx   # Structured intent/entity parser + handler
│  │  │  ├─ GenerateInvoicePDF.js
│  │  │  └─ speechSynthesis.js
│  │  ├─ pages/
│  │  │  └─ DashboardPage.jsx       # Main app page wiring voice + billing
│  │  └─ index.css                  # Tailwind CSS variables and base styles
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  └─ vite.config.js                # ESM-safe __dirname, proxy for /api
│
├─ server/
│  ├─ server.js                     # Express app, mounts routes and Vite middleware in dev
│  ├─ route.js                      # REST API endpoints
│  ├─ schema.js                     # Zod schemas (pure)
│  ├─ storage.js                    # In-memory storage utilities (demo)
│  └─ vite-server.js                # Attaches Vite dev middleware / static in prod
│
├─ package.json                     # Root scripts (dev server)
└─ package-lock.json
```

## How It Works

- **Voice flow**
  - `useVoiceRecognition()` listens for speech, transcribes text, then calls `onVoiceCommand(command)`.
  - `DashboardPage.jsx` passes a `context` object and settings into `handleVoiceCommand(command, context, settings)`.
  - `lib/ParseVoiceCommand.jsx` uses a structured parser:
    - Attempts multiple patterns per intent (e.g., add item with qty/unit/price, or add with price only).
    - Returns `{ intent, entities, success, message, confidence }`.
    - `handleVoiceCommand()` executes the action using `context` methods (add/remove/clear/generate/stop) and optionally speaks a confirmation.
  - When the settings toggle “Voice Feedback” is ON, the handler also speaks a concise order summary (top items and total) after add/remove/reset.

- **UI**
  - `components/ui/` provides minimal Tailwind-based primitives (table, tabs, button, card, label, input, switch).
  - `VoiceControlPanel.jsx` exposes settings (language, voice feedback toggle) and the main mic button.
  - `BillingInterface.jsx` displays items, total, and actions like generate invoice.

- **Backend**
  - `server/route.js` defines REST endpoints such as auth, billing items, stats, etc.
  - `server/schema.js` contains Zod validators for request payloads.
  - `server/server.js` runs Express on port 5000. In dev, it uses Vite middleware to serve the client. In prod, it serves static dist.

- **Dev servers**
  - Single-server dev mode: `npm run dev` at project root starts Express with Vite middleware on port 5000.
  - Dual-server mode: run backend (5000) and client (5173) separately; `client/vite.config.js` proxies `/api` → `http://localhost:5000`.

## Commands & Examples

- Add item
  - “add apples 2 kg 120”
  - “add milk 1 liter for ₹50”
  - “add bread for 30” (defaults to 1 piece)
- Remove item
  - “remove apples”
- Reset bill
  - “reset bill” / “clear cart”
- Generate invoice
  - “generate invoice pdf”
- Total amount
  - “what’s the total amount”
- Stop listening
  - “pause listening” / “stop”

## API Overview (selected)

- `POST /api/auth/login`
- `GET /api/bill-items` | `POST /api/bill-items` | `DELETE /api/bill-items/:id`
- `POST /api/invoice` (PDF generation client-side + update server)
- `GET /api/stats`

See `server/route.js` for the full list and payload shapes (validated with Zod in `server/schema.js`).

## Setup & Run

1) Install dependencies (root):

```bash
npm install
```

2) Development: single-server (recommended)

```bash
npm run dev
# open http://localhost:5000
```

3) Development: dual-server (optional)

```bash
# Terminal A (root): backend
npm run dev

# Terminal B (client folder): frontend
npm run dev
# open http://localhost:5173 (proxy /api → :5000)
```

## Configuration Notes

- **ESM compatibility**: Vite configs use ESM-safe `__dirname` via `fileURLToPath` due to `type: module`.
- **Proxy**: `client/vite.config.js` proxies `/api` to backend:5000 for dual-server runs.
- **Tailwind**: Config loads from `client/tailwind.config.js` and CSS variables from `client/src/index.css`.

## Roadmap / Next Steps

- Multilingual number words (e.g., Tamil/Hindi numerals → digits).
- Entity confirmation prompts when price/qty is missing.
- Persistent storage (DB) and auth hardening.
- Production build pipeline and deployment scripts.
