import React from 'react';
import { useNavigate } from 'react-router-dom';
import CSVUploader from '../components/CSVUploader';

const ImportCSV: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Import Orders from CSV</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV file with multiple orders. Tax will be calculated automatically.
        </p>
      </div>

      <CSVUploader onSuccess={handleUploadSuccess} />

      <div className="mt-8 bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">CSV Requirements</h2>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
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
            <p className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Required columns:</span> latitude, longitude, subtotal, timestamp
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
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
            <p className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Coordinates:</span> Must be within New York State boundaries
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
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
            <p className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Subtotal:</span> Positive number (e.g., 120.00)
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
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
            <p className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Timestamp:</span> ISO format or YYYY-MM-DD HH:MM:SS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCSV;
