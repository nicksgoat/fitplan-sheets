
import React, { useState, useEffect } from "react";
import { Search, X, Dumbbell, Calendar, BookOpen, Layers, Download, Trash } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { 
  getExerciseLibrary, 
  getWorkoutLibrary, 
  getWeekLibrary, 
  getProgramLibrary,
  searchLibrary
} from "@/utils/presets";
import { 
  LibraryItemType, 
  WorkoutSession, 
  WorkoutWeek, 
  WorkoutProgram,
  Exercise 
} from "@/types/workout";

type LibraryTabType = 'exercises' | 'workouts' | 'weeks' | 'programs';

const WorkoutLibrary = () => {
  const { 
    activeWeekId,
    loadSessionFromLibrary, 
    loadWeekFromLibrary, 
    loadProgramFromLibrary,
    removeSessionFromLibrary,
    removeWeekFromLibrary,
    removeProgramFromLibrary,
    getSessionLibrary,
    getWeekLibrary,
    getProgramLibrary
  } = useWorkout();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<LibraryTabType>("workouts");
  const [isOpen, setIsOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<LibraryItemType | null>(null);
  
  // Get library items based on active tab
  const getLibraryItems = (): LibraryItemType[] => {
    if (searchQuery) {
      const type = activeTab === 'exercises' ? 'exercise' :
                  activeTab === 'workouts' ? 'workout' :
                  activeTab === 'weeks' ? 'week' :
                  'program';
      return searchLibrary(searchQuery, type as any);
    }
    
    switch (activeTab) {
      case 'exercises':
        return getExerciseLibrary();
      case 'workouts':
        return getWorkoutLibrary();
      case 'weeks':
        return getWeekLibrary();
      case 'programs':
        return getProgramLibrary();
      default:
        return [];
    }
  };
  
  // Handle drag operations
  const handleDragStart = (item: LibraryItemType) => {
    setDraggedItem(item);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
  };
  
  // Handle drop operations
  const handleDropToProgram = () => {
    if (!draggedItem) return;
    
    switch (draggedItem.type) {
      case 'workout':
        if (activeWeekId) {
          loadSessionFromLibrary(draggedItem.data as WorkoutSession, activeWeekId);
          setIsOpen(false);
        }
        break;
      case 'week':
        loadWeekFromLibrary(draggedItem.data as WorkoutWeek);
        setIsOpen(false);
        break;
      case 'program':
        loadProgramFromLibrary(draggedItem.data as WorkoutProgram);
        setIsOpen(false);
        break;
    }
    
    setDraggedItem(null);
  };
  
  // Delete library item
  const handleDeleteItem = (item: LibraryItemType) => {
    switch (item.type) {
      case 'workout':
        removeSessionFromLibrary(item.id);
        break;
      case 'week':
        removeWeekFromLibrary(item.id);
        break;
      case 'program':
        removeProgramFromLibrary(item.id);
        break;
    }
  };
  
  // Load library item
  const handleLoadItem = (item: LibraryItemType) => {
    switch (item.type) {
      case 'workout':
        if (activeWeekId) {
          loadSessionFromLibrary(item.data as WorkoutSession, activeWeekId);
          setIsOpen(false);
        }
        break;
      case 'week':
        loadWeekFromLibrary(item.data as WorkoutWeek);
        setIsOpen(false);
        break;
      case 'program':
        loadProgramFromLibrary(item.data as WorkoutProgram);
        setIsOpen(false);
        break;
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  };
  
  // Get icon based on item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return <Dumbbell className="h-4 w-4 mr-1" />;
      case 'workout':
        return <Calendar className="h-4 w-4 mr-1" />;
      case 'week':
        return <Layers className="h-4 w-4 mr-1" />;
      case 'program':
        return <BookOpen className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const libraryItems = getLibraryItems();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <BookOpen className="h-4 w-4 mr-2" />
          Library
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90%] sm:w-[540px] md:w-[620px]">
        <SheetHeader>
          <SheetTitle>Workout Library</SheetTitle>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search library..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1.5 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>
        
        <div 
          className="mt-6 h-full"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropToProgram}
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LibraryTabType)}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
              <TabsTrigger value="weeks">Weeks</TabsTrigger>
              <TabsTrigger value="programs">Programs</TabsTrigger>
            </TabsList>
            
            {["exercises", "workouts", "weeks", "programs"].map((tab) => (
              <TabsContent key={tab} value={tab} className="h-[calc(100vh-220px)]">
                <ScrollArea className="h-full pr-4">
                  {libraryItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                      <p>No {tab} in your library yet.</p>
                      <p className="text-sm mt-2">
                        {tab === "exercises" 
                          ? "Add exercises to your library to reuse them across workouts."
                          : tab === "workouts" 
                            ? "Save workouts to your library to reuse them in different programs."
                            : tab === "weeks" 
                              ? "Save training weeks to quickly build programs."
                              : "Save complete training programs for future use."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {libraryItems.map((item) => (
                        <Card 
                          key={item.id}
                          draggable 
                          onDragStart={() => handleDragStart(item)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base flex items-center">
                                {getItemIcon(item.type)}
                                {item.name}
                              </CardTitle>
                            </div>
                            <CardDescription>
                              Created: {formatDate(item.createdAt)}
                              {item.updatedAt && ` • Updated: ${formatDate(item.updatedAt)}`}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            {item.type === 'workout' && (
                              <p className="text-sm">
                                {(item.data as WorkoutSession).exercises.length} exercises
                              </p>
                            )}
                            {item.type === 'week' && (
                              <p className="text-sm">
                                {(item.data as WorkoutWeek).sessions.length} workouts
                              </p>
                            )}
                            {item.type === 'program' && (
                              <p className="text-sm">
                                {(item.data as WorkoutProgram).weeks.length} weeks • 
                                {(item.data as WorkoutProgram).sessions.length} workouts
                              </p>
                            )}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-between pt-0">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleLoadItem(item)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Add to program
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                  <Trash className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {item.type}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{item.name}" from your library?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteItem(item)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
          
          {draggedItem && (
            <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none">
              <div className="bg-primary text-primary-foreground py-2 px-4 rounded-md shadow-lg">
                Drop to add to your program
              </div>
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500 mt-4">
            Drag and drop items to add them to your program, or click "Add to program"
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WorkoutLibrary;
