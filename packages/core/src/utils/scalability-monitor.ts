/**
 * Scalability Monitor
 * 
 * Comprehensive monitoring system for tracking scalability metrics,
 * detecting bottlenecks, and providing alerts for performance issues.
 */

import { SCALABILITY_LIMITS } from './scalability-manager';
import { logError, logDebug, logWarning } from './logger';

/**
 * Scalability metrics interface
 */
export interface ScalabilityMetrics {
  memory: {
    used: number;
    limit: number;
    percentage: number;
  };
  performance: {
    renderTime: number;
    bundleSize: number;
    loadTime: number;
  };
  api: {
    requestCount: number;
    errorRate: number;
    averageResponseTime: number;
  };
  cache: {
    hitRate: number;
    size: number;
    maxSize: number;
  };
  state: {
    totalSlices: number;
    totalItems: number;
    largestSlice: number;
  };
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  memoryThreshold: number; // percentage
  renderTimeThreshold: number; // ms
  errorRateThreshold: number; // percentage
  bundleSizeThreshold: number; // kb
}

/**
 * Alert types
 */
export type AlertType = 'memory' | 'performance' | 'api' | 'cache' | 'state';

/**
 * Alert interface
 */
export interface Alert {
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metrics: Partial<ScalabilityMetrics>;
  recommendations: string[];
}

/**
 * Scalability Monitor
 */
export class ScalabilityMonitor {
  private static instance: ScalabilityMonitor;
  private metrics: ScalabilityMetrics;
  private alerts: Alert[] = [];
  private alertConfig: AlertConfig;
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private alertCallbacks: Array<(alert: Alert) => void> = [];

  static getInstance(): ScalabilityMonitor {
    if (!ScalabilityMonitor.instance) {
      ScalabilityMonitor.instance = new ScalabilityMonitor();
    }
    return ScalabilityMonitor.instance;
  }

  constructor() {
    this.alertConfig = {
      memoryThreshold: 80,
      renderTimeThreshold: 16,
      errorRateThreshold: 10,
      bundleSizeThreshold: 500,
    };
    
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): ScalabilityMetrics {
    return {
      memory: {
        used: 0,
        limit: SCALABILITY_LIMITS.MAX_MEMORY_USAGE_MB,
        percentage: 0,
      },
      performance: {
        renderTime: 0,
        bundleSize: 0,
        loadTime: 0,
      },
      api: {
        requestCount: 0,
        errorRate: 0,
        averageResponseTime: 0,
      },
      cache: {
        hitRate: 0,
        size: 0,
        maxSize: SCALABILITY_LIMITS.MAX_CACHED_RESULTS,
      },
      state: {
        totalSlices: 0,
        totalItems: 0,
        largestSlice: 0,
      },
    };
  }

