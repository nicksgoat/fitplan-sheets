
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

// Types for liked items
export type LikeableItemType = 'exercise' | 'workout' | 'collection' | 'program';

export interface LikedItem extends Tables.liked_items.Row {}

export function useLikes() {
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all liked items for the current user
  const fetchLikedItems = async () => {
    if (!user) {
      setLikedItems({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('liked_items')
        .select('item_id, item_type')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching liked items:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your liked items',
          variant: 'destructive',
        });
        return;
      }

      // Transform data into a map for easy lookup
      const likedMap: Record<string, boolean> = {};
      data?.forEach((item) => {
        likedMap[`${item.item_type}-${item.item_id}`] = true;
      });

      setLikedItems(likedMap);
    } catch (err) {
      console.error('Error in fetching liked items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if an item is liked
  const isItemLiked = (itemId: string, itemType: LikeableItemType): boolean => {
    return !!likedItems[`${itemType}-${itemId}`];
  };

  // Toggle like status for an item
  const toggleLike = async (itemId: string, itemType: LikeableItemType) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like items',
        variant: 'destructive',
      });
      return false;
    }

    const itemKey = `${itemType}-${itemId}`;
    const isCurrentlyLiked = likedItems[itemKey];

    // Optimistically update UI
    setLikedItems((prev) => ({
      ...prev,
      [itemKey]: !isCurrentlyLiked,
    }));

    try {
      if (isCurrentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('liked_items')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('item_type', itemType);

        if (error) throw error;
        
        toast({
          title: 'Removed from liked items',
          description: `Item has been removed from your liked collection`,
        });
      } else {
        // Add like
        const { error } = await supabase.from('liked_items').insert({
          user_id: user.id,
          item_id: itemId,
          item_type: itemType,
        });

        if (error) throw error;
        
        toast({
          title: 'Added to liked items',
          description: `Item has been added to your liked collection`,
        });
      }
      
      return !isCurrentlyLiked; // Return the new state
    } catch (err) {
      console.error('Error toggling like:', err);
      
      // Revert optimistic update on error
      setLikedItems((prev) => ({
        ...prev,
        [itemKey]: isCurrentlyLiked,
      }));
      
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        variant: 'destructive',
      });
      
      return isCurrentlyLiked; // Return the original state on error
    }
  };

  // Fetch liked items on component mount or when user changes
  useEffect(() => {
    fetchLikedItems();
  }, [user]);

  return {
    isItemLiked,
    toggleLike,
    fetchLikedItems,
    isLoading,
  };
}
