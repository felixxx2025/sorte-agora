'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import { Button } from '@/components/ui/button';

type ChatMessage = {
  id: string;
  room: string;
  body: string;
  createdAt: string;
  user?: { name?: string; email?: string };
};

const ENABLE =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_ENABLE_CHAT !== 'false';

export function ChatDock() {
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState<'global' | 'support'>('global');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ENABLE || !open) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await apiClient.get<ChatMessage[]>(`/chat/messages?room=${room}&limit=40`);
        const data = res.data;
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setMessages([]);
      }
    };
    load();
    const t = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [open, room]);

  if (!ENABLE) return null;

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    try {
      await apiClient.post('/chat/messages', { room, body });
      setText('');
      const res = await apiClient.get<ChatMessage[]>(`/chat/messages?room=${room}&limit=40`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message || 'Falha ao enviar');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 h-12 w-12 rounded-full bg-sa-red text-sa-gold font-display font-bold shadow-lg border border-sa-gold/50"
        aria-label="Chat"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-36 right-4 lg:bottom-20 lg:right-6 z-50 w-[min(100vw-2rem,22rem)] sa-panel flex flex-col max-h-[70vh]">
          <div className="flex items-center justify-between border-b border-sa-red/30 pb-2 mb-2">
            <p className="font-display text-sm font-bold text-sa-gold">Chat</p>
            <button type="button" className="text-sa-muted text-xs" onClick={() => setOpen(false)}>
              Fechar
            </button>
          </div>
          <div className="flex gap-2 mb-2">
            {(['global', 'support'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoom(r)}
                className={
                  room === r
                    ? 'sa-chip bg-sa-red/30 text-sa-gold'
                    : 'sa-chip opacity-60'
                }
              >
                {r === 'global' ? 'Global' : 'Suporte'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-[12rem] max-h-64 text-sm">
            {messages.length === 0 && (
              <p className="text-sa-muted text-xs">Nenhuma mensagem ainda.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className="rounded bg-black/40 px-2 py-1.5">
                <p className="text-[10px] text-sa-gold">
                  {m.user?.name || m.user?.email || 'Jogador'}
                </p>
                <p className="text-gray-200 break-words">{m.body}</p>
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          <div className="mt-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              maxLength={280}
              placeholder="Mensagem..."
              className="flex-1 rounded border border-sa-red/40 bg-black/50 px-2 py-1.5 text-sm text-white"
            />
            <Button size="sm" onClick={send} disabled={sending}>
              Enviar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
