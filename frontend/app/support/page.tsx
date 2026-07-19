import Link from 'next/link';

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-[#FFD700] hover:underline text-sm">
          ← SORTE AGORA
        </Link>
        <h1 className="text-3xl font-bold">Suporte</h1>
        <p className="text-gray-400 text-sm">Atendimento staging · 19 de julho de 2026</p>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Para dúvidas sobre conta, depósitos, saques ou KYC, envie e-mail para{' '}
            <span className="text-[#FFD700]">suporte@sorteagora.com</span> (placeholder de
            staging) com o e-mail cadastrado e o ID da transação, se houver.
          </p>
          <p>
            Tempo de resposta estimado em staging: até 1 dia útil. Em produção, canais e SLAs
            serão publicados aqui.
          </p>
          <p>
            Problemas de login com MFA: confirme o horário do autenticador e use um código
            atualizado. Contas autoexcluídas ou banidas não conseguem autenticar.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/responsible" className="text-[#FFD700] hover:underline">
            Jogo responsável →
          </Link>
          <Link href="/terms" className="text-[#FFD700] hover:underline">
            Termos →
          </Link>
        </div>
      </div>
    </main>
  );
}
