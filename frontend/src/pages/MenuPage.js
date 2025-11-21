import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { menuService } from '@/services/menu.service';
import { formatCurrency } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  MoreVertical,
  Edit,
  Trash2,
  UtensilsCrossed,
  ChefHat,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const MenuPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurant_id;
  
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedDietary, setSelectedDietary] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    dishName: '',
    shortDescription: '',
    detailedDescription: '',
    foodType: 'veg',
    markAs: [],
    addons: [],
    halalCertified: false,
    cuisineType: '',
    allergens: [],
    sellingPrice: '',
    discountPrice: '',
    image: null
  });

  // Fetch menu items and categories
  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
      fetchCategories();
    }
  }, [restaurantId, selectedCategory, searchQuery]);

  const fetchMenuItems = async () => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      const categoryFilter = selectedCategory !== 'all' ? selectedCategory : null;
      const searchFilter = searchQuery || null;
      const response = await menuService.getMenuItems(restaurantId, categoryFilter, searchFilter);
      
      // Transform API data to match component expectations
      const transformedItems = response.items.map(item => ({
        id: item.id,
        name: item.name,
        shortDescription: item.description,
        detailedDescription: item.detailed_description,
        price: item.price,
        discountPrice: item.final_price !== item.price ? item.final_price : null,
        category: item.category,
        image: item.image,
        foodType: item.food_type,
        availability: item.available ? 'available' : 'unavailable',
        tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags,
        allergens: [],
        halalCertified: false,
        cuisineType: item.cuisine_type,
        mark_as: item.mark_as,
        rating: item.rating,
        reviews: item.reviews
      }));
      
      setMenuItems(transformedItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!restaurantId) return;
    
    try {
      const response = await menuService.getCategories(restaurantId);
      const categoryNames = ['all', ...response.categories.map(cat => cat.name)];
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['all']);
    }
  };
  const availabilityOptions = ['all', 'available', 'unavailable', 'out-of-stock'];
  const dietaryOptions = ['all', 'veg', 'non-veg', 'vegan', 'gluten-free'];
  const tagOptions = ['all', 'bestseller', 'new', 'chef-special', 'trending', 'seasonal'];
  const cuisineTypes = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese'];

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    if (!restaurantId) return;
    
    try {
      const newAvailable = currentStatus !== 'available';
      await menuService.toggleItemAvailability(itemId, restaurantId, newAvailable);
      
      // Update local state
      setMenuItems(items => 
        items.map(item => 
          item.id === itemId ? { ...item, availability: newAvailable ? 'available' : 'unavailable' } : item
        )
      );
      toast.success('Availability updated');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      dishName: '',
      shortDescription: '',
      detailedDescription: '',
      foodType: 'veg',
      markAs: [],
      addons: [],
      halalCertified: false,
      cuisineType: '',
      allergens: [],
      sellingPrice: '',
      discountPrice: '',
      image: null
    });
    setShowAddDialog(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      dishName: item.name,
      shortDescription: item.shortDescription,
      detailedDescription: item.detailedDescription || '',
      foodType: item.foodType,
      markAs: item.tags || [],
      addons: [],
      halalCertified: item.halalCertified,
      cuisineType: item.cuisineType,
      allergens: item.allergens || [],
      sellingPrice: item.price.toString(),
      discountPrice: item.discountPrice?.toString() || '',
      image: null
    });
    setShowAddDialog(true);
  };

  const handleSubmitItem = async () => {
    if (!formData.dishName || !formData.sellingPrice) {
      toast.error('Please fill in required fields');
      return;
    }

    if (!restaurantId) {
      toast.error('Restaurant ID not found');
      return;
    }

    try {
      await menuService.createMenuItem(restaurantId, formData);
      
      toast.success('Item submitted for approval! It will be live once approved.');
      setShowAddDialog(false);
      // Don't refresh immediately as item is pending and won't show until approved
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast.error('Failed to submit item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      // await menuService.deleteMenuItem(itemId);
      setMenuItems(items => items.filter(item => item.id !== itemId));
      toast.success('Item deleted');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = menuItems
    .filter(item => {
      // Search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Availability filter
      if (selectedAvailability !== 'all' && item.availability !== selectedAvailability) {
        return false;
      }
      // Dietary filter
      if (selectedDietary !== 'all' && item.foodType !== selectedDietary) {
        return false;
      }
      // Tag filter
      if (selectedTag !== 'all' && !item.tags.includes(selectedTag)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6" data-testid="menu-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your menu items, categories, and pricing</p>
        </div>
        <Button 
          className="bg-orange-600 hover:bg-orange-700" 
          onClick={handleAddItem}
          data-testid="add-item-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Availability Filter */}
            <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
              <SelectTrigger data-testid="availability-filter">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === 'all' ? 'All Items' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Dietary Filter */}
            <Select value={selectedDietary} onValueChange={setSelectedDietary}>
              <SelectTrigger data-testid="dietary-filter">
                <SelectValue placeholder="Dietary" />
              </SelectTrigger>
              <SelectContent>
                {dietaryOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === 'all' ? 'All Types' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="sort-select">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">A-Z</SelectItem>
                <SelectItem value="name-desc">Z-A</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== 'all' || selectedAvailability !== 'all' || selectedDietary !== 'all') && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </Badge>
              )}
              {selectedAvailability !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedAvailability}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedAvailability('all')} />
                </Badge>
              )}
              {selectedDietary !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedDietary}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDietary('all')} />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu Items List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No menu items found</p>
            <p className="text-gray-400 text-sm mb-4">Start by adding your first menu item</p>
            <Button onClick={handleAddItem} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} data-testid={`menu-item-${item.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-10 h-10 text-orange-600" />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.shortDescription}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {/* Food Type Badge */}
                          <Badge variant={item.foodType === 'veg' ? 'default' : 'destructive'} className="text-xs">
                            {item.foodType}
                          </Badge>
                          
                          {/* Tags */}
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}

                          {/* Halal */}
                          {item.halalCertified && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Halal
                            </Badge>
                          )}

                          {/* Allergens */}
                          {item.allergens.length > 0 && (
                            <Badge variant="outline" className="text-xs text-orange-700">
                              Contains: {item.allergens.join(', ')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {item.discountPrice ? (
                            <>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(item.discountPrice)}
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                {formatCurrency(item.price)}
                              </p>
                            </>
                          ) : (
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(item.price)}
                            </p>
                          )}
                        </div>

                        {/* Availability Toggle */}
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={item.availability === 'available'}
                            onCheckedChange={() => handleToggleAvailability(item.id, item.availability)}
                            data-testid={`availability-toggle-${item.id}`}
                          />
                          <span className="text-xs text-gray-500">
                            {item.availability === 'available' ? 'Available' : 'Unavailable'}
                          </span>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`menu-actions-${item.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditItem(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update item details' : 'Item will be sent to PHP backend for business approval'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dish Name */}
            <div>
              <Label htmlFor="dish-name">Dish Name *</Label>
              <Input
                id="dish-name"
                value={formData.dishName}
                onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
                placeholder="Enter dish name"
              />
            </div>

            {/* Short Description */}
            <div>
              <Label htmlFor="short-desc">Short Description *</Label>
              <Input
                id="short-desc"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="One-line summary"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <Label htmlFor="detailed-desc">Detailed Description</Label>
              <Textarea
                id="detailed-desc"
                value={formData.detailedDescription}
                onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                placeholder="Full description of the dish"
                rows={3}
              />
            </div>

            {/* Food Type */}
            <div>
              <Label htmlFor="food-type">Food Type *</Label>
              <Select value={formData.foodType} onValueChange={(value) => setFormData({ ...formData, foodType: value })}>
                <SelectTrigger id="food-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="non-veg">Non-Veg</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mark As (Checkboxes) */}
            <div>
              <Label>Mark As</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['bestseller', 'new', 'trending', 'seasonal'].map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={formData.markAs.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, markAs: [...formData.markAs, tag] });
                        } else {
                          setFormData({ ...formData, markAs: formData.markAs.filter(t => t !== tag) });
                        }
                      }}
                    />
                    <label htmlFor={`tag-${tag}`} className="text-sm capitalize">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Halal Certified */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="halal"
                checked={formData.halalCertified}
                onCheckedChange={(checked) => setFormData({ ...formData, halalCertified: checked })}
              />
              <label htmlFor="halal" className="text-sm font-medium">
                Halal Certified?
              </label>
            </div>

            {/* Cuisine Type */}
            <div>
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Select value={formData.cuisineType} onValueChange={(value) => setFormData({ ...formData, cuisineType: value })}>
                <SelectTrigger id="cuisine">
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Allergens */}
            <div>
              <Label htmlFor="allergens">Allergens (comma-separated)</Label>
              <Input
                id="allergens"
                value={formData.allergens.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  allergens: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
                })}
                placeholder="e.g., Nuts, Milk, Gluten"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="selling-price">Selling Price *</Label>
                <Input
                  id="selling-price"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="discount-price">Discount Price</Label>
                <Input
                  id="discount-price"
                  type="number"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitItem} className="bg-orange-600 hover:bg-orange-700">
              {editingItem ? 'Update Item' : 'Submit for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuPage;