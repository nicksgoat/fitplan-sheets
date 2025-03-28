import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  X, 
  Link, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { 
  useUpdateExercise, 
  useExercise, 
  useUploadExerciseVideo 
} from '@/hooks/useExerciseLibrary';
import { Exercise, ExerciseCategory, PrimaryMuscle, Difficulty } from '@/types/exercise';
import { useAuth } from '@/hooks/useAuth';

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Exercise name must be at least 3 characters."
  }).max(50, {
    message: "Exercise name must be less than 50 characters."
  }),
  category: z.enum(['barbell', 'dumbbell', 'machine', 'bodyweight', 'kettlebell', 'cable', 'cardio', 'other'] as const),
  primaryMuscle: z.enum(['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'forearms', 'full body', 'upper chest', 'core', 'other'] as const),
  secondaryMuscles: z.array(z.enum(['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'forearms', 'full body', 'upper chest', 'core', 'other'] as const)).optional(),
  description: z.string().max(500, {
    message: "Description must be less than 500 characters."
  }).optional(),
  instructions: z.string().max(1000, {
    message: "Instructions must be less than 1000 characters."
  }).optional(),
  videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'] as const).optional(),
  tags: z.array(z.string()).optional(),
  creator: z.string().optional(),
  duration: z.string().optional(),
});

const muscleOptions: PrimaryMuscle[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 
  'forearms', 'full body', 'upper chest', 'core', 'other'
];

const categoryOptions: ExerciseCategory[] = [
  'barbell', 'dumbbell', 'machine', 'bodyweight', 
  'kettlebell', 'cable', 'cardio', 'other'
];

const difficultyOptions: Difficulty[] = [
  'beginner', 'intermediate', 'advanced'
];

const EditExercise: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSecondaryMuscles, setSelectedSecondaryMuscles] = useState<PrimaryMuscle[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>('file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { 
    data: exercise, 
    isLoading: isExerciseLoading, 
    error: exerciseError 
  } = useExercise(id || '');
  
  const { uploadVideo, progress, isUploading } = useUploadExerciseVideo();
  const updateExerciseMutation = useUpdateExercise();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: 'barbell',
      primaryMuscle: 'chest',
      secondaryMuscles: [],
      description: '',
      instructions: '',
      videoUrl: '',
      difficulty: 'beginner',
      tags: [],
      creator: '',
      duration: '',
    }
  });

  useEffect(() => {
    if (exercise) {
      form.reset({
        name: exercise.name,
        category: exercise.category,
        primaryMuscle: exercise.primaryMuscle,
        secondaryMuscles: exercise.secondaryMuscles || [],
        description: exercise.description || '',
        instructions: exercise.instructions || '',
        videoUrl: exercise.videoUrl || '',
        difficulty: exercise.difficulty || 'beginner',
        tags: exercise.tags || [],
        creator: exercise.creator || '',
        duration: exercise.duration || ''
      });
      
      setSelectedSecondaryMuscles(exercise.secondaryMuscles || []);
      setSelectedTags(exercise.tags || []);
      
      if (exercise.videoUrl) {
        setVideoPreviewUrl(exercise.videoUrl);
        setUploadTab('url');
      }
    }
  }, [exercise, form]);

  useEffect(() => {
    if (isUploading) {
      setUploadProgress(progress);
    }
  }, [progress, isUploading]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetVideoFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateAndSetVideoFile = (file: File) => {
    setUploadError(null);
    
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      const errorMsg = 'Invalid file type. Please upload MP4, WebM, or QuickTime video.';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      return;
    }
    
    if (file.size > MAX_VIDEO_SIZE) {
      const errorMsg = 'Video is too large. Maximum size is 50MB.';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      return;
    }
    
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetVideoFile(files[0]);
    }
  };

  const handleClearVideo = () => {
    setVideoFile(null);
    setVideoPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleSecondaryMuscle = (muscle: PrimaryMuscle) => {
    setSelectedSecondaryMuscles(prev => {
      if (prev.includes(muscle)) {
        return prev.filter(m => m !== muscle);
      } else {
        return [...prev, muscle];
      }
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setUploadError(null);
      
      let finalVideoUrl = formData.videoUrl;
      
      if (uploadTab === 'file' && videoFile) {
        setIsVideoUploading(true);
        try {
          finalVideoUrl = await uploadVideo(videoFile, user?.id);
        } catch (error) {
          console.error('Error uploading video:', error);
          setIsSubmitting(false);
          setIsVideoUploading(false);
          
          if (error instanceof Error) {
            setUploadError(error.message);
          } else {
            setUploadError('Failed to upload video. Please try again with a smaller file.');
          }
          return;
        }
        setIsVideoUploading(false);
      }
      
      const exerciseData: Partial<Exercise> = {
        ...formData,
        secondaryMuscles: selectedSecondaryMuscles,
        tags: selectedTags,
        videoUrl: finalVideoUrl || undefined,
      };
      
      await updateExerciseMutation.mutateAsync({ 
        id: id || '', 
        exercise: exerciseData 
      });
      
      navigate('/library');
      
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast.error('Failed to update exercise. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isExerciseLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading exercise...</span>
      </div>
    );
  }

  if (exerciseError || !exercise) {
    return (
      <div className="p-6 flex flex-col items-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 w-full max-w-md">
          <p className="font-medium">Error loading exercise</p>
          <p className="text-sm mt-1">
            {exerciseError instanceof Error 
              ? exerciseError.message 
              : "Could not find the requested exercise"}
          </p>
        </div>
        <Button onClick={handleBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const renderFileTabContent = () => {
    return (
      <div className="pt-4">
        <Alert variant="default" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Video Upload Guidelines</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
              <li>Maximum file size: <strong>50MB</strong></li>
              <li>Supported formats: MP4, WebM, QuickTime</li>
              <li>For larger videos, use the URL option with YouTube or other video hosts</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        {uploadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        {!videoPreviewUrl && (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium">Drop your video here or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">MP4, WebM or QuickTime, up to 50MB</p>
            </div>
          </div>
        )}
        
        {videoPreviewUrl && (
          <div className="relative mt-4 rounded-lg overflow-hidden">
            <video 
              src={videoPreviewUrl} 
              controls 
              className="w-full h-auto max-h-[300px]"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClearVideo}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl pb-20">
      <Button 
        variant="ghost" 
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Edit Exercise</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium mb-4">Basic Information</h2>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Exercise Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Barbell Bench Press" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyOptions.map(difficulty => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Typical Duration (e.g., "2-3 minutes per set")</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 30-45 seconds" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="creator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creator (leave empty to use your name)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., FitBloom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium mb-4">Targeted Muscles</h2>
              
              <FormField
                control={form.control}
                name="primaryMuscle"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Primary Muscle*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary muscle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {muscleOptions.map(muscle => (
                          <SelectItem key={muscle} value={muscle}>
                            {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Secondary Muscles (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {muscleOptions.map(muscle => (
                    <Badge
                      key={muscle}
                      variant={selectedSecondaryMuscles.includes(muscle) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSecondaryMuscle(muscle)}
                    >
                      {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Tags (optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium mb-4">Details</h2>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the exercise and its benefits..."
                        className="min-h-[100px]"
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
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Step-by-step instructions for performing the exercise..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium mb-4">Video Demonstration (Optional)</h2>
              
              <Tabs value={uploadTab} onValueChange={(value) => setUploadTab(value as 'file' | 'url')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="url">Video URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="file">
                  {renderFileTabContent()}
                </TabsContent>
                
                <TabsContent value="url" className="pt-4">
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="relative w-full">
                              <Link className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input 
                                placeholder="https://..." 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('videoUrl') && (
                    <p className="text-xs text-gray-500 mt-2">
                      * Video URL will be used instead of uploaded file
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-10">
            <div className="container mx-auto max-w-3xl flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting && (
                  <>
                    {isVideoUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading Video ({uploadProgress}%)...
                      </>
                    ) : (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Exercise...
                      </>
                    )}
                  </>
                )}
                {!isSubmitting && (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditExercise;
