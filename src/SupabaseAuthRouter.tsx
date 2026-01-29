/**
 * Supabase Auth Router
 * 
 * Handles routing with Supabase authentication.
 * Shows login page when not authenticated, otherwise shows the app.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useSupabaseAuth } from './context/SupabaseAuthContext';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

// Import all page components from AppRouter
import HomePage from './pages/index';
import ServiceManagementRoute from './pages/service-management';
// Old content management route - replaced by ContentManagementNewRoute
// import ContentManagementRoute from './pages/content-management';
import BusinessDirectoryRoute from './pages/business-directory';
import ZonesClustersRoute from './pages/zones-clusters';
import GrowthAreasRoute from './pages/growth-areas';
import ServiceFormRoute from './pages/service-form';
import BusinessFormRoute from './pages/business-form';
import GrowthAreaFormRoute from './pages/growth-area-form';
import ZoneFormRoute from './pages/zone-form';
import ContentFormRoute from './pages/content-form';
import TaxonomyManagerRoute from './pages/taxonomy-manager';
import TaxonomyCollectionFormRoute from './pages/taxonomy-collection-form';
import TaxonomyFacetFormRoute from './pages/taxonomy-facet-form';
import TaxonomyTagFormRoute from './pages/taxonomy-tag-form';
import ServiceFormsRoute from './pages/service-forms';
import ServiceFormBuilderRoute from './pages/service-form-builder';
import EnhancedServiceFormRoute from './pages/enhanced-service-form';
import PartnersRoute from './pages/partners';
import ServiceWizardRoute from './pages/service-wizard';
import EventsRoute from './pages/events';
import EventFormRoute from './pages/event-form';
import ContentManagementNewRoute from './pages/content-management-new';
import ContentFormNewRoute from './pages/content-form-new';
import ServiceFormBuilderNewRoute from './pages/service-form-builder-new';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ContentSegmentGate } from './components/ContentSegmentGate';
import { AppLayout } from './components/AppLayout';
import EJPTransactionDashboard from './modules/ejp-transaction-dashboard';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export function SupabaseAuthRouter() {
  const { session, loading: supabaseLoading } = useSupabaseAuth();
  const { isLoading: authLoading } = useAuth();

  // Show loading while checking auth state
  if (supabaseLoading || authLoading) {
    return <LoadingScreen />;
  }

  // If not authenticated, show login
  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated - show app routes
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      
      <Route path="/service-management" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor']}>
          <ServiceManagementRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/content-management" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentManagementNewRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/content-form-new" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentFormNewRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/content-form-new/:contentId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentFormNewRoute />
        </ProtectedRoute>
      } />
      
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
      
      {/* Partners Routes */}
      <Route path="/partners" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <PartnersRoute />
        </ProtectedRoute>
      } />

      {/* Service Wizard Routes */}
      <Route path="/service-wizard" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ServiceWizardRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/service-wizard/:serviceId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ServiceWizardRoute />
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
      
      <Route path="/enhanced-service-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <EnhancedServiceFormRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/enhanced-service-form/:serviceId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <EnhancedServiceFormRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/service-forms" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <ServiceFormsRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/service-form-builder/new" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ServiceFormBuilderNewRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/service-form-builder/:formId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ServiceFormBuilderNewRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/service-form-builder/:formId/edit" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ServiceFormBuilderNewRoute />
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
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor']}>
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
      
      <Route path="/content-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentSegmentGate>
            <ContentFormRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />
      
      <Route path="/content-form/:contentId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentSegmentGate>
            <ContentFormRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />

      {/* Events Routes - Admin and Partners can access */}
      <Route path="/events" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <EventsRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/event-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <EventFormRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/event-form/:eventId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <EventFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/ejp-transaction-dashboard" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <AppLayout activeSection="experience-analytics">
            <EJPTransactionDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
