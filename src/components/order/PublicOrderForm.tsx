import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import orderService from '../../services/order';
import { MenuItem } from '../../types';

interface PublicOrderFormProps {
  restaurantTableId: number;
  items: MenuItem[];
  onOrderPlaced: (orderId: number) => void;
}

const PublicOrderForm: React.FC<PublicOrderFormProps> = ({ restaurantTableId, items, onOrderPlaced }) => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity < 0) return;
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const handleSpecialInstructionsChange = (itemId: number, instructions: string) => {
    setSpecialInstructions(prev => ({
      ...prev,
      [itemId]: instructions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!customerName.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    const orderItems = Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({
        menuItemId: parseInt(itemId),
        quantity,
        specialInstructions: specialInstructions[parseInt(itemId)] || ''
      }));

    if (orderItems.length === 0) {
      setError('Please select at least one item');
      setLoading(false);
      return;
    }

    try {
      const order = await orderService.createOrder({
        customerName,
        restaurantTableId,
        items: orderItems
      });
      onOrderPlaced(order.id);
      navigate(`/public/order/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Place Your Order</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Items
          </label>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <p className="text-lg font-semibold mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, (selectedItems[item.id] || 0) - 1)}
                      className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{selectedItems[item.id] || 0}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, (selectedItems[item.id] || 0) + 1)}
                      className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                {(selectedItems[item.id] || 0) > 0 && (
                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-1">
                      Special Instructions
                    </label>
                    <input
                      type="text"
                      value={specialInstructions[item.id] || ''}
                      onChange={(e) => handleSpecialInstructionsChange(item.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any special requests?"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </form>
    </Card>
  );
};

export default PublicOrderForm; 