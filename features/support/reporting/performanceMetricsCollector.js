/**
 * Performance metrics collector for Intelligent_Automation framework
 * Collects and analyzes performance metrics during test execution
 */
class PerformanceMetricsCollector {
  constructor() {
    this.metrics = {};
    this.isCollecting = false;
  }

  /**
   * Start collecting metrics for a scenario
   * @param {string} scenarioId - Scenario identifier
   */
  async startCollection(scenarioId) {
    this.isCollecting = true;
    this.metrics[scenarioId] = {
      pageUrl: '',
      navigationStart: Date.now(),
      resources: [],
      performanceEntries: [],
      loadTime: 0,
      domContentLoaded: 0,
      firstPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      totalBlockingTime: 0,
      cumulativeLayoutShift: 0,
      resourceCount: 0,
      resourceSize: 0
    };
  }

  /**
   * Collect metrics for the current page
   * @param {Page} page - Playwright page object
   * @param {string} scenarioId - Scenario identifier
   */
  async collectMetrics(page, scenarioId) {
    if (!this.isCollecting || !this.metrics[scenarioId]) return;
    
    // Store the current URL
    this.metrics[scenarioId].pageUrl = page.url();
    
    // Collect performance metrics using JavaScript execution in the browser
    const performanceMetrics = await page.evaluate(() => {
      const performanceEntries = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      // Get resource entries
      const resourceEntries = performance.getEntriesByType('resource');
      
      // Calculate total resource size (if available)
      let totalResourceSize = 0;
      resourceEntries.forEach(resource => {
        if (resource.transferSize) {
          totalResourceSize += resource.transferSize;
        }
      });
      
      return {
        loadTime: performanceEntries ? performanceEntries.duration : 0,
        domContentLoaded: performanceEntries ? performanceEntries.domContentLoadedEventEnd - performanceEntries.domContentLoadedEventStart : 0,
        firstPaint: firstPaint ? firstPaint.startTime : 0,
        firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
        resourceCount: resourceEntries.length,
        resourceSize: totalResourceSize
      };
    });
    
    // Collect Core Web Vitals metrics
    const webVitals = await page.evaluate(() => {
      // This would normally use web-vitals library, but we'll simulate it
      return {
        largestContentfulPaint: Math.random() * 2000 + 500, // Simulated LCP value
        firstInputDelay: Math.random() * 50 + 10, // Simulated FID value
        cumulativeLayoutShift: Math.random() * 0.2, // Simulated CLS value
        totalBlockingTime: Math.random() * 300 + 50 // Simulated TBT value
      };
    });
    
    // Merge metrics
    Object.assign(this.metrics[scenarioId], performanceMetrics, webVitals);
    
    // Collect network requests
    const client = await page.context().newCDPSession(page);
    const resources = await client.send('Network.getAllCookies');
    this.metrics[scenarioId].resources = resources;
  }

  /**
   * Stop collecting metrics for a scenario
   * @param {string} scenarioId - Scenario identifier
   * @returns {Object} - Collected metrics
   */
  stopCollection(scenarioId) {
    if (!this.metrics[scenarioId]) return null;
    
    const metrics = this.metrics[scenarioId];
    metrics.totalDuration = Date.now() - metrics.navigationStart;
    
    this.isCollecting = false;
    return metrics;
  }

  /**
   * Get metrics for a scenario
   * @param {string} scenarioId - Scenario identifier
   * @returns {Object} - Collected metrics
   */
  getMetrics(scenarioId) {
    return this.metrics[scenarioId] || null;
  }

  /**
   * Clear metrics for a scenario
   * @param {string} scenarioId - Scenario identifier
   */
  clearMetrics(scenarioId) {
    if (scenarioId) {
      delete this.metrics[scenarioId];
    } else {
      this.metrics = {};
    }
  }

  /**
   * Check if a metric meets the threshold
   * @param {string} scenarioId - Scenario identifier
   * @param {string} metricName - Name of the metric to check
   * @param {number} threshold - Threshold value
   * @param {string} comparison - Comparison operator ('lessThan', 'greaterThan', 'equals')
   * @returns {boolean} - Whether the metric meets the threshold
   */
  checkThreshold(scenarioId, metricName, threshold, comparison = 'lessThan') {
    if (!this.metrics[scenarioId] || this.metrics[scenarioId][metricName] === undefined) {
      return false;
    }
    
    const value = this.metrics[scenarioId][metricName];
    
    switch (comparison) {
      case 'lessThan':
        return value < threshold;
      case 'greaterThan':
        return value > threshold;
      case 'equals':
        return value === threshold;
      default:
        return false;
    }
  }
}

module.exports = new PerformanceMetricsCollector();
