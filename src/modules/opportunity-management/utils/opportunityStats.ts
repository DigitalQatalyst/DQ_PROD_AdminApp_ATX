import type { Opportunity, OpportunityDashboardStats } from '../types';

const CLOSED_STAGES = new Set(['Closed Won', 'Closed Lost']);

export function computeOpportunityStats(opportunities: Opportunity[]): OpportunityDashboardStats {
  const openOpps = opportunities.filter(o => !CLOSED_STAGES.has(o.stage));
  const closedWonCount = opportunities.filter(o => o.stage === 'Closed Won').length;
  const closedLostCount = opportunities.filter(o => o.stage === 'Closed Lost').length;

  const openCount = openOpps.length;
  const totalPipelineValue = openOpps.reduce((sum, o) => sum + o.dealValue, 0);
  const weightedPipelineValue = openOpps.reduce((sum, o) => sum + (o.dealValue * o.probability) / 100, 0);
  const avgDealSize = openCount === 0 ? 0 : totalPipelineValue / openCount;

  const closedTotal = closedWonCount + closedLostCount;
  const winRate = closedTotal === 0 ? 0 : (closedWonCount / closedTotal) * 100;

  return {
    totalOpportunities: opportunities.length,
    openCount,
    closedWonCount,
    closedLostCount,
    totalPipelineValue,
    weightedPipelineValue,
    avgDealSize,
    winRate,
  };
}

export function computeAvgSalesCycleDays(opportunities: Opportunity[]): number {
  const qualifying = opportunities.filter(
    o => o.createdAt && (o.wonAt || o.lostAt)
  );

  if (qualifying.length === 0) return 0;

  const totalDays = qualifying.reduce((sum, o) => {
    const start = new Date(o.createdAt).getTime();
    const end = new Date((o.wonAt ?? o.lostAt)!).getTime();
    return sum + (end - start) / 86400000;
  }, 0);

  return totalDays / qualifying.length;
}
