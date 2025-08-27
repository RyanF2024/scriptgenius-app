import { ReportHandler } from 'web-vitals';

type Metric = {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
};

/**
 * Report Web Vitals to your analytics service
 * @param onPerfEntry Callback function to handle the metrics
 */
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

/**
 * Track page load performance
 */
const trackPageLoad = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const [pageNav] = performance.getEntriesByType('navigation');
    
    if (pageNav) {
      const navigationTiming = pageNav as PerformanceNavigationTiming;
      const { domComplete, loadEventEnd, domContentLoadedEventEnd } = navigationTiming;
      
      // Log core web vitals
      const metrics = {
        dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
        tcp: navigationTiming.connectEnd - navigationTiming.connectStart,
        ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
        domLoaded: domContentLoadedEventEnd,
        pageLoad: loadEventEnd,
        domComplete,
      };
      
      console.log('Page Load Metrics:', metrics);
      // Send to analytics service
      // sendToAnalytics(metrics);
    }
  }
};

/**
 * Track custom metrics
 * @param name Metric name
 * @param value Metric value
 * @param metadata Additional metadata
 */
const trackMetric = (
  name: string,
  value: number,
  metadata: Record<string, unknown> = {}
) => {
  const metric = {
    name,
    value,
    timestamp: Date.now(),
    ...metadata,
  };
  
  console.log('Custom Metric:', metric);
  // Send to analytics service
  // sendToAnalytics(metric);
};

/**
 * Track API call performance
 * @param url API endpoint
 * @param method HTTP method
 * @param startTime Start time of the request
 * @param endTime End time of the request
 * @param status HTTP status code
 */
const trackApiCall = (
  url: string,
  method: string,
  startTime: number,
  endTime: number,
  status: number
) => {
  const duration = endTime - startTime;
  const metric = {
    name: 'api_call',
    value: duration,
    url,
    method,
    status,
    timestamp: Date.now(),
  };
  
  console.log('API Call Metric:', metric);
  // Send to analytics service
  // sendToAnalytics(metric);
  
  // Log slow API calls
  if (duration > 1000) {
    console.warn(`Slow API call to ${url} took ${duration}ms`);
  }
};

/**
 * Track component render time
 * @param componentName Name of the component
 * @param startTime Start time of the render
 * @param endTime End time of the render
 */
const trackRenderTime = (
  componentName: string,
  startTime: number,
  endTime: number
) => {
  const duration = endTime - startTime;
  const metric = {
    name: 'component_render',
    component: componentName,
    value: duration,
    timestamp: Date.now(),
  };
  
  console.log('Render Metric:', metric);
  // Send to analytics service
  // sendToAnalytics(metric);
  
  // Log slow renders
  if (duration > 100) {
    console.warn(`Slow render for ${componentName}: ${duration}ms`);
  }
};

/**
 * Track resource loading performance
 */
const trackResourceTiming = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const resources = performance.getEntriesByType('resource');
    
    resources.forEach((resource) => {
      const { name, duration, initiatorType, transferSize, decodedBodySize } = resource as PerformanceResourceTiming;
      
      const metric = {
        name: 'resource_load',
        url: name,
        type: initiatorType,
        duration,
        transferSize,
        decodedBodySize,
        timestamp: Date.now(),
      };
      
      console.log('Resource Load Metric:', metric);
      // Send to analytics service
      // sendToAnalytics(metric);
      
      // Log large resources
      if (transferSize > 100000) { // 100KB
        console.warn(`Large resource loaded: ${name} (${Math.round(transferSize / 1024)}KB)`);
      }
    });
  }
};

/**
 * Track memory usage
 */
const trackMemoryUsage = () => {
  if ('memory' in (performance as any)) {
    const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = (performance as any).memory;
    
    const metric = {
      name: 'memory_usage',
      jsHeapSizeLimit,
      totalJSHeapSize,
      usedJSHeapSize,
      timestamp: Date.now(),
    };
    
    console.log('Memory Usage:', metric);
    // Send to analytics service
    // sendToAnalytics(metric);
    
    // Log high memory usage
    const usedMB = usedJSHeapSize / (1024 * 1024);
    const limitMB = jsHeapSizeLimit / (1024 * 1024);
    const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
    
    if (usagePercent > 70) {
      console.warn(`High memory usage: ${usedMB.toFixed(2)}MB of ${limitMB.toFixed(2)}MB (${Math.round(usagePercent)}%)`);
    }
  }
};

/**
 * Initialize performance monitoring
 */
const initPerformanceMonitoring = () => {
  // Track page load performance
  if (document.readyState === 'complete') {
    trackPageLoad();
  } else {
    window.addEventListener('load', trackPageLoad);
  }
  
  // Track resource timing after page load
  if (document.readyState === 'complete') {
    setTimeout(trackResourceTiming, 0);
  } else {
    window.addEventListener('load', () => {
      setTimeout(trackResourceTiming, 0);
    });
  }
  
  // Track memory usage periodically
  if ('memory' in (performance as any)) {
    setInterval(trackMemoryUsage, 60000); // Check every minute
  }
};

export {
  reportWebVitals,
  trackPageLoad,
  trackMetric,
  trackApiCall,
  trackRenderTime,
  trackResourceTiming,
  trackMemoryUsage,
  initPerformanceMonitoring,
};
