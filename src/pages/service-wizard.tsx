import React from 'react';
import { useParams } from 'react-router-dom';
import ServiceFormWizard from '../components/ServiceFormWizard';

export default function ServiceWizard() {
  const { serviceId } = useParams();
  return <ServiceFormWizard serviceId={serviceId} />;
}
