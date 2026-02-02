import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { CRMServiceRequestsPage } from '../components/CRMServiceRequestsPage';

export default function CRMServiceRequestsRoute() {
  return (
    <AppLayout activeSection="crm-service-requests">
      <CRMServiceRequestsPage />
    </AppLayout>
  );
}
