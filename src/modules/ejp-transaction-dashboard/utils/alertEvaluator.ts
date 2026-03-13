type Severity = "high" | "medium" | "low";
type MetricKey = "activationRate" | "timeToActivation" | "dropOffRate";

export interface MetricContext {
  current: number;
  previous: number;
  target?: number;
  history?: number[];  // last N periods
}

export interface AlertRule {
  check: (ctx: MetricContext) => boolean;
  severity: Severity;
  title: (ctx: MetricContext) => string;
  subtitle?: (ctx: MetricContext) => string;
}

export type MetricRules = Record<MetricKey, AlertRule[]>;

export interface EvaluatedAlert {
  severity: Severity;
  title: string;
  subtitle?: string;
}

const rules: MetricRules = {
  activationRate: [
    // HIGH – big drop or below target
    {
      severity: "high",
      check: ({ current, previous, target }) =>
        (target !== undefined && current < target - 2) ||
        (previous > 0 && current <= previous - 3),
      title: ({ current, previous }) =>
        `Activation Rate dropped – ${Math.abs(previous - current)} pts`,
      subtitle: ({ current, previous }) =>
        `Down from ${previous}% to ${current}%`
    },
    // MEDIUM – small negative movement
    {
      severity: "medium",
      check: ({ current, previous }) =>
        previous > 0 && current < previous && previous - current < 3,
      title: ({ current, previous }) =>
        `Activation Rate slightly down`,
      subtitle: ({ current, previous }) =>
        `From ${previous}% to ${current}%`
    },
    // LOW – stable / good
    {
      severity: "low",
      check: ({ current, previous, target }) =>
        Math.abs(current - previous) < 1 &&
        (!target || current >= target),
      title: () => "Activation Rate stable",
      subtitle: ({ current }) => `Current: ${current}%`
    }
  ],

  timeToActivation: [
    // HIGH – spiked badly
    {
      severity: "high",
      check: ({ current, previous, history }) => {
        if (previous === 0) return false;
        const maxHist = history && history.length > 0 ? Math.max(...history) : previous;
        return current > maxHist && current > previous * 1.3;
      },
      title: ({ current }) =>
        `Avg. Time to Activation spiked to ${current.toFixed(1)} days`,
      subtitle: ({ current, previous }) =>
        previous > 0 ? `Highest in recent period (was ${previous.toFixed(1)} days)` : undefined
    },
    // MEDIUM – moderate increase
    {
      severity: "medium",
      check: ({ current, previous }) =>
        previous > 0 && current > previous * 1.1 && current <= previous * 1.3,
      title: ({ current }) =>
        `Avg. Time to Activation increased`,
      subtitle: ({ current, previous }) =>
        `From ${previous.toFixed(1)} → ${current.toFixed(1)} days`
    },
    // LOW – stable or improved
    {
      severity: "low",
      check: ({ current, previous }) =>
        previous === 0 || current <= previous * 1.1,
      title: ({ current }) =>
        `Activation speed stable`,
      subtitle: ({ current }) =>
        `Current average: ${current.toFixed(1)} days`
    }
  ],

  dropOffRate: [
    // HIGH – drop-off too high
    {
      severity: "high",
      check: ({ current, target }) =>
        target !== undefined ? current > target + 5 : current > 20,
      title: ({ current }) =>
        `Drop-off Rate high at ${current.toFixed(1)}%`,
      subtitle: ({ current, target }) =>
        target !== undefined ? `Exceeds target by ${(current - target).toFixed(1)}%` : undefined
    },
    // MEDIUM – slightly above desired
    {
      severity: "medium",
      check: ({ current, target }) =>
        target !== undefined
          ? current > target && current <= target + 5
          : current > 10 && current <= 20,
      title: ({ current }) => `Drop-off Rate above normal`,
      subtitle: ({ current }) => `Current: ${current.toFixed(1)}%`
    },
    // LOW – healthy
    {
      severity: "low",
      check: ({ current, target }) =>
        target !== undefined ? current <= target : current <= 10,
      title: () => `Drop-off Rate under control`,
      subtitle: ({ current }) => `Current: ${current.toFixed(1)}%`
    }
  ]
};

