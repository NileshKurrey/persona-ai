import { Router } from 'express';
import client, { MODEL } from '../lib/gemini.js';
import { getPersona, listProfiles } from '../personas/index.js';

const router = Router();


const MAX_TURNS = 12;

function trimHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_TURNS).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content ?? '').slice(0, 4000), // guard against huge pastes
  }));
}


function findRelevantVideo(personaId, userText) {
  const persona = getPersona(personaId);
  if (!persona) return null;
  const text = userText.toLowerCase();
  const match = persona.profile.videoLibrary.find((v) =>
    text.includes(v.topic.replace('-', ' ')) || text.includes(v.topic)
  );
  return match || null;
}

function createMessages(personaId, message, history) {
  const persona = getPersona(personaId);
  const trimmedHistory = trimHistory(history);

  return {
    persona,
    messages: [
      { role: 'system', content: persona.systemPrompt },
      ...trimmedHistory,
      { role: 'user', content: message },
    ],
  };
}

function validateChatPayload(req, res) {
  const { personaId, message, history } = req.body;

  if (!personaId || !getPersona(personaId)) {
    res.status(400).json({ error: 'Unknown or missing personaId' });
    return null;
  }
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'message is required' });
    return null;
  }
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'Server is missing GEMINI_API_KEY. Add it to backend/.env',
    });
    return null;
  }

  return { personaId, message, history };
}

function getChatError(err) {
  const upstreamMessage =
    err?.error?.message || err?.response?.data?.error?.message || err?.message;
  const upstreamStatus = err?.status || err?.response?.status;

  const hint =
    upstreamStatus === 401 || upstreamStatus === 403
      ? 'Check that GEMINI_API_KEY in backend/.env is valid and enabled for Gemini API.'
      : upstreamStatus === 404
        ? `Model "${MODEL}" was not found for this key. Try setting GEMINI_MODEL in backend/.env.`
        : 'Something went wrong talking to the Gemini model.';

  return { upstreamMessage, upstreamStatus, hint };
}

function writeSse(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

router.get('/personas', (_req, res) => {
  res.json({ personas: listProfiles() });
});

router.post('/chat', async (req, res) => {
  try {
    const payload = validateChatPayload(req, res);
    if (!payload) return;

    const { personaId, message, history } = payload;
    const { persona, messages } = createMessages(personaId, message, history);

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.9,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || '';
    const suggestedVideo = findRelevantVideo(personaId, message);

    res.json({
      reply,
      persona: persona.profile.id,
      suggestedVideo,
    });
  } catch (err) {
    const { upstreamMessage, upstreamStatus, hint } = getChatError(err);

    console.error('Chat error:', {
      status: upstreamStatus,
      message: upstreamMessage,
    });

    res.status(upstreamStatus && upstreamStatus < 500 ? upstreamStatus : 500).json({
      error: hint,
      detail: process.env.NODE_ENV === 'production' ? undefined : upstreamMessage,
    });
  }
});

router.post('/chat/stream', async (req, res) => {
  let clientClosed = false;

  try {
    const payload = validateChatPayload(req, res);
    if (!payload) return;

    const { personaId, message, history } = payload;
    const { persona, messages } = createMessages(personaId, message, history);

    res.on('close', () => {
      clientClosed = true;
    });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const stream = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.9,
      stream: true,
    });

    for await (const chunk of stream) {
      if (clientClosed) return;
      const text = chunk.choices?.[0]?.delta?.content || '';
      if (text) writeSse(res, 'delta', { text });
    }

    if (clientClosed) return;

    writeSse(res, 'suggestedVideo', {
      suggestedVideo: findRelevantVideo(personaId, message),
      persona: persona.profile.id,
    });
    writeSse(res, 'done', { ok: true });
    res.end();
  } catch (err) {
    const { upstreamMessage, upstreamStatus, hint } = getChatError(err);

    console.error('Streaming chat error:', {
      status: upstreamStatus,
      message: upstreamMessage,
    });

    if (res.headersSent) {
      writeSse(res, 'error', {
        error: hint,
        detail: process.env.NODE_ENV === 'production' ? undefined : upstreamMessage,
      });
      res.end();
      return;
    }

    res.status(upstreamStatus && upstreamStatus < 500 ? upstreamStatus : 500).json({
      error: hint,
      detail: process.env.NODE_ENV === 'production' ? undefined : upstreamMessage,
    });
  }
});

export default router;
