import React from 'react';
import { TaxBreakdown as TaxBreakdownType } from '../types/order';
import { formatTaxRate } from '../utils/formatters';

interface Props {
  breakdown: TaxBreakdownType;
}

const TaxBreakdown: React.FC<Props> = ({ breakdown }) => {
  const composite =
    breakdown.state_rate +
    breakdown.county_rate +
    breakdown.city_rate +
    breakdown.special_rates;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Tax Breakdown</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">State Rate</p>
          <p className="text-lg font-semibold text-gray-900">{formatTaxRate(breakdown.state_rate)}</p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">County Rate</p>
          <p className="text-lg font-semibold text-gray-900">{formatTaxRate(breakdown.county_rate)}</p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">City Rate</p>
          <p className="text-lg font-semibold text-gray-900">{formatTaxRate(breakdown.city_rate)}</p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Special Rates</p>
          <p className="text-lg font-semibold text-gray-900">{formatTaxRate(breakdown.special_rates)}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Composite Rate:</span> {formatTaxRate(composite)}
        </p>
      </div>
    </div>
  );
};

export default TaxBreakdown;
