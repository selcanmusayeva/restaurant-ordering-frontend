import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { getAssignedTables } from '../../store/slices/tableSlice';
import { getOrdersReadyForDelivery } from '../../store/slices/orderSlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import usePolling from '../../hooks/usePolling';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { TableStatus, OrderStatus } from '../../types';

const WaiterDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tables, loading: tablesLoading } = useAppSelector((state) => state.table);
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.order);
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);
  
  // Initial data fetch
  useEffect(() => {
    dispatch(getAssignedTables());
    dispatch(getOrdersReadyForDelivery());
    dispatch(fetchNotifications());
  }, [dispatch]);
  
  // Poll for updates every 30 seconds
  usePolling(() => {
    dispatch(getOrdersReadyForDelivery());
    dispatch(fetchNotifications());
    return Promise.resolve();
  }, { interval: 30000 });
  
  const isLoading = tablesLoading || ordersLoading;
  
  const getTableStatusColor = (status: TableStatus) => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return 'success';
      case TableStatus.OCCUPIED:
        return 'warning';
      case TableStatus.RESERVED:
        return 'info';
      case TableStatus.MAINTENANCE:
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  if (isLoading && tables.length === 0 && orders.length === 0) {
    return (
      <div className="flex justify-center mt-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Waiter Dashboard</h1>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Assigned Tables</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{tables.length}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Orders Ready</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {orders.filter(order => order.status === OrderStatus.READY).length}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Notifications</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{unreadCount}</p>
          </div>
        </Card>
      </div>
      
      {/* Tables section */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Tables</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tables.length === 0 ? (
          <p className="text-gray-500 col-span-3">No tables assigned to you yet.</p>
        ) : (
          tables.map(table => (
            <Card key={table.id} hoverable onClick={() => navigate(`/tables/${table.id}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Table {table.tableNumber}</h3>
                  <p className="text-sm text-gray-600">Capacity: {table.capacity}</p>
                </div>
                <Badge variant={getTableStatusColor(table.status)}>
                  {table.status}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>
      
      {/* Orders ready for delivery */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Orders Ready for Delivery</h2>
      <div className="space-y-4 mb-8">
        {orders.filter(order => order.status === OrderStatus.READY).length === 0 ? (
          <p className="text-gray-500">No orders ready for delivery at the moment.</p>
        ) : (
          orders
            .filter(order => order.status === OrderStatus.READY)
            .map(order => {
              const table = tables.find(t => t.id === order.restaurantTableId);
              return (
                <Card key={order.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Order #{order.id} - Table {table?.tableNumber || order.restaurantTableId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Ready at: {order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString() : 'Just now'}
                      </p>
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-700">Items:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                          {order.items.map(item => (
                            <li key={item.id}>
                              {item.quantity}x Item #{item.menuItemId}
                              {item.specialInstructions && ` (${item.specialInstructions})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implement marking order as delivered
                      }}
                    >
                      Mark as Delivered
                    </Button>
                  </div>
                </Card>
              );
            })
        )}
      </div>
      
      {/* Recent notifications */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Notifications</h2>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications at the moment.</p>
        ) : (
          notifications
            .slice(0, 5)
            .map(notification => (
              <Card key={notification.id} className={!notification.read ? 'border-l-4 border-blue-500' : ''}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implement marking notification as read
                      }}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </Card>
            ))
        )}
        
        {notifications.length > 0 && (
          <div className="text-center mt-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/notifications')}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterDashboard; 