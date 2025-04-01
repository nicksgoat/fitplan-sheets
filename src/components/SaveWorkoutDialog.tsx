
import { useState, useRef, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkout } from "@/contexts/WorkoutContext";
import { addWorkoutToLibrary } from "@/utils/presets";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Image, Upload, X } from "lucide-react";

interface SaveWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string;
}

const SaveWorkoutDialog = ({ open, onOpenChange, workoutId }: SaveWorkoutDialogProps) => {
  const { program } = useWorkout();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get the current workout
  const workout = program?.workouts.find(w => w.id === workoutId);

  // Handle image file upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setUploadedImage(file);
    setImageUrl(''); // Clear URL input when file is uploaded
    
    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Clear the selected image
  const clearImage = () => {
    setUploadedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle image URL input change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setUploadedImage(null);
    setPreviewUrl(null);
  };

  // Generate a random workout image if none is provided
  const getDefaultWorkoutImage = () => {
    const imageIds = [
      "barbell-workout",
      "fitness-class",
      "gym-equipment",
      "kettlebell",
      "running-track",
      "weight-lifting"
    ];
    const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
    return `https://source.unsplash.com/random/800x600?${randomId}`;
  };
  
  // Convert uploaded image to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  const handleSave = async () => {
    if (!workout) {
      toast.error("Workout not found");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Please enter a name for this workout");
      return;
    }
    
    setSaving(true);
    
    try {
      let workoutImageUrl = imageUrl.trim();
      
      // If an image was uploaded, convert it to base64
      if (uploadedImage) {
        workoutImageUrl = await convertToBase64(uploadedImage);
      } else if (!workoutImageUrl) {
        // If no image URL or upload, use default
        workoutImageUrl = getDefaultWorkoutImage();
      }
      
      // Create a deep copy to ensure all workout data is captured
      const workoutToSave = JSON.parse(JSON.stringify({
        ...workout,
        name: name.trim(),
        isPublic: isPublic,
        userId: user?.id,
        creator: user?.email || "Anonymous",
        savedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        imageUrl: workoutImageUrl
      }));
      
      // Save to local library
      addWorkoutToLibrary(workoutToSave);
      
      toast.success(`Workout saved ${isPublic ? 'to public library' : 'to your library'}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error("Failed to save workout");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-dark-200 text-white border-dark-300">
        <DialogHeader>
          <DialogTitle>Save Workout</DialogTitle>
          <DialogDescription className="text-gray-400">
            This workout will be saved for future use.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              placeholder="Enter workout name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-dark-300 border-dark-400"
              defaultValue={workout?.name || ""}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="block mb-2">Workout Image</Label>
            
            {previewUrl && (
              <div className="relative w-full h-40 mb-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="image-upload" className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="bg-dark-300 border-dark-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum file size: 5MB
                </p>
              </div>
              
              <div className="flex items-center">
                <div className="flex-grow border-t border-dark-400"></div>
                <span className="px-3 text-xs text-gray-400">OR</span>
                <div className="flex-grow border-t border-dark-400"></div>
              </div>
              
              <div>
                <Label htmlFor="image-url" className="flex items-center gap-2 mb-2">
                  <Image className="h-4 w-4" />
                  Image URL
                </Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/workout-image.jpg"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  className="bg-dark-300 border-dark-400"
                  disabled={!!uploadedImage}
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-2">
              Leave both empty for a random fitness image
            </p>
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="public-switch" className="text-sm">
              Make this workout public
            </Label>
            <Switch
              id="public-switch"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
          
          {isPublic && !user && (
            <p className="text-amber-400 text-sm">
              Note: You're not logged in. Your workout will be saved publicly but anonymously.
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !name.trim()}
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          >
            {saving ? "Saving..." : isPublic ? "Publish to Library" : "Save to Library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveWorkoutDialog;
