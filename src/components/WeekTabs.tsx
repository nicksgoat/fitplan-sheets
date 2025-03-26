
import React from "react";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWorkout } from "@/contexts/WorkoutContext";
import EditableTitle from "./EditableTitle";

const WeekTabs: React.FC = () => {
  const {
    program,
    activeWeekId,
    setActiveWeekId,
    addWeek,
    deleteWeek,
    updateWeekName
  } = useWorkout();

  // Handle editing week name
  const handleWeekNameChange = (weekId: string, newName: string) => {
    updateWeekName(weekId, newName);
  };

  if (program.weeks.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-medium">Weeks</h2>
      </div>

      <div className="flex items-center mb-6">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex p-1">
            {program.weeks.map((week) => (
              <Button
                key={week.id}
                variant={week.id === activeWeekId ? "default" : "outline"}
                size="sm"
                className="mr-1 px-3 relative group"
                onClick={() => setActiveWeekId(week.id)}
              >
                <EditableTitle
                  value={week.name}
                  onSave={(newName) => handleWeekNameChange(week.id, newName)}
                  className="max-w-[150px] truncate pr-2"
                />
                
                {program.weeks.length > 1 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash className="h-3 w-3 text-red-500 hover:text-red-700" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Week</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{week.name}"? All workouts in this week will also be deleted.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteWeek(week.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addWeek(program.weeks[program.weeks.length - 1]?.id)}
              className="flex items-center px-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Week
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default WeekTabs;
