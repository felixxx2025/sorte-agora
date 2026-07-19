'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

function KYCPageContent() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    // Fetch existing KYC documents
    const fetchDocuments = async () => {
      try {
        const response = await api.user.getKYCDocuments(token);
        if (response.kycDocuments) {
          setDocuments(response.kycDocuments);
        }
        if (response.kycStatus) {
          setKycStatus(response.kycStatus);
        }
      } catch (err) {
        console.error('Failed to fetch KYC documents:', err);
      }
    };

    fetchDocuments();
  }, [user, token, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentType) {
      setError('Please select a document type');
      return;
    }

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!token) {
      setError('Please log in to upload documents');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Convert file to base64 for demo purposes
      // In production, upload to a file storage service (S3, Cloudinary, etc.)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        try {
          const response = await api.user.uploadKYCDocument(token, documentType, base64Data);
          
          if (response.message && response.message.includes('successfully')) {
            setSuccess('Document uploaded successfully! Your KYC verification is pending review.');
            setDocumentType('');
            setSelectedFile(null);
            setPreviewUrl(null);
            
            // Refresh document list
            if (response.kycDocuments) {
              setDocuments(response.kycDocuments);
            }
            if (response.kycStatus) {
              setKycStatus(response.kycStatus);
            }
          } else {
            setError('Failed to upload document. Please try again.');
          }
        } catch {
          setError('Failed to upload document. Please try again.');
        } finally {
          setUploading(false);
        }
      };
      
      reader.readAsDataURL(selectedFile);
    } catch {
      setError('Failed to process file. Please try again.');
      setUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">KYC Verification</h1>
          <p className="text-gray-300">
            Upload your documents for identity verification
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">KYC Status</h2>
              <p className="text-gray-300">
                Current status: 
                <span className={`ml-2 font-semibold ${
                  kycStatus === 'verified' ? 'text-green-400' :
                  kycStatus === 'pending' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {kycStatus === 'verified' ? '✓ Verified' :
                   kycStatus === 'pending' ? '⏳ Pending Review' :
                   '✗ Rejected'}
                </span>
              </p>
            </div>
            {kycStatus === 'verified' && (
              <div className="text-green-400 text-5xl">✓</div>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Upload Document</h2>
          
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Document Type Selection */}
            <div>
              <label className="block text-white font-medium mb-2">Document Type *</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-yellow-400"
                required
              >
                <option value="" className="bg-purple-900">Select document type</option>
                <option value="passport" className="bg-purple-900">Passport</option>
                <option value="drivers_license" className="bg-purple-900">Driver&apos;s License</option>
                <option value="national_id" className="bg-purple-900">National ID Card</option>
                <option value="proof_of_address" className="bg-purple-900">Proof of Address</option>
                <option value="bank_statement" className="bg-purple-900">Bank Statement</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-white font-medium mb-2">Upload File *</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-400 file:text-purple-900 file:font-semibold hover:file:bg-yellow-300 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Accepted formats: JPEG, PNG, PDF (Max size: 5MB)
              </p>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div>
                <label className="block text-white font-medium mb-2">Preview</label>
                <div className="relative w-full h-64 bg-white/5 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={previewUrl} 
                    alt="Document preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {selectedFile && !previewUrl && (
              <div className="text-white">
                Selected file: {selectedFile.name}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !documentType || !selectedFile}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 py-4 rounded-lg font-bold text-lg hover:from-yellow-300 hover:to-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Uploaded Documents</h2>
            <div className="space-y-3">
              {documents.map((doc, index) => {
                let type = 'Unknown';
                let uploadedAt = '';
                try {
                  const parsed = JSON.parse(doc);
                  type = parsed.type || 'Unknown';
                  if (parsed.uploadedAt) {
                    uploadedAt = new Date(parsed.uploadedAt).toLocaleDateString();
                  }
                } catch {
                  // Fallback for old format (type:url)
                  const parts = doc.split(':');
                  type = parts[0] || 'Unknown';
                }
                
                return (
                  <div key={index} className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-yellow-400 text-2xl">📄</div>
                      <div>
                        <p className="text-white font-medium capitalize">
                          {type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {uploadedAt ? `Uploaded: ${uploadedAt}` : `Document #${index + 1}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-green-400 text-sm">✓ Uploaded</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-500/20 border border-blue-400 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <span className="text-2xl mr-2">ℹ️</span>
            Important Information
          </h3>
          <ul className="text-gray-300 space-y-2 ml-8 list-disc">
            <li>All documents must be clear and readable</li>
            <li>Documents should not be older than 3 months (for proof of address)</li>
            <li>Personal information must be clearly visible</li>
            <li>Verification typically takes 24-48 hours</li>
            <li>You will be notified via email once your documents are reviewed</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
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

export default function KYCPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <KYCPageContent />
    </Suspense>
  );
}
