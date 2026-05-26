import type { Metric } from 'web-vitals';

export function reportWebVitals(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, Math.round(metric.value), metric.rating);
  }

  // In production, send to analytics endpoint
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL}/analytics/vitals`, body);
    }
  }
}

// Performance budgets (warn in dev if exceeded)
export const PERFORMANCE_BUDGETS = {
  LCP: 2500,  // Largest Contentful Paint < 2.5s
  FID: 100,   // First Input Delay < 100ms
  CLS: 0.1,   // Cumulative Layout Shift < 0.1
  FCP: 1800,  // First Contentful Paint < 1.8s
  TTFB: 800,  // Time to First Byte < 800ms
  INP: 200,   // Interaction to Next Paint < 200ms
};
