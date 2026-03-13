import { AuthProvider } from "./context/AuthContext";
import { AzureAuthProvider } from "./components/AzureAuthProvider";
import { AzureAuthWrapper } from "./components/AzureAuthWrapper";
import { AppRouter } from "./AppRouter.tsx";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./components/ui/Toast";
import { ThemeProvider } from "./components/theme-provider";

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="atx-ui-theme">
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
    </ThemeProvider>
  );
}
