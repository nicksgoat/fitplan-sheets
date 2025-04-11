
import React, { ReactNode } from 'react';
import { LikedProvider } from '@/contexts/LikedContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { LibraryProvider } from '@/contexts/LibraryContext';
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface AppProvidersProps {
  children: ReactNode;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LikedProvider>
          <LibraryProvider>
            <WorkoutProvider>
              <ScheduleProvider>
                {children}
              </ScheduleProvider>
            </WorkoutProvider>
          </LibraryProvider>
        </LikedProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
