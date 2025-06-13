import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import StockIndicator from '@/components/molecules/StockIndicator';
import { formatDate } from '@/utils/helpers';

const InventoryTable = ({ 
  items = [], 
  onEdit = null, 
  onDelete = null,
  loading = false,
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = React.useMemo(() => {
    if (!sortConfig.key) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [items, sortConfig]);

  const getStockStatus = (current, minimum) => {
    if (current <= minimum) return { label: 'Critical', variant: 'error' };
    if (current <= minimum * 1.5) return { label: 'Low', variant: 'warning' };
    return { label: 'Good', variant: 'success' };
  };

  const SortableHeader = ({ children, sortKey }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-50 transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <ApperIcon 
            name="ChevronUp" 
            className={`w-3 h-3 ${
              sortConfig.key === sortKey && sortConfig.direction === 'asc' 
                ? 'text-primary-600' 
                : 'text-surface-400'
            }`} 
          />
          <ApperIcon 
            name="ChevronDown" 
            className={`w-3 h-3 -mt-1 ${
              sortConfig.key === sortKey && sortConfig.direction === 'desc' 
                ? 'text-primary-600' 
                : 'text-surface-400'
            }`} 
          />
        </div>
      </div>
    </th>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-surface-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-200">
          <thead className="bg-surface-50">
            <tr>
              <SortableHeader sortKey="name">Item Name</SortableHeader>
              <SortableHeader sortKey="category">Category</SortableHeader>
              <SortableHeader sortKey="quantity">Stock Level</SortableHeader>
              <SortableHeader sortKey="location">Location</SortableHeader>
              <SortableHeader sortKey="lastUpdated">Last Updated</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-surface-200">
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item, index) => {
                const stockStatus = getStockStatus(item.quantity, item.minQuantity);
                
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-surface-900 break-words">
                          {item.name}
                        </div>
                        <div className="text-xs text-surface-500">
                          {item.unit}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default" size="sm">
                        {item.category}
                      </Badge>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="min-w-0 max-w-xs">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={stockStatus.variant} size="sm">
                            {stockStatus.label}
                          </Badge>
                        </div>
                        <StockIndicator 
                          current={item.quantity}
                          minimum={item.minQuantity}
                          unit={item.unit}
                          size="sm"
                        />
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 break-words">
                      {item.location}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-500">
                      {formatDate(item.lastUpdated)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon="Edit"
                            onClick={() => onEdit(item)}
                            className="p-2"
                          />
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon="Trash2"
                            onClick={() => onDelete(item)}
                            className="p-2 text-error hover:bg-red-50"
                          />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {sortedItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <ApperIcon name="Package" className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">No inventory items found</p>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;