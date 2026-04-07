import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Expose stores for dev playtesting (Playwright access)
if (import.meta.env.DEV) {
  import('./stores/runStore').then(m => (window as any).__runStore = m.useRunStore);
  import('./stores/combatStore').then(m => (window as any).__combatStore = m.useCombatStore);
  import('./stores/metaStore').then(m => (window as any).__metaStore = m.useMetaStore);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
