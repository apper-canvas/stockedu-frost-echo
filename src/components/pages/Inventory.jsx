import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import InventoryTable from '@/components/organisms/InventoryTable';
import ItemFormModal from '@/components/organisms/ItemFormModal';
import { inventoryService, categoryService } from '@/services';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [inventoryData, categoryData] = await Promise.all([
        inventoryService.getAll(),
        categoryService.getAll()
      ]);
      
      setItems(inventoryData);
      setCategories(categoryData);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      setError(err.message || 'Failed to load inventory data');
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(lowercaseSearch) ||
        item.category.toLowerCase().includes(lowercaseSearch) ||
        item.location.toLowerCase().includes(lowercaseSearch)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await inventoryService.delete(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const handleModalSuccess = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-surface-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-surface-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-12 bg-surface-200 rounded animate-pulse"></div>
        <SkeletonLoader count={5} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Inventory Error"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-900 break-words">
            Inventory Management
          </h1>
          <p className="text-surface-600 mt-1">
            Manage your school's inventory items and stock levels
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            icon="RefreshCw"
            onClick={loadData}
            size="sm"
          >
            Refresh
          </Button>
          <Button
            icon="Plus"
            onClick={handleAddItem}
            size="sm"
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search items by name, category, or location..."
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-surface-200">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Package" className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-2xl font-bold text-surface-900">{filteredItems.length}</p>
              <p className="text-sm text-surface-600">Total Items</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-surface-200">
          <div className="flex items-center space-x-3">
            <ApperIcon name="AlertTriangle" className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {filteredItems.filter(item => item.quantity <= item.minQuantity).length}
              </p>
              <p className="text-sm text-surface-600">Low Stock</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-surface-200">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Grid3X3" className="w-8 h-8 text-secondary-600" />
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {[...new Set(filteredItems.map(item => item.category))].length}
              </p>
              <p className="text-sm text-surface-600">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {filteredItems.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-surface-200">
          <EmptyState
            icon="Package"
            title={searchTerm || selectedCategory ? "No items match your search" : "No inventory items"}
            description={searchTerm || selectedCategory ? "Try adjusting your search criteria" : "Get started by adding your first inventory item"}
            actionLabel="Add Item"
            onAction={handleAddItem}
          />
        </div>
      ) : (
        <InventoryTable
          items={filteredItems}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />
      )}

      {/* Item Form Modal */}
      <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Inventory;