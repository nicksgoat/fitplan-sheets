
// Fix for the ClubFeed.tsx file
// Add null check for item.workouts on line 60
const workoutName = item.workouts?.name || 'Unknown Workout';
