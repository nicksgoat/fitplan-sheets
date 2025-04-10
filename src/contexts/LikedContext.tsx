
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ItemType } from '@/lib/types';
import { toast } from 'sonner';

// Define the context shape
interface LikedContextType {
  likedItems: ItemType[];
  isLiked: (itemId: string) => boolean;
  toggleLike: (item: ItemType) => void;
  getLikedItemsByType: (type: string) => ItemType[];
}

// Create the context with a default value
const LikedContext = createContext<LikedContextType>({
  likedItems: [],
  isLiked: () => false,
  toggleLike: () => {},
  getLikedItemsByType: () => [],
});

// Storage key for liked items
const LIKED_ITEMS_STORAGE_KEY = 'fitbloom-liked-items';

// Provider component
export const LikedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for liked items
  const [likedItems, setLikedItems] = useState<ItemType[]>([]);

  // Load liked items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem(LIKED_ITEMS_STORAGE_KEY);
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setLikedItems(parsedItems);
      } catch (error) {
        console.error('Failed to parse liked items from storage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever liked items change
  useEffect(() => {
    localStorage.setItem(LIKED_ITEMS_STORAGE_KEY, JSON.stringify(likedItems));
  }, [likedItems]);

  // Check if an item is liked by ID
  const isLiked = (itemId: string): boolean => {
    return likedItems.some(item => item.id === itemId);
  };

  // Toggle an item's liked status
  const toggleLike = (item: ItemType) => {
    setLikedItems(prevItems => {
      const isCurrentlyLiked = prevItems.some(i => i.id === item.id);
      
      if (isCurrentlyLiked) {
        // Remove from liked items
        toast.success(`Removed from liked items`);
        return prevItems.filter(i => i.id !== item.id);
      } else {
        // Add to liked items with timestamp
        toast.success(`Added to liked items`);
        const updatedItem = {
          ...item,
          isFavorite: true,
          savedAt: new Date().toISOString()
        };
        return [...prevItems, updatedItem];
      }
    });
  };

  // Get liked items filtered by type
  const getLikedItemsByType = (type: string): ItemType[] => {
    return likedItems.filter(item => item.type === type);
  };

  // Create the context value
  const contextValue = {
    likedItems,
    isLiked,
    toggleLike,
    getLikedItemsByType
  };

  return (
    <LikedContext.Provider value={contextValue}>
      {children}
    </LikedContext.Provider>
  );
};

// Hook for using the liked context
export const useLiked = () => useContext(LikedContext);
