
export interface ItemType {
  id: string;
  title: string;
  type: 'exercise' | 'workout' | 'program';
  creator: string;
  imageUrl: string;
  duration: string;
  tags?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isFavorite: boolean;
  description?: string;
}

export interface CollectionType {
  id: string;
  name: string;
  description: string;
  coverImages: string[];
  itemCount: number;
  lastUpdated: string;
}
