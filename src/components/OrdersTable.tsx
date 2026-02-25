import React, { useState } from 'react';
import { Order } from '../types/order';
import { formatCurrency, formatTaxRate, formatDate, formatCoordinates } from '../utils/formatters';
import TaxBreakdown from './TaxBreakdown';

interface Props {
  orders: Order[];
  loading: boolean;
}

const OrdersTable: React.FC<Props> = ({ orders, loading }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No orders found</p>
        <p className="text-gray-400 mt-2">Try adjusting your filters or import some orders</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCoordinates(order.latitude, order.longitude)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.subtotal)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.tax_amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTaxRate(order.composite_tax_rate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.timestamp)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {expandedId === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                </td>
              </tr>
              {expandedId === order.id && (
                <tr className="bg-gray-50">
                  <td colSpan={8} className="px-6 py-4">
                    <TaxBreakdown breakdown={order.breakdown} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
