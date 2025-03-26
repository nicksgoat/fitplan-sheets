
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useWorkout } from "@/contexts/WorkoutContext";
import { toast } from "@/components/ui/use-toast";
import { WorkoutSettings } from "@/types/workout";

interface WorkoutPreviewSettingsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const WorkoutPreviewSettings: React.FC<WorkoutPreviewSettingsProps> = ({ 
  activeTab,
  onTabChange
}) => {
  const { program, updateProgramDetails, updateSettings } = useWorkout();
  const [programName, setProgramName] = useState(program.name);
  const [programImage, setProgramImage] = useState(program.image || "/lovable-uploads/6f7335b3-f7e0-41da-a909-03ca225a738d.png");
  
  // Settings states
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kgs">(program.settings?.weightUnit || "lbs");
  const [effortUnit, setEffortUnit] = useState<"rpe" | "rir">(program.settings?.effortUnit || "rpe");
  const [showWeight, setShowWeight] = useState(program.settings?.showWeight !== false);
  const [showEffort, setShowEffort] = useState(program.settings?.showEffort !== false);
  const [showRest, setShowRest] = useState(program.settings?.showRest !== false);
  const [showNotes, setShowNotes] = useState(program.settings?.showNotes !== false);
  
  // Sync with program when it changes
  useEffect(() => {
    setProgramName(program.name);
    setProgramImage(program.image || "/lovable-uploads/6f7335b3-f7e0-41da-a909-03ca225a738d.png");
    
    // Update settings states when program settings change
    if (program.settings) {
      setWeightUnit(program.settings.weightUnit || "lbs");
      setEffortUnit(program.settings.effortUnit || "rpe");
      setShowWeight(program.settings.showWeight !== false);
      setShowEffort(program.settings.showEffort !== false);
      setShowRest(program.settings.showRest !== false);
      setShowNotes(program.settings.showNotes !== false);
    }
  }, [program]);
  
  const handleSaveAppearance = () => {
    updateProgramDetails({ 
      name: programName, 
      image: programImage 
    });
    
    toast({
      title: "Changes saved",
      description: "Program appearance has been updated",
    });
  };
  
  const handleSaveSettings = () => {
    const settings: WorkoutSettings = {
      weightUnit,
      effortUnit,
      showWeight,
      showEffort,
      showRest,
      showNotes
    };
    
    updateSettings(settings);
    
    toast({
      title: "Settings saved",
      description: "Your workout display preferences have been updated",
    });
  };
  
  const characterCount = programName.length;
  const maxCharacters = 60;

  return (
    <div className="p-0">
      <Tabs defaultValue="preview" value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">
              <span className="text-red-500 mr-1">*</span>
              Weight unit
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              Update defaults in your account settings.
            </p>
            <RadioGroup 
              value={weightUnit} 
              onValueChange={(value) => setWeightUnit(value as "lbs" | "kgs")}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lbs" id="weight-lbs" />
                <Label htmlFor="weight-lbs">Pounds (lbs)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kgs" id="weight-kgs" />
                <Label htmlFor="weight-kgs">Kilograms (kgs)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">
              <span className="text-red-500 mr-1">*</span>
              Effort unit
            </h3>
            <RadioGroup 
              value={effortUnit} 
              onValueChange={(value) => setEffortUnit(value as "rpe" | "rir")}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rpe" id="effort-rpe" />
                <Label htmlFor="effort-rpe">RPE (Rate of perceived exertion)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rir" id="effort-rir" />
                <Label htmlFor="effort-rir">RIR (Reps in reserve)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Show or hide columns</h3>
            <p className="text-xs text-gray-500 mb-3">
              Add weight, RPE, and rest. Want more? Contact us
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-weight">Weight (lbs or kgs)</Label>
                <Switch 
                  id="show-weight" 
                  checked={showWeight} 
                  onCheckedChange={setShowWeight} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-effort">Effort (RPE or RIR)</Label>
                <Switch 
                  id="show-effort" 
                  checked={showEffort} 
                  onCheckedChange={setShowEffort} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-rest">Rest</Label>
                <Switch 
                  id="show-rest" 
                  checked={showRest} 
                  onCheckedChange={setShowRest} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-notes">Notes</Label>
                <Switch 
                  id="show-notes" 
                  checked={showNotes} 
                  onCheckedChange={setShowNotes} 
                />
              </div>
            </div>
          </div>
          
          <Button onClick={handleSaveSettings} className="w-full">
            Save settings
          </Button>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">
              <span className="text-red-500 mr-1">*</span>
              Program name
            </h3>
            <Input 
              value={programName} 
              onChange={(e) => setProgramName(e.target.value)}
              maxLength={maxCharacters}
              className="mb-1"
            />
            <div className="text-xs text-right text-gray-500">
              ({characterCount}/{maxCharacters})
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Program thumbnail</h3>
            <p className="text-xs text-gray-500 mb-3">
              This image will appear in the iOS & Android app
            </p>
            
            <div className="border rounded-lg overflow-hidden mb-4 relative">
              <img 
                src={programImage} 
                alt="Program thumbnail" 
                className="w-full h-48 object-cover"
              />
              <div className="bg-black/50 text-white p-2 absolute bottom-0 w-full">
                <p className="text-center">{programName}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => {
                setProgramImage("/lovable-uploads/ade41533-878f-4722-a6d2-b1f5f459753e.png");
              }}
            >
              Change image
            </Button>
          </div>
          
          <Button onClick={handleSaveAppearance} className="w-full">
            Save changes
          </Button>
        </TabsContent>
        
        <TabsContent value="guide">
          <div className="text-center text-gray-500 p-4">
            <p>Workout guide and instructions will appear here.</p>
            <p className="text-sm mt-2">Coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPreviewSettings;
