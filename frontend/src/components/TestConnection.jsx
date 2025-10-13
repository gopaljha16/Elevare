import React, { useState } from 'react';
import apiClient from '../utils/api';

const TestConnection = () => {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await apiClient.checkHealth();
      setStatus(`✅ Connected: ${response.message}`);
    } catch (error) {
      setStatus(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <div className="text-sm mb-2">Backend Status: {status}</div>
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
    </div>
  );
};

export default TestConnection;