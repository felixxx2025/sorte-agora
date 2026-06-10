'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/loading';
import { useUpdateProfile, useUserProfile } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: 'BR',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const currentUser = profile || user;

  if (currentUser && !isEditing) {
    setFormData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      phone: currentUser.phone || '',
      country: currentUser.country || 'BR',
    });
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateProfile.mutateAsync(formData);
      setUser(updated);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Erro ao atualizar perfil');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
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
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sobrenome</label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone</label>
                    <Input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">País</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                    >
                      <option value="BR">Brasil</option>
                      <option value="US">Estados Unidos</option>
                      <option value="PT">Portugal</option>
                      <option value="ES">Espanha</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {updateProfile.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
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
                  <div>
                    <p className="text-sm text-gray-400">País</p>
                    <p className="font-medium">{currentUser?.country || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Moeda</p>
                    <p className="font-medium">{currentUser?.currency || '-'}</p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Editar Perfil
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
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
                <span className="text-gray-400">KYC Verificado</span>
                <span className={currentUser?.isKycVerified ? 'text-green-400' : 'text-red-400'}>
                  {currentUser?.isKycVerified ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">MFA Ativado</span>
                <span className={currentUser?.mfaEnabled ? 'text-green-400' : 'text-red-400'}>
                  {currentUser?.mfaEnabled ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Membro desde</span>
                <span className="text-white">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
