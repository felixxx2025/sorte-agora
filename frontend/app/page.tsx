import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="sa-page">
      {/* Header */}
      <header className="border-b border-sa-red/30">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-extrabold">
              <span className="text-sa-red">SORTE</span>
              <span className="text-sa-gold"> AGORA</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-white hover:text-sa-gold transition"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-sa-red px-5 py-2 text-sm font-bold text-sa-gold border border-sa-gold/30 hover:bg-sa-red/80 transition"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,30,58,0.25) 0%, transparent 70%), var(--sa-bg)',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-20 md:py-32 text-center">
          <p className="sa-chip mx-auto mb-4 w-fit">🎰 A maior plataforma do Brasil</p>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight mb-4">
            <span className="text-white">SORTE</span>{' '}
            <span className="text-sa-gold">AGORA</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Cassino ao vivo, Crash, Apostas esportivas — tudo com PIX instantâneo e bônus exclusivos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-sa-gold text-black font-display font-extrabold text-lg px-10 py-4 hover:bg-sa-gold-dim transition shadow-[0_0_32px_rgba(255,215,0,0.3)]"
            >
              Jogar Grátis
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-sa-red/60 text-sa-gold font-bold px-10 py-4 hover:bg-sa-red/10 transition"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Bonus badge */}
          <div className="mt-10 inline-block sa-panel px-6 py-3 text-center">
            <p className="font-display text-3xl font-extrabold text-sa-gold">R$ 500</p>
            <p className="text-sm text-white/60">Bônus de boas-vindas no 1º depósito</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-screen-xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-center text-white mb-10">
          Por que escolher a{' '}
          <span className="text-sa-gold">SORTE AGORA</span>?
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: 'PIX Instantâneo', desc: 'Saques via PIX processados em minutos, sem burocracia.' },
            { icon: '🎮', title: 'Jogos Premium', desc: 'Crash, slots, cassino ao vivo dos melhores provedores.' },
            { icon: '👑', title: 'Programa VIP', desc: 'Missões exclusivas e recompensas que crescem com você.' },
          ].map((f) => (
            <div key={f.title} className="sa-panel p-6 flex flex-col gap-3">
              <span className="text-4xl">{f.icon}</span>
              <h3 className="font-display text-lg font-bold text-sa-gold">{f.title}</h3>
              <p className="text-sm text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sa-red/20 mt-8">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-sa-muted mb-4">
            <Link href="/terms" className="hover:text-white transition">Termos e Condições</Link>
            <Link href="/privacy" className="hover:text-white transition">Política de Privacidade</Link>
            <Link href="/responsible" className="hover:text-white transition">Jogo Responsável</Link>
            <Link href="/support" className="hover:text-white transition">Suporte</Link>
          </div>
          <p className="text-center text-sa-muted text-xs">
            © 2024 SORTE AGORA. Todos os direitos reservados. +18. Jogue com responsabilidade.
          </p>
        </div>
      </footer>
    </div>
  );
}
