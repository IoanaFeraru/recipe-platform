import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

// Mock Auth Context Provider
interface MockAuthProviderProps {
  children: ReactNode;
  value?: {
    user: {
      uid: string;
      email: string | null;
      displayName: string | null;
      photoURL?: string | null;
    } | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  };
}

export function MockAuthProvider({ children, value }: MockAuthProviderProps) {
  const defaultValue = {
    user: null,
    loading: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    updateUserProfile: async () => {},
    ...value,
  };

  return <>{children}</>;
}

// All Providers wrapper
interface AllProvidersProps {
  children: ReactNode;
  authValue?: MockAuthProviderProps['value'];
}

function AllProviders({ children, authValue }: AllProvidersProps) {
  return (
    <ThemeProvider>
      <MockAuthProvider value={authValue}>{children}</MockAuthProvider>
    </ThemeProvider>
  );
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: MockAuthProviderProps['value'];
}

export function renderWithProviders(
  ui: ReactElement,
  { authValue, ...renderOptions }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders authValue={authValue}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
