import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// DEVELOP-V1: Dashboard removed - only analytics dashboards enabled
// import HomePage from './pages/index';
// DEVELOP-V1: All feature routes disabled - only base + analytics enabled
// import ServiceManagementRoute from './pages/service-management';
import ContentManagementRoute from "./pages/content-management";
// import BusinessDirectoryRoute from './pages/business-directory';
// import ZonesClustersRoute from './pages/zones-clusters';
// import GrowthAreasRoute from './pages/growth-areas';
// import ServiceFormRoute from './pages/service-form';
// import BusinessFormRoute from './pages/business-form';
// import GrowthAreaFormRoute from './pages/growth-area-form';
// import ZoneFormRoute from './pages/zone-form';
import ContentFormRoute from "./pages/content-form";
import LeadManagementModule from "./modules/lead-management";
import LoginPage from "./pages/login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ContentSegmentGate } from "./components/ContentSegmentGate";
import { AppLayout } from "./components/AppLayout";
import EJPTransactionDashboard from "./modules/ejp-transaction-dashboard";
// import TaxonomyManagerRoute from './pages/taxonomy-manager';
// import TaxonomyCollectionFormRoute from './pages/taxonomy-collection-form';
// import TaxonomyFacetFormRoute from './pages/taxonomy-facet-form';
// import TaxonomyTagFormRoute from './pages/taxonomy-tag-form';
import ServiceDeliveryOverview from "./modules/service-delivery-overview";
import { useAuth } from "./context/AuthContext";
import { ChatInterface } from "./modules/chat-support/pages/ChatInterface";

// Component to redirect to appropriate dashboard based on user segment
const DashboardRedirect = () => {
  const { userSegment } = useAuth();

  // Redirect based on user segment
  if (userSegment === "internal") {
    return <Navigate to="/service-delivery-overview" replace />;
  } else if (userSegment === "partner") {
    return <Navigate to="/ejp-transaction-dashboard" replace />;
  }

  // Default fallback (should not happen if user is properly authenticated)
  return <Navigate to="/ejp-transaction-dashboard" replace />;
};

export function AppRouter() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Base Routes - Always Enabled */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/chat-support"
          element={
            <ProtectedRoute requiredRoles={["admin", "approver", "editor", "viewer"]}
            requiredSegments={["partner"]}>
              <AppLayout activeSection="chat-support">
                <ChatInterface />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* DEVELOP-V1: Dashboard removed - redirect to appropriate dashboard based on user segment */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Redirect /dashboard to appropriate dashboard based on user segment */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Analytics Dashboards - Enabled in v1 */}
        {/* Service Delivery Dashboard - Only accessible to Staff (internal segment) */}
        <Route
          path="/service-delivery-overview"
          element={
            <ProtectedRoute
              requiredRoles={["admin", "approver", "editor", "viewer"]}
              requiredSegments={["internal"]}
            >
              <AppLayout activeSection="service-delivery">
                <ServiceDeliveryOverview />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Experience Analytics Dashboard - Only accessible to Partners */}
        <Route
          path="/ejp-transaction-dashboard"
          element={
            <ProtectedRoute
              requiredRoles={["admin", "approver", "editor", "viewer"]}
              requiredSegments={["partner","internal",]}
            >
              <AppLayout activeSection="experience-analytics">
                <EJPTransactionDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect legacy dashboard route to correct dashboard */}
        <Route
          path="/dashboard/experience-analytics"
          element={
            <ProtectedRoute
              requiredRoles={["admin", "approver", "editor", "viewer"]}
              requiredSegments={["partner"]}
            >
              <Navigate to="/ejp-transaction-dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* DEVELOP-V1: All other feature routes disabled */}
        {/* 
      <Route path="/service-management" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor']}>
          <ServiceManagementRoute />
        </ProtectedRoute>
      } />
*/}
        <Route
          path="/content-management"
          element={
            <ProtectedRoute
              requiredRoles={["admin", "approver", "editor", "viewer"]}
            >
              <ContentSegmentGate>
                <ContentManagementRoute />
              </ContentSegmentGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lead-management"
          element={
            <ProtectedRoute
              requiredRoles={["admin", "approver", "editor", "viewer"]}
              requiredSegments={["internal", "partner"]}
            >
              <AppLayout activeSection="lead-management">
                <LeadManagementModule />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        {/*}
      <Route path="/business-directory" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <BusinessDirectoryRoute />
        </ProtectedRoute>
      } />

      <Route path="/zones-clusters" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <ZonesClustersRoute />
        </ProtectedRoute>
      } />

      <Route path="/growth-areas" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <GrowthAreasRoute />
        </ProtectedRoute>
      } />

      <Route path="/service-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ServiceFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/service-form/:id" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ServiceFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/business-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <BusinessFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/business-form/:businessId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <BusinessFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/growth-area-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <GrowthAreaFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <TaxonomyManagerRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/collection/new" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyCollectionFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/collection/:collectionId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyCollectionFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/facet/new" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyFacetFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/facet/:facetId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyFacetFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/tag/new" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyTagFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/tag/:tagId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyTagFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/growth-area-form/:areaId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <GrowthAreaFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/zone-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ZoneFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/zone-form/:zoneId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ZoneFormRoute />
        </ProtectedRoute>
      } />
      */}
        <Route
          path="/content-form"
          element={
            <ProtectedRoute requiredRoles={["admin", "editor"]}>
              <ContentSegmentGate>
                <ContentFormRoute />
              </ContentSegmentGate>
            </ProtectedRoute>
          }
        />

        <Route
          path="/content-form/:contentId"
          element={
            <ProtectedRoute requiredRoles={["admin", "editor"]}>
              <ContentSegmentGate>
                <ContentFormRoute />
              </ContentSegmentGate>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
