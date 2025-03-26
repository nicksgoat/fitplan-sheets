
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

const SessionTabs: React.FC = () => {
  const {
    program,
    activeSessionId,
    activeWeekId,
    setActiveSessionId,
    addSession,
    deleteSession,
    updateSessionName
  } = useWorkout();

  // Handle editing session name
  const handleSessionNameChange = (sessionId: string, newName: string) => {
    updateSessionName(sessionId, newName);
  };

  // Get sessions for the active week
  const getSessionsForActiveWeek = () => {
    if (!activeWeekId) return [];

    const activeWeek = program.weeks.find((week) => week.id === activeWeekId);
    if (!activeWeek) return [];

    return activeWeek.sessions
      .map((sessionId) => {
        const session = program.sessions.find((s) => s.id === sessionId);
        return session || null;
      })
      .filter(Boolean);
  };

  const sessions = getSessionsForActiveWeek();

  if (!activeWeekId || sessions.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-medium">Workouts</h2>
      </div>

      <div className="flex items-center mb-4">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex p-1">
            {sessions.map((session) => (
              <Button
                key={session.id}
                variant={session.id === activeSessionId ? "default" : "outline"}
                size="sm"
                className="mr-1 px-3 relative group"
                onClick={() => setActiveSessionId(session.id)}
              >
                <EditableTitle
                  value={session.name}
                  onSave={(newName) => handleSessionNameChange(session.id, newName)}
                  className="max-w-[150px] truncate pr-2"
                />
                
                {sessions.length > 1 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash className="h-3 w-3 text-red-500 hover:text-red-700" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workout</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{session.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSession(session.id)}
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
              onClick={() => addSession(activeWeekId, sessions[sessions.length - 1]?.id)}
              className="flex items-center px-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Workout
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default SessionTabs;