/**
 * Generic function to evaluate any metric
 */
export function evaluateMetric(
  key: MetricKey,
  ctx: MetricContext
): EvaluatedAlert | null {
  const metricRules = rules[key];

  for (const rule of metricRules) {
    if (rule.check(ctx)) {
      return {
        severity: rule.severity,
        title: rule.title(ctx),
        subtitle: rule.subtitle ? rule.subtitle(ctx) : undefined,
      };
    }
  }

  return null; // no alert
}

/**
 * Format date for alert display
 */
function formatAlertDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Evaluate all metrics and return formatted alerts
 */
export interface FormattedAlert {
  title: string;
  date: string;
  context: string;
  severity: 'high' | 'medium' | 'low';
  description?: string;
}

export interface MetricsData {
  activationRate?: {
    current: number;
    previous: number;
    target?: number;
    history?: number[];
  };
  timeToActivation?: {
    current: number;
    previous: number;
    history?: number[];
  };
  dropOffRate?: {
    current: number;
    previous: number;
    target?: number;
  };
}

export function evaluateAllMetrics(metrics: MetricsData): FormattedAlert[] {
  const alerts: FormattedAlert[] = [];
  const now = new Date();

  // Activation Rate
  if (metrics.activationRate) {
    const activationAlert = evaluateMetric("activationRate", {
      current: metrics.activationRate.current,
      previous: metrics.activationRate.previous,
      target: metrics.activationRate.target,
      history: metrics.activationRate.history,
    });

    if (activationAlert) {
      alerts.push({
        title: activationAlert.title,
        date: formatAlertDate(now),
        context: activationAlert.subtitle || '',
        severity: activationAlert.severity,
        description: `The activation rate metric tracks the percentage of enterprises that successfully activate services after requesting them. ${activationAlert.severity === 'high' ? 'Immediate attention required to investigate and address the decline.' : activationAlert.severity === 'medium' ? 'Monitor closely and consider proactive measures.' : 'Performance is within acceptable parameters.'}`
      });
    }
  }

  // Time to Activation
  if (metrics.timeToActivation) {
    const timeAlert = evaluateMetric("timeToActivation", {
      current: metrics.timeToActivation.current,
      previous: metrics.timeToActivation.previous,
      history: metrics.timeToActivation.history,
    });

    if (timeAlert) {
      alerts.push({
        title: timeAlert.title,
        date: formatAlertDate(now),
        context: timeAlert.subtitle || '',
        severity: timeAlert.severity,
        description: `This metric measures the average time from service request to successful activation. ${timeAlert.severity === 'high' ? 'The spike indicates potential bottlenecks in the activation process that need immediate investigation.' : timeAlert.severity === 'medium' ? 'A moderate increase suggests reviewing activation workflows for optimization opportunities.' : 'Activation speed is consistent with historical performance.'}`
      });
    }
  }

  // Drop-off Rate
  if (metrics.dropOffRate) {
    const dropOffAlert = evaluateMetric("dropOffRate", {
      current: metrics.dropOffRate.current,
      previous: metrics.dropOffRate.previous,
      target: metrics.dropOffRate.target,
    });

    if (dropOffAlert) {
      alerts.push({
        title: dropOffAlert.title,
        date: formatAlertDate(now),
        context: dropOffAlert.subtitle || '',
        severity: dropOffAlert.severity,
        description: `Drop-off rate indicates the percentage of enterprises that abandon the service activation process. ${dropOffAlert.severity === 'high' ? 'High drop-off rates require urgent investigation into user experience, technical barriers, or process complexity.' : dropOffAlert.severity === 'medium' ? 'Elevated drop-off suggests reviewing the activation journey for friction points.' : 'Drop-off rate is within healthy operational ranges.'}`
      });
    }
  }

  return alerts;
}
