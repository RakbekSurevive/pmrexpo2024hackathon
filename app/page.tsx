'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pb } from './lib/pocketbase';
import type { Emergency } from './types/emergency';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEmergencies() {
      try {
        setIsLoading(true);
        const records = await pb.collection('ticket').getFullList();
        setEmergencies(records as unknown as Emergency[]);
      } catch (error) {
        console.error('Error fetching emergencies:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmergencies();
  }, []);

  const handleCardClick = (id: string) => {
    router.push(`/detail/${id}`);
  };

  const highPriorityItems = emergencies.filter(item => item.emergency_priority === 'high');
  const lowPriorityItems = emergencies.filter(item => item.emergency_priority === 'low');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Emergency Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Overview of all emergency tickets</p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {emergencies.map((emergency) => (
            <div key={emergency.id} className="border-b border-gray-200 hover:bg-gray-50">
              <Link href={`/detail/${emergency.id}`} className="block p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emergency.emergency_priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {emergency.emergency_priority}
                      </span>
                      <span className="text-sm text-gray-500">{emergency.emergency_type}</span>
                    </div>
                    <p className="text-sm text-gray-900">{emergency.location}</p>
                    <p className="text-sm text-gray-500">{emergency.current_situation}</p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
