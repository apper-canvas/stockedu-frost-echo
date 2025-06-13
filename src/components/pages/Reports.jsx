import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import { inventoryService, requestService, categoryService } from '@/services';
import { formatDate } from '@/utils/helpers';

const Reports = () => {
  const [reportData, setReportData] = useState({
    inventory: [],
    requests: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState('inventory');

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [inventory, requests, categories] = await Promise.all([
        inventoryService.getAll(),
        requestService.getAll(),
        categoryService.getAll()
      ]);

      setReportData({
        inventory,
        requests,
        categories
      });
    } catch (err) {
      console.error('Failed to load report data:', err);
      setError(err.message || 'Failed to load report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryReport = () => {
    const { inventory } = reportData;
    
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * 10), 0); // Estimated value
    const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);
    const categoryBreakdown = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      summary: {
        totalItems,
        totalValue,
        lowStockCount: lowStockItems.length,
        categories: Object.keys(categoryBreakdown).length
      },
      lowStockItems,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([name, count]) => ({ name, count })),
      items: inventory.sort((a, b) => a.name.localeCompare(b.name))
    };
  };

  const generateRequestsReport = () => {
    const { requests } = reportData;
    
    const totalRequests = requests.length;
    const statusBreakdown = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});

    const requestsByMonth = requests.reduce((acc, request) => {
      const month = new Date(request.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return {
      summary: {
        totalRequests,
        pending: statusBreakdown.pending || 0,
        approved: statusBreakdown.approved || 0,
        fulfilled: statusBreakdown.fulfilled || 0,
        rejected: statusBreakdown.rejected || 0
      },
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
      monthlyBreakdown: Object.entries(requestsByMonth).map(([month, count]) => ({ month, count })),
      recentRequests: requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const reportContent = selectedReport === 'inventory' 
      ? generateInventoryReport() 
      : generateRequestsReport();
    
    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-surface-200 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-10 bg-surface-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-surface-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="h-10 bg-surface-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-surface-200 rounded w-32 animate-pulse"></div>
        </div>
        <SkeletonLoader count={3} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Reports Error"
          message={error}
          onRetry={loadReportData}
        />
      </div>
    );
  }

  const inventoryReport = generateInventoryReport();
  const requestsReport = generateRequestsReport();

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-900 break-words">
            Reports & Analytics
          </h1>
          <p className="text-surface-600 mt-1">
            Generate detailed reports about your inventory and requests
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            icon="RefreshCw"
            onClick={loadReportData}
            size="sm"
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            icon="Printer"
            onClick={handlePrint}
            size="sm"
          >
            Print
          </Button>
          <Button
            variant="primary"
            icon="Download"
            onClick={handleExport}
            size="sm"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedReport('inventory')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedReport === 'inventory'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            }`}
          >
            <ApperIcon name="Package" className="w-4 h-4 inline mr-2" />
            Inventory Report
          </button>
          <button
            onClick={() => setSelectedReport('requests')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedReport === 'requests'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            }`}
          >
            <ApperIcon name="FileText" className="w-4 h-4 inline mr-2" />
            Requests Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'inventory' ? (
        <div className="space-y-6">
          {/* Inventory Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Package" className="w-8 h-8 text-primary-600" />
                <div>
                  <p className="text-2xl font-bold text-surface-900">{inventoryReport.summary.totalItems}</p>
                  <p className="text-sm text-surface-600">Total Items</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center space-x-3">
                <ApperIcon name="DollarSign" className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-surface-900">${inventoryReport.summary.totalValue}</p>
                  <p className="text-sm text-surface-600">Estimated Value</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center space-x-3">
                <ApperIcon name="AlertTriangle" className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-surface-900">{inventoryReport.summary.lowStockCount}</p>
                  <p className="text-sm text-surface-600">Low Stock Items</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Grid3X3" className="w-8 h-8 text-secondary-600" />
                <div>
                  <p className="text-2xl font-bold text-surface-900">{inventoryReport.summary.categories}</p>
                  <p className="text-sm text-surface-600">Categories</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Items by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventoryReport.categoryBreakdown.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-surface-50 rounded-lg"
                >
                  <span className="font-medium text-surface-900 break-words">{category.name}</span>
                  <Badge variant="primary">{category.count}</Badge>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Low Stock Items */}
          {inventoryReport.lowStockItems.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-surface-900 mb-4 text-amber-600">
                <ApperIcon name="AlertTriangle" className="w-5 h-5 inline mr-2" />
                Low Stock Items Requiring Attention
              </h3>
              <div className="space-y-3">
                {inventoryReport.lowStockItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-surface-900 break-words">{item.name}</p>
                      <p className="text-sm text-surface-600">{item.location} • {item.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold text-amber-600">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-surface-500">Min: {item.minQuantity}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Requests Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <div className="flex items-center space-x-3">
                <ApperIcon name="FileText" className="w-8 h-8 text-primary-600" />
                <div>
                  <p className="text-2xl font-bold text-surface-900">{requestsReport.summary.totalRequests}</p>
                  <p className="text-sm text-surface-600">Total Requests</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Clock" className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-surface-900">{requestsReport.summary.pending}</p>
                  <p className="text-sm text-surface-600">Pending</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center space-x-3">
                <ApperIcon name="CheckCircle" className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-surface-900">{requestsReport.summary.approved}</p>
                  <p className="text-sm text-surface-600">Approved</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Package" className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-surface-900">{requestsReport.summary.fulfilled}</p>
                  <p className="text-sm text-surface-600">Fulfilled</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center space-x-3">
                <ApperIcon name="XCircle" className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-surface-900">{requestsReport.summary.rejected}</p>
                  <p className="text-sm text-surface-600">Rejected</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Requests */}
          <Card>
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Recent Requests</h3>
            {requestsReport.recentRequests.length === 0 ? (
              <EmptyState
                icon="FileText"
                title="No requests found"
                description="Requests will appear here as they are submitted"
              />
            ) : (
              <div className="space-y-3">
                {requestsReport.recentRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-surface-50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-surface-900 break-words">
                        {request.itemName || 'Unknown Item'}
                      </p>
                      <p className="text-sm text-surface-600">
                        {request.requestedBy} • Qty: {request.quantity} • {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <Badge variant={
                        request.status === 'approved' ? 'success' :
                        request.status === 'fulfilled' ? 'info' :
                        request.status === 'rejected' ? 'error' : 'warning'
                      }>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;