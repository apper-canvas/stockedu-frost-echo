import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { inventoryService, categoryService } from '@/services';

const ItemFormModal = ({ 
  isOpen, 
  onClose, 
  item = null, 
  onSuccess = null 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    location: '',
    unit: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (item) {
        setFormData({
          name: item.name || '',
          category: item.category || '',
          quantity: item.quantity?.toString() || '',
          minQuantity: item.minQuantity?.toString() || '',
          location: item.location || '',
          unit: item.unit || ''
        });
      } else {
        setFormData({
          name: '',
          category: '',
          quantity: '',
          minQuantity: '',
          location: '',
          unit: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, item]);

  const loadCategories = async () => {
    try {
      const result = await categoryService.getAll();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.quantity || isNaN(formData.quantity) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.minQuantity || isNaN(formData.minQuantity) || Number(formData.minQuantity) < 0) {
      newErrors.minQuantity = 'Valid minimum quantity is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    
    try {
      const itemData = {
        ...formData,
        quantity: Number(formData.quantity),
        minQuantity: Number(formData.minQuantity)
      };

      if (item) {
        await inventoryService.update(item.id, itemData);
        toast.success('Item updated successfully');
      } else {
        await inventoryService.create(itemData);
        toast.success('Item created successfully');
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <h2 className="text-lg font-semibold text-surface-900">
                {item ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={onClose}
                className="text-surface-400 hover:text-surface-600 transition-colors p-1"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                icon="Package"
              />

              <div className="relative">
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Category <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.category ? 'border-error' : 'border-surface-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ApperIcon name="ChevronDown" className="w-4 h-4 text-surface-400" />
                  </div>
                </div>
                {errors.category && (
                  <p className="mt-1 text-xs text-error flex items-center">
                    <ApperIcon name="AlertCircle" className="w-3 h-3 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Current Quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  error={errors.quantity}
                  required
                  icon="Hash"
                />

                <Input
                  label="Minimum Quantity"
                  name="minQuantity"
                  type="number"
                  min="0"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  error={errors.minQuantity}
                  required
                  icon="AlertTriangle"
                />
              </div>

              <Input
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                error={errors.unit}
                required
                icon="Ruler"
                placeholder="e.g., pieces, bottles, boxes"
              />

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                error={errors.location}
                required
                icon="MapPin"
              />

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  icon={item ? "Save" : "Plus"}
                >
                  {item ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ItemFormModal;