
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/contexts/ClubContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Club, ClubType, MembershipType } from '@/types/club';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

interface ClubSettingsProps {
  clubId: string;
}

const ClubSettings: React.FC<ClubSettingsProps> = ({ clubId }) => {
  const { currentClub, refreshClubs } = useClub();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isPremium, setIsPremium] = useState(
    currentClub?.membership_type === 'premium' || currentClub?.membership_type === 'vip'
  );

  const form = useForm({
    defaultValues: {
      name: currentClub?.name || '',
      description: currentClub?.description || '',
      club_type: currentClub?.club_type || 'fitness',
      membership_type: currentClub?.membership_type || 'free',
      premium_price: currentClub?.premium_price || 4.99,
    }
  });

  const handleUpdateSettings = async (data: any) => {
    try {
      setSaving(true);
      
      // If premium is toggled off, force membership type to free
      if (!isPremium) {
        data.membership_type = 'free';
        data.premium_price = null;
      }
      
      const { error } = await supabase
        .from('clubs')
        .update({
          name: data.name,
          description: data.description,
          club_type: data.club_type,
          membership_type: data.membership_type,
          premium_price: isPremium ? data.premium_price : null
        })
        .eq('id', clubId);

      if (error) throw error;
      
      toast.success('Club settings updated successfully');
      refreshClubs();
    } catch (error) {
      console.error('Error updating club settings:', error);
      toast.error('Failed to update club settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClub = async () => {
    try {
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
    }
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${clubId}_${type}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('club_images')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('club_images')
        .getPublicUrl(fileName);
      
      // Update club record with new image URL
      const updateData = type === 'logo' 
        ? { logo_url: publicUrl }
        : { banner_url: publicUrl };
        
      const { error: updateError } = await supabase
        .from('clubs')
        .update(updateData)
        .eq('id', clubId);
        
      if (updateError) throw updateError;
      
      toast.success(`Club ${type} updated successfully`);
      refreshClubs();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  if (!currentClub) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Club Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <form onSubmit={form.handleSubmit(handleUpdateSettings)} className="space-y-4">
              <div>
                <Label htmlFor="name">Club Name</Label>
                <Input
                  id="name"
                  {...form.register('name', { required: true })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="club_type">Club Type</Label>
                <Select 
                  onValueChange={(value) => form.setValue('club_type', value as ClubType)}
                  defaultValue={form.watch('club_type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select club type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Club Logo</h3>
                <div className="flex items-center gap-4">
                  <img 
                    src={currentClub.logo_url || 'https://via.placeholder.com/100'} 
                    alt="Club logo" 
                    className="h-20 w-20 object-cover rounded-full"
                  />
                  <Input
                    type="file"
                    onChange={(e) => handleUploadImage(e, 'logo')}
                    accept="image/*"
                    disabled={uploading}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Club Banner</h3>
                <div className="flex items-center gap-4">
                  <img 
                    src={currentClub.banner_url || 'https://via.placeholder.com/300x100'} 
                    alt="Club banner" 
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <Input
                    type="file"
                    onChange={(e) => handleUploadImage(e, 'banner')}
                    accept="image/*"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Membership Settings */}
          <TabsContent value="membership">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Premium Membership</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable paid memberships for your club
                  </p>
                </div>
                <Switch
                  checked={isPremium}
                  onCheckedChange={setIsPremium}
                />
              </div>
              
              {isPremium && (
                <form onSubmit={form.handleSubmit(handleUpdateSettings)} className="space-y-4">
                  <div>
                    <Label htmlFor="membership_type">Membership Tier</Label>
                    <Select 
                      onValueChange={(value) => form.setValue('membership_type', value as MembershipType)}
                      defaultValue={form.watch('membership_type')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select membership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="premium_price">Monthly Price ($)</Label>
                    <Input
                      id="premium_price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register('premium_price', { 
                        valueAsNumber: true,
                        min: 0
                      })}
                    />
                  </div>
                  
                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? 'Saving...' : 'Save Membership Settings'}
                  </Button>
                </form>
              )}
            </div>
          </TabsContent>
          
          {/* Danger Zone */}
          <TabsContent value="danger">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-red-500 mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions are irreversible. Please be certain.
                </p>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Delete this club</h4>
                    <p className="text-sm text-muted-foreground">
                      Once deleted, there is no going back.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Club</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete
                          the club and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteClub} className="bg-red-600">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClubSettings;
