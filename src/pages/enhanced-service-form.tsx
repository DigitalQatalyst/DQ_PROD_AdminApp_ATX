import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { EnhancedServiceForm } from '../components/EnhancedServiceForm';

export default function EnhancedServiceFormRoute() {
  return (
    <AppLayout activeSection="service-management">
      <EnhancedServiceForm />
    </AppLayout>
  );
}


