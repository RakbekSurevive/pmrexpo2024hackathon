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
    // Initial fetch
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

    // Subscribe to realtime updates
    const subscribeToUpdates = async () => {
      const unsubscribe = await pb.collection('ticket').subscribe('*', function(e) {
        if (e.action === 'create') {
          setEmergencies(prev => [...prev, e.record as unknown as Emergency]);
        } else if (e.action === 'update') {
          setEmergencies(prev => 
            prev.map(item => item.id === e.record.id ? (e.record as unknown as Emergency) : item)
          );
        } else if (e.action === 'delete') {
          setEmergencies(prev => prev.filter(item => item.id !== e.record.id));
        }
      });

      // Cleanup subscription on unmount
      return unsubscribe;
    };

    const unsubscribePromise = subscribeToUpdates();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe());
    };
  }, []);

  const handleCardClick = (id: string) => {
    router.push(`/detail/${id}`);
  };

  const highPriorityItems = emergencies.filter(item => item.emergency_priority === 'high');
  const mediumPriorityItems = emergencies.filter(item => item.emergency_priority === 'medium');
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
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start h-16">
            <div className="flex space-x-4 items-center">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium bg-gray-900 text-white"
              >
                Active
              </Link>
              <Link
                href="/closed"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Closed
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Emergency Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Overview of all emergency tickets</p>
        </div>

        {highPriorityItems.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">High Priority Emergencies</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {highPriorityItems.map((emergency) => (
                <div key={emergency.id} className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-300">
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
          </section>
        )}

        {mediumPriorityItems.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Medium Priority Emergencies</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mediumPriorityItems.map((emergency) => (
                <div key={emergency.id} className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <Link href={`/detail/${emergency.id}`} className="block p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emergency.emergency_priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
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
          </section>
        )}

        {lowPriorityItems.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Low Priority Emergencies</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lowPriorityItems.map((emergency) => (
                <div key={emergency.id} className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <Link href={`/detail/${emergency.id}`} className="block p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emergency.emergency_priority === 'low' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'
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
          </section>
        )}
      </div>
    </div>
  );
}
