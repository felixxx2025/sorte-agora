import Link from 'next/link';

export default function ResponsibleGamingPage() {
  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-[#FFD700] hover:underline text-sm">
          ← SORTE AGORA
        </Link>
        <h1 className="text-3xl font-bold">Jogo Responsável</h1>
        <p className="text-gray-400 text-sm">Atualizado em 19 de julho de 2026</p>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            A SORTE AGORA é exclusiva para maiores de 18 anos. Apostas envolvem risco financeiro;
            jogue apenas com valores que você pode perder.
          </p>
          <p>
            Ferramentas disponíveis no perfil: limites de depósito, autoexclusão temporária e
            exclusão de conta (LGPD). Em caso de autoexclusão ativa, o login é bloqueado até o
            término do período.
          </p>
          <p>
            Se você ou alguém próximo precisa de apoio, procure o CVV (188) ou serviços locais de
            prevenção ao vício em jogos.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/support" className="text-[#FFD700] hover:underline">
            Suporte →
          </Link>
          <Link href="/profile" className="text-[#FFD700] hover:underline">
            Ir ao perfil →
          </Link>
        </div>
      </div>
    </main>
  );
}
