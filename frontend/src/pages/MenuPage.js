import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UtensilsCrossed } from 'lucide-react';

const MenuPage = () => {
  return (
    <div className="space-y-6" data-testid="menu-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your menu items, categories, and pricing</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700" data-testid="add-item-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <UtensilsCrossed className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Menu management coming soon</p>
          <p className="text-gray-400 text-sm mt-2">Will be connected to PHP backend</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuPage;