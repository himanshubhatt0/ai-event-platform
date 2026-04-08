'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/utils/cookies';
import { organizationService, Organization } from '@/services/organization.service';
import Link from 'next/link';
import { Toast } from '@/components/Toast';

export default function OrganizationDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const router = useRouter();

  useEffect(() => {
    if (!getCookie('auth_token')) {
      router.push('/login');
      return;
    }
    fetchOrganizations();
  }, [router]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getAllOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch organizations';
      setError(errorMessage);
      setToastType('error');
      setToastMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      setToastType('error');
      setToastMessage('Organization name is required');
      return;
    }

    try {
      const newOrg = await organizationService.createOrganization(newOrgName);
      setOrganizations([newOrg, ...organizations]);
      setNewOrgName('');
      setShowCreateForm(false);
      setToastType('success');
      setToastMessage('Organization created successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create organization';
      setToastType('error');
      setToastMessage(errorMessage);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      try {
        await organizationService.deleteOrganization(orgId);
        setOrganizations(organizations.filter((org) => org.id !== orgId));
        setToastType('success');
        setToastMessage('Organization deleted successfully');
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Failed to delete organization';
        setToastType('error');
        setToastMessage(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-900">Loading organizations...</div>
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
            <h1 className="text-4xl font-bold text-gray-900">Organizations</h1>
            <p className="mt-2 text-gray-600">Manage your organizations and their events and products</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out"
          >
            {showCreateForm ? 'Cancel' : 'Create Organization'}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Organization</h2>
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Enter organization name"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={100}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out"
              >
                Create Organization
              </button>
            </form>
          </div>
        )}

        {/* Organizations Grid */}
        {organizations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No organizations found. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div key={org.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-150">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{org.name}</h3>
                <p className="text-sm text-gray-600 mb-4">Created: {new Date(org.createdAt).toLocaleDateString()}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">{org.users?.length || 0}</div>
                    <div className="text-xs text-gray-600">Users</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-2xl font-bold text-green-600">{org.events?.length || 0}</div>
                    <div className="text-xs text-gray-600">Events</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-2xl font-bold text-purple-600">{org.products?.length || 0}</div>
                    <div className="text-xs text-gray-600">Products</div>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Link
                    href={`/organization/${org.id}/events`}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-center text-sm font-medium rounded hover:bg-blue-700 transition"
                  >
                    Events
                  </Link>
                  <Link
                    href={`/organization/${org.id}/products`}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-center text-sm font-medium rounded hover:bg-green-700 transition"
                  >
                    Products
                  </Link>
                </div>

                <button
                  onClick={() => handleDeleteOrganization(org.id)}
                  className="w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
