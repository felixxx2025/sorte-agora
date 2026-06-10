'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function SportsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showLive, setShowLive] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [selectedSelection, setSelectedSelection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sports/events?isLive=${showLive}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showLive]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchEvents();
  }, [isAuthenticated, fetchEvents, router]);

  const fetchEventDetails = async (eventId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sports/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setSelectedEvent(data);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    }
  };

  const placeBet = async () => {
    if (!selectedSelection || !betAmount) {
      alert('Selecione uma aposta e insira o valor');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sports/bets`, {
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
      const data = await response.json();
      if (response.ok) {
        alert('Aposta realizada com sucesso!');
        setBetAmount('');
        setSelectedSelection(null);
        setSelectedEvent(null);
      } else {
        alert(data.message || 'Erro ao realizar aposta');
      }
    } catch (error) {
      console.error('Place bet error:', error);
      alert('Erro ao realizar aposta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Apostas Esportivas</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => setShowLive(false)}
                className={!showLive ? 'bg-blue-600' : 'bg-gray-700'}
              >
                Todos os Eventos
              </Button>
              <Button
                onClick={() => setShowLive(true)}
                className={showLive ? 'bg-red-600' : 'bg-gray-700'}
              >
                Ao Vivo 🔴
              </Button>
            </div>

            {!selectedEvent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="bg-gray-800 border-gray-700 cursor-pointer hover:border-blue-500 transition"
                    onClick={() => fetchEventDetails(event.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-gray-300">{event.sport}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-2">{event.homeTeam} vs {event.awayTeam}</p>
                      <p className="text-sm text-gray-400 mb-2">
                        {new Date(event.startTime).toLocaleString()}
                      </p>
                      {event.isLive && (
                        <span className="inline-block bg-red-600 text-xs px-2 py-1 rounded">
                          AO VIVO
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <Button
                  onClick={() => setSelectedEvent(null)}
                  className="mb-6 bg-gray-700 hover:bg-gray-600"
                >
                  ← Voltar
                </Button>

                <Card className="bg-gray-800 border-gray-700 mb-6">
                  <CardHeader>
                    <CardTitle className="text-gray-300">
                      {selectedEvent.homeTeam} vs {selectedEvent.awayTeam}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">{selectedEvent.sport}</p>
                    <p className="text-sm text-gray-400">
                      Início: {new Date(selectedEvent.startTime).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <h2 className="text-xl font-bold mb-4">Mercados de Apostas</h2>
                <div className="space-y-4">
                  {selectedEvent.markets?.map((market: any) => (
                    <Card key={market.id} className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-gray-300 text-lg">{market.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {market.selections?.map((selection: any) => (
                            <div
                              key={selection.id}
                              className={`p-4 rounded cursor-pointer border-2 transition ${selectedSelection?.id === selection.id
                                ? 'border-green-500 bg-green-900/20'
                                : 'border-gray-600 hover:border-gray-500'
                                }`}
                              onClick={() => setSelectedSelection(selection)}
                            >
                              <p className="font-medium mb-2">{selection.name}</p>
                              <p className="text-2xl font-bold text-green-400">
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
                  <Card className="bg-gray-800 border-gray-700 mt-6">
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
                          <p className="text-sm text-gray-400">Odd</p>
                          <p className="font-medium text-green-400">{Number(selectedSelection.odds).toFixed(2)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Valor da Aposta (R$)</label>
                          <Input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            min="1"
                            step="0.01"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        {betAmount && (
                          <div>
                            <p className="text-sm text-gray-400">Retorno Potencial</p>
                            <p className="font-medium text-green-400">
                              R$ {(parseFloat(betAmount) * Number(selectedSelection.odds)).toFixed(2)}
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={placeBet}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
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
    </div>
  );
}
