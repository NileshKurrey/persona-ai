'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const FALLBACK_PROFILES = {
  hitesh: {
    id: 'hitesh',
    name: 'Hitesh Choudhary',
    title: 'Founder, Chaicode',
    avatarInitial: 'H',
    avatar: '/avatars/hitesh.png',
    accent: '#e8a33d',
    tagline: 'Chai peete peete code samajhte hain',
    links: {
      website: 'https://hitesh.ai',
      youtubePrimary: 'https://www.youtube.com/@HiteshCodeLab',
      twitter: 'https://twitter.com/Hiteshdotcom',
    },
  },
  piyush: {
    id: 'piyush',
    name: 'Piyush Garg',
    title: 'Full-Stack Developer',
    avatarInitial: 'P',
    avatar: '/avatars/piyush.webp',
    accent: '#2fb6a8',
    tagline: 'I build devs, not just apps.',
    links: {
      website: 'https://www.piyushgarg.dev',
      youtube: 'https://www.youtube.com/@piyushgargdev',
      twitter: 'https://x.com/piyushgarg_dev',
    },
  },
};

const PERSONA_IDS = ['hitesh', 'piyush'];

const WELCOME = {
  hitesh:
    'Haan ji! Ask me about JavaScript, DSA, career direction, or what to build next.',
  piyush:
    "Hey, tell me what you're building or learning. We'll turn the vague part into next steps.",
};

const QUICK_PROMPTS = {
  hitesh: ['How should I learn JS?', 'Give me a DSA plan', 'Review my project idea'],
  piyush: ['Plan my backend project', 'Explain Docker simply', 'How do I deploy this?'],
};

const THEME = {
  hitesh: {
    glow: 'from-[#e8a33d]/30 via-[#e8a33d]/10 to-transparent',
    active: 'border-[#e8a33d]/70 bg-[#e8a33d]/10 text-[#ffe5b0]',
    bubble: 'border-[#e8a33d]/35 bg-[#2a2218] text-[#fff8ea]',
    button: 'bg-[#e8a33d] text-[#16120b] hover:bg-[#f0b45a]',
    ring: 'ring-[#e8a33d]/45',
  },
  piyush: {
    glow: 'from-[#2fb6a8]/30 via-[#2fb6a8]/10 to-transparent',
    active: 'border-[#2fb6a8]/70 bg-[#2fb6a8]/10 text-[#cffff8]',
    bubble: 'border-[#2fb6a8]/35 bg-[#142927] text-[#effffc]',
    button: 'bg-[#2fb6a8] text-[#071715] hover:bg-[#4dd0c2]',
    ring: 'ring-[#2fb6a8]/45',
  },
};

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function normalizeProfile(profile) {
  const fallback = FALLBACK_PROFILES[profile.id] || {};
  return {
    ...fallback,
    ...profile,
    avatar: fallback.avatar || `/avatars/${profile.id}.png`,
  };
}

function parseSseMessage(message) {
  const lines = message.split('\n');
  let event = 'message';
  const data = [];

  lines.forEach((line) => {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  });

  return {
    event,
    data: data.length ? JSON.parse(data.join('\n')) : null,
  };
}

function updateAssistantMessage(messages, id, updates) {
  return messages.map((message) =>
    message.id === id ? { ...message, ...updates } : message
  );
}

function appendAssistantText(messages, id, text) {
  return messages.map((message) =>
    message.id === id ? { ...message, content: `${message.content}${text}` } : message
  );
}

