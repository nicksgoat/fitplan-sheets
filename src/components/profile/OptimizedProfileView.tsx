
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Loader2, Calendar, Activity, Edit, User, Settings, Award, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

interface ProfileStats {
  total_workouts: number;
  total_exercise_logs: number;
  avg_workout_duration: number;
  workout_streak: number;
  longest_streak: number;
  favorite_exercise: string;
  recent_achievements: any[];
}

export default function OptimizedProfileView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
  
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async (): Promise<ProfileStats> => {
      if (!user?.id) return {
        total_workouts: 0,
        total_exercise_logs: 0,
        avg_workout_duration: 0,
        workout_streak: 0,
        longest_streak: 0,
        favorite_exercise: '',
        recent_achievements: []
      };
      
      // Get total workouts
      const { data: workouts, error: workoutsError } = await supabase
        .from('workout_logs')
        .select('count', { count: 'exact' })
        .eq('user_id', user.id);
        
      if (workoutsError) throw workoutsError;
      
      // Get exercise logs
      const { data: exerciseLogs, error: exercisesError } = await supabase
        .from('exercise_logs')
        .select('count', { count: 'exact' })
        .eq('user_id', user.id);
        
      if (exercisesError) throw exercisesError;
      
      // Get workout streak
      const { data: streak, error: streakError } = await supabase.rpc('calculate_workout_streak', {
        p_user_id: user.id
      });
      
      if (streakError) throw streakError;
      
      // Average workout duration
      const { data: durationsData, error: durationError } = await supabase
        .from('workout_logs')
        .select('duration')
        .eq('user_id', user.id);
        
      if (durationError) throw durationError;
      
      const avgDuration = durationsData && durationsData.length > 0 
        ? durationsData.reduce((sum, log) => sum + (log.duration || 0), 0) / durationsData.length 
        : 0;
      
      // This would normally come from a proper achievements system
      const recentAchievements = [
        { 
          id: '1', 
          title: 'First Workout', 
          description: 'Completed your first workout', 
          earned_at: new Date().toISOString(),
          icon: '🏋️' 
        },
        { 
          id: '2', 
          title: '5 Workout Streak', 
          description: 'Worked out 5 days in a row', 
          earned_at: new Date().toISOString(),
          icon: '🔥' 
        }
      ];
      
      return {
        total_workouts: workouts.count || 0,
        total_exercise_logs: exerciseLogs.count || 0,
        avg_workout_duration: Math.round(avgDuration),
        workout_streak: streak[0]?.current_streak || 0,
        longest_streak: streak[0]?.longest_streak || 0,
        favorite_exercise: 'Bench Press', // This would come from analytics
        recent_achievements: recentAchievements
      };
    },
    enabled: !!user?.id
  });
  
  const { data: recentWorkouts, isLoading: isWorkoutsLoading } = useQuery({
    queryKey: ['recent-workouts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*, workout:workout_id(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Calculate progress for the current week's workout goal
  // In a real app, this would be compared against the user's weekly goal
  const weeklyGoal = 5; // Example: 5 workouts per week
  const weeklyProgress = Math.min(100, ((stats?.workout_streak || 0) / weeklyGoal) * 100);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <p>Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-8">
      <Card className="border border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4 items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile?.display_name || user.email?.split('@')[0]}</CardTitle>
                <CardDescription>
                  Member since {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'recent'}
                </CardDescription>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">Fitness Enthusiast</Badge>
                  {stats?.workout_streak >= 5 && (
                    <Badge variant="secondary">🔥 {stats.workout_streak} Day Streak</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="md:w-auto w-full" onClick={() => navigate('/profile/edit')}>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Bio</h3>
            <p className="text-sm text-gray-300">{profile?.bio || 'No bio added yet.'}</p>
          </div>
        </CardContent>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-6 mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-fitbloom-purple" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Workouts Completed</span>
                      <span className="font-medium">{stats?.workout_streak || 0} / {weeklyGoal}</span>
                    </div>
                    <Progress value={weeklyProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-fitbloom-purple" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">{stats?.workout_streak || 0}</div>
                      <div className="text-xs text-gray-400">days in a row</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Longest Streak</div>
                      <div className="text-xl font-semibold">{stats?.longest_streak || 0} days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-fitbloom-purple" />
                  Recent Workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isWorkoutsLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-6 w-6 text-fitbloom-purple animate-spin" />
                  </div>
                ) : recentWorkouts && recentWorkouts.length > 0 ? (
                  <div className="space-y-3">
                    {recentWorkouts.map((workout) => (
                      <div key={workout.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{workout.workout?.name || 'Unnamed Workout'}</div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(workout.created_at), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline">{workout.duration} mins</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No recent workouts found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gray-900/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                    <Activity className="h-4 w-4 text-fitbloom-purple" />
                    Total Workouts
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <div className="text-2xl font-bold">{stats?.total_workouts || 0}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                    <Activity className="h-4 w-4 text-fitbloom-purple" />
                    Exercises Logged
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <div className="text-2xl font-bold">{stats?.total_exercise_logs || 0}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4 text-fitbloom-purple" />
                    Avg. Duration
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <div className="text-2xl font-bold">{stats?.avg_workout_duration || 0} mins</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                    <Award className="h-4 w-4 text-fitbloom-purple" />
                    Favorite Exercise
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <div className="text-sm font-medium">{stats?.favorite_exercise || 'None'}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Workout History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-400 py-8">
                  Detailed workout analytics will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Achievements</CardTitle>
                <CardDescription>Complete workouts to unlock achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recent_achievements && stats.recent_achievements.length > 0 ? (
                    stats.recent_achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-fitbloom-purple/20 flex items-center justify-center text-2xl">
                          {achievement.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <p className="text-sm text-gray-400">{achievement.description}</p>
                          <p className="text-xs text-gray-500">
                            Earned on {format(new Date(achievement.earned_at), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8">
                      Complete more workouts to earn achievements
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
