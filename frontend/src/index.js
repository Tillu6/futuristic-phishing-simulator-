// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This will import your Tailwind CSS
import App from './App';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { AuthProvider } from './components/AuthProvider'; // Adjust path if needed

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FirebaseProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </FirebaseProvider>
  </React.StrictMode>
);
