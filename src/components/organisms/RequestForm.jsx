import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import { requestService, inventoryService } from '@/services';

const RequestForm = ({ onSuccess = null, className = '' }) => {
  const [formData, setFormData] = useState({
    itemId: '',
    requestedBy: '',
    quantity: '',
    notes: ''
  });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    setLoadingItems(true);
    try {
      const items = await inventoryService.getAll();
      setInventoryItems(items);
    } catch (error) {
      console.error('Failed to load inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleItemChange = (e) => {
    const itemId = e.target.value;
    const item = inventoryItems.find(i => i.id === itemId);
    
    setFormData(prev => ({ ...prev, itemId }));
    setSelectedItem(item);
    
    if (errors.itemId) {
      setErrors(prev => ({ ...prev, itemId: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemId) {
      newErrors.itemId = 'Please select an item';
    }

    if (!formData.requestedBy.trim()) {
      newErrors.requestedBy = 'Requester name is required';
    }

    if (!formData.quantity || isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (selectedItem && Number(formData.quantity) > selectedItem.quantity) {
      newErrors.quantity = `Only ${selectedItem.quantity} ${selectedItem.unit} available in stock`;
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
      const requestData = {
        ...formData,
        quantity: Number(formData.quantity),
        itemName: selectedItem.name
      };

      await requestService.create(requestData);
      toast.success('Request submitted successfully');
      
      // Reset form
      setFormData({
        itemId: '',
        requestedBy: '',
        quantity: '',
        notes: ''
      });
      setSelectedItem(null);
      setErrors({});

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error(error.message || 'Failed to create request');
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

  return (
    <Card className={className}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-surface-900 mb-2">
          Create New Request
        </h3>
        <p className="text-sm text-surface-600">
          Submit a request for inventory items
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Selection */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Select Item <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              name="itemId"
              value={formData.itemId}
              onChange={handleItemChange}
              disabled={loadingItems}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                errors.itemId ? 'border-error' : 'border-surface-300'
              }`}
            >
              <option value="">
                {loadingItems ? 'Loading items...' : 'Choose an item'}
              </option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.quantity} {item.unit} available
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {loadingItems ? (
                <ApperIcon name="Loader2" className="w-4 h-4 text-surface-400 animate-spin" />
              ) : (
                <ApperIcon name="ChevronDown" className="w-4 h-4 text-surface-400" />
              )}
            </div>
          </div>
          {errors.itemId && (
            <p className="mt-1 text-xs text-error flex items-center">
              <ApperIcon name="AlertCircle" className="w-3 h-3 mr-1" />
              {errors.itemId}
            </p>
          )}
        </div>

        {/* Selected Item Info */}
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-surface-900">{selectedItem.name}</h4>
              <span className="text-sm text-surface-600">{selectedItem.location}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-surface-600">
              <span>Available: {selectedItem.quantity} {selectedItem.unit}</span>
              <span>Category: {selectedItem.category}</span>
            </div>
          </motion.div>
        )}

        {/* Requester Name */}
        <Input
          label="Requested By"
          name="requestedBy"
          value={formData.requestedBy}
          onChange={handleChange}
          error={errors.requestedBy}
          required
          icon="User"
          placeholder="Enter your name"
        />

        {/* Quantity */}
        <Input
          label="Quantity Requested"
          name="quantity"
          type="number"
          min="1"
          max={selectedItem?.quantity || undefined}
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
          required
          icon="Hash"
          placeholder={selectedItem ? `Max: ${selectedItem.quantity}` : 'Enter quantity'}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 text-sm bg-white border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            placeholder="Any additional information about your request..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            icon="Send"
            disabled={!selectedItem}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RequestForm;