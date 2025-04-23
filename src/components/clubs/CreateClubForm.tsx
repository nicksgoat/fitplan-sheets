
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
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
import { ClubType, MembershipType } from '@/types/club';

const formSchema = z.object({
  name: z.string().min(3, 'Club name must be at least 3 characters'),
  description: z.string().optional(),
  clubType: z.string(),
  membershipType: z.string(),
  premiumPrice: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateClubForm = () => {
  const { user } = useAuth();
  const { createNewClub } = useClub();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

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

  const membershipType = form.watch('membershipType');
  
  const uploadImage = async (file: File, prefix: string) => {
    if (!file) return null;
    
    // This is a placeholder for image upload functionality
    // In a real implementation, this would upload to storage
    console.log('Would upload image:', file);
    
    // Return a mock URL for now
    return `https://example.com/${prefix}_${file.name}`;
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
        club_type: values.clubType as ClubType,
        membership_type: values.membershipType as MembershipType,
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLogoImage(e.target.files[0]);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBannerImage(e.target.files[0]);
    }
  };

  return (
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
                  placeholder="Describe your club..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clubType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Club Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a club type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="invite_only">Invite Only</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {membershipType === 'premium' && (
          <FormField
            control={form.control}
            name="premiumPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Premium Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="9.99"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <div>
            <FormLabel htmlFor="logo">Club Logo</FormLabel>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="mt-1"
            />
            {logoImage && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {logoImage.name}
              </p>
            )}
          </div>

          <div>
            <FormLabel htmlFor="banner">Club Banner</FormLabel>
            <Input
              id="banner"
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="mt-1"
            />
            {bannerImage && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {bannerImage.name}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || uploadingLogo || uploadingBanner}
        >
          {isSubmitting ? 'Creating...' : 'Create Club'}
        </Button>
      </form>
    </Form>
  );
};

export { CreateClubForm };
export default CreateClubForm;
