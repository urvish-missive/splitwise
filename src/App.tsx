import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
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
      </BrowserRouter>
    </Provider>
  );
}
