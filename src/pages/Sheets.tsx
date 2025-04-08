import React, { useEffect, useState, useRef } from "react";
import { WorkoutProvider, useWorkout } from "@/contexts/WorkoutContext";
import WorkoutHeader from "@/components/WorkoutHeader";
import WorkoutSession from "@/components/WorkoutSession";
import WorkoutMobilePreview from "@/components/WorkoutMobilePreview";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Library } from "lucide-react";
import { LibraryProvider } from "@/contexts/LibraryContext";
import WorkoutCalendar from "@/components/workout/WorkoutCalendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WorkoutLibrarySidebar, { WorkoutLibrarySidebarRef } from "@/components/workout/WorkoutLibrarySidebar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const WorkoutApp: React.FC = () => {
  const { 
    program, 
    activeWorkoutId,
    addWeek,
    addWorkout,
    setActiveWeekId,
    setActiveWorkoutId,
    activeWeekId
  } = useWorkout();
  
  const [activeTab, setActiveTab] = useState<string>("workout");
  const [librarySidebarOpen, setLibrarySidebarOpen] = useState(false);
  const librarySidebarRef = useRef<WorkoutLibrarySidebarRef>(null);
  
  useEffect(() => {
    if (program) {
      if (program.weeks.length === 0) {
        const newWeekId = addWeek();
        if (typeof newWeekId === 'string') {
          const newWorkoutId = addWorkout(newWeekId);
          setActiveWeekId(newWeekId);
          if (typeof newWorkoutId === 'string') {
            setActiveWorkoutId(newWorkoutId);
          }
        }
      } else if (program.weeks.length > 0 && !activeWorkoutId) {
        setActiveWeekId(program.weeks[0].id);
        const firstWeekWorkouts = program.weeks[0].workouts;
        if (firstWeekWorkouts.length > 0) {
          setActiveWorkoutId(firstWeekWorkouts[0]);
        } else if (program.workouts.length > 0) {
          setActiveWorkoutId(program.workouts[0].id);
        }
      }
    }
  }, [program, addWeek, addWorkout, setActiveWeekId, setActiveWorkoutId, activeWorkoutId]);
  
  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-dark-200 border border-dark-300 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">Create Your First Workout</h2>
          <p className="text-gray-400 mb-6">
            Start by creating your first workout day to begin building your training program.
          </p>
          <Button 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            onClick={() => {
              const newWeekId = addWeek();
              if (typeof newWeekId === 'string') {
                const newWorkoutId = addWorkout(newWeekId);
                setActiveWeekId(newWeekId);
                if (typeof newWorkoutId === 'string') {
                  setActiveWorkoutId(newWorkoutId);
                }
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Workout
          </Button>
        </div>
      </div>
    );
  }
  
  if (program.weeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-dark-200 border border-dark-300 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">Create Your First Week</h2>
          <p className="text-gray-400 mb-6">
            Start by creating your first week to organize your workouts.
          </p>
          <Button 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            onClick={() => {
              const newWeekId = addWeek();
              if (typeof newWeekId === 'string') {
                const newWorkoutId = addWorkout(newWeekId);
                setActiveWeekId(newWeekId);
                if (typeof newWorkoutId === 'string') {
                  setActiveWorkoutId(newWorkoutId);
                }
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Week
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLibrarySidebarOpen(true)}
          className="flex items-center gap-1"
        >
          <Library className="h-4 w-4" />
          <span>Library</span>
        </Button>
      </div>
      
      <WorkoutLibrarySidebar 
        ref={librarySidebarRef}
        open={librarySidebarOpen}
        onOpenChange={setLibrarySidebarOpen}
      />
      
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6 bg-dark-200">
            <TabsTrigger value="workout" className="data-[state=active]:bg-fitbloom-purple">
              Workout Editor
            </TabsTrigger>
            <TabsTrigger value="program" className="data-[state=active]:bg-fitbloom-purple">
              Program Calendar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workout">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
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
          </TabsContent>
          
          <TabsContent value="program">
            <WorkoutCalendar onSelectWorkout={(workoutId) => {
              setActiveWorkoutId(workoutId);
              setActiveTab("workout");
            }} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Sheets: React.FC = () => {
  return (
    <WorkoutProvider>
      <LibraryProvider>
        <DndProvider backend={HTML5Backend}>
          <div className="min-h-screen py-4 px-4 bg-dark-100 text-white">
            <WorkoutHeader />
            <WorkoutApp />
          </div>
        </DndProvider>
      </LibraryProvider>
    </WorkoutProvider>
  );
};

export default Sheets;
