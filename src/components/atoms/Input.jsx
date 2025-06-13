import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Input = forwardRef(({ 
  label,
  type = 'text',
  error = null,
  icon = null,
  className = '',
  required = false,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(props.value || props.defaultValue || '');

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const inputClasses = `
    w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    ${error ? 'border-error' : 'border-surface-300'}
    ${icon ? 'pl-10' : ''}
    ${className}
  `;

  const labelClasses = `
    absolute left-3 transition-all duration-200 pointer-events-none text-surface-500
    ${isFocused || hasValue 
      ? 'top-1 text-xs text-primary-600' 
      : 'top-2.5 text-sm'
    }
    ${icon ? 'left-10' : 'left-3'}
  `;

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-2.5 z-10">
          <ApperIcon name={icon} className="w-4 h-4 text-surface-400" />
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />
      
      {label && (
        <motion.label
          className={labelClasses}
          animate={{
            top: isFocused || hasValue ? 4 : 10,
            fontSize: isFocused || hasValue ? '0.75rem' : '0.875rem',
            color: isFocused ? '#2563eb' : '#64748b'
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </motion.label>
      )}
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-error flex items-center"
        >
          <ApperIcon name="AlertCircle" className="w-3 h-3 mr-1" />
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;