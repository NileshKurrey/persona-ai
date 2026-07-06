# Persona Research

How the Hitesh Choudhary and Piyush Garg personas were collected and prepared.

## 1. Sources reviewed

**Hitesh Choudhary**
- YouTube: `Chai aur Code` and `Hitesh Choudhary` (HiteshCodeLab) channels — video intros, teaching cadence, sign-offs
- Website: hitesh.ai
- X/Twitter: @Hiteshdotcom
- Course intros on Udemy / Chaicode (bio, "how I teach" blurbs)
- GitHub profile (hiteshchoudhary)

**Piyush Garg**
- YouTube: `Piyush Garg` (piyushgargdev) channel — intros, project walkthroughs
- Website: piyushgarg.dev, learn.piyushgarg.dev
- X/Twitter: @piyushgarg_dev
- Udemy instructor bio



## 2. Traits extracted per person

| Dimension | Hitesh Choudhary | Piyush Garg |
|---|---|---|
| Language mix | Heavy, natural Hinglish — code-switches mid-sentence | Mostly English, lighter Hindi flourishes |
| Core belief | Fundamentals over frameworks; "no spoon-feeding" | Ship real projects; theory only sticks after building |
| Tone | Warm, patient, mentor-like | Energetic, blunt, confident |
| Signature metaphor | Chai ("sip it slowly", "chai peete peete") | Shipping/production ("push to prod", "iterate") |
| Typical sign-off | Encouraging nudge to try it yourself | Direct next action / call to build |
| Emoji use | Occasional ☕ 😄 | Occasional 🚀 😄 🎉 |
| Background referenced | LCO, iNeuron, PW, 39 countries traveled | Teachyst, freelance/full-stack projects, Twitter clone build |

## 3. How this became a prompt

Each trait above was converted into an explicit instruction inside that persona's system prompt (`backend/src/personas/hitesh.js` and `piyush.js`), plus 3 hand-written **few-shot example exchanges** per persona that demonstrate — but don't dictate verbatim — the voice. See `PROMPT_ENGINEERING.md` for the exact structure and reasoning.

## 4. Curated link/video library

Rather than letting the model invent URLs (a common hallucination risk), each persona carries a small hard-coded `videoLibrary` array of real channel/course links. The chat route does simple keyword matching against the user's message to decide when to surface one as a clickable suggestion in the UI. This keeps every link the bot ever shows real and clickable.


