import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-[#FFD700] hover:underline text-sm">
          ← SORTE AGORA
        </Link>
        <h1 className="text-3xl font-bold font-display">Termos de Uso</h1>
        <p className="text-gray-400 text-sm">Atualizado em 19 de julho de 2026</p>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Ao utilizar a plataforma SORTE AGORA você declara ter 18 anos ou mais e concorda com
            estes termos. Apostas envolvem risco financeiro.
          </p>
          <p>
            Contas são pessoais e intransferíveis. Atividades fraudulentas, multi-contas ou abuso
            de bônus podem resultar em suspensão e retenção de fundos conforme análise.
          </p>
          <p>
            Depósitos e saques via PIX seguem regras do provedor de pagamento e prazos de análise
            interna. Autoexclusão e limites diários estão disponíveis no perfil.
          </p>
          <p>
            Este documento é um modelo operacional para staging — não substitui assessoria jurídica
            nem licenciamento de apostas.
          </p>
        </div>
        <Link href="/privacy" className="inline-block text-[#FFD700] hover:underline">
          Ver Política de Privacidade →
        </Link>
      </div>
    </main>
  );
}
