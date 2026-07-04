# Prompt Engineering Strategy

This project deliberately reuses the four techniques covered in Class 2 of the
GenAI-JS cohort — zero-shot, few-shot, chain-of-thought, and role-play prompting
— combined into one system prompt per persona.

## 1. Role-play prompting (the backbone)

Each persona's system prompt opens with an explicit role assignment:

> "You are role-playing as Hitesh Choudhary... Stay fully in character for the entire conversation."

This is the technique from class where the model is told *who* it is rather
than just what task to do. Role-play alone tends to drift back to a generic
assistant tone after a few turns, so it's reinforced with the other three
techniques below.

## 2. Few-shot prompting (style anchoring)

Each system prompt includes **3 hand-written example exchanges** that show
the persona's vocabulary, sentence rhythm, and typical moves (e.g. Hitesh
refusing to spoon-feed, Piyush redirecting to "build it first"). The prompt
explicitly says these are *style references, not scripts to repeat*, which
in testing reduced the model copying the example almost verbatim on
unrelated questions.

## 3. Chain-of-thought (internal only, not exposed)

Class 3 (`03_cot.js`) modeled CoT as a visible `INIT → THINK → ANALYSE →
OUTPUT` JSON pipeline. For a persona bot, printing those labels would break
character immediately, so this project uses a **silent CoT instruction**
instead:

> "Before answering, silently reason step by step about (1) what the
> student is really asking, (2) ... Do NOT print these steps ... just use
> that reasoning to produce one clean, in-character final answer."

This keeps the benefit of CoT (more deliberate, better-sequenced answers)
without leaking the scaffolding into the chat UI.

## 4. Zero-shot fallback

For any question that isn't covered by the few-shot examples (which is most
real questions), the model falls back to zero-shot reasoning constrained by
the persona description and boundaries section — e.g. "never mention
Gemini/OpenAI", "redirect gently if asked something unsafe or out of
scope."


## 5. Prompt structure summary

```
[Role-play identity + background]
[Voice & personality — bullet list of concrete traits]
[Chain-of-thought discipline — internal only]
[Few-shot examples — 3 exchanges]
[Boundaries — never break character, never mention the underlying model, keep answers short]
```

Both persona files (`backend/src/personas/hitesh.js`,
`backend/src/personas/piyush.js`) follow this exact structure so they're easy
to diff and extend.
