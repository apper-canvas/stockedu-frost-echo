import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import MetricCard from '@/components/organisms/MetricCard';
import LowStockAlert from '@/components/organisms/LowStockAlert';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import { inventoryService, requestService } from '@/services';
import { formatDate } from '@/utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    lowStockCount: 0,
    pendingRequests: 0,
    categories: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [inventoryItems, requests, lowStockItems] = await Promise.all([
        inventoryService.getAll(),
        requestService.getAll(),
        inventoryService.getLowStockItems()
      ]);

      // Calculate metrics
      const categories = [...new Set(inventoryItems.map(item => item.category))];
      const pendingRequests = requests.filter(req => req.status === 'pending');

      setMetrics({
        totalItems: inventoryItems.length,
        lowStockCount: lowStockItems.length,
        pendingRequests: pendingRequests.length,
        categories: categories.length
      });

      // Generate recent activity
      const activity = [
        ...inventoryItems
          .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
          .slice(0, 3)
          .map(item => ({
            id: `inv-${item.id}`,
            type: 'inventory',
            title: `${item.name} updated`,
            description: `Stock level: ${item.quantity} ${item.unit}`,
            timestamp: item.lastUpdated,
            icon: 'Package'
          })),
        ...requests
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
          .map(request => ({
            id: `req-${request.id}`,
            type: 'request',
            title: `New request from ${request.requestedBy}`,
            description: `${request.quantity} ${request.itemName || 'items'} requested`,
            timestamp: request.createdAt,
            icon: 'FileText'
          }))
      ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

      setRecentActivity(activity);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="card" />
        </div>
        <SkeletonLoader count={1} type="card" />
        <SkeletonLoader count={3} type="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Dashboard Error"
          message={error}
          onRetry={loadDashboardData}
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
            Dashboard
          </h1>
          <p className="text-surface-600 mt-1">
            Overview of your school inventory system
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            icon="RefreshCw"
            onClick={loadDashboardData}
            size="sm"
          >
            Refresh
          </Button>
          <Button
            icon="Plus"
            onClick={() => navigate('/inventory')}
            size="sm"
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Items"
          value={metrics.totalItems}
          icon="Package"
          color="primary"
        />
        <MetricCard
          title="Low Stock Items"
          value={metrics.lowStockCount}
          icon="AlertTriangle"
          color={metrics.lowStockCount > 0 ? "warning" : "success"}
          trend={metrics.lowStockCount > 0 ? `${metrics.lowStockCount} need attention` : "All good"}
          trendDirection={metrics.lowStockCount > 0 ? "down" : "up"}
        />
        <MetricCard
          title="Pending Requests"
          value={metrics.pendingRequests}
          icon="FileText"
          color={metrics.pendingRequests > 0 ? "error" : "success"}
        />
        <MetricCard
          title="Categories"
          value={metrics.categories}
          icon="Grid3X3"
          color="secondary"
        />
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-surface-900">
            Recent Activity
          </h2>
          <Button
            variant="ghost"
            size="sm"
            icon="ExternalLink"
            onClick={() => navigate('/inventory')}
          >
            View All
          </Button>
        </div>

        {recentActivity.length === 0 ? (
          <EmptyState
            icon="Activity"
            title="No recent activity"
            description="Activity will appear here as you manage your inventory"
            actionLabel="Add First Item"
            onAction={() => navigate('/inventory')}
          />
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 rounded-lg hover:bg-surface-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'inventory' ? 'bg-primary-100' : 'bg-secondary-100'
                }`}>
                  <ApperIcon 
                    name={activity.icon} 
                    className={`w-5 h-5 ${
                      activity.type === 'inventory' ? 'text-primary-600' : 'text-secondary-600'
                    }`} 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 break-words">
                    {activity.title}
                  </p>
                  <p className="text-sm text-surface-600 break-words">
                    {activity.description}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;