const axios = require('axios');

class AnalyticsService {
  constructor() {
    this.plausibleDomain = process.env.PLAUSIBLE_DOMAIN;
    this.plausibleApiKey = process.env.PLAUSIBLE_API_KEY;
    this.vercelAnalyticsId = process.env.VERCEL_ANALYTICS_ID;
    this.enabled = process.env.ANALYTICS_ENABLED === 'true';
  }

  /**
   * Track a page view
   * @param {string} portfolioId - Portfolio ID
   * @param {string} url - Page URL
   * @param {Object} metadata - Additional metadata
   */
  async trackPageView(portfolioId, url, metadata = {}) {
    if (!this.enabled) return;

    try {
      // Track with Plausible if configured
      if (this.plausibleDomain && this.plausibleApiKey) {
        await axios.post(
          'https://plausible.io/api/event',
          {
            name: 'pageview',
            url: url,
            domain: this.plausibleDomain,
            props: {
              portfolioId,
              ...metadata
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.plausibleApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Store in database for internal analytics
      await this.storeEvent({
        type: 'pageview',
        portfolioId,
        url,
        metadata,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Analytics tracking error:', error.message);
      // Don't throw - analytics should never break the app
    }
  }

  /**
   * Track a CTA click
   * @param {string} portfolioId - Portfolio ID
   * @param {string} ctaName - Name of the CTA
   * @param {Object} metadata - Additional metadata
   */
  async trackCTAClick(portfolioId, ctaName, metadata = {}) {
    if (!this.enabled) return;

    try {
      await this.storeEvent({
        type: 'cta_click',
        portfolioId,
        ctaName,
        metadata,
        timestamp: new Date()
      });

      // Track with Plausible as custom event
      if (this.plausibleDomain && this.plausibleApiKey) {
        await axios.post(
          'https://plausible.io/api/event',
          {
            name: 'CTA Click',
            url: metadata.url || '',
            domain: this.plausibleDomain,
            props: {
              portfolioId,
              ctaName,
              ...metadata
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.plausibleApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

    } catch (error) {
      console.error('Analytics tracking error:', error.message);
    }
  }

  /**
   * Track section scroll depth
   * @param {string} portfolioId - Portfolio ID
   * @param {string} section - Section name
   * @param {number} depth - Scroll depth percentage
   * @param {Object} metadata - Additional metadata
   */
  async trackScrollDepth(portfolioId, section, depth, metadata = {}) {
    if (!this.enabled) return;

    try {
      await this.storeEvent({
        type: 'scroll_depth',
        portfolioId,
        section,
        depth,
        metadata,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Analytics tracking error:', error.message);
    }
  }

  /**
   * Get analytics for a portfolio
   * @param {string} portfolioId - Portfolio ID
   * @param {Object} options - Query options (dateRange, metrics)
   * @returns {Promise<Object>} Analytics data
   */
  async getPortfolioAnalytics(portfolioId, options = {}) {
    try {
      // This would query your database for stored events
      // For now, return mock data structure
      return {
        portfolioId,
        dateRange: options.dateRange || 'last_30_days',
        metrics: {
          totalViews: 0,
          uniqueVisitors: 0,
          ctaClicks: 0,
          averageScrollDepth: 0,
          topSections: [],
          topCTAs: []
        },
        timeline: []
      };

    } catch (error) {
      console.error('Failed to get analytics:', error.message);
      throw error;
    }
  }

  /**
   * Store analytics event (internal storage)
   * @param {Object} event - Event data
   */
  async storeEvent(event) {
    // In a real implementation, this would store to MongoDB or another database
    // For now, just log it
    console.log('📊 Analytics Event:', {
      type: event.type,
      portfolioId: event.portfolioId,
      timestamp: event.timestamp
    });

    // TODO: Implement database storage
    // Example:
    // await AnalyticsEvent.create(event);
  }

  /**
   * Generate analytics tracking script for portfolio
   * @param {string} portfolioId - Portfolio ID
   * @returns {string} JavaScript tracking code
   */
  generateTrackingScript(portfolioId) {
    return `
<!-- Portfolio Analytics -->
<script>
(function() {
  const portfolioId = '${portfolioId}';
  const apiEndpoint = '/api/analytics/track';
  
  // Track page view
  fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'pageview',
      portfolioId: portfolioId,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    })
  }).catch(err => console.error('Analytics error:', err));
  
  // Track CTA clicks
  document.addEventListener('click', function(e) {
    const cta = e.target.closest('a[href], button');
    if (cta) {
      const ctaName = cta.textContent.trim() || cta.getAttribute('aria-label') || 'Unknown CTA';
      fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cta_click',
          portfolioId: portfolioId,
          ctaName: ctaName,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error('Analytics error:', err));
    }
  });
  
  // Track scroll depth
  let maxScroll = 0;
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', function() {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      // Track which section is in view
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'scroll_depth',
              portfolioId: portfolioId,
              section: section.id,
              depth: Math.round(scrollPercent),
              timestamp: new Date().toISOString()
            })
          }).catch(err => console.error('Analytics error:', err));
        }
      });
    }
  });
})();
</script>
`;
  }

  /**
   * Check if analytics is enabled and configured
   * @returns {boolean}
   */
  isConfigured() {
    return this.enabled && (this.plausibleDomain || this.vercelAnalyticsId);
  }
}

module.exports = new AnalyticsService();
