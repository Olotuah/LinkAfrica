// src/utils/analytics.js - HYBRID VERSION (API + LocalStorage)

import { analyticsAPI, publicAPI } from './api';

class AnalyticsTracker {
  static async trackEvent(eventType, data = {}) {
    const event = {
      id: Date.now(),
      event: eventType,
      data: data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: "::1",
    };

    try {
      // TRY API FIRST
      console.log('📊 Attempting to track via API...');
      await analyticsAPI.trackEvent({
        eventType,
        data,
        timestamp: event.timestamp,
        userAgent: event.userAgent
      });
      console.log('✅ Event tracked via API:', eventType);
      
      // Also store locally as backup
      this.storeEventLocally(event);
      return event;
      
    } catch (apiError) {
      console.log('⚠️ API unavailable, storing locally:', apiError.message);
      
      // FALLBACK TO LOCALSTORAGE
      this.storeEventLocally(event);
      return event;
    }
  }

  static storeEventLocally(event) {
    try {
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const updatedEvents = [event, ...existingEvents];
      
      // Keep only last 1000 events
      if (updatedEvents.length > 1000) {
        updatedEvents.splice(1000);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(updatedEvents));
      console.log('💾 Event stored locally:', event.event);
    } catch (error) {
      console.error('❌ Failed to store event locally:', error);
    }
  }

  static async trackLinkClick(linkId, linkTitle, linkUrl, userId) {
    try {
      // Try the dedicated click tracking API first
      await publicAPI.trackClick(linkId);
      console.log('✅ Click tracked via API');
    } catch (apiError) {
      console.log('⚠️ Click API unavailable, using fallback');
    }

    // Always track locally as well for analytics dashboard
    return this.trackEvent('link_click', {
      linkId,
      linkTitle,
      linkUrl,
      userId: userId || 'anonymous'
    });
  }

  static async trackProfileView(userId, source = 'direct') {
    return this.trackEvent('profile_view', {
      userId: userId || 'anonymous',
      source
    });
  }

  static async getAnalyticsData(userId, days = 30) {
    try {
      // TRY API FIRST
      console.log('📊 Attempting to get analytics via API...');
      const response = await analyticsAPI.getStats(days);
      console.log('✅ Analytics loaded from API:', response.data);
      
      // Add missing fields that our dashboard expects
      const apiStats = {
        totalClicks: response.data.totalClicks || 0,
        profileViews: response.data.profileViews || 0,
        conversionRate: response.data.conversionRate || 0,
        monthlyGrowth: response.data.monthlyGrowth || 0,
        dailyStats: response.data.dailyStats || [],
        topLinks: response.data.topLinks || [],
        activeLinks: response.data.activeLinks || 0,
        totalLinks: response.data.totalLinks || 0,
        earnings: response.data.earnings || 0
      };
      
      return apiStats;
      
    } catch (apiError) {
      console.log('⚠️ API unavailable, loading from localStorage...', apiError.message);
      
      // FALLBACK TO LOCALSTORAGE
      return this.getLocalAnalyticsData(userId, days);
    }
  }

