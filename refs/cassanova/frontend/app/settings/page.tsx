'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

function SettingsPageContent() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    // Fetch 2FA status
    const fetch2FAStatus = async () => {
      try {
        const response = await api.auth.get2FAStatus(token);
        if (response.twoFactorEnabled !== undefined) {
          setTwoFactorEnabled(response.twoFactorEnabled);
        }
      } catch (err) {
        console.error('Failed to fetch 2FA status:', err);
      }
    };

    fetch2FAStatus();
  }, [user, token, router]);

  const handleSetup2FA = async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.auth.setup2FA(token);
      
      if (response.qrCode && response.secret && response.backupCodes) {
        setQrCode(response.qrCode);
        setSecret(response.secret);
        setBackupCodes(response.backupCodes);
        setShowSetup(true);
      } else {
        setError(response.message || 'Failed to setup 2FA');
      }
    } catch {
      setError('Failed to setup 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !verificationCode) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.auth.verify2FA(token, verificationCode);
      
      if (response.message && response.message.includes('enabled')) {
        setSuccess('Two-factor authentication enabled successfully!');
        setTwoFactorEnabled(true);
        setShowSetup(false);
        setVerificationCode('');
        
        // Keep backup codes visible
        setTimeout(() => {
          setQrCode('');
          setSecret('');
        }, 5000);
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !disablePassword) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.auth.disable2FA(token, disablePassword);
      
      if (response.message && response.message.includes('disabled')) {
        setSuccess('Two-factor authentication disabled successfully');
        setTwoFactorEnabled(false);
        setShowDisable(false);
        setDisablePassword('');
        setBackupCodes([]);
      } else {
        setError(response.message || 'Failed to disable 2FA');
      }
    } catch {
      setError('Failed to disable 2FA. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Security Settings</h1>
          <p className="text-gray-300">
            Manage your account security and two-factor authentication
          </p>
        </div>

        {/* 2FA Status Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Two-Factor Authentication</h2>
              <p className="text-gray-300">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${
              twoFactorEnabled 
                ? 'bg-green-500/20 text-green-400 border border-green-400' 
                : 'bg-gray-500/20 text-gray-400 border border-gray-400'
            }`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          {!twoFactorEnabled && !showSetup && (
            <div>
              <p className="text-gray-300 mb-6">
                Two-factor authentication provides an additional layer of security by requiring a verification code from your authenticator app when you log in.
              </p>
              <button
                onClick={handleSetup2FA}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 px-8 py-3 rounded-lg font-bold hover:from-yellow-300 hover:to-yellow-400 transition-all disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Enable 2FA'}
              </button>
            </div>
          )}

          {twoFactorEnabled && !showDisable && (
            <div>
              <div className="bg-green-500/10 border border-green-400 rounded-lg p-4 mb-6">
                <p className="text-green-300 flex items-center">
                  <span className="text-2xl mr-2">✓</span>
                  Your account is protected with two-factor authentication
                </p>
              </div>
              <button
                onClick={() => setShowDisable(true)}
                className="bg-red-500/20 text-red-300 border border-red-400 px-8 py-3 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
              >
                Disable 2FA
              </button>
            </div>
          )}
        </div>

        {/* Setup 2FA Flow */}
        {showSetup && qrCode && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-6">
            <h3 className="text-2xl font-semibold text-white mb-6">Setup Two-Factor Authentication</h3>
            
            <div className="space-y-6">
              {/* Step 1: Scan QR Code */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Step 1: Scan QR Code</h4>
                <p className="text-gray-300 mb-4">
                  Use an authenticator app (Google Authenticator, Authy, etc.) to scan this QR code:
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                </div>
              </div>

              {/* Step 2: Manual Entry (Optional) */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Or Enter Code Manually</h4>
                <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
                  <code className="text-yellow-400 font-mono text-lg">{secret}</code>
                  <button
                    onClick={() => copyToClipboard(secret)}
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Step 3: Verify */}
              <form onSubmit={handleVerify2FA}>
                <h4 className="text-lg font-semibold text-white mb-3">Step 2: Verify Code</h4>
                <p className="text-gray-300 mb-4">
                  Enter the 6-digit code from your authenticator app:
                </p>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-yellow-400"
                    maxLength={6}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 px-8 py-3 rounded-lg font-bold hover:from-yellow-300 hover:to-yellow-400 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </form>

              {/* Backup Codes */}
              <div className="bg-red-500/10 border border-red-400 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <span className="text-2xl mr-2">⚠️</span>
                  Backup Codes
                </h4>
                <p className="text-gray-300 mb-4">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white/5 p-3 rounded-lg">
                      <code className="text-yellow-400 font-mono">{code}</code>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  className="mt-4 text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Copy All Codes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disable 2FA Form */}
        {showDisable && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-6">
            <h3 className="text-2xl font-semibold text-white mb-6">Disable Two-Factor Authentication</h3>
            
            <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-4 mb-6">
              <p className="text-yellow-300 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                Disabling 2FA will make your account less secure
              </p>
            </div>

            <form onSubmit={handleDisable2FA} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Confirm Your Password
                </label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisable(false);
                    setDisablePassword('');
                    setError('');
                  }}
                  className="flex-1 bg-white/10 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-500/20 border border-blue-400 rounded-xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <span className="text-2xl mr-2">ℹ️</span>
            About Two-Factor Authentication
          </h3>
          <ul className="text-gray-300 space-y-2 ml-8 list-disc">
            <li>2FA adds an extra layer of security to your account</li>
            <li>You&apos;ll need your authenticator app every time you log in</li>
            <li>Save your backup codes in a secure location</li>
            <li>Each backup code can only be used once</li>
            <li>Popular authenticator apps: Google Authenticator, Authy, Microsoft Authenticator</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-yellow-400 hover:text-yellow-300 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
