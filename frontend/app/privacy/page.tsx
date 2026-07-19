import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-[#FFD700] hover:underline text-sm">
          ← SORTE AGORA
        </Link>
        <h1 className="text-3xl font-bold font-display">Política de Privacidade</h1>
        <p className="text-gray-400 text-sm">LGPD · Atualizado em 19 de julho de 2026</p>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Tratamos dados pessoais para autenticação, KYC, prevenção a fraude, operação financeira
            e cumprimento legal. Bases: execução de contrato e obrigação legal.
          </p>
          <p>
            Você pode exportar seus dados (`GET /users/me/export`) ou solicitar exclusão/anonimização
            (`DELETE /users/me`) pelo perfil. Documentos KYC são armazenados via storage configurável
            (local/MinIO).
          </p>
          <p>
            Compartilhamos dados apenas com processadores necessários (pagamento, e-mail, hosting)
            sob contrato. Retenção segue necessidade operacional e exigências legais.
          </p>
          <p>
            Contato do controlador: privacidade@sorteagora.com (placeholder staging).
          </p>
        </div>
        <Link href="/terms" className="inline-block text-[#FFD700] hover:underline">
          ← Voltar aos Termos
        </Link>
      </div>
    </main>
  );
}
