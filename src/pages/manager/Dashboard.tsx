import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchSystemStatistics } from '../../store/slices/statisticsSlice';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import TextWithUnit from '../../components/common/TextWithUnit';

const ManagerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systemStats, loading } = useAppSelector((state) => state.statistics);
  
  useEffect(() => {
    dispatch(fetchSystemStatistics());
  }, [dispatch]);
  
  if (loading || !systemStats) {
    return (
      <div className="flex justify-center mt-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manager Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Active Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{systemStats.totalActiveUsers}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Tables Occupied</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{systemStats.totalTablesOccupied}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Orders Today</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{systemStats.totalOrdersToday}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Sales Today</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              ${systemStats.totalSalesToday.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Popular Items">
          <div className="space-y-4">
            {Object.entries(systemStats.popularItems || {})
              .sort(([, aCount], [, bCount]) => (bCount as number) - (aCount as number))
              .slice(0, 5)
              .map(([itemName, count]) => (
                <div key={itemName} className="flex justify-between items-center">
                  <span className="font-medium">{itemName}</span>
                  <TextWithUnit value={count} unit="orders" className="text-gray-600" />
                </div>
              ))}
          </div>
        </Card>
        
        <Card title="Sales by Category">
          <div className="space-y-4">
            {Object.entries(systemStats.salesByCategory || {})
              .sort(([, aValue], [, bValue]) => (bValue as number) - (aValue as number))
              .map(([category, value]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="font-medium">{category}</span>
                  <span className="text-gray-600">${(value as number).toFixed(2)}</span>
                </div>
              ))}
          </div>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card title="Recent Activity">
          <p className="text-gray-500 text-center py-4">Detailed implementation for activity feed will be added here.</p>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard; 