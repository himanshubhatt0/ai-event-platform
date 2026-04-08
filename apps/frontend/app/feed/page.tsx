'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/utils/cookies';
import {
  InteractionType,
  MarketplaceItem,
  marketplaceService,
} from '@/services/marketplace.service';
import { Toast } from '@/components/Toast';

function formatInteractionLabel(type: InteractionType) {
  if (type === 'REGISTER') {
    return 'Register';
  }
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export default function FeedPage() {
  const router = useRouter();
  const [feed, setFeed] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const isAuthenticated = Boolean(getCookie('auth_token'));

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const items = await marketplaceService.getFeed();
      setFeed(items);
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err?.response?.data?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchFeed();
  }, [isAuthenticated, router]);

  const handleInteraction = async (item: MarketplaceItem, type: InteractionType) => {
    try {
      await marketplaceService.toggleInteraction({
        type,
        eventId: item.type === 'event' ? item.id : undefined,
        productId: item.type === 'product' ? item.id : undefined,
      });
      await fetchFeed();
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err?.response?.data?.message || 'Failed to update interaction');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-900">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace Feed</h1>
        <p className="text-gray-600 mb-8">Mixed stream of events and products from all organizations.</p>

        {feed.length === 0 ? (
          <div className="bg-white p-10 rounded-lg shadow text-center text-gray-600">
            No items found in feed.
          </div>
        ) : (
          <div className="space-y-5">
            {feed.map((item) => {
              const actions: InteractionType[] =
                item.type === 'event' ? ['LIKE', 'SAVE', 'REGISTER'] : ['LIKE', 'SAVE'];

              return (
                <div key={`${item.type}-${item.id}`} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700 uppercase">
                        {item.type}
                      </span>
                      <h2 className="text-xl font-semibold text-gray-900 mt-2">{item.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.organization?.name || 'Unknown Organization'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-700 mt-4">{item.description}</p>

                  {item.type === 'event' && item.date && (
                    <p className="text-sm text-gray-600 mt-3">
                      Event Date: {new Date(item.date).toLocaleString()}
                    </p>
                  )}

                  {item.type === 'product' && typeof item.price === 'number' && (
                    <p className="text-sm text-gray-600 mt-3">Price: ${item.price.toFixed(2)}</p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {actions.map((action) => {
                      const isActive = item.userInteractions.includes(action);
                      return (
                        <button
                          key={action}
                          onClick={() => handleInteraction(item, action)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {formatInteractionLabel(action)} ({item.interactionCounts[action]})
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
