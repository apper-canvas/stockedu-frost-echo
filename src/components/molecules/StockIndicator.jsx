import React from 'react';
import { motion } from 'framer-motion';

const StockIndicator = ({ current, minimum, unit = '', size = 'md' }) => {
  const percentage = minimum > 0 ? (current / minimum) * 100 : 100;
  
  const getStockLevel = () => {
    if (current <= minimum) return 'critical';
    if (current <= minimum * 1.5) return 'low';
    return 'good';
  };

  const stockLevel = getStockLevel();
  
  const colors = {
    critical: 'bg-error',
    low: 'bg-warning',
    good: 'bg-success'
  };

  const textColors = {
    critical: 'text-error',
    low: 'text-amber-700',
    good: 'text-green-700'
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`font-medium ${textSizes[size]} ${textColors[stockLevel]}`}>
          {current} {unit}
        </span>
        <span className={`text-xs text-surface-500`}>
          Min: {minimum} {unit}
        </span>
      </div>
      
      <div className={`w-full bg-surface-200 rounded-full ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${colors[stockLevel]} ${sizes[size]} rounded-full transition-colors`}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <span className={`text-xs font-medium ${textColors[stockLevel]} capitalize`}>
          {stockLevel} Stock
        </span>
        <span className="text-xs text-surface-500">
          {percentage.toFixed(0)}% of minimum
        </span>
      </div>
    </div>
  );
};

export default StockIndicator;