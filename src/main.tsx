import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { EventProvider } from './context/EventContext';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';

// Initialize Deque axe-core runtime accessibility auditing in development
if ((import.meta as unknown as { env: { DEV: boolean } }).env?.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <EventProvider>
        <App />
      </EventProvider>
    </SettingsProvider>
  </React.StrictMode>
);

