
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Profile, SocialLink } from '@/types/profile';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EditProfileFormProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Profile>) => Promise<{ success: boolean }>;
}

const EditProfileForm = ({ profile, isOpen, onClose, onSave }: EditProfileFormProps) => {
  const [formData, setFormData] = useState<Partial<Profile>>(profile || {});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    profile?.social_links || []
  );
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle social link changes
  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    setSocialLinks(updatedLinks);
  };

  // Add new social link
  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  // Remove social link
  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Prepare updates object with social links
    const updates: Partial<Profile> = {
      ...formData,
      social_links: socialLinks
    };
    
    const { success } = await onSave(updates);
    
    if (success) {
      onClose();
    }
    
    setLoading(false);
  };

  // Handle cancel/close
  const handleCancel = () => {
    // Reset form
    setFormData(profile || {});
    setSocialLinks(profile?.social_links || []);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and social links.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Avatar Preview */}
            <div className="flex justify-center mb-2">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={formData.avatar_url || undefined} 
                  alt={formData.display_name || 'User'} 
                />
                <AvatarFallback className="text-lg">
                  {formData.display_name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Avatar URL */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar_url" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                value={formData.avatar_url || ''}
                onChange={handleChange}
                className="col-span-3"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            
            {/* Display Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="display_name" className="text-right">
                Display Name
              </Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name || ''}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Your Name"
              />
            </div>
            
            {/* Username */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                className="col-span-3"
                placeholder="username"
              />
            </div>
            
            {/* Bio */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right self-start pt-2">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            
            {/* Website */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input
                id="website"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="col-span-3"
                placeholder="https://yourwebsite.com"
              />
            </div>
            
            {/* Social Links */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <Label>Social Links</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addSocialLink}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Link
                </Button>
              </div>
              
              {socialLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-9 gap-2 mb-2">
                  <Input
                    placeholder="Platform"
                    value={link.platform}
                    onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                    className="col-span-3"
                  />
                  <Input
                    placeholder="URL or username"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                    className="col-span-5"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeSocialLink(index)}
                    className="col-span-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileForm;
