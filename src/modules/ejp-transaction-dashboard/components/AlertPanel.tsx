import React from 'react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';
import { cn } from '../../../utils/cn';

export interface Alert {
  title: string;
  date: string;
  context: string;
  severity: 'high' | 'medium' | 'low';
  details?: string;
  description?: string;
}

export interface AlertPanelProps {
  alerts: Alert[];
  title?: string;
  description?: string;
  className?: string;
}

/**
 * AlertPanel - ShadCN UI styled alert panel component
 * Displays alerts with color-coded severity using consistent theme colors
 */
const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  title = 'Alerts',
  description,
  className,
}) => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const getAlertStyles = (severity: Alert['severity']) => {
    const alertTheme = ChartTheme.alerts[severity];
    return {
      background: alertTheme.background,
      text: alertTheme.text,
      border: alertTheme.border,
    };
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟠';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  // Sort alerts by severity: High first, then Medium, then Low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  const sortedAlerts = [...alerts].sort((a, b) => {
    return (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
  });

  return (
    <ChartContainer title={title} description={description} className={className}>
      <div className="max-h-[450px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin' }}>
        {sortedAlerts.map((alert, index) => {
          const styles = getAlertStyles(alert.severity);
          const isExpanded = expandedIndex === index;
          return (
            <div key={index}>
              <div
                className="p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer"
                style={{
                  backgroundColor: styles.background,
                  borderLeftColor: styles.border,
                }}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: styles.text }}>{getSeverityIcon(alert.severity)}</span>
                      <span className="text-sm font-medium" style={{ color: styles.text }}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm mb-1 font-medium" style={{ color: styles.text }}>
                      {alert.title}
                    </div>
                    <div className="text-xs opacity-75" style={{ color: styles.text }}>
                      {alert.date} • {alert.context}
                    </div>
                  </div>
                  <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: styles.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-2 p-4 bg-white rounded-lg border shadow-sm space-y-3">
                  {alert.description && (
                    <div className="pb-3 border-b">
                      <span className="text-sm font-medium text-gray-500">Description: </span>
                      <p className="text-sm mt-1 text-gray-700">{alert.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Severity: </span>
                    <span className="text-sm font-medium" style={{ color: styles.text }}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date: </span>
                    <span className="text-sm">{alert.date}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Context: </span>
                    <span className="text-sm">{alert.context}</span>
                  </div>
                  {alert.details && (
                    <div className="pt-3 border-t">
                      <span className="text-sm font-medium text-gray-500">Details: </span>
                      <p className="text-sm mt-2 text-gray-700">{alert.details}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ChartContainer>
  );
};

export default AlertPanel;

