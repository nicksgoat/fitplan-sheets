
import React, { ReactNode } from 'react';
import { LikedProvider } from '@/contexts/LikedContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { LibraryProvider } from '@/contexts/LibraryContext';
import { ScheduleProvider } from '@/contexts/ScheduleContext';

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <LikedProvider>
      <LibraryProvider>
        <WorkoutProvider>
          <ScheduleProvider>
            {children}
          </ScheduleProvider>
        </WorkoutProvider>
      </LibraryProvider>
    </LikedProvider>
  );
};

export default AppProviders;
