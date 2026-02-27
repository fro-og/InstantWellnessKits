import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/client';
import OrdersTable from '../components/OrdersTable';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';
import { OrdersFilters, OrdersResponse } from '../types/order';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<OrdersFilters>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });

  const { data, isLoading, error } = useQuery<OrdersResponse>({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.getOrders(filters),
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load orders');
    }
  }, [error]);

  const handleApplyFilters = (newFilters: OrdersFilters) => {
    setFilters({
      ...newFilters,
      page: 1,
      limit: filters.limit,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (limit: number) => {
    setFilters({ ...filters, page: 1, limit });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all wellness kit orders with tax calculations
        </p>
      </div>

      <Filters onApply={handleApplyFilters} />

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <OrdersTable orders={data?.data || []} loading={isLoading} />

        {data && data.total > 0 && (
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            pageSize={data.limit}
            totalItems={data.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
