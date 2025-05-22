import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getPendingOrders, getInProgressOrders, markOrderInPreparation, markOrderReady } from '../../store/slices/orderSlice';
import { fetchKitchenStatistics } from '../../store/slices/statisticsSlice';
import usePolling from '../../hooks/usePolling';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { OrderStatus } from '../../types';
import TextWithUnit from '../../components/common/TextWithUnit';

const KitchenDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.order);
  const { kitchenStats, loading: statsLoading } = useAppSelector((state) => state.statistics);
  
  // Initial data fetch
  useEffect(() => {
    dispatch(getPendingOrders());
    dispatch(getInProgressOrders());
    dispatch(fetchKitchenStatistics());
  }, [dispatch]);
  
  // Poll for updates every 30 seconds
  usePolling(() => {
    dispatch(getPendingOrders());
    dispatch(getInProgressOrders());
    dispatch(fetchKitchenStatistics());
    return Promise.resolve();
  }, { interval: 30000 });
  
  const isLoading = ordersLoading || statsLoading;
  
  const pendingOrders = orders.filter(order => order.status === OrderStatus.PENDING);
  const inProgressOrders = orders.filter(order => order.status === OrderStatus.IN_PROGRESS);
  
  const handleStartPreparation = (orderId: number) => {
    dispatch(markOrderInPreparation(orderId));
  };
  
  const handleMarkReady = (orderId: number) => {
    dispatch(markOrderReady(orderId));
  };
  
  if (isLoading && orders.length === 0 && !kitchenStats) {
    return (
      <div className="flex justify-center mt-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kitchen Dashboard</h1>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Pending Orders</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {kitchenStats?.pendingOrders || pendingOrders.length}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">In Progress</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {kitchenStats?.inProgressOrders || inProgressOrders.length}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Completed Today</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {kitchenStats?.completedOrders || 0}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Avg. Prep Time</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {kitchenStats?.averagePreparationTime || '0:00'}
            </p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Orders</h2>
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <p className="text-gray-500">No pending orders at the moment.</p>
            ) : (
              pendingOrders.map(order => (
                <Card key={order.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <Badge variant="warning" className="ml-2">Pending</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Table: {order.restaurantTableId} - Created: {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartPreparation(order.id)}
                    >
                      Start Preparation
                    </Button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700">Items:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                      {order.items.map(item => (
                        <li key={item.id}>
                          {item.quantity}x Item #{item.menuItemId}
                          {item.specialInstructions && (
                            <span className="text-orange-500"> ({item.specialInstructions})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    
                    {order.specialInstructions && (
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-700">Order Instructions:</h4>
                        <p className="text-sm text-gray-600 ml-2">{order.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
        
        {/* In Progress Orders */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">In Progress</h2>
          <div className="space-y-4">
            {inProgressOrders.length === 0 ? (
              <p className="text-gray-500">No orders in progress at the moment.</p>
            ) : (
              inProgressOrders.map(order => (
                <Card key={order.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <Badge variant="info" className="ml-2">In Progress</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Table: {order.restaurantTableId} - Started: {order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString() : 'Just now'}
                      </p>
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleMarkReady(order.id)}
                    >
                      Mark as Ready
                    </Button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700">Items:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                      {order.items.map(item => (
                        <li key={item.id}>
                          {item.quantity}x Item #{item.menuItemId}
                          {item.specialInstructions && (
                            <span className="text-orange-500"> ({item.specialInstructions})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    
                    {order.specialInstructions && (
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-700">Order Instructions:</h4>
                        <p className="text-sm text-gray-600 ml-2">{order.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Most Ordered Items */}
      {kitchenStats && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Most Ordered Items Today</h2>
          <Card>
            <div className="space-y-4">
              {Object.entries(kitchenStats.ordersByMenuItem)
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
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard; 