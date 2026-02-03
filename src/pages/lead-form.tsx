import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { LeadForm } from '../components/LeadForm';

export default function LeadFormRoute() {
  const { leadId } = useParams<{ leadId?: string }>();
  return (
    <AppLayout activeSection="lead-management">
      <LeadForm leadId={leadId} />
    </AppLayout>
  );
}
