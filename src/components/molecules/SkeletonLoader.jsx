import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  count = 3, 
  type = 'card',
  className = '' 
}) => {
  const shimmerVariants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: { 
      backgroundPosition: '200% 0',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear'
      }
    }
  };

  const skeletonClasses = `
    bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 
    bg-[length:200%_100%] rounded animate-pulse
  `;

  const renderCardSkeleton = (index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
    >
      <div className="space-y-4">
        <div className={`h-6 w-3/4 ${skeletonClasses}`} />
        <div className={`h-4 w-full ${skeletonClasses}`} />
        <div className={`h-4 w-5/6 ${skeletonClasses}`} />
        <div className="flex justify-between">
          <div className={`h-4 w-1/4 ${skeletonClasses}`} />
          <div className={`h-4 w-1/4 ${skeletonClasses}`} />
        </div>
      </div>
    </motion.div>
  );

  const renderTableSkeleton = (index) => (
    <motion.tr
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-surface-200"
    >
      <td className="px-6 py-4">
        <div className={`h-4 w-full ${skeletonClasses}`} />
      </td>
      <td className="px-6 py-4">
        <div className={`h-4 w-20 ${skeletonClasses}`} />
      </td>
      <td className="px-6 py-4">
        <div className={`h-4 w-16 ${skeletonClasses}`} />
      </td>
      <td className="px-6 py-4">
        <div className={`h-4 w-24 ${skeletonClasses}`} />
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <div className={`h-8 w-8 rounded ${skeletonClasses}`} />
          <div className={`h-8 w-8 rounded ${skeletonClasses}`} />
        </div>
      </td>
    </motion.tr>
  );

  const renderListSkeleton = (index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-surface-200"
    >
      <div className={`w-12 h-12 rounded-full ${skeletonClasses}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-4 w-3/4 ${skeletonClasses}`} />
        <div className={`h-3 w-1/2 ${skeletonClasses}`} />
      </div>
      <div className={`h-6 w-16 rounded-full ${skeletonClasses}`} />
    </motion.div>
  );

  const skeletonTypes = {
    card: renderCardSkeleton,
    table: renderTableSkeleton,
    list: renderListSkeleton
  };

  const renderSkeleton = skeletonTypes[type] || renderCardSkeleton;

  if (type === 'table') {
    return (
      <div className={`overflow-hidden ${className}`}>
        <table className="min-w-full">
          <tbody>
            {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

export default SkeletonLoader;