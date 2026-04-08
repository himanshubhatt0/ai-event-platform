'use client';

import { useMemo, useState } from 'react';
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

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MarketplaceItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const hasResults = useMemo(() => results.length > 0, [results]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setToastType('error');
      setToastMessage('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const items = await marketplaceService.search(query.trim());
      setResults(items);
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err?.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (item: MarketplaceItem, type: InteractionType) => {
    try {
      await marketplaceService.toggleInteraction({
        type,
        eventId: item.type === 'event' ? item.id : undefined,
        productId: item.type === 'product' ? item.id : undefined,
      });

      setResults((prev) =>
        prev.map((entry) => {
          if (entry.id !== item.id || entry.type !== item.type) {
            return entry;
          }

          const active = entry.userInteractions.includes(type);
          const nextInteractions = active
            ? entry.userInteractions.filter((interaction) => interaction !== type)
            : [...entry.userInteractions, type];

          const nextCount = active
            ? Math.max(0, entry.interactionCounts[type] - 1)
            : entry.interactionCounts[type] + 1;

          return {
            ...entry,
            userInteractions: nextInteractions,
            interactionCounts: {
              ...entry.interactionCounts,
              [type]: nextCount,
            },
          };
        }),
      );
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err?.response?.data?.message || 'Failed to update interaction');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Semantic Search</h1>
        <p className="text-gray-600 mb-6">
          Use natural language to find events and products by meaning, not just keywords.
        </p>

        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. tech conference in delhi next month or affordable AI tools"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {!loading && !hasResults && (
          <div className="bg-white p-10 rounded-lg shadow text-center text-gray-600">
            Enter a query to see relevance-ranked results.
          </div>
        )}

        {hasResults && (
          <div className="space-y-5">
            {results.map((item) => {
              const actions: InteractionType[] =
                item.type === 'event' ? ['LIKE', 'SAVE', 'REGISTER'] : ['LIKE', 'SAVE'];

              return (
                <div key={`${item.type}-${item.id}`} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700 uppercase">
                        {item.type}
                      </span>
                      <h2 className="text-xl font-semibold text-gray-900 mt-2">{item.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">{item.organization?.name || 'Unknown Organization'}</p>
                    </div>
                    <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                      Score: {(item.relevanceScore || 0).toFixed(3)}
                    </span>
                  </div>

                  <p className="text-gray-700 mt-4">{item.description}</p>

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
