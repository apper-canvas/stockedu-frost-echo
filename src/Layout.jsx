import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-surface-200 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold font-display text-surface-900">StockEdu</h1>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
        >
          <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="w-6 h-6 text-surface-700" />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-surface-50 border-r border-surface-200 flex-col z-40">
          <div className="p-6 border-b border-surface-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-surface-900">StockEdu</h1>
                <p className="text-sm text-surface-600">Inventory Management</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-surface-700 hover:bg-white hover:shadow-sm hover:-translate-y-0.5'
                  }`
                }
              >
                <ApperIcon name={route.icon} className="w-5 h-5" />
                <span>{route.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-surface-50 border-r border-surface-200 flex flex-col z-50"
        >
          <div className="p-6 border-b border-surface-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-surface-900">StockEdu</h1>
                <p className="text-sm text-surface-600">Inventory Management</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-surface-700 hover:bg-white hover:shadow-sm'
                  }`
                }
              >
                <ApperIcon name={route.icon} className="w-5 h-5" />
                <span>{route.label}</span>
              </NavLink>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;