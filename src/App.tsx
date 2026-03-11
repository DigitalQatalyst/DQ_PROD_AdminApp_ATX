import { AuthProvider } from './context/AuthContext';
import { AzureAuthProvider } from './components/AzureAuthProvider';
import { AzureAuthWrapper } from './components/AzureAuthWrapper';
import { AppRouter } from './AppRouter.tsx';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';

export function App() {
  return (
    <AzureAuthProvider>
      <AuthProvider>
        <AzureAuthWrapper>
          <AppProvider>
            <ToastProvider>
              <AppRouter />
            </ToastProvider>
          </AppProvider>
        </AzureAuthWrapper>
      </AuthProvider>
    </AzureAuthProvider>
  );
}