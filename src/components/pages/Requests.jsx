import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import RequestForm from '@/components/organisms/RequestForm';
import { requestService } from '@/services';
import { formatDate } from '@/utils/helpers';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

useEffect(() => {
    loadRequests();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showForm) {
        setShowForm(false);
      }
    };

    if (showForm) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await requestService.getAll();
      setRequests(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError(err.message || 'Failed to load requests');
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await requestService.updateStatus(requestId, newStatus);
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
      toast.success(`Request ${newStatus} successfully`);
    } catch (error) {
      console.error('Failed to update request status:', error);
      toast.error(error.message || 'Failed to update request status');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'fulfilled': return 'info';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'CheckCircle';
      case 'fulfilled': return 'Package';
      case 'rejected': return 'XCircle';
      default: return 'Clock';
    }
  };

  const filteredRequests = requests.filter(request => 
    statusFilter === 'all' || request.status === statusFilter
  );

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-surface-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-surface-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="flex space-x-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-surface-200 rounded w-24 animate-pulse"></div>
          ))}
        </div>
        <SkeletonLoader count={4} type="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Requests Error"
          message={error}
          onRetry={loadRequests}
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
            Requests Management
          </h1>
          <p className="text-surface-600 mt-1">
            View and manage inventory requests from staff
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            icon="RefreshCw"
            onClick={loadRequests}
            size="sm"
          >
            Refresh
</Button>
          <Button
            icon="Plus"
            onClick={() => setShowForm(true)}
            size="sm"
          >
            New Request
          </Button>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowForm(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-200">
                <h2 className="text-xl font-semibold text-surface-900">
                  Create New Request
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              <div className="p-6">
                <RequestForm
                  onSuccess={() => {
                    loadRequests();
                    setShowForm(false);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <EmptyState
            icon="FileText"
            title={statusFilter === 'all' ? "No requests found" : `No ${statusFilter} requests`}
            description={statusFilter === 'all' ? "Requests will appear here as staff submit them" : `No requests with ${statusFilter} status`}
            actionLabel="Create Request"
            onAction={() => setShowForm(true)}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-surface-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-surface-900 break-words">
                        {request.itemName || 'Unknown Item'}
                      </h3>
                      <Badge variant={getStatusVariant(request.status)}>
                        <ApperIcon name={getStatusIcon(request.status)} className="w-3 h-3 mr-1" />
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-surface-600">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="User" className="w-4 h-4" />
                        <span>Requested by: {request.requestedBy}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Hash" className="w-4 h-4" />
                        <span>Quantity: {request.quantity}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Calendar" className="w-4 h-4" />
                        <span>Created: {formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="mt-3 p-3 bg-surface-50 rounded-lg">
                        <p className="text-sm text-surface-700 break-words">
                          <strong>Notes:</strong> {request.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                      <Button
                        variant="success"
                        size="sm"
                        icon="CheckCircle"
                        onClick={() => handleStatusChange(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon="XCircle"
                        onClick={() => handleStatusChange(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  {request.status === 'approved' && (
                    <div>
                      <Button
                        variant="primary"
                        size="sm"
                        icon="Package"
                        onClick={() => handleStatusChange(request.id, 'fulfilled')}
Mark Fulfilled
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Requests;