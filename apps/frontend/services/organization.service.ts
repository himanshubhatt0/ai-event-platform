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

export interface CreateMyOrganizationResponse {
  access_token: string;
  message: string;
  user: User;
  organization: Organization;
}

// Organization APIs
export const organizationService = {
  // Organizations used by the current frontend flows
  getOrganizationById: async (orgId: string): Promise<Organization> => {
    const response = await api.get(`/organization/${orgId}`);
    return response.data;
  },

  createMyOrganization: async (name: string): Promise<CreateMyOrganizationResponse> => {
    const response = await api.post('/organization/mine', { name });
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
};
