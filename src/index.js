// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';  // ← Important: import from /client
import './index.css';                     // Keep if you have it, or remove
import App from './App';
// import reportWebVitals from './reportWebVitals';  // optional

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: remove or keep for performance measuring
// reportWebVitals(console.log);