'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/loading';
import {
  useDisableMfa,
  useEnableMfa,
  useGenerateMfaSecret,
  useUpdateProfile,
  useUserProfile,
} from '@/lib/hooks';
import { usersApi } from '@/lib/api/users';
import { useAuthStore } from '@/lib/stores/authStore';
import { useEffect, useState } from 'react';

function ProfileContent() {
  const { user, setUser } = useAuthStore();
  const { data: profile, isLoading, refetch } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const generateMfa = useGenerateMfaSecret();
  const enableMfa = useEnableMfa();
  const disableMfa = useDisableMfa();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: 'BR',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mfaSecret, setMfaSecret] = useState<{ secret: string; qrCode: string } | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  const [kycForm, setKycForm] = useState({
    documentType: 'CPF',
    documentNumber: '',
    documentFront: 'data:image/png;base64,demo',
    selfie: 'data:image/png;base64,demo',
  });
  const [kycStatus, setKycStatus] = useState<any>(null);

  const currentUser = profile || user;

  useEffect(() => {
    if (currentUser && !isEditing) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phone || '',
        country: currentUser.country || 'BR',
      });
    }
  }, [currentUser, isEditing]);

  useEffect(() => {
    usersApi.getKycStatus().then(setKycStatus).catch(() => setKycStatus(null));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const updated = await updateProfile.mutateAsync(formData);
      setUser(updated);
      setIsEditing(false);
      setMessage('Perfil atualizado com sucesso!');
    } catch {
      setError('Erro ao atualizar perfil');
    }
  };

  const handleStartMfa = async () => {
    try {
      const data = await generateMfa.mutateAsync();
      setMfaSecret(data);
    } catch {
      setError('Erro ao gerar MFA');
    }
  };

  const handleEnableMfa = async () => {
    try {
      await enableMfa.mutateAsync({ token: mfaToken });
      setMessage('MFA ativado!');
      setMfaSecret(null);
      setMfaToken('');
      refetch();
    } catch {
      setError('Token MFA inválido');
    }
  };

  const handleDisableMfa = async () => {
    try {
      await disableMfa.mutateAsync({ token: mfaToken });
      setMessage('MFA desativado');
      setMfaToken('');
      refetch();
    } catch {
      setError('Não foi possível desativar MFA');
    }
  };

  const handleKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersApi.submitKyc(kycForm as any);
      setMessage('KYC enviado para análise');
      const status = await usersApi.getKycStatus();
      setKycStatus(status);
    } catch {
      setError('Erro ao enviar KYC (já pode haver um pendente)');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Perfil</h1>

      {(message || error) && (
        <p className={`mb-4 text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>
          {error || message}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#16213E] border-white/10">
          <CardHeader>
            <CardTitle className="text-gray-300">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Nome"
                  className="bg-[#0F0F1A] border-white/10 text-white"
                />
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Sobrenome"
                  className="bg-[#0F0F1A] border-white/10 text-white"
                />
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Telefone"
                  className="bg-[#0F0F1A] border-white/10 text-white"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-[#FFD700] text-[#1A1A2E]">
                    Salvar
                  </Button>
                  <Button type="button" onClick={() => setIsEditing(false)} className="bg-[#0F0F1A]">
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <p>
                  <span className="text-gray-400 text-sm">Email</span>
                  <br />
                  {currentUser?.email}
                </p>
                <p>
                  <span className="text-gray-400 text-sm">Nome</span>
                  <br />
                  {currentUser?.firstName || '-'} {currentUser?.lastName || ''}
                </p>
                <Button onClick={() => setIsEditing(true)} className="bg-[#FFD700] text-[#1A1A2E]">
                  Editar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#16213E] border-white/10">
          <CardHeader>
            <CardTitle className="text-gray-300">Segurança · MFA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Status:{' '}
              <span className={currentUser?.mfaEnabled ? 'text-green-400' : 'text-red-400'}>
                {currentUser?.mfaEnabled ? 'Ativado' : 'Desativado'}
              </span>
            </p>
            {!currentUser?.mfaEnabled && !mfaSecret && (
              <Button onClick={handleStartMfa} className="bg-[#FFD700] text-[#1A1A2E]">
                Configurar MFA
              </Button>
            )}
            {mfaSecret && (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mfaSecret.qrCode} alt="QR MFA" className="mx-auto rounded" />
                <Input
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value)}
                  placeholder="Código do autenticador"
                  className="bg-[#0F0F1A] border-white/10 text-white"
                />
                <Button onClick={handleEnableMfa} className="bg-green-600">
                  Ativar MFA
                </Button>
              </div>
            )}
            {currentUser?.mfaEnabled && (
              <div className="space-y-2">
                <Input
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value)}
                  placeholder="Código para desativar"
                  className="bg-[#0F0F1A] border-white/10 text-white"
                />
                <Button onClick={handleDisableMfa} className="bg-red-600">
                  Desativar MFA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#16213E] border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-300">KYC / Verificação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Verificado:{' '}
              <span className={kycStatus?.isKycVerified ? 'text-green-400' : 'text-yellow-400'}>
                {kycStatus?.isKycVerified
                  ? 'Sim'
                  : kycStatus?.latest?.status || 'Não enviado'}
              </span>
            </p>
            {!kycStatus?.isKycVerified && kycStatus?.latest?.status !== 'PENDING' && (
              <form onSubmit={handleKyc} className="grid md:grid-cols-2 gap-4">
                <select
                  value={kycForm.documentType}
                  onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })}
                  className="bg-[#0F0F1A] border border-white/10 rounded px-3 py-2"
                >
                  <option value="CPF">CPF</option>
                  <option value="RG">RG</option>
                  <option value="CNH">CNH</option>
                  <option value="PASSPORT">Passaporte</option>
                </select>
                <Input
                  value={kycForm.documentNumber}
                  onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })}
                  placeholder="Número do documento"
                  required
                  className="bg-[#0F0F1A] border-white/10 text-white"
                />
                <Button type="submit" className="md:col-span-2 bg-[#FFD700] text-[#1A1A2E]">
                  Enviar KYC (demo)
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
