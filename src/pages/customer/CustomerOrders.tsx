import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCustomerOrders } from '../../store/slices/orderSlice';
import CustomerRoute from '../../components/routes/CustomerRoute';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';
import { OrderStatus } from '../../types';

const getStatusVariant = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'warning';
    case OrderStatus.IN_PROGRESS:
      return 'info';
    case OrderStatus.READY:
      return 'success';
    case OrderStatus.COMPLETED:
      return 'success';
    case OrderStatus.DELIVERED:
      return 'success';
    case OrderStatus.CANCELLED:
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pending';
    case OrderStatus.IN_PROGRESS:
      return 'In Progress';
    case OrderStatus.READY:
      return 'Ready';
    case OrderStatus.COMPLETED:
      return 'Completed';
    case OrderStatus.DELIVERED:
      return 'Delivered';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    default:
      return status;
  }
};

const CustomerOrders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.order);
  const { activeSession } = useAppSelector((state) => state.session);
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');

  useEffect(() => {
    if (activeSession) {
      dispatch(fetchCustomerOrders());
    }
  }, [dispatch, activeSession]);

  // Poll for updates every minute
  useEffect(() => {
    if (!activeSession) return;
    
    const intervalId = setInterval(() => {
      dispatch(fetchCustomerOrders());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [dispatch, activeSession]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED;
    } else if (filter === 'completed') {
      return order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED;
    }
    return true;
  });

  if (loading && orders.length === 0) {
    return (
      <CustomerRoute>
        <div className="flex justify-center mt-12">
          <Spinner size="lg" />
        </div>
      </CustomerRoute>
    );
  }

  const calculateTotal = (order: any) => {
    return order.items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  return (
    <CustomerRoute>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Orders</h1>
          <Link to="/customer/menu">
            <Button variant="primary" size="sm">Order More Food</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          <Button 
            variant={filter === 'active' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active Orders
          </Button>
          <Button 
            variant={filter === 'completed' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed Orders
          </Button>
          <Button 
            variant={filter === 'all' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Orders
          </Button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You don't have any {filter !== 'all' ? filter : ''} orders yet.</p>
            <Link to="/customer/menu">
              <Button variant="primary">Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <Card key={order.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                      <Badge variant={getStatusVariant(order.status)} className="ml-2">
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${calculateTotal(order).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.items.reduce((total: number, item: any) => total + item.quantity, 0)} items</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium mb-2">Order Items:</h3>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                          {item.specialInstructions && (
                            <p className="text-xs text-gray-500">{item.specialInstructions}</p>
                          )}
                        </div>
                        <div className="text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.specialInstructions && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h3 className="font-medium">Special Instructions:</h3>
                    <p className="text-sm text-gray-600 mt-1">{order.specialInstructions}</p>
                  </div>
                )}

                {order.status === OrderStatus.PENDING && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-gray-500 text-sm">Your order will be prepared shortly.</p>
                  </div>
                )}

                {order.status === OrderStatus.IN_PROGRESS && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-blue-500 text-sm">Your order is being prepared in the kitchen.</p>
                  </div>
                )}

                {order.status === OrderStatus.READY && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-green-500 text-sm font-medium">Your order is ready and will be delivered to your table soon!</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </CustomerRoute>
  );
};

export default CustomerOrders; 