
import React from "react";
import { Button } from "./ui/button";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Plus } from "lucide-react";
import UserProfile from "./UserProfile";
import { useAuth } from "@/contexts/AuthContext";

const WorkoutHeader: React.FC = () => {
  const { program } = useWorkout();
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between pb-8">
      <div>
        <h1 className="text-2xl font-bold">{program.name}</h1>
        <p className="text-muted-foreground">Track your workouts and progress</p>
      </div>
      <div className="flex items-center gap-4">
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
        {user && <UserProfile />}
      </div>
    </header>
  );
};

export default WorkoutHeader;
