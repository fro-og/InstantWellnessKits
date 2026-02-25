import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';
import { ordersApi } from '../api/client';
import { CreateOrderDto } from '../types/order';
import { toast } from 'react-toastify';

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const handleSubmit = async (data: CreateOrderDto) => {
    setLoading(true);
    try {
      const order = await ordersApi.createOrder(data);
      setCreatedOrder(order);
      toast.success('Order created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate('/');
  };

  const handleCreateAnother = () => {
    setCreatedOrder(null);
  };

  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">Order Created Successfully!</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-lg font-semibold text-gray-900">#{createdOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-lg font-semibold text-gray-900">
                  {createdOrder.latitude.toFixed(6)}, {createdOrder.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${createdOrder.subtotal.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${createdOrder.tax_amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${createdOrder.total_amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(createdOrder.composite_tax_rate * 100).toFixed(3)}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleViewAll}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              View All Orders
            </button>
            <button
              onClick={handleCreateAnother}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Order</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manually create a wellness kit order with tax calculation
        </p>
      </div>

      <OrderForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateOrder;
