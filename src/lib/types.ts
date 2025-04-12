export interface ItemType {
  id: string;
  title: string;
  type: 'exercise' | 'workout' | 'program' | 'collection';
  creator: string;
  imageUrl: string;
  videoUrl?: string;
  tags?: string[];
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isFavorite: boolean;
  description?: string;
  isCustom?: boolean;
  savedAt?: string; // Added timestamp when the item was saved
  lastModified?: string; // Added timestamp when the item was last modified
  price?: number; // Added for monetization
  isPurchasable?: boolean; // Added to indicate if the item can be purchased
  creatorId?: string; // ID of the creator
  creatorUsername?: string; // Username of the creator for URL building
  slug?: string; // Slug for URL friendly paths
}

export interface CollectionType {
  id: string;
  name: string;
  description: string;
  coverImages: string[];
  itemCount: number;
  lastUpdated: string;
}
