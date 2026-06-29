import { useState } from 'react';
import { sendChat } from '../lib/api.js';

const STARTERS = [
  'What should I do first when I arrive?',
  'Which city is better for me — Seoul or Busan?',
  'What Korean certifications help me get hired faster?',
];

export default function ChatAssistant({ context }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your ArrivAI integration guide. Ask me about cities, jobs, language, or your next 30 days in Korea.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(text) {
    const msg = (text || input).trim();
    if (!msg || loading || !context?.profile) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const data = await sendChat(msg, context);
      setMessages((m) => [...m, { role: 'assistant', text: data.reply || data.fallback }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: err.message || 'Could not reach the assistant.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-navy shadow-lg shadow-accent/30 transition hover:scale-105"
        aria-label="Open AI assistant"
      >
        {open ? '✕' : 'AI'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[min(480px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-light shadow-2xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="font-heading text-sm font-semibold text-white">ArrivAI Assistant</p>
            <p className="text-xs text-slate-400">Powered by Claude</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-accent/20 text-white'
                    : 'bg-white/5 text-slate-300'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <p className="text-xs text-slate-500 animate-pulse">Thinking…</p>
            )}
          </div>

          {!loading && messages.length <= 2 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSend(s)}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-400 hover:border-accent/50 hover:text-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Korea, jobs, visas…"
              className="flex-1 rounded-lg border border-white/10 bg-navy px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-navy disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
