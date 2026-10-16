import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'atlas-ui/tokens.css';
import 'atlas-ui/base.css';
import './fonts/fonts.css';
import './styles/site.css';
import './styles/pages.css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
