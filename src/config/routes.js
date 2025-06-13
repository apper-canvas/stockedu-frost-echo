import Dashboard from '@/components/pages/Dashboard';
import Inventory from '@/components/pages/Inventory';
import Requests from '@/components/pages/Requests';
import Reports from '@/components/pages/Reports';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    path: '/inventory',
    icon: 'Package',
    component: Inventory
  },
  requests: {
    id: 'requests',
    label: 'Requests',
    path: '/requests',
    icon: 'FileText',
    component: Requests
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    component: Reports
  }
};

export const routeArray = Object.values(routes);