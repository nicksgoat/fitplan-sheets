
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ExerciseCategory,
  PrimaryMuscle,
} from '@/types/exercise';
import { useCreateExercise } from '@/hooks/useExerciseLibrary';

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
});

type FormValues = z.infer<typeof formSchema>;

const CreateExercise: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createExercise, isPending } = useCreateExercise();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      primaryMuscle: 'other' as PrimaryMuscle,
      category: 'other' as ExerciseCategory,
      description: '',
      instructions: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createExercise({
      name: values.name,
      primaryMuscle: values.primaryMuscle as PrimaryMuscle,
      category: values.category as ExerciseCategory,
      description: values.description,
      instructions: values.instructions,
      isCustom: true,
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

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Brief description of the exercise" {...field} />
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
                  <Input placeholder="Step-by-step instructions" {...field} />
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
              disabled={isPending}
              className="bg-fitbloom-purple hover:bg-opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
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
