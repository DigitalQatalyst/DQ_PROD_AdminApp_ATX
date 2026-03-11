import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/ui/AppIcon';
import { fetchServicePerformanceAlerts, ServicePerformanceAlert } from '../../../api/analytics/servicePerformanceAlerts';
import { fetchRiskAlerts, RiskAlert } from '../../../api/analytics/riskAlerts';

interface RealTimeAlertsProps {
  description?: string;
  context?: string;
  startDate?: string;
  endDate?: string;
  serviceCategory?: string;
  useRiskAlerts?: boolean;
}

type UiSeverity = 'critical' | 'warning' | 'info';

interface AlertListItem {
  id: string | number;
  severity: UiSeverity;
  title: string;
  message: string;
  metric?: string;
  timestamp: string;
}

const severityMap: Record<ServicePerformanceAlert['severity'], UiSeverity> = {
  critical: 'critical',
  high: 'critical',
  medium: 'warning',
  low: 'info',
};

const RealTimeAlerts: React.FC<RealTimeAlertsProps> = ({
  description = 'Live monitoring of partner service delivery issues',
  context,
  startDate,
  endDate,
  serviceCategory,
  useRiskAlerts = false,
}) => {
  const [alerts, setAlerts] = useState<ServicePerformanceAlert[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAlerts = async () => {
      try {
        setLoading(true);
        if (useRiskAlerts) {
          const data = await fetchRiskAlerts(serviceCategory);
          if (isMounted) {
            setRiskAlerts(data);
            setError(null);
          }
        } else {
          const data = await fetchServicePerformanceAlerts(false, context, startDate, endDate, serviceCategory);
          if (isMounted) {
            setAlerts(data);
            setError(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load alerts');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAlerts();

    const interval = setInterval(loadAlerts, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [context, startDate, endDate, serviceCategory, useRiskAlerts]);

  const mappedAlerts: AlertListItem[] = useMemo(
    () => {
      if (useRiskAlerts) {
        return riskAlerts.map((alert) => ({
          id: alert.id,
          severity: alert.type,
          title: alert.title,
          message: alert.message,
          metric: alert.action,
          timestamp: alert.timestamp,
        }));
      }
      return alerts.map((alert) => ({
        id: alert.id,
        severity: severityMap[alert.severity] ?? 'info',
        title: alert.title,
        message: alert.message,
        metric: alert.metric,
        timestamp: alert.timestamp,
      }));
    },
    [alerts, riskAlerts, useRiskAlerts]
  );

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return { name: 'AlertTriangle', color: 'text-red-600' };
      case 'warning':
        return { name: 'AlertCircle', color: 'text-amber-600' };
      case 'info':
        return { name: 'Info', color: 'text-blue-600' };
      default:
        return { name: 'Bell', color: 'text-gray-600' };
    }
  };

  const getAlertBorder = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-amber-500';
      case 'info':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const content = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon name="Loader" size={24} className="animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">Fetching latest alerts…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon name="AlertTriangle" size={24} className="text-red-500 mb-2" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchServicePerformanceAlerts()
                .then((data) => setAlerts(data))
                .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load alerts'))
                .finally(() => setLoading(false));
            }}
            className="text-xs text-blue-600 hover:text-blue-700 mt-3"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!mappedAlerts.length) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon name="CheckCircle" size={32} className="text-emerald-500 mb-3" />
          <p className="text-sm font-medium text-card-foreground mb-1">No active alerts</p>
          <p className="text-xs text-muted-foreground">
            All partner services operating within normal parameters
          </p>
        </div>
      );
    }

    return mappedAlerts.map((alert, idx) => {
      const alertIcon = getAlertIcon(alert.severity);
      const isExpanded = expandedIndex === idx;
      return (
        <div key={alert.id}>
          <div
            className={`p-3 rounded-lg border-l-4 bg-background border transition-all duration-200 hover:shadow-sm cursor-pointer ${getAlertBorder(alert.severity)}`}
            onClick={() => setExpandedIndex(isExpanded ? null : idx)}
          >
            <div className="flex items-start gap-3">
              <Icon name={alertIcon.name} size={16} className={`${alertIcon.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-card-foreground">
                    {alert.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {alert.metric && (
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{alert.metric}</p>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {alert.message}
                </p>
              </div>
            </div>
          </div>
          {isExpanded && (
            <div className="mt-2 p-4 bg-white rounded-lg border shadow-sm space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Severity: </span>
                <span className={`text-sm font-medium ${alertIcon.color}`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Timestamp: </span>
                <span className="text-sm">
                  {new Date(alert.timestamp).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              {alert.metric && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Metric: </span>
                  <span className="text-sm">{alert.metric}</span>
                </div>
              )}
              <div className="pt-3 border-t">
                <span className="text-sm font-medium text-gray-500">Full Message: </span>
                <p className="text-sm mt-2 text-gray-700">{alert.message}</p>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-6 bg-card border border-border rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-card-foreground truncate">Real-time Alerts</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">Live</span>
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {content()}
      </div>
    </div>
  );
};

export default RealTimeAlerts;
