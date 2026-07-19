'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/loading';
import { useUpdateProfile, useUserProfile } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';
import { useEffect, useState } from 'react';

function ProfileContent() {
  const { user, setUser } = useAuthStore();
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: 'BR',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        <p className={`mb-4 text-sm ${error ? 'text-red-400' : 'text-green-400'}`} role={error ? 'alert' : 'status'}>
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
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="bg-[#0F0F1A] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sobrenome</label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="bg-[#0F0F1A] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <Input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-[#0F0F1A] border-white/10 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E]"
                  >
                    {updateProfile.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button type="button" onClick={() => setIsEditing(false)} className="bg-[#0F0F1A]">
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Nome</p>
                  <p className="font-medium">{currentUser?.firstName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Sobrenome</p>
                  <p className="font-medium">{currentUser?.lastName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Telefone</p>
                  <p className="font-medium">{currentUser?.phone || '-'}</p>
                </div>
                <Button onClick={() => setIsEditing(true)} className="mt-4 bg-[#FFD700] text-[#1A1A2E]">
                  Editar Perfil
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#16213E] border-white/10">
          <CardHeader>
            <CardTitle className="text-gray-300">Status da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Verificado</span>
              <span className={currentUser?.isVerified ? 'text-green-400' : 'text-red-400'}>
                {currentUser?.isVerified ? 'Sim' : 'Não'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">KYC</span>
              <span className={currentUser?.isKycVerified ? 'text-green-400' : 'text-red-400'}>
                {currentUser?.isKycVerified ? 'Sim' : 'Não'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">MFA</span>
              <span className={currentUser?.mfaEnabled ? 'text-green-400' : 'text-red-400'}>
                {currentUser?.mfaEnabled ? 'Sim' : 'Não'}
              </span>
            </div>
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
