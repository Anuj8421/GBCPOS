import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <div className="space-y-6" data-testid="analytics-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Performance</h1>
        <p className="text-gray-600 mt-1">View sales analytics, operations metrics, and customer reviews</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Analytics dashboard coming soon</p>
          <p className="text-gray-400 text-sm mt-2">Will be connected to PHP backend</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;