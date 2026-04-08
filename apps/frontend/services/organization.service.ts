import { api } from './api';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  users?: User[];
  events?: Event[];
  products?: Product[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  organizationId?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  date: string;
  organizationId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  organizationId: string;
  createdAt: string;
}

// Organization APIs
export const organizationService = {
  // Organizations
  getAllOrganizations: async (): Promise<Organization[]> => {
    const response = await api.get('/organization');
    return response.data;
  },

  getOrganizationById: async (orgId: string): Promise<Organization> => {
    const response = await api.get(`/organization/${orgId}`);
    return response.data;
  },

  createOrganization: async (name: string): Promise<Organization> => {
    const response = await api.post('/organization', { name });
    return response.data;
  },

  updateOrganization: async (orgId: string, name: string): Promise<Organization> => {
    const response = await api.put(`/organization/${orgId}`, { name });
    return response.data;
  },

  deleteOrganization: async (orgId: string): Promise<Organization> => {
    const response = await api.delete(`/organization/${orgId}`);
    return response.data;
  },

  // Users in Organization
  getOrgUsers: async (orgId: string): Promise<Organization> => {
    const response = await api.get(`/organization/${orgId}/users`);
    return response.data;
  },

  assignUserToOrg: async (orgId: string, userId: string): Promise<User> => {
    const response = await api.post(`/organization/${orgId}/user/${userId}`);
    return response.data;
  },

  removeUserFromOrg: async (userId: string): Promise<User> => {
    const response = await api.delete(`/organization/user/${userId}`);
    return response.data;
  },

  // Events
  getOrgEvents: async (orgId: string): Promise<Event[]> => {
    const response = await api.get(`/organization/${orgId}/events`);
    return response.data;
  },

  createEvent: async (data: {
    title: string;
    description: string;
    date: string;
    organizationId: string;
  }): Promise<Event> => {
    const response = await api.post('/event', data);
    return response.data;
  },

  getEventById: async (eventId: string): Promise<Event> => {
    const response = await api.get(`/event/${eventId}`);
    return response.data;
  },

  updateEvent: async (
    eventId: string,
    data: Partial<{
      title: string;
      description: string;
      date: string;
    }>,
  ): Promise<Event> => {
    const response = await api.put(`/event/${eventId}`, data);
    return response.data;
  },

  // Products
  getOrgProducts: async (orgId: string): Promise<Product[]> => {
    const response = await api.get(`/organization/${orgId}/products`);
    return response.data;
  },

  createProduct: async (data: {
    title: string;
    description: string;
    price: number;
    organizationId: string;
  }): Promise<Product> => {
    const response = await api.post('/product', data);
    return response.data;
  },

  getProductById: async (productId: string): Promise<Product> => {
    const response = await api.get(`/product/${productId}`);
    return response.data;
  },

  updateProduct: async (
    productId: string,
    data: Partial<{
      title: string;
      description: string;
      price: number;
    }>,
  ): Promise<Product> => {
    const response = await api.put(`/product/${productId}`, data);
    return response.data;
  },
};
