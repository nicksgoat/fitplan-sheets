
import React, { useEffect } from "react";
import { WorkoutProvider, useWorkout } from "@/contexts/WorkoutContext";
import WorkoutHeader from "@/components/WorkoutHeader";
import SessionTabs from "@/components/SessionTabs";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutMobilePreview from "@/components/WorkoutMobilePreview";
import { motion } from "framer-motion";

// Import required to use framer-motion
<lov-add-dependency>framer-motion@^10.16.4</lov-add-dependency>

const WorkoutApp: React.FC = () => {
  const { program, activeSessionId, setActiveSessionId } = useWorkout();
  
  useEffect(() => {
    // Set the first session as active if none is selected
    if (!activeSessionId && program.sessions.length > 0) {
      setActiveSessionId(program.sessions[0].id);
    }
  }, [activeSessionId, program.sessions, setActiveSessionId]);
  
  if (!activeSessionId) return null;
  
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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
