import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { Order, OrderStatus, OrderItem } from '../../types';
import orderService from '../../services/order';
import { useAppSelector } from '../../store';
import { useSearchParams } from 'react-router-dom';

// Define an interface extending OrderItem to ensure the required properties are available
interface ExtendedOrderItem extends OrderItem {
  priceAtTimeOfOrder: number;
}

const StaffOrders: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedOrders: Order[] = [];
      
      if (statusFilter) {
        // If there's a status filter, fetch orders by status
        fetchedOrders = await orderService.getOrdersByStatus(statusFilter);
      } else {
        // Different roles need different order lists
        if (user?.role === 'CHEF') {
          // Kitchen staff sees incoming orders
          fetchedOrders = await orderService.getIncomingOrders();
        } else if (user?.role === 'WAITER') {
          // Waiters see ready for delivery orders
          fetchedOrders = await orderService.getOrdersReadyForDelivery();
        } else {
          // Managers or other staff see all active orders
          fetchedOrders = await orderService.getActiveOrders();
        }
      }
      
      setOrders(fetchedOrders);
      setError('');
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    fetchOrders();
    
    // Set up a refresh interval
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      // Refresh orders after status update
      fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'READY':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-burgundy-600 bg-burgundy-50 rounded-lg p-6 max-w-md text-center">
          <h3 className="font-display text-lg font-medium mb-2">Error Loading Orders</h3>
          <p className="text-burgundy-700">{error}</p>
          <Button 
            variant="primary"
            className="mt-4"
            onClick={fetchOrders}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-burgundy-800">
          {user?.role === 'CHEF' ? 'Kitchen Orders' :
          user?.role === 'WAITER' ? 'Orders Ready for Service' :
          'All Active Orders'}
        </h1>
        <Button
          variant="primary"
          onClick={fetchOrders}
        >
          Refresh
        </Button>
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-cream-50 rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600">No active orders at the moment</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-burgundy-800">Order #{order.id}</h3>
                    <p className="text-gray-600">Table #{order.restaurantTableId}</p>
                    {order.createdAt && (
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    
                    {/* Role-specific action buttons */}
                    {user?.role === 'CHEF' && order.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateStatus(order.id, OrderStatus.IN_PROGRESS)}
                      >
                        Start Preparing
                      </Button>
                    )}
                    
                    {user?.role === 'CHEF' && order.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateStatus(order.id, OrderStatus.READY)}
                      >
                        Mark Ready
                      </Button>
                    )}
                    
                    {user?.role === 'WAITER' && order.status === 'READY' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateStatus(order.id, OrderStatus.DELIVERED)}
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="divide-y">
                    {order.items.map((item) => {
                      // Cast to ExtendedOrderItem to access priceAtTimeOfOrder
                      const extendedItem = item as ExtendedOrderItem;
                      return (
                        <li key={item.id} className="py-2">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-medium">Item #{item.menuItemId}</div>
                              {item.specialInstructions && (
                                <div className="text-sm text-gray-600">
                                  Instructions: {item.specialInstructions}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div>Qty: {item.quantity}</div>
                              <div className="text-sm text-gray-600">
                                {extendedItem.priceAtTimeOfOrder ? 
                                  `$${(extendedItem.priceAtTimeOfOrder * item.quantity).toFixed(2)}` : 
                                  ''}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                {order.specialInstructions && (
                  <div className="bg-cream-50 p-3 rounded-md">
                    <h4 className="font-semibold mb-1">Special Instructions:</h4>
                    <p>{order.specialInstructions}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffOrders; 