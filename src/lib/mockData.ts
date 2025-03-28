
import { ItemType, CollectionType } from './types';

// Mock Exercises
export const mockExercises: ItemType[] = [
  {
    id: 'e1',
    title: 'Barbell Squat',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '5-10 min',
    tags: ['Legs', 'Strength', 'Compound'],
    difficulty: 'intermediate',
    isFavorite: true,
    description: 'A compound lower-body exercise that targets the quadriceps, hamstrings, and glutes.'
  },
  {
    id: 'e2',
    title: 'Push-up',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '3-5 min',
    tags: ['Chest', 'Arms', 'Bodyweight'],
    difficulty: 'beginner',
    isFavorite: false,
    description: 'A bodyweight exercise that works the chest, shoulders, triceps, and core muscles.'
  },
  {
    id: 'e3',
    title: 'Pull-up',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '3-5 min',
    tags: ['Back', 'Arms', 'Bodyweight'],
    difficulty: 'intermediate',
    isFavorite: true,
    description: 'A bodyweight exercise that targets the back, biceps, and shoulders.'
  },
  {
    id: 'e4',
    title: 'Deadlift',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '5-10 min',
    tags: ['Back', 'Legs', 'Compound'],
    difficulty: 'advanced',
    isFavorite: false,
    description: 'A compound exercise that works the entire posterior chain, including the back, glutes, and hamstrings.'
  },
  {
    id: 'e5',
    title: 'Plank',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '1-3 min',
    tags: ['Core', 'Isometric', 'Bodyweight'],
    difficulty: 'beginner',
    isFavorite: false,
    description: 'An isometric core strength exercise that involves maintaining a position similar to a push-up for the maximum possible time.'
  },
  {
    id: 'e6',
    title: 'Burpee',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '3-5 min',
    tags: ['Full Body', 'Cardio', 'HIIT'],
    difficulty: 'intermediate',
    isFavorite: false,
    description: 'A full-body exercise that combines a squat, push-up, and jump, often used in high-intensity interval training.'
  },
  {
    id: 'e7',
    title: 'Lunge',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '3-5 min',
    tags: ['Legs', 'Balance', 'Unilateral'],
    difficulty: 'beginner',
    isFavorite: false,
    description: 'A unilateral lower-body exercise that works the quadriceps, hamstrings, and glutes while improving balance and coordination.'
  },
  {
    id: 'e8',
    title: 'Mountain Climber',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '2-4 min',
    tags: ['Cardio', 'Core', 'HIIT'],
    difficulty: 'beginner',
    isFavorite: true,
    description: 'A dynamic exercise that works the core, shoulders, and hip flexors while elevating the heart rate.'
  },
  {
    id: 'e9',
    title: 'Dumbbell Row',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '3-5 min',
    tags: ['Back', 'Arms', 'Unilateral'],
    difficulty: 'beginner',
    isFavorite: false,
    description: 'A unilateral back exercise that targets the latissimus dorsi, rhomboids, and biceps.'
  },
  {
    id: 'e10',
    title: 'Kettlebell Swing',
    type: 'exercise',
    creator: 'FitBloom Trainer',
    imageUrl: '/placeholder.svg',
    duration: '5-8 min',
    tags: ['Hips', 'Power', 'Kettlebell'],
    difficulty: 'intermediate',
    isFavorite: false,
    description: 'A dynamic exercise that targets the posterior chain and develops power and explosive strength.'
  }
];

// Mock Workouts
export const mockWorkouts: ItemType[] = [
  {
    id: 'w1',
    title: 'Full Body HIIT',
    type: 'workout',
    creator: 'Emma Johnson',
    imageUrl: '/placeholder.svg',
    duration: '30 min',
    tags: ['HIIT', 'Full Body', 'Intense'],
    difficulty: 'intermediate',
    isFavorite: true,
    description: 'A high-intensity interval training workout that targets all major muscle groups.'
  },
  {
    id: 'w2',
    title: 'Upper Body Strength',
    type: 'workout',
    creator: 'Marcus Lee',
    imageUrl: '/placeholder.svg',
    duration: '45 min',
    tags: ['Strength', 'Upper Body', 'Weights'],
    difficulty: 'intermediate',
    isFavorite: false,
    description: 'A comprehensive upper body workout focusing on building strength and muscle.'
  },
  {
    id: 'w3',
    title: 'Lower Body Burnout',
    type: 'workout',
    creator: 'Sophia Martinez',
    imageUrl: '/placeholder.svg',
    duration: '40 min',
    tags: ['Lower Body', 'Endurance', 'Burn'],
    difficulty: 'advanced',
    isFavorite: false,
    description: 'An intense lower body workout designed to build strength and endurance in the legs and glutes.'
  },
  {
    id: 'w4',
    title: 'Core Crusher',
    type: 'workout',
    creator: 'Alex Thompson',
    imageUrl: '/placeholder.svg',
    duration: '20 min',
    tags: ['Core', 'Abs', 'Stability'],
    difficulty: 'intermediate',
    isFavorite: true,
    description: 'A targeted core workout that strengthens the abdominals, obliques, and lower back.'
  },
  {
    id: 'w5',
    title: 'Mobility Flow',
    type: 'workout',
    creator: 'Maya Williams',
    imageUrl: '/placeholder.svg',
    duration: '25 min',
    tags: ['Mobility', 'Recovery', 'Flexibility'],
    difficulty: 'beginner',
    isFavorite: false,
    description: 'A gentle flow that improves joint mobility, flexibility, and movement quality.'
  },
  {
    id: 'w6',
    title: 'Cardio Blast',
    type: 'workout',
    creator: 'James Wilson',
    imageUrl: '/placeholder.svg',
    duration: '35 min',
    tags: ['Cardio', 'Fat Burn', 'Endurance'],
    difficulty: 'intermediate',
    isFavorite: true,
    description: 'A heart-pumping cardio workout designed to improve cardiovascular fitness and burn calories.'
  },
  {
    id: 'w7',
    title: 'Yoga for Athletes',
    type: 'workout',
    creator: 'Leila Patel',
    imageUrl: '/placeholder.svg',
    duration: '50 min',
    tags: ['Yoga', 'Flexibility', 'Recovery'],
    difficulty: 'beginner',
    isFavorite: false,
    description: 'A yoga sequence specifically designed for athletes to improve flexibility, balance, and recovery.'
  },
  {
    id: 'w8',
    title: 'Bodyweight Bootcamp',
    type: 'workout',
    creator: 'Ryan Garcia',
    imageUrl: '/placeholder.svg',
    duration: '40 min',
    tags: ['Bodyweight', 'Circuit', 'Strength'],
    difficulty: 'intermediate',
    isFavorite: false,
    description: 'A challenging bodyweight circuit workout that builds strength, endurance, and mobility.'
  },
  {
    id: 'w9',
    title: 'Power Yoga',
    type: 'workout',
    creator: 'Zoe Chen',
    imageUrl: '/placeholder.svg',
    duration: '60 min',
    tags: ['Yoga', 'Power', 'Flow'],
    difficulty: 'intermediate',
    isFavorite: true,
    description: 'A dynamic yoga practice that builds strength, flexibility, and mental focus.'
  }
];

