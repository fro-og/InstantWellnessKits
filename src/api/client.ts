import axios from 'axios';
import { Order, CreateOrderDto, OrdersResponse, OrdersFilters } from '../types/order';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ordersApi = {
  getOrders: async (filters: OrdersFilters = {}): Promise<OrdersResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.minSubtotal) params.append('minSubtotal', filters.minSubtotal.toString());
    if (filters.maxSubtotal) params.append('maxSubtotal', filters.maxSubtotal.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.get(`/orders?${params.toString()}`);
    return response.data;
  },

  createOrder: async (data: CreateOrderDto): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  importCSV: async (file: File): Promise<{ message: string; count: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/orders/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  }
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  register: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/register', { email, password });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  }
};
