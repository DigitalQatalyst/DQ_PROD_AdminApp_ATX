/**
 * Chart Theme - Centralized color logic for all dashboard charts
 * Follows ShadCN UI patterns and consistent design system
 */

export const ChartTheme = {
  // Base Theme - Exact colors from Growth Areas and other pages
  base: {
    primaryBlue: '#2563EB',      // Blue-600 - standard blue for bars
    secondaryTeal: '#16A34A',    // Green-600 - standard green for bars
    accentIndigo: '#4F46E5',     // Indigo-600 - for variety
    neutralGray: '#6B7280',      // Gray-500
    surfaceLight: '#F9FAFB',     // Gray-50
    textAxis: '#374151',         // Gray-700
    targetGray: '#9CA3AF',       // Gray-400
  },

  // Performance Gradient - Exact colors from app badges
  performance: {
    excellent: '#6EE7B7',        // Green-600 - exact match (text-green-600)
    good: '#10B981',             // Green-500 - lighter green
    moderate: '#F59E0B',         // Amber-500 - warning color
    low: '#F97316',              // Orange-500
    critical: '#EF4444',         // Red-500 - error s error badges
  },

  // Alert Colors - Matching app's alert/badge system
  alerts: {
    high: {
      background: '#FEE2E2',     // Red-100
      text: '#DC2626',           // Red-600
      border: '#FCA5A5',         // Red-300
    },
    medium: {
      background: '#FEF3C7',     // Amber-100
      text: '#D97706',           // Amber-600
      border: '#FCD34D',         // Amber-300
    },
    low: {
      background: '#D1FAE5',     // Green-100
      text: '#059669',           // Green-600
      border: '#6EE7B7',         // Green-300
    },
  },

  // Helper functions
  getPerformanceColor: (value: number, thresholds: { low: number; moderate: number; high: number }): string => {
    if (value < thresholds.moderate) return ChartTheme.performance.excellent;
    if (value < thresholds.high) return ChartTheme.performance.moderate;
    return ChartTheme.performance.critical;
  },

  getCompletionColor: (value: number): string => {
    if (value >= 90) return ChartTheme.performance.excellent;
    if (value >= 70) return ChartTheme.performance.moderate;
    return ChartTheme.performance.critical;
  },

  getDropoffColor: (value: number): string => {
    if (value < 10) return ChartTheme.performance.good;
    if (value <= 15) return ChartTheme.performance.moderate;
    return ChartTheme.performance.critical;
  },

  // ECharts configuration helpers
  getEChartsOption: () => ({
    textStyle: {
      color: ChartTheme.base.textAxis,
      fontFamily: 'inherit',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: ChartTheme.base.neutralGray,
      borderWidth: 1,
      textStyle: {
        color: ChartTheme.base.textAxis,
      },
    },
  }),
};

export default ChartTheme;