  static getLocalAnalyticsData(userId, days = 30) {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const userEvents = events.filter(event => 
        event.data.userId == userId || event.data.userId == userId?.toString()
      );

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentEvents = userEvents.filter(event => 
        new Date(event.timestamp) >= cutoffDate
      );

      return this.processAnalyticsData(recentEvents, days);
    } catch (error) {
      console.error('❌ Error getting local analytics data:', error);
      return this.getEmptyAnalytics();
    }
  }

  static processAnalyticsData(events, days) {
    const linkClicks = events.filter(e => e.event === 'link_click');
    const profileViews = events.filter(e => e.event === 'profile_view');

    const dailyStats = this.generateDailyStats(events, days);
    const topLinks = this.calculateTopLinks(linkClicks);

    const conversionRate = profileViews.length > 0 
      ? ((linkClicks.length / profileViews.length) * 100).toFixed(1)
      : 0;

    const previousPeriodEvents = this.getPreviousPeriodEvents(events, days);
    const growthRate = this.calculateGrowthRate(
      profileViews.length, 
      previousPeriodEvents.profileViews
    );

    return {
      totalClicks: linkClicks.length,
      profileViews: profileViews.length,
      conversionRate: parseFloat(conversionRate),
      monthlyGrowth: growthRate,
      dailyStats,
      topLinks,
      activeLinks: 0,
      totalLinks: 0,
      earnings: 0
    };
  }

  static generateDailyStats(events, days) {
    const dailyStats = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp).toISOString().split('T')[0];
        return eventDate === dateString;
      });

      const clicks = dayEvents.filter(e => e.event === 'link_click').length;
      const views = dayEvents.filter(e => e.event === 'profile_view').length;
      
      dailyStats.push({
        date: dateString,
        clicks,
        views
      });
    }
    
    return dailyStats;
  }

  static calculateTopLinks(linkClickEvents) {
    const linkStats = {};
    
    linkClickEvents.forEach(event => {
      const linkId = event.data.linkId;
      const linkTitle = event.data.linkTitle;
      const linkUrl = event.data.linkUrl;
      
      if (!linkStats[linkId]) {
        linkStats[linkId] = {
          id: linkId,
          title: linkTitle,
          url: linkUrl,
          clicks: 0
        };
      }
      
      linkStats[linkId].clicks++;
    });

    return Object.values(linkStats)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }

  static getPreviousPeriodEvents(events, days) {
    const previousCutoff = new Date();
    previousCutoff.setDate(previousCutoff.getDate() - (days * 2));
    
    const currentCutoff = new Date();
    currentCutoff.setDate(currentCutoff.getDate() - days);

    const previousEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= previousCutoff && eventDate < currentCutoff;
    });

    return {
      profileViews: previousEvents.filter(e => e.event === 'profile_view').length
    };
  }

  static calculateGrowthRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  static getEmptyAnalytics() {
    return {
      totalClicks: 0,
      profileViews: 0,
      conversionRate: 0,
      monthlyGrowth: 0,
      dailyStats: [],
      topLinks: [],
      activeLinks: 0,
      totalLinks: 0,
      earnings: 0
    };
  }

  // Debug method to check both API and localStorage
  static async debugAnalytics(userId) {
    console.log('🐛 === ANALYTICS DEBUG ===');
    console.log('User ID:', userId);
    
    // Check API
    try {
      const apiData = await analyticsAPI.getStats(30);
      console.log('📡 API Data:', apiData.data);
    } catch (error) {
      console.log('📡 API Error:', error.message);
    }
    
    // Check localStorage
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const userEvents = events.filter(e => e.data.userId == userId);
    console.log('💾 localStorage Events:', userEvents.length);
    console.log('💾 Recent Events:', userEvents.slice(0, 5));
    
    console.log('🐛 === END DEBUG ===');
  }

  // Generate sample data (for testing when no real data exists)
  static generateSampleData(userId, days = 30) {
    console.log('🎭 Generating sample data for user:', userId);
    
    const sampleEvents = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Profile views (1-3 per day)
      const dailyViews = Math.floor(Math.random() * 3) + 1;
      for (let v = 0; v < dailyViews; v++) {
        sampleEvents.push({
          id: Date.now() + Math.random(),
          event: 'profile_view',
          data: { userId: userId },
          timestamp: new Date(date.getTime() + (v * 1000 * 60 * 60)).toISOString(),
          userAgent: navigator.userAgent,
          ip: "::1"
        });
      }

      // Link clicks (0-5 per day)
      const dailyClicks = Math.floor(Math.random() * 6);
      for (let c = 0; c < dailyClicks; c++) {
        const linkTitles = ['Instagram', 'YouTube', 'WhatsApp', 'Course', 'Contact'];
        const randomTitle = linkTitles[Math.floor(Math.random() * linkTitles.length)];
        
        sampleEvents.push({
          id: Date.now() + Math.random(),
          event: 'link_click',
          data: {
            linkId: Math.floor(Math.random() * 5) + 1,
            linkTitle: randomTitle,
            linkUrl: `https://example.com/${randomTitle.toLowerCase()}`,
            userId: userId
          },
          timestamp: new Date(date.getTime() + (c * 1000 * 60 * 30)).toISOString(),
          userAgent: navigator.userAgent,
          ip: "::1"
        });
      }
    }

    // Add to existing events instead of replacing
    const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const combinedEvents = [...sampleEvents, ...existingEvents];
    localStorage.setItem('analytics_events', JSON.stringify(combinedEvents));
    
    console.log('✅ Generated', sampleEvents.length, 'sample events');
  }
}

export default AnalyticsTracker;