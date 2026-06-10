import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.jsx';

import { PlayerProvider } from './context/PlayerContext.jsx';
registerSW(
  {
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      console.log('SW registered: ', swUrl);
    },
  }
);

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <PlayerProvider>
      <App></App>
    </PlayerProvider>
  </React.StrictMode>
)
