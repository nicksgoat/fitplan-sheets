
import React, { useState, useRef } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { Image, Upload, Camera } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoImage(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImage(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}_${Date.now()}.${fileExt}`;
      const filePath = `clubs/${fileName}`;

      const { error } = await supabase.storage
        .from('club_images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        toast.error(`Failed to upload image: ${error.message}`);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('club_images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Exception during image upload:', error);
      toast.error('An unexpected error occurred during image upload');
      return null;
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to create a club');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Creating club...');
      
      // Upload images if selected
      let logoUrl = null;
      let bannerUrl = null;
      
      if (logoImage) {
        setUploadingLogo(true);
        logoUrl = await uploadImage(logoImage, 'club_logo');
        setUploadingLogo(false);
      }
      
      if (bannerImage) {
        setUploadingBanner(true);
        bannerUrl = await uploadImage(bannerImage, 'club_banner');
        setUploadingBanner(false);
      }
      
      const newClub = await createNewClub({
        name: values.name,
        description: values.description || '',
        club_type: values.clubType,
        creator_id: user.id,
        membership_type: values.membershipType,
        premium_price: values.membershipType === 'premium' && values.premiumPrice 
          ? parseFloat(values.premiumPrice) 
          : undefined,
        logo_url: logoUrl,
        banner_url: bannerUrl,
      });
      
      toast.dismiss();
      toast.success('Club created successfully!');
      navigate(`/clubs/${newClub.id}`);
    } catch (error) {
      console.error('Error creating club:', error);
      toast.dismiss();
      toast.error('Failed to create club. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto bg-dark-200 p-6 rounded-lg">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Create a New Club</h1>
        <p className="text-gray-400">Create a community around your fitness interests or goals.</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <FormLabel>Club Images</FormLabel>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo Upload */}
            <div className="flex flex-col items-center">
              <div 
                onClick={() => logoInputRef.current?.click()} 
                className={`w-24 h-24 rounded-full overflow-hidden relative cursor-pointer border-2 border-dashed ${logoPreview ? 'border-gray-400' : 'border-gray-600'} flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all`}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Camera size={20} />
                    <span className="text-xs mt-1">Club Logo</span>
                  </div>
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-white/30"></div>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 mt-2">Club Logo</span>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoChange}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* Banner Upload */}
            <div className="flex-1 flex flex-col">
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className={`h-32 w-full rounded-md overflow-hidden relative cursor-pointer border-2 border-dashed ${bannerPreview ? 'border-gray-400' : 'border-gray-600'} flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all`}
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Image size={24} />
                    <span className="text-xs mt-1">Add club banner image</span>
                  </div>
                )}
                {uploadingBanner && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-white/30"></div>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 mt-2">Banner Image (16:9 recommended)</span>
              <input
                type="file"
                ref={bannerInputRef}
                onChange={handleBannerChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Club'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateClubForm;
