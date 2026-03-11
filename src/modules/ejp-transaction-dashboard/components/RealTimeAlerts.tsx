import React, { useState, useEffect } from 'react';
import Icon from '../../../components/ui/AppIcon';
import { fetchPartnerLeadAlerts } from '../../../api/analytics/partnerAnalytics';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'high' | 'medium' | 'low';
  enabled: boolean;
}

interface Alert {
  id: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'monitoring' | 'investigating' | 'resolved';
  ruleId?: string;
  value?: number;
  threshold?: number;
}

const RealTimeAlerts: React.FC = () => {
  // Alert rules configuration
  const alertRules: AlertRule[] = [
    {
      id: 'sla-breach',
      name: 'SLA Breach Detection',
      condition: 'Service Success Rate drops below threshold',
      threshold: 80,
      severity: 'high',
      enabled: true
    },
    {
      id: 'escalation-spike',
      name: 'Escalation Rate Spike',
      condition: 'Escalation Rate exceeds threshold week-over-week',
      threshold: 10,
      severity: 'high',
      enabled: true
    },
    {
      id: 'activation-dip',
      name: 'Activation Rate Decline',
      condition: 'Activation Rate falls by threshold over last month',
      threshold: 5,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'system-uptime',
      name: 'System Uptime Warning',
      condition: 'System uptime drops below threshold',
      threshold: 99,
      severity: 'high',
      enabled: true
    },
    {
      id: 'error-rate',
      name: 'Error Rate Increase',
      condition: 'Error rate exceeds threshold',
      threshold: 2,
      severity: 'medium',
      enabled: true
    }
  ];

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchPartnerLeadAlerts();
        const mappedAlerts = data.map((alert: any, index: number) => ({
          id: index + 1,
          type: alert.severity.toLowerCase(),
          severity: alert.severity.toLowerCase() as 'high' | 'medium' | 'low',
          title: alert.title,
          description: alert.description,
          timestamp: alert.timestamp,
          status: alert.severity === 'High' ? 'active' : alert.severity === 'Medium' ? 'monitoring' : 'resolved' as 'active' | 'monitoring' | 'investigating' | 'resolved'
        }));
        setAlerts(mappedAlerts);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'AlertTriangle';
      case 'medium':
        return 'AlertCircle';
      case 'low':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-500';
      case 'monitoring':
        return 'bg-yellow-500';
      case 'investigating':
        return 'bg-orange-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };



  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-medium text-foreground">Real-Time Alerts & Monitoring</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span>Live Monitoring</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  alert.severity === 'high' ? 'bg-red-100' :
                  alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <Icon 
                    name={getSeverityIcon(alert.severity)} 
                    size={16} 
                    className={
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-sm font-medium text-foreground">{alert.title}</h5>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(alert.status)}`}></div>
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.status === 'active' ? 'bg-red-100 text-red-700' :
                    alert.status === 'monitoring' ? 'bg-yellow-100 text-yellow-700' :
                    alert.status === 'investigating' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </span>
                  
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Alert Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.severity === 'high').length}
            </div>
            <div className="text-xs text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {alerts.filter(a => a.severity === 'medium').length}
            </div>
            <div className="text-xs text-gray-600">Medium Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.severity === 'low').length}
            </div>
            <div className="text-xs text-gray-600">Low Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {alerts.filter(a => a.status === 'resolved').length}
            </div>
            <div className="text-xs text-gray-600">Resolved</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAlerts;




