import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { inventoryService } from '@/services';

const LowStockAlert = ({ className = '' }) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLowStockItems();
  }, []);

  const loadLowStockItems = async () => {
    setLoading(true);
    try {
      const items = await inventoryService.getLowStockItems();
      setLowStockItems(items);
    } catch (error) {
      console.error('Failed to load low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || lowStockItems.length === 0) {
    return null;
  }

  const criticalItems = lowStockItems.filter(item => item.quantity <= item.minQuantity);
  const lowItems = lowStockItems.filter(item => item.quantity > item.minQuantity && item.quantity <= item.minQuantity * 1.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ApperIcon name="AlertTriangle" className="w-6 h-6 text-amber-600" />
            </motion.div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-surface-900">
              Low Stock Alert
            </h3>
            <p className="text-sm text-surface-600">
              {criticalItems.length} critical, {lowItems.length} low stock items need attention
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="error" size="sm">
            {criticalItems.length} Critical
          </Badge>
          <Badge variant="warning" size="sm">
            {lowItems.length} Low
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            icon={isExpanded ? "ChevronUp" : "ChevronDown"}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-3"
          >
            {/* Critical Items */}
            {criticalItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                  <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
                  Critical Stock ({criticalItems.length})
                </h4>
                <div className="space-y-2">
                  {criticalItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-3 border border-red-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-surface-900 text-sm break-words">
                            {item.name}
                          </p>
                          <p className="text-xs text-surface-600">
                            {item.location} • {item.category}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-sm font-semibold text-red-600">
                            {item.quantity} {item.unit}
                          </p>
                          <p className="text-xs text-surface-500">
                            Min: {item.minQuantity}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Stock Items */}
            {lowItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                  <ApperIcon name="AlertTriangle" className="w-4 h-4 mr-1" />
                  Low Stock ({lowItems.length})
                </h4>
                <div className="space-y-2">
                  {lowItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (criticalItems.length + index) * 0.1 }}
                      className="bg-white rounded-lg p-3 border border-amber-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-surface-900 text-sm break-words">
                            {item.name}
                          </p>
                          <p className="text-xs text-surface-600">
                            {item.location} • {item.category}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-sm font-semibold text-amber-600">
                            {item.quantity} {item.unit}
                          </p>
                          <p className="text-xs text-surface-500">
                            Min: {item.minQuantity}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LowStockAlert;