import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOrders } from '../../store/slices/orderSlice';
import StaffRoute from '../../components/routes/StaffRoute';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { OrderStatus, UserRole, Order as BaseOrder } from '../../types';

// Extend Order interface to include new fields from API
interface Order extends BaseOrder {
  customerName?: string;
  restaurantTableId?: number;
}

type FilterType = 'all' | 'pending' | 'inProgress' | 'ready' | 'delivered' | 'cancelled';

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

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-amber-100 text-amber-800';
    case OrderStatus.IN_PROGRESS:
      return 'bg-amber-300 text-amber-900';
    case OrderStatus.READY:
      return 'bg-sage-200 text-sage-800';
    case OrderStatus.COMPLETED:
    case OrderStatus.DELIVERED:
      return 'bg-sage-400 text-sage-900';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const OrdersManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders: baseOrders, loading } = useAppSelector((state) => state.order);
  const orders = baseOrders as unknown as Order[];
  const { user } = useAppSelector((state) => state.auth);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    // Only poll for updates every minute
    const intervalId = setInterval(() => {
      dispatch(fetchOrders(activeFilter));
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [dispatch, activeFilter]);

  // Effect for handling filter changes - this will handle the initial fetch too
  useEffect(() => {
    // When the filter changes, make sure we have the right data
    const loadFilteredOrders = async () => {
      console.log(`Filter changed to ${activeFilter}, fetching orders with this filter...`);
      // Dispatch the fetchOrders action with the current filter
      await dispatch(fetchOrders(activeFilter));
    };
    
    loadFilteredOrders();
  }, [activeFilter, dispatch]);

  // Simplified filter logic since we're now getting pre-filtered data from the server
  const filterOrders = () => {
    console.log(`Orders after server filtering: ${orders.length}`);
    return orders;
  };

  // Filter orders based on user role
  const getOrdersForRole = () => {
    const filteredOrders = filterOrders();
    
    // Kitchen staff only see pending and in-progress orders
    if (user?.role === UserRole.CHEF) {
      return filteredOrders.filter(
        order => order.status === OrderStatus.PENDING || order.status === OrderStatus.IN_PROGRESS
      );
    }
    
    // Waiters see all active orders (not delivered/cancelled)
    if (user?.role === UserRole.WAITER) {
      return filteredOrders.filter(
        order => order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED
      );
    }
    
    // Admin/Manager sees all orders
    return filteredOrders;
  };

  const displayedOrders = getOrdersForRole();
  
  const calculateTotal = (order: any) => {
    return order.items.reduce((total: number, item: any) => {
      // Use priceAtTimeOfOrder instead of price
      return total + (item.priceAtTimeOfOrder * item.quantity);
    }, 0);
  };

  return (
    <StaffRoute roles={[UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]}>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-burgundy-800">Orders Management</h1>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-wrap space-x-2 overflow-x-auto pb-2">
            <Button 
              variant={activeFilter === 'all' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => {
                console.log('Switching to ALL filter');
                setActiveFilter('all');
              }}
            >
              All
            </Button>
            <Button 
              variant={activeFilter === 'pending' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => {
                console.log('Switching to PENDING filter');
                setActiveFilter('pending');
              }}
            >
              Pending
            </Button>
            <Button 
              variant={activeFilter === 'inProgress' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => {
                console.log('Switching to IN_PROGRESS filter');
                setActiveFilter('inProgress');
              }}
            >
              In Progress
            </Button>
            <Button 
              variant={activeFilter === 'ready' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => {
                console.log('Switching to READY filter');
                setActiveFilter('ready');
              }}
            >
              Ready
            </Button>
            <Button 
              variant={activeFilter === 'delivered' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => {
                console.log('Switching to DELIVERED filter');
                setActiveFilter('delivered');
              }}
            >
              Delivered
            </Button>
            <Button 
              variant={activeFilter === 'cancelled' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => {
                console.log('Switching to CANCELLED filter');
                setActiveFilter('cancelled');
              }}
            >
              Cancelled
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <Spinner size="lg" />
          </div>
        ) : displayedOrders.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-burgundy-600">No orders found matching your filter.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {displayedOrders.map((order: Order) => (
              <Card key={order.id} className="slide-up" variant="order" hoverable onClick={() => navigate(`/staff/orders/${order.id}`)}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-lg font-display font-semibold text-burgundy-800">Order #{order.id}</h2>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Table:</span> {order.restaurantTableId || 'Takeaway'}
                    </p>
                    {(order.customerName || order.customer?.name) && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Customer:</span> {order.customerName || order.customer?.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-burgundy-700">${calculateTotal(order).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {order.items.reduce((total: number, item: any) => total + item.quantity, 0)} items
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 border-t border-cream-100 pt-3">
                  <h3 className="text-sm font-medium text-burgundy-700 mb-2">Items:</h3>
                  <ul className="text-sm text-gray-600">
                    {order.items.slice(0, 3).map((item: any) => (
                      <li key={item.id} className="mb-1 flex justify-between">
                        <span>{item.quantity}x {item.menuItem?.name || 'Unknown Item'}</span>
                        <span className="text-burgundy-600 font-medium">${(item.priceAtTimeOfOrder * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="text-burgundy-500 italic mt-1">
                        +{order.items.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="mt-4 pt-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    fullWidth
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StaffRoute>
  );
};

export default OrdersManagement; 