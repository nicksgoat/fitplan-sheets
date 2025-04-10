
import { useLiked } from '@/contexts/LikedContext';
import { ItemType } from '@/lib/types';

export function useLikeItem(item: ItemType | null) {
  const { isLiked, toggleLike } = useLiked();
  
  const liked = item ? isLiked(item.id) : false;
  
  const toggleLikeItem = () => {
    if (item) {
      toggleLike(item);
    }
  };
  
  return { liked, toggleLikeItem };
}
