import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Parse URL parameters for code sharing
const loadSharedCode = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    
    if (codeParam) {
      const decodedState = JSON.parse(atob(decodeURIComponent(codeParam)));
      return decodedState;
    }
  } catch (error) {
    console.error('Failed to load shared code:', error);
  }
  
  return null;
};

// Initialize the app
const initApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// Start the application
initApp();