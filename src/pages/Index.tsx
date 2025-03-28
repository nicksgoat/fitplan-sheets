import React, { useState, useEffect } from "react";
import { Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { WorkoutProvider, useWorkout } from "@/contexts/WorkoutContext";
import WorkoutHeader from "@/components/WorkoutHeader";
import WeekTabs from "@/components/WeekTabs";
import SessionTabs from "@/components/SessionTabs";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutMobilePreview from "@/components/WorkoutMobilePreview";
import { motion } from "framer-motion";

const WorkoutApp: React.FC = () => {
  const { 
    program, 
    activeWorkoutId
  } = useWorkout();
  
  if (!program || !activeWorkoutId) return null;
  
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WeekTabs />
          <SessionTabs />
          {activeWorkoutId && (
            <motion.div
              key={activeWorkoutId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <WorkoutSession sessionId={activeWorkoutId} />
            </motion.div>
          )}
        </div>
        
        <div className="hidden lg:block">
          <div className="sticky top-24">
            {activeWorkoutId && (
              <WorkoutMobilePreview sessionId={activeWorkoutId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  // State to track if we should show the workout app or redirect
  const [showWorkout, setShowWorkout] = useState(false);
  
  useEffect(() => {
    // Check if the URL has a specific parameter to show workout
    // For example: /?mode=workout
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'workout') {
      setShowWorkout(true);
    }
  }, []);

  // If showing workout app
  if (showWorkout) {
    return (
      <WorkoutProvider>
        <div className="min-h-screen py-4 px-4 bg-dark-100 text-white">
          <WorkoutHeader />
          <WorkoutApp />
        </div>
      </WorkoutProvider>
    );
  }
  
  // Otherwise redirect to sheets page
  return (
    <MainLayout>
      <Navigate to="/sheets" replace />
    </MainLayout>
  );
};

export default Index;
