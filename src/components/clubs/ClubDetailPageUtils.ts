
import { supabase } from '@/integrations/supabase/client';

// Helper function to upload post images
export const uploadPostImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('club_post_images')
      .upload(fileName, file);
      
    if (uploadError) throw uploadError;
    
    const { data } = supabase
      .storage
      .from('club_post_images')
      .getPublicUrl(fileName);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Helper function to fetch club channels
export const fetchClubChannels = async (clubId: string) => {
  try {
    const { data, error } = await supabase
      .from('club_channels')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching club channels:', error);
    return [];
  }
};
