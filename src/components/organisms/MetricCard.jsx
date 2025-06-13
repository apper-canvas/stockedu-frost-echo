import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend = null,
  trendDirection = 'up',
  color = 'primary',
  loading = false,
  className = ''
}) => {
  const colors = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    },
    secondary: {
      bg: 'bg-secondary-50',
      icon: 'text-secondary-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    },
    success: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      trend: 'text-green-600'
    },
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      trend: 'text-amber-600'
    },
    error: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      trend: 'text-red-600'
    }
  };

  const colorScheme = colors[color] || colors.primary;

  if (loading) {
    return (
      <Card className={`${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-surface-200 rounded w-1/2"></div>
            <div className="w-10 h-10 bg-surface-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-surface-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-surface-200 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card hover className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-surface-600">{title}</h3>
        <div className={`w-10 h-10 ${colorScheme.bg} rounded-lg flex items-center justify-center`}>
          <ApperIcon name={icon} className={`w-5 h-5 ${colorScheme.icon}`} />
        </div>
      </div>
      
      <div className="space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl font-bold font-display text-surface-900"
        >
          {value}
        </motion.div>
        
        {trend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center text-xs"
          >
            <ApperIcon 
              name={trendDirection === 'up' ? 'TrendingUp' : 'TrendingDown'} 
              className={`w-3 h-3 mr-1 ${colorScheme.trend}`} 
            />
            <span className={colorScheme.trend}>{trend}</span>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;