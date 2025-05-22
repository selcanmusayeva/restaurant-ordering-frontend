import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import useTableSession from '../../hooks/useTableSession';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import tableService from '../../services/table';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ScanQR: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { startSession } = useTableSession(false);
  const [tableId, setTableId] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleScan = async (data: string | null) => {
    if (!data) return;
    
    try {
      setError('');
      setLoading(true);
      
      // Try to parse as a table number first
      const tableNumber = parseInt(data);
      if (!isNaN(tableNumber)) {
        await handleStartSession(tableNumber);
        return;
      }
      
      // If not a number, check if it's a UUID
      if (UUID_REGEX.test(data)) {
        try {
          // Fetch table info based on UUID to get the table ID
          const tableInfo = await tableService.getTableByUuid(data);
          if (tableInfo && tableInfo.id) {
            await handleStartSession(tableInfo.id, data);
          } else {
            setError('Invalid QR code: Unable to find table');
          }
        } catch (err) {
          setError('Invalid QR code: Table not found');
        }
      } else {
        setError('Invalid QR code: Unable to parse table information');
      }
    } catch (err) {
      setError('Error processing QR code');
      console.error(err);
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };
  
  const handleError = (err: Error) => {
    console.error(err);
    setError('Error scanning QR code: ' + err.message);
  };
  
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableId.trim()) {
      setError('Please enter a table number or UUID');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Try to parse as a table number first
      const tableIdNum = parseInt(tableId);
      if (!isNaN(tableIdNum)) {
        await handleStartSession(tableIdNum);
        return;
      }
      
      // If not a number, check if it's a UUID
      if (UUID_REGEX.test(tableId)) {
        try {
          // Fetch table info based on UUID to get the table ID
          const tableInfo = await tableService.getTableByUuid(tableId);
          if (tableInfo && tableInfo.id) {
            await handleStartSession(tableInfo.id, tableId);
          } else {
            setError('Invalid table code: Unable to find table');
          }
        } catch (err) {
          setError('Invalid table code: Table not found');
        }
      } else {
        setError('Table number must be a valid number or a valid UUID code');
      }
    } catch (err) {
      console.error(err);
      setError('Error processing table information');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartSession = async (tableId: number, tableUuid?: string) => {
    try {
      setError('');
      
      // Create a session that expires in 2 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);
      
      // Start the session
      startSession(tableId, 'session-' + Date.now(), expiresAt.toISOString(), tableUuid);
      
      // Navigate to menu with tableId parameter
      navigate(`/menu/${tableId}`);
    } catch (error: any) {
      setError(error.message || 'Failed to start session');
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <CustomerLayout>
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Scan Table QR Code</h1>
          
          {isScanning ? (
            <div className="mb-8">
              <QrReader
                onResult={(result, error) => {
                  if (result) {
                    handleScan(result.getText());
                  }
                  if (error) {
                    handleError(error);
                  }
                }}
                constraints={{ facingMode: 'environment' }}
                className="w-full"
              />
              <Button
                variant="secondary"
                fullWidth
                className="mt-4"
                onClick={() => setIsScanning(false)}
                disabled={loading}
              >
                Cancel Scan
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              fullWidth
              className="mb-8"
              onClick={() => setIsScanning(true)}
              disabled={loading}
            >
              Start Scanning
            </Button>
          )}
          
          <div className="text-center mb-4">
            <span className="text-gray-500">or</span>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleManualSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Number or Code
              </label>
              <input
                type="text"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter table number or QR code"
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
            >
              Start Session
            </Button>
          </form>
          
          <div className="mt-6 border-t border-gray-200 pt-4 flex justify-center">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-burgundy-700 hover:text-burgundy-900"
              >
                Logout
              </Button>
            ) : (
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-burgundy-700 hover:bg-burgundy-800"
              >
                Login
              </Link>
            )}
          </div>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default ScanQR; 