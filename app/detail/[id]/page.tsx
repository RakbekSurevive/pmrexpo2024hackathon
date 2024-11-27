'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pb } from '../../lib/pocketbase';
import type { Emergency } from '../../types/emergency';
import { ClientResponseError } from 'pocketbase';

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = use(params);

  useEffect(() => {
    async function fetchEmergency() {
      try {
        setIsLoading(true);
        const record = await pb.collection('ticket').getOne(id);
        setEmergency(record as unknown as Emergency);
      } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
          router.push('/'); // Redirect to home page
          return;
        }
        console.error('Error fetching emergency:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmergency();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!emergency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Emergency not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Emergency Details</h1>
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-semibold">Priority:</span>{' '}
            <span className={emergency.emergency_priority === 'high' ? 'text-red-600' : 'text-blue-600'}>
              {emergency.emergency_priority}
            </span>
          </p>
          <p className="text-lg">
            <span className="font-semibold">Type:</span>{' '}
            <span className="text-slate-600">{emergency.emergency_type}</span>
          </p>
          <p className="text-lg">
            <span className="font-semibold">Location:</span>{' '}
            <span className="text-slate-600">{emergency.location}</span>
          </p>
          <p className="text-lg">
            <span className="font-semibold">Current Situation:</span>{' '}
            <span className="text-slate-600">{emergency.current_situation}</span>
          </p>
        </div>
      </main>
    </div>
  );
}