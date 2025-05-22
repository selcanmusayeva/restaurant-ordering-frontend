import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { MenuItem, Category } from '../../types';
import menuService from '../../services/menu';

const StaffMenu: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [menuItems, categoryList] = await Promise.all([
          menuService.getAvailableMenuItems(),
          menuService.getCategories()
        ]);
        setItems(menuItems);
        setCategories(categoryList);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button variant="primary">Add New Item</Button>
      </div>

      <div className="grid gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="p-6">
            <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
            <div className="grid gap-4">
              {items
                .filter((item) => item.categoryId === category.id)
                .map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600">{item.description}</p>
                      <p className="text-lg font-bold mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="secondary">Edit</Button>
                      <Button variant="danger">Delete</Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StaffMenu; 