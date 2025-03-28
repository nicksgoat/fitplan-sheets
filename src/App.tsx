
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { MaxWeightProvider } from './contexts/MaxWeightContext';
import Index from './pages/Index';

import './App.css';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <MaxWeightProvider>
            <WorkoutProvider>
              <Index />
              <Toaster position="top-center" />
            </WorkoutProvider>
          </MaxWeightProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
