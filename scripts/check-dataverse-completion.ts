/**
 * Quick diagnostic script to validate Case → Opportunity → Product joins for provider completion time.
 *
 * Requirements:
 * - DATAVERSE_BASE_URL: e.g. https://<org>.crm.dynamics.com/api/data/v9.2
 * - DATAVERSE_BEARER_TOKEN: valid OAuth token with read access to incidents/opportunities/products
 *
 * Run:
 *   DATAVERSE_BASE_URL=https://... DATAVERSE_BEARER_TOKEN=... npx ts-node scripts/check-dataverse-completion.ts
 */

import axios from 'axios';

const BASE_URL = process.env.DATAVERSE_BASE_URL || '';
const TOKEN = process.env.DATAVERSE_BEARER_TOKEN || '';

if (!BASE_URL || !TOKEN) {
  console.error('❌ DATAVERSE_BASE_URL and DATAVERSE_BEARER_TOKEN are required.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/json',
  Prefer: 'odata.include-annotations="*"',
};

const fetchAll = async (url: string) => {
  const rows: any[] = [];
  let next = url;
  while (next) {
    const resp = await axios.get(next, { headers });
    rows.push(...(resp.data?.value ?? []));
    next = resp.data?.['@odata.nextLink'];
  }
  return rows;
};

const main = async () => {
  const selectIncident = [
    'incidentid',
    'modifiedon',
    'statecode',
    'statuscode',
    '_kf_assignedto_value',
    '_kf_relatedopportunity_value',
    'kf_kf_servicetype',
    '_kf_servicetype_value',
  ].join(',');

  const expandIncident = [
    'kf_AssignedTo($select=accountid,name)',
    'kf_RelatedOpportunity($select=opportunityid,createdon,_kf_productid_value;$expand=kf_Product($select=productid,kf_servicetype))',
  ].join(',');

  const filterIncident = encodeURIComponent(
    [
      `_kf_relatedopportunity_value ne null`,
      `_kf_assignedto_value ne null`,
      `statecode eq 1`, // Resolved
      `casetypecode eq 2`, // Fulfillment case
    ].join(' and ')
  );

  const incidentsUrl = `${BASE_URL}/incidents?$select=${selectIncident}&$expand=${expandIncident}&$filter=${filterIncident}&$top=200`;

  console.log('🔎 Fetching incidents with joins...');
  const incidents = await fetchAll(incidentsUrl);
  console.log(`➡️  Retrieved ${incidents.length} incidents`);

  const rows = incidents
    .map((incident: any) => {
      const opp = incident?.kf_RelatedOpportunity;
      const product = opp?.kf_Product;
      if (!opp?.createdon || !incident?.modifiedon) return null;

      const diffMs = new Date(incident.modifiedon).getTime() - new Date(opp.createdon).getTime();
      if (!Number.isFinite(diffMs) || diffMs < 0) return null;

      return {
        incidentId: incident.incidentid,
        providerId: incident?._kf_assignedto_value,
        providerName: incident?.kf_AssignedTo?.name,
        opportunityId: opp?.opportunityid,
        productId: product?.productid,
        serviceTypeFormatted:
          product?.['kf_servicetype@OData.Community.Display.V1.FormattedValue'] ??
          product?.kf_servicetype,
        completionDays: diffMs / (1000 * 60 * 60 * 24),
      };
    })
    .filter(Boolean) as Array<{
      incidentId: string;
      providerId: string;
      providerName: string;
      opportunityId: string;
      productId: string;
      serviceTypeFormatted: string;
      completionDays: number;
    }>;

  console.log(`✅ Completion rows after filtering: ${rows.length}`);

  const byProvider = new Map<
    string,
    { name: string; count: number; totalDays: number; sample: typeof rows[0][] }
  >();

  rows.forEach((row) => {
    const key = row.providerId || 'unknown';
    if (!byProvider.has(key)) {
      byProvider.set(key, { name: row.providerName || 'Unknown', count: 0, totalDays: 0, sample: [] });
    }
    const agg = byProvider.get(key)!;
    agg.count += 1;
    agg.totalDays += row.completionDays;
    if (agg.sample.length < 3) agg.sample.push(row);
  });

  const summary = Array.from(byProvider.entries())
    .map(([providerId, agg]) => ({
      providerId,
      providerName: agg.name,
      avgCompletionDays: Math.round((agg.totalDays / Math.max(agg.count, 1)) * 10) / 10,
      count: agg.count,
      sample: agg.sample,
    }))
    .sort((a, b) => a.avgCompletionDays - b.avgCompletionDays);

  console.log('📊 Provider completion summary (sorted fastest to slowest):');
  summary.forEach((s) =>
    console.log(
      ` - ${s.providerName} (${s.providerId}): ${s.avgCompletionDays} days over ${s.count} cases`
    )
  );

  if (summary.length) {
    console.log('🔍 Sample rows:', JSON.stringify(summary[0].sample, null, 2));
  }
};

main().catch((err) => {
  console.error('❌ Error running Dataverse completion check:', err?.message || err);
  process.exit(1);
});
