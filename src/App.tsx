import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { AppRoutes } from '@/routes/AppRoutes';
import { useFirebaseAuth } from '@/features/auth/useFirebaseAuth';
import { Toaster } from 'sonner';

function FirebaseProviderWrapper({ children }: { children: React.ReactNode }) {
  useFirebaseAuth();
  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <FirebaseProviderWrapper>
          <AppRoutes />
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: {
                borderRadius: '1rem',
                fontSize: '0.85rem'
              }
            }}
          />
        </FirebaseProviderWrapper>
      </BrowserRouter>
    </Provider>
  );
}