  /**
   * Start monitoring
   */
  startMonitoring(intervalMs: number = 10000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkAlerts();
    }, intervalMs);
    
    logDebug('Scalability monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    logDebug('Scalability monitoring stopped');
  }

  /**
   * Collect current metrics
   */
  private collectMetrics(): void {
    this.collectMemoryMetrics();
    this.collectPerformanceMetrics();
    this.collectAPIMetrics();
    this.collectCacheMetrics();
    this.collectStateMetrics();
  }

  /**
   * Collect memory metrics
   */
  private collectMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024; // MB
      const limit = SCALABILITY_LIMITS.MAX_MEMORY_USAGE_MB;
      
      this.metrics.memory = {
        used,
        limit,
        percentage: (used / limit) * 100,
      };
    }
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): void {
    // Measure render time
    const startTime = performance.now();
    requestAnimationFrame(() => {
      const endTime = performance.now();
      this.metrics.performance.renderTime = endTime - startTime;
    });
    
    // Estimate bundle size
    this.metrics.performance.bundleSize = this.estimateBundleSize();
    
    // Measure load time
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.performance.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      }
    }
  }

  /**
   * Collect API metrics
   */
  private collectAPIMetrics(): void {
    // This would be implemented with actual API tracking
    // For now, we'll use placeholder values
    this.metrics.api = {
      requestCount: 0,
      errorRate: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * Collect cache metrics
   */
  private collectCacheMetrics(): void {
    // This would be implemented with actual cache tracking
    // For now, we'll use placeholder values
    this.metrics.cache = {
      hitRate: 0,
      size: 0,
      maxSize: SCALABILITY_LIMITS.MAX_CACHED_RESULTS,
    };
  }

  /**
   * Collect state metrics
   */
  private collectStateMetrics(): void {
    // This would be implemented with actual state tracking
    // For now, we'll use placeholder values
    this.metrics.state = {
      totalSlices: 0,
      totalItems: 0,
      largestSlice: 0,
    };
  }

  /**
   * Estimate bundle size
   */
  private estimateBundleSize(): number {
    if (typeof window === 'undefined') return 0;
    
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('_next/static')) {
        totalSize += 50; // Rough estimate
      }
    });
    
    return totalSize;
  }

  /**
   * Check for alerts
   */
  private checkAlerts(): void {
    this.checkMemoryAlerts();
    this.checkPerformanceAlerts();
    this.checkAPIAlerts();
    this.checkCacheAlerts();
    this.checkStateAlerts();
  }

  /**
   * Check memory alerts
   */
  private checkMemoryAlerts(): void {
    const { percentage } = this.metrics.memory;
    
    if (percentage > this.alertConfig.memoryThreshold) {
      this.createAlert('memory', this.getMemorySeverity(percentage), {
        message: `High memory usage: ${percentage.toFixed(1)}%`,
        metrics: { memory: this.metrics.memory },
        recommendations: [
          'Clear unused caches',
          'Reduce data retention',
          'Implement data pagination',
        ],
      });
    }
  }

  /**
   * Check performance alerts
   */
  private checkPerformanceAlerts(): void {
    const { renderTime, bundleSize } = this.metrics.performance;
    
    if (renderTime > this.alertConfig.renderTimeThreshold) {
      this.createAlert('performance', 'high', {
        message: `Slow render time: ${renderTime.toFixed(2)}ms`,
        metrics: { performance: this.metrics.performance },
        recommendations: [
          'Optimize component rendering',
          'Implement virtual scrolling',
          'Reduce DOM complexity',
        ],
      });
    }
    
    if (bundleSize > this.alertConfig.bundleSizeThreshold) {
      this.createAlert('performance', 'medium', {
        message: `Large bundle size: ${bundleSize}kb`,
        metrics: { performance: this.metrics.performance },
        recommendations: [
          'Implement code splitting',
          'Remove unused dependencies',
          'Optimize imports',
        ],
      });
    }
  }

  /**
   * Check API alerts
   */
  private checkAPIAlerts(): void {
    const { errorRate } = this.metrics.api;
    
    if (errorRate > this.alertConfig.errorRateThreshold) {
      this.createAlert('api', 'high', {
        message: `High API error rate: ${errorRate.toFixed(1)}%`,
        metrics: { api: this.metrics.api },
        recommendations: [
          'Implement retry logic',
          'Add fallback mechanisms',
          'Monitor API health',
        ],
      });
    }
  }

  /**
   * Check cache alerts
   */
  private checkCacheAlerts(): void {
    const { hitRate, size, maxSize } = this.metrics.cache;
    
    if (hitRate < 50) {
      this.createAlert('cache', 'medium', {
        message: `Low cache hit rate: ${hitRate.toFixed(1)}%`,
        metrics: { cache: this.metrics.cache },
        recommendations: [
          'Optimize cache keys',
          'Increase cache TTL',
          'Review cache strategy',
        ],
      });
    }
    
    if (size > maxSize * 0.9) {
      this.createAlert('cache', 'low', {
        message: `Cache near capacity: ${size}/${maxSize}`,
        metrics: { cache: this.metrics.cache },
        recommendations: [
          'Implement cache eviction',
          'Increase cache size',
          'Optimize cache usage',
        ],
      });
    }
  }

  /**
   * Check state alerts
   */
  private checkStateAlerts(): void {
    const { totalItems, largestSlice } = this.metrics.state;
    
    if (totalItems > SCALABILITY_LIMITS.MAX_QUOTES_IN_MEMORY) {
      this.createAlert('state', 'high', {
        message: `Too many state items: ${totalItems}`,
        metrics: { state: this.metrics.state },
        recommendations: [
          'Implement data pagination',
          'Use virtual scrolling',
          'Clear old data',
        ],
      });
    }
    
    if (largestSlice > SCALABILITY_LIMITS.MAX_QUOTES_IN_MEMORY * 0.5) {
      this.createAlert('state', 'medium', {
        message: `Large state slice: ${largestSlice} items`,
        metrics: { state: this.metrics.state },
        recommendations: [
          'Split large state slices',
          'Implement lazy loading',
          'Optimize state structure',
        ],
      });
    }
  }

  /**
   * Get memory severity
   */
  private getMemorySeverity(percentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (percentage > 95) return 'critical';
    if (percentage > 90) return 'high';
    if (percentage > 80) return 'medium';
    return 'low';
  }

  /**
   * Create alert
   */
  private createAlert(
    type: AlertType,
    severity: Alert['severity'],
    data: {
      message: string;
      metrics: Partial<ScalabilityMetrics>;
      recommendations: string[];
    }
  ): void {
    const alert: Alert = {
      type,
      severity,
      message: data.message,
      timestamp: Date.now(),
      metrics: data.metrics,
      recommendations: data.recommendations,
    };
    
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    // Notify callbacks
    this.alertCallbacks.forEach(callback => callback(alert));
    
    // Log alert
    const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'info';
    (logLevel === 'error' ? logError : logLevel === 'warning' ? logWarning : logDebug)(
      `Scalability alert: ${data.message}`,
      { alert, metrics: data.metrics }
    );
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Remove alert callback
   */
  offAlert(callback: (alert: Alert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): ScalabilityMetrics {
    return { ...this.metrics };
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit: number = 10): Alert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: AlertType): Alert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: Alert['severity']): Alert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    logDebug('Alerts cleared');
  }

  /**
   * Update alert configuration
   */
  updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
    logDebug('Alert configuration updated', { config: this.alertConfig });
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check memory
    if (this.metrics.memory.percentage > 90) {
      issues.push('Critical memory usage');
      recommendations.push('Clear caches and reduce data retention');
    } else if (this.metrics.memory.percentage > 80) {
      issues.push('High memory usage');
      recommendations.push('Monitor memory usage and consider optimization');
    }
    
    // Check performance
    if (this.metrics.performance.renderTime > 32) {
      issues.push('Slow rendering');
      recommendations.push('Optimize component rendering and reduce DOM complexity');
    }
    
    // Check API
    if (this.metrics.api.errorRate > 20) {
      issues.push('High API error rate');
      recommendations.push('Implement retry logic and fallback mechanisms');
    }
    
    const status = issues.length === 0 ? 'healthy' : 
                  issues.some(issue => issue.includes('Critical')) ? 'critical' : 'warning';
    
    return { status, issues, recommendations };
  }
}
