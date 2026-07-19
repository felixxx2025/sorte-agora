'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async (token: string) => {
      try {
        const response = await api.auth.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch {
        setStatus('error');
        setMessage('Verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token, router]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    try {
      const response = await api.auth.resendVerification(resendEmail);
      alert(response.message || 'Verification email sent!');
      setResendEmail('');
    } catch {
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{
      background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)'
    }}>
      <div className="max-w-md mx-auto">
        {/* Verification Status Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {status === 'verifying' && (
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-4">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-300 text-center mb-6">
            {message}
          </p>

          {/* Success Actions */}
          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                Redirecting to login page...
              </p>
              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Error Actions */}
          {status === 'error' && (
            <div>
              <div className="text-center mb-6">
                <Link
                  href="/login"
                  className="inline-block text-purple-400 hover:text-purple-300 font-medium"
                >
                  Back to Login
                </Link>
              </div>

              {/* Resend Verification Form */}
              <div className="border-t border-gray-800 pt-6">
                <h2 className="text-lg font-semibold mb-4">Resend Verification Email</h2>
                <form onSubmit={handleResendVerification}>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)'
      }}>
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
