import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  createOrder 
} from '../../store/slices/orderSlice';
import CustomerRoute from '../../components/auth/CustomerRoute';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cart, loading, error, tableSession } = useAppSelector(state => state.order);
  const [orderInstructions, setOrderInstructions] = useState('');
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + tax;
  
  const handleUpdateQuantity = (menuItemId: number, quantity: number, specialInstructions: string) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(menuItemId));
    } else {
      dispatch(updateCartItem({ menuItemId, quantity, specialInstructions }));
    }
  };
  
  const handleRemoveItem = (menuItemId: number) => {
    dispatch(removeFromCart(menuItemId));
  };
  
  const handlePlaceOrder = async () => {
    if (!tableSession) return;
    
    const orderData = {
      customerName: "Customer",
      restaurantTableId: tableSession.tableId,
      items: cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      }))
    };
    
    const resultAction = await dispatch(
      createOrder({
        tableId: tableSession.tableId,
        sessionId: tableSession.sessionId,
        orderData
      })
    );
    
    if (createOrder.fulfilled.match(resultAction)) {
      // Order placed successfully
      navigate('/orders');
    }
  };
  
  if (cart.length === 0) {
    return (
      <CustomerRoute>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart</h1>
          <p className="text-gray-600 mb-6">Your cart is empty</p>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
          >
            Browse Menu
          </Button>
        </div>
      </CustomerRoute>
    );
  }
  
  return (
    <CustomerRoute>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart</h1>
        <p className="text-gray-600">Review your items and place your order</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.menuItemId} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500 mt-1">
                          Instructions: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleUpdateQuantity(
                          item.menuItemId, 
                          item.quantity - 1, 
                          item.specialInstructions
                        )}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200"
                      >
                        -
                      </button>
                      <span className="mx-3">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(
                          item.menuItemId, 
                          item.quantity + 1, 
                          item.specialInstructions
                        )}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveItem(item.menuItemId)}
                      className="text-red-600 text-sm hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="mt-3">
                    <textarea
                      placeholder="Special instructions (optional)"
                      value={item.specialInstructions}
                      onChange={(e) => handleUpdateQuantity(
                        item.menuItemId, 
                        item.quantity, 
                        e.target.value
                      )}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={1}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => navigate('/')}
                className="mr-3"
              >
                Add More Items
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    dispatch(clearCart());
                  }
                }}
              >
                Clear Cart
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Order summary */}
        <div>
          <Card
            title="Order Summary"
            className="sticky top-4"
          >
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-semibold">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <textarea
                placeholder="Special instructions for the entire order (optional)"
                value={orderInstructions}
                onChange={(e) => setOrderInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={3}
              />
            </div>
            
            <Button
              variant="primary"
              fullWidth
              className="mt-4"
              isLoading={loading}
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </Card>
        </div>
      </div>
    </CustomerRoute>
  );
};

export default Cart; 