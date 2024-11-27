'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pb } from '../lib/pocketbase';
import type { Emergency } from '../types/emergency';

export default function ClosedTickets() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);

  useEffect(() => {
    // Fetch only closed tickets
    const fetchClosedEmergencies = async () => {
      const records = await pb.collection('ticket').getList(1, 50, {
        filter: 'status = "close"',
        sort: '-created',
      });
      setEmergencies(records.items as unknown as Emergency[]);
    };

    fetchClosedEmergencies();

    // Subscribe to realtime updates for closed tickets
    const subscribeToUpdates = async () => {
      const unsubscribe = await pb.collection('ticket').subscribe('*', function(e) {
        if (e.action === 'create' && e.record.status === 'close') {
          setEmergencies(prev => [...prev, e.record as unknown as Emergency]);
        } else if (e.action === 'update') {
          setEmergencies(prev => 
            prev.map(item => item.id === e.record.id ? (e.record as unknown as Emergency) : item)
          );
        } else if (e.action === 'delete') {
          setEmergencies(prev => prev.filter(item => item.id !== e.record.id));
        }
      });
      return unsubscribe;
    };

    const unsubscribePromise = subscribeToUpdates();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start h-16">
            <div className="flex space-x-4 items-center">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Active
              </Link>
              <Link
                href="/closed"
                className="px-3 py-2 rounded-md text-sm font-medium bg-gray-900 text-white"
              >
                Closed
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {emergencies.map((emergency) => (
              <li key={emergency.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {emergency.current_situation}
                    </h3>
                    <p className="text-sm text-gray-500">{emergency.location}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Closed
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
