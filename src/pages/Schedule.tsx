
import { useSchedule } from "@/contexts/ScheduleContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CalendarClock, InfoIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Schedule() {
  const { activeSchedule } = useSchedule();
  const { programs } = useLibrary();
  const { session } = useAuth();
  
  // Find the program data for the active schedule
  const findProgramById = (programId: string) => {
    return programs.find(p => p.id === programId);
  };
  
  const program = activeSchedule ? findProgramById(activeSchedule.programId) : undefined;
  
  return (
    <div className="container max-w-6xl mx-auto pb-safe h-full overflow-x-hidden">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Schedule</h1>
            <p className="text-muted-foreground">Track your fitness journey</p>
          </div>
          
          {!session && (
            <Button asChild className="bg-fitbloom-purple hover:bg-fitbloom-purple/90">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
        
        {!session && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Sign in to track your workouts and manage your schedule.
            </AlertDescription>
          </Alert>
        )}
        
        {session && !activeSchedule && (
          <Card className="bg-gray-900/30 border-gray-800">
            <CardHeader>
              <CardTitle>No Active Programs</CardTitle>
              <CardDescription>
                You don't have any active programs scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-8 gap-3 text-gray-400">
                <CalendarClock className="h-8 w-8 text-fitbloom-purple/70" />
                <p>Start a program from the library to see your workout schedule here.</p>
              </div>
              <Button 
                asChild
                className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              >
                <Link to="/library">Browse Programs</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        {session && activeSchedule && (
          <ScheduleCard />
        )}
      </div>
    </div>
  );
}
