import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTableSession from '../../hooks/useTableSession';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const TableScan: React.FC = () => {
  const navigate = useNavigate();
  const { startSession } = useTableSession(false);
  const [tableId, setTableId] = useState('');
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState('');
  
  const handleTableScan = (tableIdInput: string) => {
    try {
      const id = parseInt(tableIdInput);
      if (isNaN(id)) {
        setError('Invalid table ID');
        return;
      }
      
      // Create a session that expires in 2 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);
      
      // Start the session
      startSession(id, 'session-' + Date.now(), expiresAt.toISOString());
      
      // Navigate to menu
      navigate('/menu/' + id);
    } catch (err: any) {
      setError(err.message || 'Failed to scan table');
    }
  };
  
  useEffect(() => {
    if (scanned) {
      handleTableScan(tableId);
    }
  }, [scanned, tableId, handleTableScan]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScanned(true);
  };
  
  return (
    <CustomerLayout>
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Enter Table Number</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Number
              </label>
              <input
                type="number"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter table number"
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
            >
              Proceed to Menu
            </Button>
          </form>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default TableScan; 