
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClub } from '@/contexts/ClubContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(3, 'Club name must be at least 3 characters'),
  description: z.string().optional(),
  clubType: z.enum(['fitness', 'sports', 'wellness', 'nutrition', 'other']),
  membershipType: z.enum(['free', 'premium']),
  premiumPrice: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateClubForm: React.FC = () => {
  const { createNewClub } = useClub();
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      clubType: 'fitness',
      membershipType: 'free',
      premiumPrice: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to create a club');
      return;
    }

    try {
      const newClub = await createNewClub({
        name: values.name,
        description: values.description || '',
        clubType: values.clubType,
        creatorId: user.id,
        membershipType: values.membershipType,
        premiumPrice: values.membershipType === 'premium' && values.premiumPrice 
          ? parseFloat(values.premiumPrice) 
          : undefined,
      });
      
      toast.success('Club created successfully!');
      navigate(`/clubs/${newClub.id}`);
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error('Failed to create club');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto bg-dark-200 p-6 rounded-lg">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Create a New Club</h1>
        <p className="text-gray-400">Create a community around your fitness interests or goals.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Club Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter club name" {...field} />
                </FormControl>
                <FormDescription>
                  Choose a name that represents your club's purpose.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe what your club is about" 
                    {...field} 
                    rows={4}
                  />
                </FormControl>
                <FormDescription>
                  Explain the goals, activities, or focus of your club.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="clubType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select club type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categorize your club for better discoverability.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="membershipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select membership type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium (Paid)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose whether membership requires payment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {form.watch('membershipType') === 'premium' && (
            <FormField
              control={form.control}
              name="premiumPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premium Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter membership price" 
                      {...field} 
                      step="0.01"
                    />
                  </FormControl>
                  <FormDescription>
                    Set a monthly subscription price for premium membership.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/clubs')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            >
              Create Club
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateClubForm;
