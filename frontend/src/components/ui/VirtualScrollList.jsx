import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useVirtualScrolling, useComponentSize, usePerformanceMonitor } from '../../utils/performance.jsx';

/**
 * VirtualScrollList Component
 * High-performance virtual scrolling for large lists
 */
const VirtualScrollList = React.memo(({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  className = '',
  overscan = 5,
  ...props
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const { startTiming, endTiming } = usePerformanceMonitor('VirtualScrollList');

  // Calculate visible items with overscan
  const visibleItems = useMemo(() => {
    startTiming('calculateVisible');
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan * 2
    );

    const result = {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };

    endTiming('calculateVisible');
    return result;
  }, [items, itemHeight, containerHeight, scrollTop, overscan, startTiming, endTiming]);

  // Optimized scroll handler
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    
    // Only update if scroll position changed significantly
    if (Math.abs(newScrollTop - scrollTop) > itemHeight / 4) {
      setScrollTop(newScrollTop);
    }
  }, [scrollTop, itemHeight]);

  // Render visible items
  const renderedItems = useMemo(() => {
    startTiming('renderItems');
    
    const items = visibleItems.items.map((item, index) => {
      const actualIndex = visibleItems.startIndex + index;
      return (
        <div
          key={item.id || actualIndex}
          style={{
            position: 'absolute',
            top: (visibleItems.startIndex + index) * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight
          }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });

    endTiming('renderItems');
    return items;
  }, [visibleItems, itemHeight, renderItem, startTiming, endTiming]);

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Total height spacer */}
      <div
        style={{
          height: visibleItems.totalHeight,
          position: 'relative'
        }}
      >
        {/* Rendered items */}
        {renderedItems}
      </div>
    </div>
  );
});

VirtualScrollList.displayName = 'VirtualScrollList';

/**
 * VirtualGrid Component
 * Virtual scrolling for grid layouts
 */
export const VirtualGrid = React.memo(({
  items = [],
  itemWidth = 200,
  itemHeight = 150,
  containerWidth = 800,
  containerHeight = 400,
  gap = 10,
  renderItem,
  className = '',
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { startTiming, endTiming } = usePerformanceMonitor('VirtualGrid');

  // Calculate grid dimensions
  const gridConfig = useMemo(() => {
    const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const totalRows = Math.ceil(items.length / itemsPerRow);
    const rowHeight = itemHeight + gap;

    return {
      itemsPerRow,
      totalRows,
      rowHeight,
      totalHeight: totalRows * rowHeight
    };
  }, [items.length, containerWidth, itemWidth, itemHeight, gap]);

  // Calculate visible items
  const visibleItems = useMemo(() => {
    startTiming('calculateGridVisible');

    const startRow = Math.floor(scrollTop / gridConfig.rowHeight);
    const endRow = Math.min(
      gridConfig.totalRows,
      startRow + Math.ceil(containerHeight / gridConfig.rowHeight) + 1
    );

    const startIndex = startRow * gridConfig.itemsPerRow;
    const endIndex = Math.min(items.length, endRow * gridConfig.itemsPerRow);

    const result = {
      startRow,
      endRow,
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex)
    };

    endTiming('calculateGridVisible');
    return result;
  }, [items, scrollTop, gridConfig, containerHeight, startTiming, endTiming]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Render grid items
  const renderedItems = useMemo(() => {
    startTiming('renderGridItems');

    const items = visibleItems.items.map((item, index) => {
      const actualIndex = visibleItems.startIndex + index;
      const row = Math.floor(actualIndex / gridConfig.itemsPerRow);
      const col = actualIndex % gridConfig.itemsPerRow;

      return (
        <div
          key={item.id || actualIndex}
          style={{
            position: 'absolute',
            top: row * gridConfig.rowHeight,
            left: col * (itemWidth + gap),
            width: itemWidth,
            height: itemHeight
          }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });

    endTiming('renderGridItems');
    return items;
  }, [visibleItems, gridConfig, itemWidth, itemHeight, gap, renderItem, startTiming, endTiming]);

  return (
    <div
      className={`virtual-grid-container ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
      {...props}
    >
      <div
        style={{
          height: gridConfig.totalHeight,
          position: 'relative'
        }}
      >
        {renderedItems}
      </div>
    </div>
  );
});

VirtualGrid.displayName = 'VirtualGrid';

export default VirtualScrollList;