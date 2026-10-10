import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import App from './App';

import type { Container } from 'react-dom/client';

import './styles/main.scss';

const container: Container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