// Mock Programs
export const mockPrograms: ItemType[] = [
  {
    id: 'p1',
    title: '30-Day Strength Challenge',
    type: 'program',
    creator: 'FitBloom Academy',
    imageUrl: '/placeholder.svg',
    duration: '4 weeks',
    tags: ['Strength', 'Progressive', 'Structured'],
    difficulty: 'intermediate',
    isFavorite: true,
    description: 'A month-long progressive strength program designed to build muscle and increase overall strength.'
  },
  {
    id: 'p2',
    title: 'Couch to 5K',
    type: 'program',
    creator: 'Run Club',
    imageUrl: '/placeholder.svg',
    duration: '8 weeks',
    tags: ['Running', 'Beginner', 'Cardio'],
    difficulty: 'beginner',
    isFavorite: false,
    description: 'A beginner-friendly running program that takes you from zero to running 5 kilometers continuously.'
  },
  {
    id: 'p3',
    title: 'Mobility Mastery',
    type: 'program',
    creator: 'Movement Lab',
    imageUrl: '/placeholder.svg',
    duration: '3 weeks',
    tags: ['Mobility', 'Flexibility', 'Recovery'],
    difficulty: 'beginner',
    isFavorite: true,
    description: 'A comprehensive program focused on improving joint mobility, flexibility, and movement quality.'
  },
  {
    id: 'p4',
    title: 'Athlete Performance',
    type: 'program',
    creator: 'Elite Sport Science',
    imageUrl: '/placeholder.svg',
    duration: '12 weeks',
    tags: ['Performance', 'Athletic', 'Advanced'],
    difficulty: 'advanced',
    isFavorite: false,
    description: 'A comprehensive athletic development program designed to enhance speed, power, agility, and sport-specific performance.'
  },
  {
    id: 'p5',
    title: 'Body Transformation',
    type: 'program',
    creator: 'Transform Fitness',
    imageUrl: '/placeholder.svg',
    duration: '8 weeks',
    tags: ['Weight Loss', 'Strength', 'Nutrition'],
    difficulty: 'intermediate',
    isFavorite: true,
    description: 'A complete body transformation program that combines strength training, cardio, and nutrition guidance.'
  },
  {
    id: 'p6',
    title: 'Yoga Journey',
    type: 'program',
    creator: 'Zen Flow Yoga',
    imageUrl: '/placeholder.svg',
    duration: '6 weeks',
    tags: ['Yoga', 'Mindfulness', 'Progression'],
    difficulty: 'beginner',
    isFavorite: false,
    description: 'A progressive yoga program that builds from basic poses to more advanced sequences.'
  }
];

// Mock Collections
export const mockCollections: CollectionType[] = [
  {
    id: 'c1',
    name: 'My Morning Routine',
    description: 'Quick exercises to start the day energized and focused',
    coverImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    itemCount: 5,
    lastUpdated: '2 days ago'
  },
  {
    id: 'c2',
    name: 'Recovery Days',
    description: 'Low intensity workouts for active recovery days',
    coverImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    itemCount: 8,
    lastUpdated: '1 week ago'
  },
  {
    id: 'c3',
    name: 'Pre-Season Training',
    description: 'Workouts to prepare for the upcoming soccer season',
    coverImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    itemCount: 12,
    lastUpdated: '3 days ago'
  },
  {
    id: 'c4',
    name: 'Travel Workouts',
    description: 'No-equipment workouts that can be done anywhere',
    coverImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    itemCount: 7,
    lastUpdated: '2 weeks ago'
  },
  {
    id: 'c5',
    name: 'Core Strength',
    description: 'Focused exercises to build core strength and stability',
    coverImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    itemCount: 10,
    lastUpdated: '4 days ago'
  }
];
