
import React from "react";
import { WorkoutProvider, useWorkout } from "@/contexts/WorkoutContext";
import WorkoutHeader from "@/components/WorkoutHeader";
import WeekTabs from "@/components/WeekTabs";
import SessionTabs from "@/components/SessionTabs";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutMobilePreview from "@/components/WorkoutMobilePreview";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CreateWorkoutSheet from "@/components/CreateWorkoutSheet";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const WorkoutApp: React.FC = () => {
  const { 
    program, 
    activeSessionId,
    activeWeekId,
    addSession
  } = useWorkout();
  
  if (!activeSessionId) return null;
  
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <WeekTabs />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Create Workout</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-xl bg-dark-200 border-dark-300 p-0">
                <CreateWorkoutSheet weekId={activeWeekId} />
              </SheetContent>
            </Sheet>
          </div>

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
      <div className="min-h-screen py-4 px-4 bg-dark-100 text-white">
        <WorkoutHeader />
        <WorkoutApp />
      </div>
    </WorkoutProvider>
  );
};

export default Index;
