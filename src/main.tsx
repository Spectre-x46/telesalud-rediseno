import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { RequestProvider } from './state/request';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RequestProvider>
      <App />
    </RequestProvider>
  </StrictMode>,
);
