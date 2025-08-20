import React, { StrictMode } from 'react';

import { Container, createRoot } from 'react-dom/client';

import App from './App';

import './styles/main.scss';

const container: Container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
