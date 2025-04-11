
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import AppProviders from './components/AppProviders.tsx'

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
