'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCookie } from '@/utils/cookies';
import { organizationService, Event, Organization } from '@/services/organization.service';
import Link from 'next/link';
import { Toast } from '@/components/Toast';

export default function EventsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    if (orgId) {
      fetchData();
    }
  }, [orgId, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgData, eventsData] = await Promise.all([
        organizationService.getOrganizationById(orgId),
        organizationService.getOrgEvents(orgId),
      ]);
      setOrganization(orgData);
      setEvents(eventsData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch data';
      setToastType('error');
      setToastMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
      setToastType('error');
      setToastMessage('All fields are required');
      return;
    }

    try {
      if (editingId) {
        // Update existing event
        const updated = await organizationService.updateEvent(editingId, formData);
        setEvents(events.map((e) => (e.id === editingId ? updated : e)));
        setToastType('success');
        setToastMessage('Event updated successfully');
      } else {
        // Create new event
        const newEvent = await organizationService.createEvent({
          ...formData,
          organizationId: orgId,
        });
        setEvents([newEvent, ...events]);
        setToastType('success');
        setToastMessage('Event created successfully');
      }

      setFormData({ title: '', description: '', date: '' });
      setShowCreateForm(false);
      setEditingId(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to save event';
      setToastType('error');
      setToastMessage(errorMessage);
    }
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
    });
    setEditingId(event.id);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', date: '' });
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await organizationService.deleteEvent(eventId);
      setEvents(events.filter((e) => e.id !== eventId));
      setToastType('success');
      setToastMessage('Event deleted successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete event';
      setToastType('error');
      setToastMessage(errorMessage);
    }
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
            <Link href="/organization" className="text-indigo-600 hover:text-indigo-700 font-medium mb-2 inline-block">
              ← Back to Organizations
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Events - {organization?.name}</h1>
            <p className="mt-2 text-gray-600">Create and manage events for this organization</p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingId(null);
              setFormData({ title: '', description: '', date: '' });
            }}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            {showCreateForm ? 'Cancel' : 'Create Event'}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Event' : 'Create New Event'}
            </h2>
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
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  {editingId ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-400 transition"
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

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(event)}
                    className="w-1/2 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="w-1/2 px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
