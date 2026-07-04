# Context Management Approach

## Where conversation state lives

The **client (browser)** holds the full transcript per persona, in React
state, keyed by persona id (`hitesh` / `piyush`). This means:

- Switching personas mid-session keeps each persona's own conversation
  intact (switching to Piyush doesn't erase your Hitesh thread).
- The server is stateless between requests — no database or session store
  needed for this assignment's scope, which keeps deployment trivial (a
  single Express process can be restarted/scaled without losing anything
  the client hasn't already lost).

## What gets sent to the model on every request

On every `POST /api/chat`, the server rebuilds the message array as:

```
[system prompt for the active persona]
  + [last N messages of the client-provided history]
  + [the new user message]
```

`N` is capped at **12 messages** (`MAX_TURNS` in
`backend/src/routes/chat.route.js`) — roughly the last 6 back-and-forth
turns. This is a simple sliding-window strategy chosen over full-history
replay for two reasons:

1. **Cost/latency** — Gemini pricing and response time both scale with
   input tokens; an unbounded transcript would make later turns in a long
   conversation progressively slower and more expensive.
2. **Persona stability** — the system prompt (which carries all the
   persona instructions) is always present in full on every call, so even
   with a trimmed window the model never "forgets" who it is. Only
   older *topic* context ages out, which is an acceptable tradeoff for a
   Q&A-style mentor bot where each answer is fairly self-contained.

Each message is also truncated to 4000 characters server-side as a guard
against someone pasting a huge block of text and blowing up the request.


## Suggested video / link injection

Alongside trimming history, the server does a lightweight keyword match
against the user's latest message and the active persona's curated
`videoLibrary` (see `backend/src/personas/*.js`). If a topic keyword
matches (e.g. "docker"), the API response includes a `suggestedVideo`
object that the frontend renders as a clickable chip under that message.
This is a context-*augmentation* step, separate from the trimmed chat
history sent to the model — the model itself never has to guess a URL.
