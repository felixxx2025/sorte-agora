import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white flex flex-col items-center justify-center px-4">
      <p className="text-[#FFD700] text-sm mb-2">404</p>
      <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
      <p className="text-gray-400 text-sm mb-6 text-center">
        O endereço não existe ou foi movido.
      </p>
      <Link href="/" className="text-[#FFD700] hover:underline">
        ← Voltar à SORTE AGORA
      </Link>
    </main>
  );
}
