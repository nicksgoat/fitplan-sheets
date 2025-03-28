
import React from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import CreateWorkoutSheet from "./CreateWorkoutSheet";
import UserProfile from "./UserProfile";

const WorkoutHeader = () => {
  const { program } = useWorkout();

  return (
    <header className="py-4 sticky top-0 z-10 backdrop-blur-lg bg-dark-100/80 border-b border-dark-300">
      <div className="w-full max-w-screen-2xl mx-auto flex justify-between items-center px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">
            {program?.name || "Workout Program"}
          </h1>
          <CreateWorkoutSheet />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <PlusIcon className="h-4 w-4" />
          </Button>
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default WorkoutHeader;
