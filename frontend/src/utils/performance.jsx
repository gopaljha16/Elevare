import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Performance monitoring utilities
 */

// Performance metrics collection
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
    }

    // Start timing a operation
    startTiming(name) {
        this.metrics.set(name, {
            startTime: performance.now(),
            endTime: null,
            duration: null
        });
    }

    // End timing and calculate duration
    endTiming(name) {
        const metric = this.metrics.get(name);
        if (metric) {
            metric.endTime = performance.now();
            metric.duration = metric.endTime - metric.startTime;

            // Notify observers
            const observers = this.observers.get(name) || [];
            observers.forEach(callback => callback(metric));
        }
        return metric?.duration || 0;
    }

    // Subscribe to timing events
    subscribe(name, callback) {
        if (!this.observers.has(name)) {
            this.observers.set(name, []);
        }
        this.observers.get(name).push(callback);

        // Return unsubscribe function
        return () => {
            const observers = this.observers.get(name) || [];
            const index = observers.indexOf(callback);
            if (index > -1) {
                observers.splice(index, 1);
            }
        };
    }

    // Get all metrics
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    // Clear metrics
    clear() {
        this.metrics.clear();
    }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component render performance
 * @param {string} componentName - Name of the component
 * @returns {Object} - Performance utilities
 */
export const usePerformanceMonitor = (componentName) => {
    const renderCountRef = useRef(0);
    const lastRenderTimeRef = useRef(0);

    useEffect(() => {
        renderCountRef.current += 1;
        const renderTime = performance.now();

        if (lastRenderTimeRef.current > 0) {
            const timeSinceLastRender = renderTime - lastRenderTimeRef.current;

            // Log slow renders (> 100ms for significant performance issues)
            if (timeSinceLastRender > 100) {
                console.warn(`Slow render detected in ${componentName}: ${timeSinceLastRender.toFixed(2)}ms`);
            }
        }

        lastRenderTimeRef.current = renderTime;
    });

    const startTiming = useCallback((operation) => {
        performanceMonitor.startTiming(`${componentName}.${operation}`);
    }, [componentName]);

    const endTiming = useCallback((operation) => {
        return performanceMonitor.endTiming(`${componentName}.${operation}`);
    }, [componentName]);

    return {
        renderCount: renderCountRef.current,
        startTiming,
        endTiming,
        componentName
    };
};

/**
 * Hook for debounced callbacks with performance optimization
 * @param {Function} callback - Callback function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @param {Array} deps - Dependencies array
 * @returns {Function} - Debounced callback
 */
export const useOptimizedCallback = (callback, delay, deps) => {
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);

    // Update callback ref when dependencies change
    useEffect(() => {
        callbackRef.current = callback;
    }, deps);

    return useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);
};

/**
 * Hook for memoized expensive calculations
 * @param {Function} factory - Factory function for expensive calculation
 * @param {Array} deps - Dependencies array
 * @param {string} name - Name for performance monitoring
 * @returns {any} - Memoized value
 */
export const useOptimizedMemo = (factory, deps, name) => {
    return useMemo(() => {
        if (name) {
            performanceMonitor.startTiming(`memo.${name}`);
        }

        const result = factory();

        if (name) {
            const duration = performanceMonitor.endTiming(`memo.${name}`);
            if (duration > 10) {
                console.warn(`Expensive memo calculation in ${name}: ${duration.toFixed(2)}ms`);
            }
        }

        return result;
    }, deps);
};

/**
 * Hook for virtual scrolling implementation
 * @param {Array} items - Array of items to virtualize
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of the container
 * @returns {Object} - Virtual scrolling utilities
 */
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
    const [scrollTop, setScrollTop] = useState(0);

    const visibleItems = useMemo(() => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / itemHeight) + 1,
            items.length
        );

        return {
            startIndex,
            endIndex,
            items: items.slice(startIndex, endIndex),
            totalHeight: items.length * itemHeight,
            offsetY: startIndex * itemHeight
        };
    }, [items, itemHeight, containerHeight, scrollTop]);

    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
    }, []);

    return {
        visibleItems,
        handleScroll,
        totalHeight: visibleItems.totalHeight
    };
};

