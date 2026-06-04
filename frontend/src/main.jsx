import './polyfill';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { registerSW } from 'virtual:pwa-register'

// Auto-register service worker for true PWA support (Offline map/assets cache & install prompts)
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[PikNGo PWA] New app updates available! Please refresh.');
    },
    onOfflineReady() {
      console.log('[PikNGo PWA] App is completely ready for offline mode!');
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
