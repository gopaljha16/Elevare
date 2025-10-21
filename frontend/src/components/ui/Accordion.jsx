import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const AccordionContext = createContext();

export const Accordion = ({ type = 'single', collapsible = false, children, className, ...props }) => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (value) => {
    const newOpenItems = new Set(openItems);
    
    if (type === 'single') {
      if (newOpenItems.has(value)) {
        if (collapsible) {
          newOpenItems.delete(value);
        }
      } else {
        newOpenItems.clear();
        newOpenItems.add(value);
      }
    } else {
      if (newOpenItems.has(value)) {
        newOpenItems.delete(value);
      } else {
        newOpenItems.add(value);
      }
    }
    
    setOpenItems(newOpenItems);
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = ({ value, children, className, ...props }) => {
  return (
    <div className={cn('border-b border-gray-200 dark:border-gray-700', className)} {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value })
      )}
    </div>
  );
};

export const AccordionTrigger = ({ value, children, className, ...props }) => {
  const { openItems, toggleItem } = useContext(AccordionContext);
  const isOpen = openItems.has(value);

  return (
    <button
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left w-full',
        className
      )}
      onClick={() => toggleItem(value)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  );
};

export const AccordionContent = ({ value, children, className, ...props }) => {
  const { openItems } = useContext(AccordionContext);
  const isOpen = openItems.has(value);

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200',
        isOpen ? 'animate-accordion-down' : 'animate-accordion-up'
      )}
      style={{
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0
      }}
    >
      <div className={cn('pb-4 pt-0', className)} {...props}>
        {children}
      </div>
    </div>
  );
};