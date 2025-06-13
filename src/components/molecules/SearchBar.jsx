import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { debounce } from '@/utils/helpers';

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search...', 
  categories = [],
  selectedCategory = '',
  onCategoryChange,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useCallback(
    debounce((term) => {
      if (onSearch) {
        onSearch(term);
      }
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <ApperIcon name="Search" className="w-4 h-4 text-surface-400" />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        
        {searchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
          >
            <ApperIcon name="X" className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
            className="appearance-none bg-white border border-surface-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ApperIcon name="ChevronDown" className="w-4 h-4 text-surface-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;