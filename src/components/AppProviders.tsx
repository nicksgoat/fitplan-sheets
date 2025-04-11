
import React, { ReactNode } from 'react';
import { LikedProvider } from '@/contexts/LikedContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { LibraryProvider } from '@/contexts/LibraryContext';
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import { AuthProvider } from '@/hooks/useAuth';

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
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
  );
};

export default AppProviders;
