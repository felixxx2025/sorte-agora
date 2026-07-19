'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCallback, useEffect, useState } from 'react';

function getApiBase() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return apiBase.endsWith('/api') ? apiBase : `${apiBase.replace(/\/$/, '')}/api`;
}

function unwrap(payload: any) {
  return payload?.data ?? payload;
}

function SportsContent() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showLive, setShowLive] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [selectedSelection, setSelectedSelection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${getApiBase()}/sports/events?isLive=${showLive}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      const data = unwrap(payload);
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setError('Não foi possível carregar eventos.');
    } finally {
      setIsLoading(false);
    }
  }, [showLive]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const fetchEventDetails = async (eventId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${getApiBase()}/sports/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      setSelectedEvent(unwrap(payload));
    } catch {
      setError('Não foi possível carregar detalhes do evento.');
    }
  };

  const placeBet = async () => {
    setMessage('');
    setError('');
    if (!selectedSelection || !betAmount) {
      setError('Selecione uma aposta e insira o valor');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${getApiBase()}/sports/bets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectionId: selectedSelection.id,
          stake: parseFloat(betAmount),
          userId: useAuthStore.getState().user?.id,
        }),
      });
      const payload = await response.json();
      const data = unwrap(payload);
      if (response.ok) {
        setMessage('Aposta realizada com sucesso!');
        setBetAmount('');
        setSelectedSelection(null);
        setSelectedEvent(null);
      } else {
        setError(data?.message || payload?.message || 'Erro ao realizar aposta');
      }
    } catch {
      setError('Erro ao realizar aposta');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Apostas Esportivas</h1>

      {(message || error) && (
        <p className={`mb-4 text-sm ${error ? 'text-red-400' : 'text-green-400'}`} role={error ? 'alert' : 'status'}>
          {error || message}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]" />
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setShowLive(false)}
              className={!showLive ? 'bg-[#FFD700] text-[#1A1A2E]' : 'bg-[#16213E]'}
            >
              Todos os Eventos
            </Button>
            <Button
              onClick={() => setShowLive(true)}
              className={showLive ? 'bg-red-600' : 'bg-[#16213E]'}
            >
              Ao Vivo
            </Button>
          </div>

          {!selectedEvent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="bg-[#16213E] border-white/10 cursor-pointer hover:border-[#FFD700]/40 transition"
                  onClick={() => fetchEventDetails(event.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-gray-300">{event.name || 'Evento'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-2">
                      {event.startTime ? new Date(event.startTime).toLocaleString() : '—'}
                    </p>
                    {event.isLive && (
                      <span className="inline-block bg-red-600 text-xs px-2 py-1 rounded">AO VIVO</span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <Button onClick={() => setSelectedEvent(null)} className="mb-6 bg-[#16213E]">
                ← Voltar
              </Button>

              <Card className="bg-[#16213E] border-white/10 mb-6">
                <CardHeader>
                  <CardTitle className="text-gray-300">{selectedEvent.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    Início:{' '}
                    {selectedEvent.startTime
                      ? new Date(selectedEvent.startTime).toLocaleString()
                      : '—'}
                  </p>
                </CardContent>
              </Card>

              <h2 className="text-xl font-bold mb-4">Mercados de Apostas</h2>
              <div className="space-y-4">
                {selectedEvent.markets?.map((market: any) => (
                  <Card key={market.id} className="bg-[#16213E] border-white/10">
                    <CardHeader>
                      <CardTitle className="text-gray-300 text-lg">{market.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {market.selections?.map((selection: any) => (
                          <div
                            key={selection.id}
                            className={`p-4 rounded cursor-pointer border-2 transition ${
                              selectedSelection?.id === selection.id
                                ? 'border-[#FFD700] bg-[#FFD700]/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                            onClick={() => setSelectedSelection(selection)}
                          >
                            <p className="font-medium mb-2">{selection.name}</p>
                            <p className="text-2xl font-bold text-[#FFD700]">
                              {Number(selection.odds).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedSelection && (
                <Card className="bg-[#16213E] border-white/10 mt-6">
                  <CardHeader>
                    <CardTitle className="text-gray-300">Confirmar Aposta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Seleção</p>
                        <p className="font-medium">{selectedSelection.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                        <Input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          min="1"
                          step="0.01"
                          className="bg-[#0F0F1A] border-white/10 text-white"
                        />
                      </div>
                      {betAmount && (
                        <p className="text-[#FFD700]">
                          Retorno potencial: R${' '}
                          {(parseFloat(betAmount) * Number(selectedSelection.odds)).toFixed(2)}
                        </p>
                      )}
                      <Button onClick={placeBet} className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E]">
                        Confirmar Aposta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {(!events || events.length === 0) && !selectedEvent && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl">
                {showLive ? 'Nenhum evento ao vivo no momento.' : 'Nenhum evento encontrado.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SportsPage() {
  return (
    <AuthGuard>
      <SportsContent />
    </AuthGuard>
  );
}
