import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { ServiceRequestsPage } from '../components/ServiceRequestsPage';

export default function ServiceRequestsRoute() {
    return (
        <AppLayout activeSection="service-requests">
            <ServiceRequestsPage />
        </AppLayout>
    );
}
