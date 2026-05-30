import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { PlayerProvider } from './context/PlayerContext.jsx'

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <PlayerProvider>
      <App></App>
    </PlayerProvider>
  </React.StrictMode>
)
