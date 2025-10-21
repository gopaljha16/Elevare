import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const SelectContext = createContext();

export const Select = ({ value, onValueChange, children, ...props }) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  
  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <SelectContext.Provider 
      value={{ 
        value: currentValue, 
        onValueChange: handleValueChange,
        isOpen,
        setIsOpen
      }}
    >
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className, ...props }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext);

  return (
    <button
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ placeholder, className, ...props }) => {
  const { value } = useContext(SelectContext);
  
  return (
    <span className={cn('block truncate', className)} {...props}>
      {value || placeholder}
    </span>
  );
};

export const SelectContent = ({ children, className, ...props }) => {
  const { isOpen } = useContext(SelectContext);
  
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg',
        className
      )}
      {...props}
    >
      <div className="max-h-60 overflow-auto p-1">
        {children}
      </div>
    </div>
  );
};

export const SelectItem = ({ value, children, className, ...props }) => {
  const { onValueChange, setIsOpen } = useContext(SelectContext);

  return (
    <button
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700',
        className
      )}
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
};