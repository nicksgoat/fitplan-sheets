
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleCard from "@/components/schedule/ScheduleCard";

export default function Index() {
  const { session } = useAuth();

  return (
    <div className="container max-w-6xl mx-auto pb-safe h-full overflow-x-hidden">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {session ? `Welcome, ${session.user.email?.split('@')[0] || 'User'}` : 'Welcome to FitBloom'}
            </h1>
            <p className="text-muted-foreground">Your fitness journey starts here</p>
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
            <AlertTitle>Get Started</AlertTitle>
            <AlertDescription>
              Create an account to track your workouts and save your progress.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
            <ScheduleCard />
          </TabsContent>
          <TabsContent value="activity">
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Your Activity</h3>
              <p className="text-center text-gray-400 py-8">
                Your workout activity and stats will appear here as you track your progress.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
