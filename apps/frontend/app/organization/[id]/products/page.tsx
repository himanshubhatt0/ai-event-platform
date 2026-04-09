'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { getCookie } from '@/utils/cookies';
import { organizationService, Product, Organization } from '@/services/organization.service';
import Link from 'next/link';
import { Toast } from '@/components/Toast';
import { extractApiErrorMessage } from '@/utils/apiError';

export default function ProductsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  const { user } = useSelector((state: any) => state.auth);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
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
      router.replace(`/organization/${user.organizationId}/products`);
      return;
    }

    if (orgId) {
      fetchData();
    }
  }, [orgId, router, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgData, productsData] = await Promise.all([
        organizationService.getOrganizationById(orgId),
        organizationService.getOrgProducts(orgId),
      ]);
      setOrganization(orgData);
      setProducts(productsData);
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

    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      setToastType('error');
      setToastMessage('All fields are required');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setToastType('error');
      setToastMessage('Price must be a valid positive number');
      return;
    }

    try {
      setIsSubmitting(true);
      const newProduct = await organizationService.createProduct({
        title: formData.title,
        description: formData.description,
        price,
        organizationId: orgId,
      });
      setProducts((prev) => [newProduct, ...prev]);
      setToastType('success');
      setToastMessage('Product created successfully');

      setFormData({ title: '', description: '', price: '' });
      setShowCreateForm(false);
    } catch (err: any) {
      setToastType('error');
      setToastMessage(extractApiErrorMessage(err, 'Failed to save product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setFormData({ title: '', description: '', price: '' });
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
            <h1 className="text-4xl font-bold text-gray-900">Products - {organization?.name}</h1>
            <p className="mt-2 text-gray-600">Create and manage products for this organization</p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setFormData({ title: '', description: '', price: '' });
            }}
            className="px-6 py-3 bg-indigo-600 cursor-pointer text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            {showCreateForm ? 'Cancel' : 'Create Product'}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Product title"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                  rows={4}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Product price"
                  step="0.01"
                  min="0"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 cursor-pointer px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  {isSubmitting ? 'Saving...' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 cursor-pointer px-4 py-2 bg-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">No products found. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{product.title}</h3>
                    <p className="text-2xl font-bold text-indigo-600 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{product.description}</p>

                <p className="text-xs text-gray-500 mb-4">
                  Created: {new Date(product.createdAt).toLocaleDateString()}
                </p>

                <div className="pt-4 border-t" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