/**
 * Hook for intersection observer (lazy loading)
 * @param {Object} options - Intersection observer options
 * @returns {Array} - [ref, isIntersecting]
 */
export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                ...options
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [options]);

    return [ref, isIntersecting];
};

/**
 * Hook for measuring component size
 * @returns {Array} - [ref, dimensions]
 */
export const useComponentSize = () => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });

        resizeObserver.observe(element);

        return () => {
            resizeObserver.unobserve(element);
        };
    }, []);

    return [ref, dimensions];
};

/**
 * Higher-order component for performance monitoring
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {string} componentName - Name for monitoring
 * @returns {React.Component} - Wrapped component with monitoring
 */
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
    return React.memo((props) => {
        const { renderCount, startTiming, endTiming } = usePerformanceMonitor(componentName);

        useEffect(() => {
            startTiming('render');
            return () => {
                endTiming('render');
            };
        });

        return <WrappedComponent {...props} renderCount={renderCount} />;
    });
};

/**
 * Utility for preventing unnecessary re-renders
 * @param {Object} _props - Component props (unused but kept for API consistency)
 * @param {Array} watchKeys - Keys to watch for changes
 * @returns {boolean} - Whether props have changed
 */
export const shallowCompareProps = (_props, watchKeys = []) => {
    return (prevProps, nextProps) => {
        if (watchKeys.length === 0) {
            // Compare all keys
            const prevKeys = Object.keys(prevProps);
            const nextKeys = Object.keys(nextProps);

            if (prevKeys.length !== nextKeys.length) return false;

            return prevKeys.every(key => prevProps[key] === nextProps[key]);
        }

        // Compare only specified keys
        return watchKeys.every(key => prevProps[key] === nextProps[key]);
    };
};

/**
 * Performance-optimized component wrapper
 * @param {React.Component} Component - Component to optimize
 * @param {Array} watchProps - Props to watch for changes
 * @returns {React.Component} - Optimized component
 */
export const optimizeComponent = (Component, watchProps = []) => {
    return React.memo(Component, shallowCompareProps({}, watchProps));
};

/**
 * Bundle size analyzer utility
 */
export const analyzeBundleSize = () => {
    if (process.env.NODE_ENV === 'development') {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const totalSize = scripts.reduce((total, script) => {
            // This is a rough estimation - in production you'd use webpack-bundle-analyzer
            return total + (script.src.length * 100); // Rough estimate
        }, 0);

        console.log(`Estimated bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    }
};

/**
 * Memory usage monitoring
 */
export const monitorMemoryUsage = () => {
    if (performance.memory) {
        const memory = performance.memory;
        return {
            used: Math.round(memory.usedJSHeapSize / 1048576), // MB
            total: Math.round(memory.totalJSHeapSize / 1048576), // MB
            limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
        };
    }
    return null;
};

/**
 * Performance report generator
 */
export const generatePerformanceReport = () => {
    const metrics = performanceMonitor.getMetrics();
    const memory = monitorMemoryUsage();

    const report = {
        timestamp: new Date().toISOString(),
        metrics,
        memory,
        navigation: performance.getEntriesByType('navigation')[0],
        resources: performance.getEntriesByType('resource').length
    };

    console.table(report.metrics);
    console.log('Memory Usage:', report.memory);

    return report;
};

export default {
    performanceMonitor,
    usePerformanceMonitor,
    useOptimizedCallback,
    useOptimizedMemo,
    useVirtualScrolling,
    useIntersectionObserver,
    useComponentSize,
    withPerformanceMonitoring,
    optimizeComponent,
    shallowCompareProps,
    analyzeBundleSize,
    monitorMemoryUsage,
    generatePerformanceReport
};