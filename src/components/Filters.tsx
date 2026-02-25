import React, { useState } from 'react';
import { OrdersFilters } from '../types/order';

interface Props {
  onApply: (filters: OrdersFilters) => void;
  initial?: OrdersFilters;
}

const Filters: React.FC<Props> = ({ onApply, initial = {} }) => {
  const [filters, setFilters] = useState<OrdersFilters>({
    startDate: initial.startDate || '',
    endDate: initial.endDate || '',
    minSubtotal: initial.minSubtotal,
    maxSubtotal: initial.maxSubtotal,
    search: initial.search || '',
  });
  const [expanded, setExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filters);
  };

  const handleReset = () => {
    const reset = { startDate: '', endDate: '', minSubtotal: undefined, maxSubtotal: undefined, search: '' };
    setFilters(reset);
    onApply(reset);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Filters</h3>
        <button onClick={() => setExpanded(!expanded)} className="text-sm text-indigo-600 hover:text-indigo-900">
          {expanded ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                value={filters.startDate} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="date" 
                name="endDate" 
                value={filters.endDate} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Subtotal ($)</label>
              <input 
                type="number" 
                name="minSubtotal" 
                value={filters.minSubtotal || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Subtotal ($)</label>
              <input 
                type="number" 
                name="maxSubtotal" 
                value={filters.maxSubtotal || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input 
                type="text" 
                name="search" 
                value={filters.search} 
                onChange={handleChange} 
                placeholder="ID or location..." 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={handleReset} 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Filters;
