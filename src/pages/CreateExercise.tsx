
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Plus, X, Upload, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ExerciseCategory,
  PrimaryMuscle,
} from '@/types/exercise';
import { useCreateExercise } from '@/hooks/useExerciseLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadExerciseVideo } from '@/services/exerciseLibraryService';
import { useAuth } from '@/hooks/useAuth';

// Maximum video size (50MB)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
// Allowed video file types
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Form validation schema using zod
const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  primaryMuscle: z.enum([
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps',
    'hamstrings', 'glutes', 'calves', 'abs', 'forearms', 'full body',
    'upper chest', 'core', 'other'
  ] as const),
  category: z.enum([
    'barbell', 'dumbbell', 'machine', 'bodyweight', 'kettlebell',
    'cable', 'cardio', 'other'
  ] as const),
  description: z.string().optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'] as const),
  duration: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateExercise: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createExercise, isPending } = useCreateExercise();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      primaryMuscle: 'other' as PrimaryMuscle,
      category: 'other' as ExerciseCategory,
      description: '',
      instructions: '',
      imageUrl: '',
      videoUrl: '',
      difficulty: 'beginner',
      duration: '',
    },
  });

  const addTag = () => {
    if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload MP4, WebM, or QuickTime video.');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error('Video is too large. Maximum size is 50MB.');
      return;
    }
    
    setVideoFile(file);
    // Clear any previously set videoUrl when a new file is selected
    form.setValue('videoUrl', '');
  };

  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload MP4, WebM, or QuickTime video.');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error('Video is too large. Maximum size is 50MB.');
      return;
    }
    
    setVideoFile(file);
    // Clear any previously set videoUrl when a new file is selected
    form.setValue('videoUrl', '');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast.error('Please select a video file first');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(10); // Start progress indicator
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      // Upload the video file
      const videoUrl = await uploadExerciseVideo(videoFile, user?.id);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Set the video URL in the form
      form.setValue('videoUrl', videoUrl);
      
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    // If video file is selected but not uploaded yet, upload it first
    if (mediaType === 'video' && videoFile && !values.videoUrl) {
      try {
        setIsUploading(true);
        const videoUrl = await uploadExerciseVideo(videoFile, user?.id);
        values.videoUrl = videoUrl;
      } catch (error) {
        console.error('Error uploading video during submission:', error);
        toast.error('Failed to upload video. Please try again.');
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }
    
    createExercise({
      name: values.name,
      primaryMuscle: values.primaryMuscle as PrimaryMuscle,
      category: values.category as ExerciseCategory,
      description: values.description,
      instructions: values.instructions,
      isCustom: true,
      imageUrl: mediaType === 'image' ? values.imageUrl : undefined,
      videoUrl: mediaType === 'video' ? values.videoUrl : undefined,
      tags,
      difficulty: values.difficulty,
      duration: values.duration,
      creator: 'You'
    }, {
      onSuccess: () => {
        toast.success('Exercise created successfully!');
        navigate('/library');
      },
      onError: (error) => {
        toast.error('Failed to create exercise');
        console.error('Error creating exercise:', error);
      }
    });
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mr-4"
          size="icon"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Exercise</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercise Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Barbell Bench Press" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="primaryMuscle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Muscle</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary muscle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="chest">Chest</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                      <SelectItem value="shoulders">Shoulders</SelectItem>
                      <SelectItem value="biceps">Biceps</SelectItem>
                      <SelectItem value="triceps">Triceps</SelectItem>
                      <SelectItem value="quadriceps">Quadriceps</SelectItem>
                      <SelectItem value="hamstrings">Hamstrings</SelectItem>
                      <SelectItem value="glutes">Glutes</SelectItem>
                      <SelectItem value="calves">Calves</SelectItem>
                      <SelectItem value="abs">Abs</SelectItem>
                      <SelectItem value="forearms">Forearms</SelectItem>
                      <SelectItem value="full body">Full Body</SelectItem>
                      <SelectItem value="upper chest">Upper Chest</SelectItem>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="barbell">Barbell</SelectItem>
                      <SelectItem value="dumbbell">Dumbbell</SelectItem>
                      <SelectItem value="machine">Machine</SelectItem>
                      <SelectItem value="bodyweight">Bodyweight</SelectItem>
                      <SelectItem value="kettlebell">Kettlebell</SelectItem>
                      <SelectItem value="cable">Cable</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Media Section */}
          <div>
            <FormLabel>Media</FormLabel>
            <Tabs
              defaultValue="image"
              className="w-full"
              onValueChange={(value) => setMediaType(value as 'image' | 'video')}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
              
              <TabsContent value="image">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the exercise image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="video">
                <div>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoSelect}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  
                  <div 
                    className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
                      videoFile ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleVideoDrop}
                    onDragOver={handleDragOver}
                  >
                    {videoFile ? (
                      <div className="flex flex-col items-center">
                        <VideoIcon className="h-12 w-12 text-green-500 mb-2" />
                        <p className="text-sm font-medium">{videoFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">Drop your video here or click to browse</p>
                        <p className="text-xs text-gray-500 mt-1">MP4, WebM or QuickTime, up to 50MB</p>
                      </div>
                    )}
                  </div>
                  
                  {videoFile && !form.getValues('videoUrl') && (
                    <div className="mt-2">
                      <Button 
                        type="button" 
                        onClick={handleVideoUpload}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading... {uploadProgress}%
                          </>
                        ) : (
                          'Upload Video'
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {form.getValues('videoUrl') && (
                    <div className="mt-2">
                      <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800 flex items-center">
                        <VideoIcon className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-600">Video uploaded successfully</span>
                      </div>
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Or enter a video URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/video.mp4" {...field} />
                        </FormControl>
                        <FormDescription>
                          You can either upload a video file or provide a URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 30 sec, 1 min" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormLabel>Tags</FormLabel>
            <div className="flex items-center mb-2">
              <Input 
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addTag} 
                size="sm" 
                className="ml-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => removeTag(tag)} 
                    className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of the exercise" 
                    className="min-h-20" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Step-by-step instructions" 
                    className="min-h-32" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || isUploading}
              className="bg-fitbloom-purple hover:bg-opacity-90"
            >
              {isPending || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Creating...'}
                </>
              ) : (
                'Create Exercise'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateExercise;