function MarkdownMessage({ content, isUser }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-3 mt-1 text-xl font-extrabold leading-tight">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-1 text-lg font-extrabold leading-tight">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-1 text-base font-bold leading-tight">{children}</h3>
        ),
        p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-extrabold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="my-2 list-disc space-y-1 pl-5 marker:text-current">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-current">{children}</ol>
        ),
        li: ({ children }) => <li className="pl-1">{children}</li>,
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={cx(
              'font-semibold underline decoration-2 underline-offset-4',
              isUser ? 'text-slate-900' : 'text-sky-200'
            )}
          >
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.startsWith('language-');
          return isBlock ? (
            <code className="block overflow-x-auto whitespace-pre rounded-2xl border border-white/10 bg-black/30 p-3 font-mono text-xs leading-5">
              {children}
            </code>
          ) : (
            <code
              className={cx(
                'rounded-md px-1.5 py-0.5 font-mono text-[0.86em]',
                isUser ? 'bg-slate-200 text-slate-950' : 'bg-black/25 text-slate-100'
              )}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="my-3 max-w-full overflow-x-auto">{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-4 border-current/30 pl-3 italic opacity-90">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function getTypingLabel(personaId) {
  return personaId === 'hitesh' ? 'Hitesh sir is typing...' : 'Piyush sir is typing...';
}

export default function ChatApp() {
  const [profiles, setProfiles] = useState(FALLBACK_PROFILES);
  const [activePersona, setActivePersona] = useState('hitesh');
  const [messagesByPersona, setMessagesByPersona] = useState({
    hitesh: [],
    piyush: [],
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/personas`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.personas?.length) {
          const nextProfiles = {};
          data.personas.forEach((profile) => {
            nextProfiles[profile.id] = normalizeProfile(profile);
          });
          setProfiles((prev) => ({ ...prev, ...nextProfiles }));
        }
      })
      .catch(() => {
        /* Fallback profiles keep the UI usable until the backend starts. */
      });
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messagesByPersona, activePersona, loading]);

  const persona = profiles[activePersona];
  const messages = messagesByPersona[activePersona];
  const theme = THEME[activePersona];

  async function sendMessage(textOverride) {
    const text = (textOverride || input).trim();
    if (!text || loading) return;

    setError('');
    setInput('');

    const personaId = activePersona;
    const assistantId =
      globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const userMsg = { id: `${assistantId}-user`, role: 'user', content: text };
    const assistantMsg = {
      id: assistantId,
      role: 'assistant',
      content: '',
      suggestedVideo: null,
      streaming: true,
    };

    setMessagesByPersona((prev) => ({
      ...prev,
      [personaId]: [...prev[personaId], userMsg, assistantMsg],
    }));
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId,
          message: text,
          history: messages,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || 'Request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        events.filter(Boolean).forEach((eventBlock) => {
          const { event, data } = parseSseMessage(eventBlock);

          if (event === 'delta' && data?.text) {
            setMessagesByPersona((prev) => ({
              ...prev,
              [personaId]: appendAssistantText(prev[personaId], assistantId, data.text),
            }));
          }

          if (event === 'suggestedVideo') {
            setMessagesByPersona((prev) => ({
              ...prev,
              [personaId]: updateAssistantMessage(prev[personaId], assistantId, {
                suggestedVideo: data?.suggestedVideo || null,
              }),
            }));
          }

          if (event === 'error') {
            throw new Error(data?.detail || data?.error || 'Streaming failed');
          }
        });
      }

      setMessagesByPersona((prev) => ({
        ...prev,
        [personaId]: updateAssistantMessage(prev[personaId], assistantId, {
          streaming: false,
        }),
      }));
    } catch (err) {
      setMessagesByPersona((prev) => ({
        ...prev,
        [personaId]: updateAssistantMessage(prev[personaId], assistantId, {
          streaming: false,
          content:
            prev[personaId].find((message) => message.id === assistantId)?.content ||
            'I could not finish that response. Please try again.',
        }),
      }));
      setError(
        err.message === 'Failed to fetch'
          ? `Can't reach the backend at ${API_URL}. Is the Express server running?`
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0d1117] text-slate-100">
      <div className={cx('pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-b blur-3xl', theme.glow)} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Gemini persona lab
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              Persona <span className="text-[#e8a33d]">AI</span>
            </h1>
          </div>

          
        </header>

        <section className="grid min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#121821]/90 shadow-2xl shadow-black/35 backdrop-blur-xl lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="border-b border-white/10 bg-[#0f141d]/90 p-4 lg:border-b-0 lg:border-r">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {PERSONA_IDS.map((id) => {
                const profile = profiles[id];
                const isActive = activePersona === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActivePersona(id)}
                    className={cx(
                      'group flex min-h-24 items-center gap-3 rounded-2xl border p-3 text-left transition duration-200',
                      isActive
                        ? theme.active
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-slate-200'
                    )}
                  >
                    <img
                      src={profile.avatar}
                      alt=""
                      className={cx(
                        'h-14 w-14 rounded-2xl object-cover ring-2 ring-transparent transition',
                        isActive && theme.ring
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-current">
                        {profile.name}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500 group-hover:text-slate-400">
                        {id === 'hitesh' ? 'hitesh.js' : 'piyush.dev'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-4">
                <img
                  src={persona.avatar}
                  alt=""
                  className={cx('h-20 w-20 rounded-3xl object-cover ring-4', theme.ring)}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-extrabold text-white">{persona.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-300">{persona.title}</p>
                </div>
              </div>

              <p className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-3 text-sm leading-6 text-slate-300">
                {persona.tagline}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(persona.links || {}).map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-slate-400 transition hover:border-white/25 hover:text-white"
                  >
                    {key.replace('youtubePrimary', 'youtube')}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                  Active conversation
                </p>
                <h2 className="mt-1 truncate text-xl font-bold text-white">{persona.name}</h2>
              </div>
              <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-slate-400 sm:block">
                {messages.length} messages
              </div>
            </div>

            {error && (
              <div className="mx-4 mt-4 rounded-2xl border border-red-400/30 bg-red-950/40 px-4 py-3 font-mono text-xs leading-5 text-red-100 sm:mx-6">
                {error}
              </div>
            )}

            <div
              ref={logRef}
              className="min-h-[420px] flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6"
            >
              {messages.length === 0 && (
                <div className="grid h-full min-h-[360px] place-items-center">
                  <div className="max-w-md text-center">
                    <img
                      src={persona.avatar}
                      alt=""
                      className={cx('mx-auto h-28 w-28 rounded-[2rem] object-cover ring-4', theme.ring)}
                    />
                    <h3 className="mt-5 text-2xl font-extrabold text-white">
                      Start with {persona.name.split(' ')[0]}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{WELCOME[activePersona]}</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {QUICK_PROMPTS[activePersona].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => sendMessage(prompt)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/25 hover:bg-white/[0.08]"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message, index) => {
                const isUser = message.role === 'user';

                return (
                  <div
                    key={message.id || `${message.role}-${index}`}
                    className={cx('flex items-end gap-3', isUser && 'justify-end')}
                  >
                    {!isUser && (
                      <img
                        src={persona.avatar}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-xl object-cover"
                      />
                    )}
                    <div className={cx('max-w-[min(82%,720px)]', isUser && 'order-first')}>
                      <div
                        className={cx(
                          'rounded-3xl border px-4 py-3 text-sm leading-6 shadow-xl shadow-black/10',
                          isUser
                            ? 'rounded-br-lg border-white/10 bg-white text-slate-950'
                            : cx('rounded-bl-lg', theme.bubble)
                        )}
                      >
                        <div className="break-words">
                          {message.content ? (
                            <MarkdownMessage content={message.content} isUser={isUser} />
                          ) : (
                            <span className="text-slate-400">
                              {getTypingLabel(activePersona)}
                            </span>
                          )}
                        </div>
                      </div>

                      {message.suggestedVideo && (
                        <a
                          href={message.suggestedVideo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex max-w-full rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-slate-300 transition hover:border-white/25 hover:text-white"
                        >
                          <span className="truncate">Watch: {message.suggestedVideo.title}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>

            <div className="border-t border-white/10 bg-[#0f141d]/90 p-4 sm:p-5">
              <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-2 sm:flex-row sm:items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${persona.name.split(' ')[0]} something...`}
                  className="min-h-12 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className={cx(
                    'min-h-12 rounded-2xl px-6 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-45',
                    theme.button
                  )}
                >
                  Send
                </button>
              </div>
              <p className="mt-3 text-center font-mono text-[11px] text-slate-600">
                Powered by Gemini via an Express API
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
