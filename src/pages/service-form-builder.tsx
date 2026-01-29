import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { ServiceFormBuilder } from '../components/ServiceFormBuilder';

export default function ServiceFormBuilderRoute() {
  return (
    <AppLayout activeSection="service-forms">
      <ServiceFormBuilder />
    </AppLayout>
  );
}


