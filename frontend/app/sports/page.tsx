'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Input } from '@/components/ui/input';
import { usePlaceBet, useSportsEvent, useSportsEvents } from '@/lib/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function SportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialLive = searchParams.get('isLive') === 'true';
  const [showLive, setShowLive] = useState(initialLive);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [selectedSelection, setSelectedSelection] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setShowLive(searchParams.get('isLive') === 'true');
  }, [searchParams]);

  const { data: events = [], isLoading, isError, refetch } = useSportsEvents(showLive);
  const { data: selectedEvent } = useSportsEvent(selectedEventId || '');
  const placeBetMutation = usePlaceBet();

  const toggleLive = (val: boolean) => {
    setShowLive(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('isLive', 'true');
    else params.delete('isLive');
    router.replace(`/sports?${params.toString()}`);
  };

  const placeBet = async () => {
    setMessage('');
    setError('');
    if (!selectedSelection || !betAmount) {
      setError('Selecione uma aposta e insira o valor');
      return;
    }
    try {
      await placeBetMutation.mutateAsync({
        selectionId: selectedSelection.id,
        stake: parseFloat(betAmount),
      });
      setMessage('Aposta realizada com sucesso!');
      setBetAmount('');
      setSelectedSelection(null);
      setSelectedEventId(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Erro ao realizar aposta';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    }
  };

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        <h1 className="font-display text-2xl font-extrabold text-sa-gold">Apostas Esportivas</h1>

        {(message || error) && (
          <p
            className={`text-sm ${error ? 'text-red-400' : 'text-green-400'}`}
            role={error ? 'alert' : 'status'}
          >
            {error || message}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sa-gold" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-red-400" role="alert">Não foi possível carregar eventos.</p>
            <button
              onClick={() => refetch()}
              className="rounded-lg sa-panel px-4 py-2 text-sm text-sa-gold"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {/* Live / All toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleLive(false)}
                className={!showLive ? 'sa-chip bg-sa-red/60 text-sa-gold border-sa-gold/50' : 'sa-chip opacity-60 hover:opacity-100 transition'}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => toggleLive(true)}
                className={showLive ? 'sa-chip bg-sa-red text-white border-sa-red' : 'sa-chip opacity-60 hover:opacity-100 transition'}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                AO VIVO
              </button>
            </div>

            {!selectedEventId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(events as any[]).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="sa-panel p-4 text-left hover:border-sa-red/70 transition w-full"
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display font-bold text-white text-sm">{event.name || 'Evento'}</p>
                      {event.isLive && (
                        <span className="sa-chip text-[10px] flex-shrink-0 bg-sa-red/80">AO VIVO</span>
                      )}
                    </div>
                    <p className="text-xs text-sa-muted mt-1">
                      {event.startTime ? new Date(event.startTime).toLocaleString('pt-BR') : '—'}
                    </p>
                    {event.league && (
                      <p className="text-xs text-sa-gold/60 mt-1">{event.league}</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="max-w-3xl">
                <button
                  type="button"
                  onClick={() => { setSelectedEventId(null); setSelectedSelection(null); }}
                  className="sa-chip mb-4"
                >
                  ← Voltar
                </button>

                {!selectedEvent ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sa-gold" />
                  </div>
                ) : (
                  <>
                    <div className="sa-panel p-4 mb-5">
                      <h2 className="font-display font-bold text-white">{selectedEvent.name}</h2>
                      <p className="text-xs text-sa-muted mt-1">
                        {selectedEvent.startTime ? new Date(selectedEvent.startTime).toLocaleString('pt-BR') : '—'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {selectedEvent.markets?.map((market: any) => (
                        <div key={market.id} className="sa-panel p-4">
                          <h3 className="font-display font-bold text-sa-gold text-sm mb-3">{market.name}</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {market.selections?.map((sel: any) => (
                              <button
                                key={sel.id}
                                type="button"
                                onClick={() => setSelectedSelection(sel)}
                                className={`rounded-lg border-2 p-3 text-left transition ${
                                  selectedSelection?.id === sel.id
                                    ? 'border-sa-gold bg-sa-gold/10'
                                    : 'border-sa-red/20 hover:border-sa-red/50'
                                }`}
                              >
                                <p className="text-xs text-white">{sel.name}</p>
                                <p className="font-display text-lg font-extrabold text-sa-gold">
                                  {Number(sel.odds).toFixed(2)}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedSelection && (
                      <div className="sa-panel p-5 mt-5 space-y-4">
                        <h3 className="font-display font-bold text-sa-gold">Confirmar Aposta</h3>
                        <div>
                          <p className="text-xs text-sa-muted">Seleção</p>
                          <p className="text-sm font-medium text-white">{selectedSelection.name}</p>
                        </div>
                        <div>
                          <label className="block text-xs text-sa-muted mb-1.5">Valor (R$)</label>
                          <Input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            min="1"
                            step="0.01"
                            className="bg-black/50 border-sa-red/40 text-white"
                          />
                        </div>
                        {betAmount && (
                          <p className="text-sa-gold text-sm">
                            Retorno potencial: R$ {(parseFloat(betAmount) * Number(selectedSelection.odds)).toFixed(2)}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={placeBet}
                          disabled={placeBetMutation.isPending}
                          className="w-full rounded-lg bg-sa-gold text-black font-display font-extrabold py-3 hover:bg-sa-gold-dim transition disabled:opacity-50"
                        >
                          {placeBetMutation.isPending ? 'Enviando...' : 'Confirmar Aposta'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {(!events || (events as any[]).length === 0) && !selectedEventId && (
              <p className="text-sa-muted text-center py-12">
                {showLive ? 'Nenhum evento ao vivo no momento.' : 'Nenhum evento encontrado.'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SportsPage() {
  return (
    <AuthGuard>
      <Suspense>
        <SportsContent />
      </Suspense>
    </AuthGuard>
  );
}
