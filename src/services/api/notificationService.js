import { inventoryService, requestService } from '@/services';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class NotificationService {
  constructor() {
    this.notifications = [];
    this.lastId = 0;
  }

  async getAll() {
    await delay(200);
    
    // Generate notifications from inventory and requests
    const [lowStockItems, requests] = await Promise.all([
      inventoryService.getLowStockItems(),
      requestService.getAll()
    ]);

    const notifications = [];

    // Low stock notifications
    lowStockItems.forEach(item => {
      const severity = item.quantity <= item.minQuantity ? 'critical' : 'warning';
      notifications.push({
        id: `stock-${item.id}`,
        type: 'low_stock',
        title: `Low Stock Alert: ${item.name}`,
        message: `Only ${item.quantity} ${item.unit} remaining (Min: ${item.minQuantity})`,
        severity,
        isRead: false,
        createdAt: item.lastUpdated || new Date().toISOString(),
        data: { itemId: item.id, itemName: item.name }
      });
    });

    // Request status notifications
    requests
      .filter(req => req.status !== 'pending')
      .slice(0, 10)
      .forEach(request => {
        const statusMessages = {
          approved: 'Your request has been approved',
          rejected: 'Your request has been rejected',
          fulfilled: 'Your request has been fulfilled'
        };

        notifications.push({
          id: `request-${request.id}`,
          type: 'request_status',
          title: `Request ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`,
          message: `${statusMessages[request.status]}: ${request.itemName} (${request.quantity} units)`,
          severity: request.status === 'rejected' ? 'error' : 'info',
          isRead: false,
          createdAt: request.createdAt,
          data: { requestId: request.id, status: request.status }
        });
      });

    // Sort by creation date (newest first)
    return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async markAsRead(notificationId) {
    await delay(100);
    // In a real app, this would update the database
    return { success: true };
  }

  async markAllAsRead() {
    await delay(200);
    // In a real app, this would update all notifications
    return { success: true };
  }

  async getUnreadCount() {
    await delay(100);
    const notifications = await this.getAll();
    return notifications.filter(n => !n.isRead).length;
  }

  async getNotificationsByType(type) {
    await delay(150);
    const notifications = await this.getAll();
    return notifications.filter(n => n.type === type);
  }
}

export default new NotificationService();