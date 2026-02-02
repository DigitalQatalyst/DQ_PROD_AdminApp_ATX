import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { LeadManagementPage } from '../components/LeadManagementPage';

export default function LeadManagementRoute() {
  return (
    <AppLayout activeSection="lead-management">
      <LeadManagementPage />
    </AppLayout>
  );
}
