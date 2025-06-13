import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border border-surface-200 shadow-sm';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const cardClasses = `${baseClasses} ${paddings[padding]} ${className}`;

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, shadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)' }}
        transition={{ duration: 0.2 }}
        className={cardClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;