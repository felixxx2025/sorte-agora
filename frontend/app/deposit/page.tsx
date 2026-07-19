'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DepositPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/wallet?tab=deposit');
  }, [router]);

  return null;
}
