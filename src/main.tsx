import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import './index.css';

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Error al renderizar la aplicación:', error);
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; background: #ffebee; border: 1px solid #f44336; border-radius: 4px; margin: 20px;">
      <h2 style="color: #d32f2f;">Error al cargar la aplicación</h2>
      <p>Error: ${error}</p>
      <p>Por favor, recarga la página o contacta al administrador.</p>
    </div>
  `;
}
