
export const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
};

export const getCategoryColor = (category?: string): string => {
  switch (category?.toLowerCase()) {
    case 'strength':
      return 'bg-red-500';
    case 'cardio':
      return 'bg-blue-500';
    case 'hiit':
      return 'bg-orange-500';
    case 'yoga':
      return 'bg-green-500';
    case 'mobility':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export const getDifficultyLabel = (difficulty?: string): string => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'Easy';
    case 'intermediate':
      return 'Medium';
    case 'advanced':
      return 'Hard';
    case 'expert':
      return 'Expert';
    default:
      return 'All Levels';
  }
};
