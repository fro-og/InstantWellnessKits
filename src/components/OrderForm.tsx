import React from 'react';
import { useForm } from 'react-hook-form';
import { CreateOrderDto } from '../types/order';
import { NEW_YORK_STATE_BOUNDS } from '../utils/constants';

interface Props {
  onSubmit: (data: CreateOrderDto) => Promise<void>;
  loading?: boolean;
}

const OrderForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateOrderDto>();

  const onFormSubmit = async (data: CreateOrderDto) => {
    await onSubmit(data);
    reset();
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Order</h2>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
            Latitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="latitude"
            step="any"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.latitude ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., 40.7128"
            {...register('latitude', {
              required: 'Latitude is required',
              min: {
                value: NEW_YORK_STATE_BOUNDS.minLat,
                message: `Latitude must be between ${NEW_YORK_STATE_BOUNDS.minLat} and ${NEW_YORK_STATE_BOUNDS.maxLat}`,
              },
              max: {
                value: NEW_YORK_STATE_BOUNDS.maxLat,
                message: `Latitude must be between ${NEW_YORK_STATE_BOUNDS.minLat} and ${NEW_YORK_STATE_BOUNDS.maxLat}`,
              },
            })}
          />
          {errors.latitude && (
            <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="longitude"
            step="any"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.longitude ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., -74.0060"
            {...register('longitude', {
              required: 'Longitude is required',
              min: {
                value: NEW_YORK_STATE_BOUNDS.minLng,
                message: `Longitude must be between ${NEW_YORK_STATE_BOUNDS.minLng} and ${NEW_YORK_STATE_BOUNDS.maxLng}`,
              },
              max: {
                value: NEW_YORK_STATE_BOUNDS.maxLng,
                message: `Longitude must be between ${NEW_YORK_STATE_BOUNDS.minLng} and ${NEW_YORK_STATE_BOUNDS.maxLng}`,
              },
            })}
          />
          {errors.longitude && (
            <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="subtotal" className="block text-sm font-medium text-gray-700 mb-1">
            Subtotal ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="subtotal"
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.subtotal ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., 120.00"
            {...register('subtotal', {
              required: 'Subtotal is required',
              min: {
                value: 0.01,
                message: 'Subtotal must be greater than 0',
              },
            })}
          />
          {errors.subtotal && (
            <p className="mt-1 text-sm text-red-600">{errors.subtotal.message}</p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-700">
          <span className="font-medium">Note:</span> Orders must be within New York State boundaries.
        </p>
      </div>
    </div>
  );
};

export default OrderForm;
