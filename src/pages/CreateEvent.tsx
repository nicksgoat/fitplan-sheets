
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clubId = searchParams.get('clubId');
  const { user } = useAuth();
  const { userClubs, createClubEvent } = useClub();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(2); // 2 hours default
  const [loading, setLoading] = useState(false);
  const [selectedClub, setSelectedClub] = useState<string | null>(clubId || null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  useEffect(() => {
    // If no club is selected but we have user clubs, select the first one
    if (!selectedClub && userClubs.length > 0) {
      setSelectedClub(userClubs[0].id);
    }
  }, [userClubs]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (): Promise<string | null> => {
    if (!image) return null;
    
    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('club_images')
        .upload(filePath, image);
      
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('club_images')
        .getPublicUrl(filePath);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  const handleCreateEvent = async () => {
    if (!name.trim()) {
      toast.error('Please enter an event name');
      return;
    }
    
    if (!selectedClub) {
      toast.error('Please select a club');
      return;
    }
    
    if (!startDate || !startTime) {
      toast.error('Please select a start date and time');
      return;
    }
    
    try {
      setLoading(true);
      
      // Upload image if selected
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage();
      }
      
      // Create start and end dates
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + duration);
      
      const eventData = {
        club_id: selectedClub,
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        image_url: imageUrl,
      };
      
      const createdEvent = await createClubEvent(eventData);
      
      if (createdEvent) {
        toast.success('Event created successfully');
        navigate(`/clubs/${selectedClub}`);
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('An error occurred while creating the event');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create Event</h1>
      </div>
      
      <div className="space-y-6">
        {/* Image upload */}
        <div>
          <Label htmlFor="image-upload" className="block mb-2">Event Image</Label>
          <label 
            htmlFor="image-upload" 
            className="block cursor-pointer"
          >
            <div className="border border-dashed border-gray-600 rounded-lg overflow-hidden h-48 bg-gray-900 flex items-center justify-center relative">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                  <p>Click to upload event image</p>
                </div>
              )}
            </div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
        
        {/* Club selector */}
        {userClubs.length > 0 && (
          <div>
            <Label htmlFor="club" className="block mb-2">Select Club</Label>
            <select
              id="club"
              value={selectedClub || ''}
              onChange={(e) => setSelectedClub(e.target.value)}
              disabled={!!clubId}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white"
            >
              <option value="">Select a club</option>
              {userClubs.map(club => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Event details */}
        <div>
          <Label htmlFor="name" className="block mb-2">Event Name*</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter event name"
            className="bg-gray-900 border-gray-700"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="location" className="block mb-2">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter event location"
            className="bg-gray-900 border-gray-700"
          />
        </div>
        
        <div>
          <Label htmlFor="description" className="block mb-2">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your event"
            className="bg-gray-900 border-gray-700 resize-none"
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date" className="block mb-2">Start Date</Label>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-400" />
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="start-time" className="block mb-2">Start Time</Label>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-400" />
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="duration" className="block mb-2">Duration (hours)</Label>
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDuration(prev => Math.max(0.5, prev - 0.5))}
              disabled={duration <= 0.5}
            >
              -
            </Button>
            <span className="mx-4 w-16 text-center">{duration}</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDuration(prev => Math.min(24, prev + 0.5))}
              disabled={duration >= 24}
            >
              +
            </Button>
          </div>
        </div>
        
        <Button
          className="w-full"
          onClick={handleCreateEvent}
          disabled={loading}
        >
          {loading ? 'Creating Event...' : 'Create Event'}
        </Button>
      </div>
    </div>
  );
};

export default CreateEvent;
