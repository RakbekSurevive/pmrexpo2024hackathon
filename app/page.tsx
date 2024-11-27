'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pb } from './lib/pocketbase';
import type { Emergency } from './types/emergency';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <main className="max-w-5xl mx-auto space-y-12">
        {/* High Priority Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 px-6 py-2.5 inline-block rounded-full bg-red-50 text-red-700 border border-red-200 shadow-sm">
            High priority
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highPriorityItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleCardClick(item.id)}
                className="cursor-pointer flex items-start gap-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-red-600">map</span>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-red-600">Priority: {item.emergency_priority}</p>
                  <p className="text-slate-600">Type: {item.emergency_type}</p>
                  <p className="text-slate-500">Location: {item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Low Priority Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 px-6 py-2.5 inline-block rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
            Low priority
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lowPriorityItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleCardClick(item.id)}
                className="cursor-pointer flex items-start gap-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-blue-600">map</span>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-blue-600">Priority: {item.emergency_priority}</p>
                  <p className="text-slate-600">Type: {item.emergency_type}</p>
                  <p className="text-slate-500">Location: {item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
