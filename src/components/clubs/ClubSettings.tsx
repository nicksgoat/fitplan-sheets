
import React, { useState, useEffect } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription,
  FormMessage
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  name: z.string().min(3, 'Club name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  club_type: z.enum(['fitness', 'sports', 'wellness', 'nutrition', 'other']),
  membership_type: z.enum(['free', 'premium', 'vip']),
  premium_price: z.number().optional(),
  banner_url: z.string().url().optional().or(z.string().length(0)),
  logo_url: z.string().url().optional().or(z.string().length(0)),
});

interface ClubSettingsProps {
  clubId: string;
}

const ClubSettings: React.FC<ClubSettingsProps> = ({ clubId }) => {
  const { currentClub, refreshClubs } = useClub();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentClub?.name || '',
      description: currentClub?.description || '',
      club_type: (currentClub?.club_type as any) || 'fitness',
      membership_type: (currentClub?.membership_type as any) || 'free',
      premium_price: currentClub?.premium_price || undefined,
      banner_url: currentClub?.banner_url || '',
      logo_url: currentClub?.logo_url || '',
    }
  });
  
  // Update form when club data changes
  useEffect(() => {
    if (currentClub) {
      form.reset({
        name: currentClub.name,
        description: currentClub.description || '',
        club_type: (currentClub.club_type as any) || 'fitness',
        membership_type: (currentClub.membership_type as any) || 'free',
        premium_price: currentClub.premium_price || undefined,
        banner_url: currentClub.banner_url || '',
        logo_url: currentClub.logo_url || '',
      });
    }
  }, [currentClub]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!clubId) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('clubs')
        .update(values)
        .eq('id', clubId);
      
      if (error) throw error;
      
      toast.success('Club settings updated successfully');
      refreshClubs();
    } catch (error) {
      console.error('Error updating club settings:', error);
      toast.error('Failed to update club settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteClub = async () => {
    if (!window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId);
      
      if (error) throw error;
      
      toast.success('Club deleted successfully');
      window.location.href = '/clubs';
    } catch (error) {
      console.error('Error deleting club:', error);
      toast.error('Failed to delete club');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="general" 
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Club Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Club Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                          <Textarea {...field} rows={5} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="club_type"
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
                          What type of activities does your club focus on?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Club Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to your club's logo (recommended: square image)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="banner_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to your club's banner image (recommended: 3:1 ratio)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Preview section */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Preview</h4>
                    <div className="border border-dark-300 rounded-md p-4 bg-dark-300">
                      {form.watch('banner_url') && (
                        <div className="h-24 mb-4 rounded-md overflow-hidden">
                          <img 
                            src={form.watch('banner_url')} 
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x200?text=Invalid+Image+URL';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        {form.watch('logo_url') ? (
                          <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                            <img 
                              src={form.watch('logo_url')} 
                              alt="Logo preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Invalid';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-fitbloom-purple flex items-center justify-center mr-3">
                            <span className="text-white font-bold">
                              {form.watch('name')?.charAt(0) || 'C'}
                            </span>
                          </div>
                        )}
                        <h3 className="text-lg font-bold">{form.watch('name') || 'Club Name'}</h3>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="membership">
              <Card>
                <CardHeader>
                  <CardTitle>Membership Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="membership_type"
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
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Free clubs are open to everyone. Premium and VIP clubs can charge for membership.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('membership_type') !== 'free' && (
                    <FormField
                      control={form.control}
                      name="premium_price"
                      render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Premium Membership Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              onChange={(e) => onChange(parseFloat(e.target.value))}
                              value={value || ''}
                              {...rest}
                            />
                          </FormControl>
                          <FormDescription>
                            Monthly price in USD for premium membership
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="danger">
              <Card className="border-red-900">
                <CardHeader>
                  <CardTitle className="text-red-500">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Delete Club</h3>
                      <p className="text-muted-foreground mb-4">
                        Permanently delete this club and all its data. This action cannot be undone.
                      </p>
                      <Button 
                        type="button"
                        variant="destructive" 
                        onClick={handleDeleteClub}
                        disabled={isLoading}
                      >
                        Delete Club
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || !form.formState.isDirty}
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default ClubSettings;
