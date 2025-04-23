
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, Calendar, Activity, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfWeek, endOfWeek, getISOWeek } from 'date-fns';

const COLORS = ['#6c5ce7', '#fd79a8', '#00cec9', '#fdcb6e', '#e17055', '#74b9ff'];

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const [timeFrame, setTimeFrame] = useState('week'); // week, month, year
  
  const { data: workoutLogs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['workout-logs', user?.id, timeFrame],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let startDate;
      
      switch(timeFrame) {
        case 'week':
          startDate = subDays(new Date(), 7);
          break;
        case 'month':
          startDate = subDays(new Date(), 30);
          break;
        case 'year':
        default:
          startDate = subDays(new Date(), 365);
          break;
      }
      
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  const { data: workoutAnalytics } = useQuery({
    queryKey: ['workout-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.rpc('get_workout_log_counts', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user?.id
  });
  
  const { data: exerciseStats } = useQuery({
    queryKey: ['exercise-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.rpc('get_most_used_exercises', {
        p_user_id: user.id,
        p_limit: 10
      });
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user?.id
  });
  
  const { data: streakData } = useQuery({
    queryKey: ['workout-streak', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.rpc('calculate_workout_streak', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      // Return first row (should be only one)
      return data[0] || { current_streak: 0, longest_streak: 0 };
    },
    enabled: !!user?.id
  });
  
  // Format data for charts
  const activityData = React.useMemo(() => {
    if (!workoutLogs) return [];
    
    // Group workouts by day
    const grouped = workoutLogs.reduce((acc, log) => {
      const date = format(new Date(log.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          duration: 0,
          displayDate: format(new Date(log.created_at), 'MMM dd')
        };
      }
      acc[date].count += 1;
      acc[date].duration += log.duration || 0;
      return acc;
    }, {});
    
    return Object.values(grouped);
  }, [workoutLogs]);
  
  const muscleGroupData = React.useMemo(() => {
    if (!exerciseStats) return [];
    
    // This is simplified - in a real app you would track muscle groups for each exercise
    return exerciseStats.map((stat, index) => ({
      name: stat.exercise_name,
      value: stat.usage_count,
      color: COLORS[index % COLORS.length]
    })).slice(0, 6); // Limit to top 6 for pie chart
  }, [exerciseStats]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <p>Please sign in to view your analytics</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fitness Analytics Dashboard</h2>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-fitbloom-purple" />
              Total Workouts
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <p className="text-3xl font-bold">{workoutLogs?.length || 0}</p>
            <p className="text-xs text-gray-400">in selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-fitbloom-purple" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <p className="text-3xl font-bold">{streakData?.current_streak || 0}</p>
            <p className="text-xs text-gray-400">days in a row</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-fitbloom-purple" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <p className="text-3xl font-bold">{streakData?.longest_streak || 0}</p>
            <p className="text-xs text-gray-400">consecutive days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-fitbloom-purple" />
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <p className="text-3xl font-bold">
              {workoutLogs ? Math.round(workoutLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60) : 0}
            </p>
            <p className="text-xs text-gray-400">hours of training</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-fitbloom-purple" />
              Workout Activity
            </CardTitle>
            <CardDescription>
              Your workout frequency and duration over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogsLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 text-fitbloom-purple animate-spin" />
              </div>
            ) : activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="displayDate" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '8px' }} 
                    labelStyle={{ color: '#fff' }} 
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Workouts"
                    stroke="#6c5ce7"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="duration"
                    name="Duration (mins)"
                    stroke="#00cec9"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-gray-400">No workout data available for the selected period</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-fitbloom-purple" />
              Muscle Group Focus
            </CardTitle>
            <CardDescription>
              Distribution of exercises by targeted muscle groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogsLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 text-fitbloom-purple animate-spin" />
              </div>
            ) : muscleGroupData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={muscleGroupData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {muscleGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '8px' }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-gray-400">No exercise data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-fitbloom-purple" />
              Most Used Exercises
            </CardTitle>
            <CardDescription>
              Your favorite exercises by frequency of use
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogsLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 text-fitbloom-purple animate-spin" />
              </div>
            ) : exerciseStats && exerciseStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={exerciseStats.slice(0, 8)} // Limit to top 8
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis 
                    dataKey="exercise_name" 
                    type="category" 
                    stroke="#888" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '8px' }} 
                    formatter={(value) => [`${value} uses`, 'Frequency']}
                  />
                  <Bar 
                    dataKey="usage_count" 
                    name="Times Used" 
                    fill="#6c5ce7" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-gray-400">No exercise data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
