import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { ServiceFormsManagementPage } from '../components/ServiceFormsManagementPage';

export default function ServiceFormsRoute() {
  return (
    <AppLayout activeSection="service-forms">
      <ServiceFormsManagementPage />
    </AppLayout>
  );
}


