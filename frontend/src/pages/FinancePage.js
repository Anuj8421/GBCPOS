import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const FinancePage = () => {
  return (
    <div className="space-y-6" data-testid="finance-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <p className="text-gray-600 mt-1">Manage payouts, invoices, and banking details</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Finance module coming soon</p>
          <p className="text-gray-400 text-sm mt-2">Will be connected to PHP backend</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancePage;