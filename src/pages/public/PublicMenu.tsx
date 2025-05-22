import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicOrderForm from '../../components/order/PublicOrderForm';
import menuService from '../../services/menu';
import useTableSession from '../../hooks/useTableSession';
import { MenuItem, Category } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import PublicLayout from '../../components/layout/PublicLayout';

const PublicMenu: React.FC = () => {
  // Read tableId from URL and from session
  const { tableId: urlTableId } = useParams<{ tableId?: string }>();
  const { tableSession, startSession } = useTableSession(false);
  
  // Use URL tableId if it exists, otherwise use tableSession
  const activeTableId = urlTableId ? parseInt(urlTableId) : tableSession?.tableId;

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);

  // If we have a tableId in the URL but not in session, start a session
  useEffect(() => {
    if (urlTableId && !tableSession) {
      const tableIdNum = parseInt(urlTableId);
      if (!isNaN(tableIdNum)) {
        // Create a session that expires in 2 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 2);
        startSession(tableIdNum, 'session-' + Date.now(), expiresAt.toISOString());
      }
    }
  }, [urlTableId, tableSession, startSession]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [menuItems, categoryList] = await Promise.all([
          menuService.getAvailableMenuItems(),
          menuService.getCategories()
        ]);
        setItems(menuItems);
        setCategories(categoryList);
        // Default to showing all items initially
        setSelectedCategory(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredItems = selectedCategory
    ? items.filter(item => item.categoryId === selectedCategory)
    : items;

  const handleOrderPlaced = (orderId: number) => {
    setShowOrderForm(false);
    // You might want to show a success message or redirect to order status page
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-burgundy-600 bg-burgundy-50 rounded-lg p-6 max-w-md text-center">
            <svg className="w-12 h-12 mx-auto text-burgundy-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="font-display text-lg font-medium mb-2">Unable to Load Menu</h3>
            <p className="text-burgundy-700">{error}</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-burgundy-800 mb-4 md:mb-0">Our Menu</h1>
          <div className="flex flex-wrap items-center gap-2">
            {activeTableId && (
              <div className="bg-cream-100 text-burgundy-700 rounded-md px-3 py-1 text-sm font-medium">
                Table #{activeTableId}
              </div>
            )}
            
            {activeTableId && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowOrderForm(true)}
                className="shadow-elegant"
              >
                Place Order
              </Button>
            )}
          </div>
          
          {!activeTableId && (
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-md">
              <a href="/public/scan" className="underline">Scan a QR code</a> to place an order
            </div>
          )}
        </div>

        {categories.length > 0 && (
          <div className="flex space-x-2 md:space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 shadow-sm font-medium ${
                selectedCategory === null
                  ? 'bg-burgundy-600 text-white shadow-md'
                  : 'bg-cream-100 text-burgundy-700 hover:bg-cream-200'
              }`}
            >
              All Items
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 shadow-sm font-medium ${
                  selectedCategory === category.id
                    ? 'bg-burgundy-600 text-white shadow-md'
                    : 'bg-cream-100 text-burgundy-700 hover:bg-cream-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.map(item => (
            <Card key={item.id} className="p-5 slide-up" variant="menu" hoverable>
              <div className="flex flex-col h-full">
                {item.imageUrl && (
                  <div className="relative mb-4 rounded-lg overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {!item.available && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-medium px-3 py-1 bg-burgundy-800 bg-opacity-75 rounded-md">Currently Unavailable</span>
                      </div>
                    )}
                  </div>
                )}
                <h3 className="text-xl font-display font-semibold text-burgundy-800 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-burgundy-700">${item.price.toFixed(2)}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.available ? 'bg-sage-100 text-sage-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {showOrderForm && activeTableId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elegant">
              <div className="p-6 border-b border-cream-100">
                <h2 className="text-2xl font-display font-semibold text-burgundy-800">Place Your Order</h2>
                <p className="text-gray-600">Table #{activeTableId}</p>
              </div>
              <PublicOrderForm
                restaurantTableId={activeTableId}
                items={items}
                onOrderPlaced={handleOrderPlaced}
              />
              <div className="p-4 border-t border-cream-100 bg-cream-50">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowOrderForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default PublicMenu; 