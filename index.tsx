import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { validateConfig } from './services/config';

// Validate configuration at startup to fail fast on misconfiguration
try {
  validateConfig();
} catch (error) {
  console.error('Fatal: Configuration validation failed', error);
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #1e293b; color: #f1f5f9; font-family: system-ui; padding: 20px;">
      <div style="max-width: 600px; text-align: center;">
        <h1 style="color: #ef4444; margin-bottom: 16px;">Configuration Error</h1>
        <p style="margin-bottom: 16px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p style="color: #94a3b8; font-size: 14px;">Check your .env.local file and ensure all required environment variables are set correctly.</p>
      </div>
    </div>
  `;
  throw error;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
