import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { purgeDummyDataIfPresent } from './lib/storageCleanup';

// Ensure all legacy dummy data is wiped
purgeDummyDataIfPresent();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
