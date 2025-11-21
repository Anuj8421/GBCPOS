import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { menuService } from '@/services/menu.service';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/helpers';
import { Search, UtensilsCrossed, Filter } from 'lucide-react';

const SearchPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurant_id;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!restaurantId || !query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await menuService.getMenuItems(restaurantId, null, query);
      setSearchResults(response.items || []);
    } catch (error) {
      console.error('Error searching menu items:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, restaurantId]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Menu Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search dishes, categories, ingredients..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}

      {searchQuery && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {searchResults.length} results for "{searchQuery}"
            </h2>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UtensilsCrossed className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  No menu items found matching your search.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <UtensilsCrossed className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {!item.available && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive">Unavailable</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-orange-600">
                            {formatCurrency(item.final_price)}
                          </span>
                          {item.final_price !== item.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.food_type === 'veg' ? 'default' : 'secondary'}>
                          {item.food_type}
                        </Badge>
                        {item.is_popular && (
                          <Badge variant="outline" className="text-orange-600">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!searchQuery && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              Enter a search term to find menu items
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;