import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0F1A] to-[#1A1A2E]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center">
              <span className="text-[#1A1A2E] font-bold text-xl">S</span>
            </div>
            <span className="text-white font-bold text-xl">SORTE AGORA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-white hover:text-[#FFD700] transition-colors">
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E] px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Bem-vindo à <span className="text-[#FFD700]">SORTE AGORA</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Sua sorte começa agora! Jogue nos melhores jogos e aposte nos seus eventos favoritos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="bg-[#16213E] border border-[#FFD700]/30 rounded-lg p-6 mb-4 sm:mb-0">
            <p className="text-[#FFD700] text-2xl font-bold">R$ 100</p>
            <p className="text-gray-300 text-sm">Bônus de Boas-vindas</p>
          </div>
          <Link
            href="/register"
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E] px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Criar Conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Por que escolher a SORTE AGORA?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#16213E] rounded-lg p-6 border border-white/10">
            <div className="w-12 h-12 bg-[#FFD700]/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-[#FFD700] text-2xl">💰</span>
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">Bônus Generosos</h3>
            <p className="text-gray-400">
              Receba bônus de boas-vindas e promoções exclusivas regularmente.
            </p>
          </div>
          <div className="bg-[#16213E] rounded-lg p-6 border border-white/10">
            <div className="w-12 h-12 bg-[#FFD700]/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-[#FFD700] text-2xl">⚡</span>
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">Pagamentos Instantâneos</h3>
            <p className="text-gray-400">
              Saques via PIX processados em minutos, sem burocracia.
            </p>
          </div>
          <div className="bg-[#16213E] rounded-lg p-6 border border-white/10">
            <div className="w-12 h-12 bg-[#FFD700]/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-[#FFD700] text-2xl">🎮</span>
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">Jogos Premium</h3>
            <p className="text-gray-400">
              Os melhores jogos dos provedores mais renomados do mercado.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">
              Termos e Condições
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/responsible" className="hover:text-white transition-colors">
              Jogo Responsável
            </Link>
            <Link href="/support" className="hover:text-white transition-colors">
              Suporte
            </Link>
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">
            © 2024 SORTE AGORA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
