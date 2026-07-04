# Persona AI — Hitesh / Piyush AI Persona Chat

A dual-persona AI chat that responds like **Hitesh Choudhary** or
**Piyush Garg**, built for the Chaicode GenAI-with-JS 2026 cohort,
Assignment 2 (Prompting: zero-shot, few-shot, chain-of-thought, role-play).

- **Frontend:** Next.js (App Router, React, plain CSS — no UI framework)
- **Backend:** Express.js
- **Model:** Gemini (`gemini-2.0-flash`), called through the **OpenAI SDK**
  pointed at Gemini's OpenAI-compatible endpoint — same `openai` package and
  `chat.completions.create` API used in class (`01_zero.js`, `02_few_shot.js`,
  `03_cot.js`).

## Project structure

```
chai-persona-bot/
├── backend/                    Express API
│   ├── server.js
│   └── src/
│       ├── lib/gemini.js       OpenAI SDK client pointed at Gemini's base URL
│       ├── personas/           Hitesh & Piyush system prompts + curated links
│       └── routes/chat.route.js
├── frontend/                   Next.js app
│   ├── app/                    layout, page, global design tokens (CSS)
│   └── components/ChatApp.jsx  chat UI, persona switcher, message log
└── docs/
    ├── PERSONA_RESEARCH.md     how persona data was collected & prepared
    ├── PROMPT_ENGINEERING.md   role-play + few-shot + CoT strategy
    ├── CONTEXT_MANAGEMENT.md   how conversation history is trimmed/sent
    └── SAMPLE_CONVERSATIONS.md example transcripts for both personas
```

## 1. Get a Gemini API key

Create a free key at <https://aistudio.google.com/app/apikey>.

## 2. Run the backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and paste your GEMINI_API_KEY
npm start
```

The API starts on `http://localhost:8080`. Quick check:

```bash
curl http://localhost:8080/api/personas
```

## 3. Run the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# defaults already point at http://localhost:8080, edit if needed
npm run dev
```

Open <http://localhost:3000>. Use the `hitesh.js` / `piyush.dev` tabs at
the top to switch personas — each keeps its own separate conversation.

## API

### `GET /api/personas`
Returns both persona profiles (name, tagline, links, curated video
library) so the frontend never hardcodes anything that could drift from
the backend.

### `POST /api/chat`
```json
{
  "personaId": "hitesh",
  "message": "how do I learn closures?",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }]
}
```
Returns:
```json
{
  "reply": "...",
  "persona": "hitesh",
  "suggestedVideo": { "title": "...", "url": "..." } // or null
}
```

## Deploying

- **Backend:** any Node host (Render, Railway, Fly.io, a small VPS). Set
  `GEMINI_API_KEY` and `CLIENT_ORIGIN` (your deployed frontend URL) as env
  vars.
- **Frontend:** Vercel is the easiest fit for Next.js. Set
  `NEXT_PUBLIC_API_URL` to your deployed backend URL.

## Docs

See the `docs/` folder for persona research notes, the prompt engineering
strategy (role-play + few-shot + silent chain-of-thought), the context
management approach, and sample conversations for both personas.
