'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { getCookie } from '@/utils/cookies';
import { organizationService, Event, Organization } from '@/services/organization.service';
import Link from 'next/link';
import { Toast } from '@/components/Toast';
import { extractApiErrorMessage } from '@/utils/apiError';

type EventsPageData = {
  orgData: Organization;
  eventsData: Event[];
};

const pageDataCache = new Map<string, EventsPageData>();
const pageDataInFlight = new Map<string, Promise<EventsPageData>>();

async function getEventsPageData(orgId: string): Promise<EventsPageData> {
  const cached = pageDataCache.get(orgId);
  if (cached) {
    return cached;
  }

  const existingRequest = pageDataInFlight.get(orgId);
  if (existingRequest) {
    return existingRequest;
  }

  const request = Promise.all([
    organizationService.getOrganizationById(orgId),
    organizationService.getOrgEvents(orgId),
  ])
    .then(([orgData, eventsData]) => {
      const data = { orgData, eventsData };
      pageDataCache.set(orgId, data);
      return data;
    })
    .finally(() => {
      pageDataInFlight.delete(orgId);
    });

  pageDataInFlight.set(orgId, request);
  return request;
}

export default function EventsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  const { user } = useSelector((state: any) => state.auth);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
  });

  useEffect(() => {
    if (!getCookie('auth_token')) {
      router.push('/login');
      return;
    }

    // Wait for redux user to be hydrated
    if (!user) return;

    if (!user.organizationId) {
      router.replace('/dashboard');
      return;
    }

    if (user.organizationId !== orgId) {
      router.replace(`/organization/${user.organizationId}/events`);
      return;
    }

    if (orgId) {
      fetchData();
    }
  }, [orgId, router, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { orgData, eventsData } = await getEventsPageData(orgId);
      setOrganization(orgData);
      setEvents(eventsData);
    } catch (err: any) {
      setToastType('error');
      setToastMessage(extractApiErrorMessage(err, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
      setToastType('error');
      setToastMessage('All fields are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const newEvent = await organizationService.createEvent({
        ...formData,
        organizationId: orgId,
      });
      setEvents((prev) => {
        const nextEvents = [newEvent, ...prev];

        const cached = pageDataCache.get(orgId);
        if (cached) {
          pageDataCache.set(orgId, {
            ...cached,
            eventsData: nextEvents,
          });
        }

        return nextEvents;
      });
      setToastType('success');
      setToastMessage('Event created successfully');

      setFormData({ title: '', description: '', date: '' });
      setShowCreateForm(false);
    } catch (err: any) {
      setToastType('error');
      setToastMessage(extractApiErrorMessage(err, 'Failed to save event'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setFormData({ title: '', description: '', date: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Events - {organization?.name}</h1>
            <p className="mt-2 text-gray-600">Create and manage events for this organization</p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setFormData({ title: '', description: '', date: '' });
            }}
            className="px-6 py-3 cursor-pointer bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            {showCreateForm ? 'Cancel' : 'Create Event'}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                  rows={4}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 cursor-pointer bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  {isSubmitting ? 'Saving...' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 cursor-pointer bg-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">No events found. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{event.description}</p>

                {event.location && (
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Location:</strong> {event.location}
                  </p>
                )}

                <div className="pt-4 border-t" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
