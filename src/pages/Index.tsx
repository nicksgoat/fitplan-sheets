
import React, { useEffect } from "react";
import { WorkoutProvider, useWorkout } from "@/contexts/WorkoutContext";
import WorkoutHeader from "@/components/WorkoutHeader";
import SessionTabs from "@/components/SessionTabs";
import WeekTabs from "@/components/WeekTabs";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutMobilePreview from "@/components/WorkoutMobilePreview";
import { motion } from "framer-motion";

const WorkoutApp: React.FC = () => {
  const { 
    program, 
    activeSessionId, 
    activeWeekId,
    setActiveSessionId, 
    setActiveWeekId 
  } = useWorkout();
  
  useEffect(() => {
    // Initialize active week and session if needed
    if (program.weeks && program.weeks.length > 0) {
      // If we have a weeks structure
      if (!activeWeekId) {
        setActiveWeekId(program.weeks[0].id);
      }
      
      // Find the selected week
      const selectedWeek = program.weeks.find(week => week.id === activeWeekId);
      
      // If we have a selected week and no active session, or the active session isn't in the selected week
      if (selectedWeek && selectedWeek.sessions.length > 0 && 
          (!activeSessionId || !selectedWeek.sessions.some(s => s.id === activeSessionId))) {
        setActiveSessionId(selectedWeek.sessions[0].id);
      }
    } else if (!activeSessionId && program.sessions.length > 0) {
      // Fallback to old structure if needed
      setActiveSessionId(program.sessions[0].id);
    }
  }, [
    activeSessionId, 
    activeWeekId, 
    program.sessions, 
    program.weeks, 
    setActiveSessionId, 
    setActiveWeekId
  ]);
  
  if (!activeSessionId) return null;
  
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Show week tabs if we have a weeks structure */}
          {program.weeks && program.weeks.length > 0 && <WeekTabs />}
          <SessionTabs />
          <motion.div
            key={activeSessionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <WorkoutSession sessionId={activeSessionId} />
          </motion.div>
        </div>
        
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <WorkoutMobilePreview sessionId={activeSessionId} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <WorkoutProvider>
      <div className="min-h-screen py-4 px-4">
        <WorkoutHeader />
        <WorkoutApp />
      </div>
    </WorkoutProvider>
  );
};

export default Index;
