
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRightIcon, DollarSign, Dumbbell, Heart, LucideIcon, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({ title, value, description, icon: Icon, iconColor = "text-primary" }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const ProductsOverview = () => {
  const { user } = useAuth();

  // Fetch count of programs created by user
  const { data: programsCount, isLoading: loadingPrograms } = useQuery({
    queryKey: ['creatorProgramsCount', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('programs')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });

  // Fetch count of workouts created by user
  const { data: workoutsCount, isLoading: loadingWorkouts } = useQuery({
    queryKey: ['creatorWorkoutsCount', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });

  // Fetch count of clubs created by user
  const { data: clubsCount, isLoading: loadingClubs } = useQuery({
    queryKey: ['creatorClubsCount', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });

  // Example sales data for the chart - in a real app this would come from the database
  const sampleSalesData = [
    { name: 'Mon', sales: 54 },
    { name: 'Tue', sales: 67 },
    { name: 'Wed', sales: 41 },
    { name: 'Thu', sales: 55 },
    { name: 'Fri', sales: 73 },
    { name: 'Sat', sales: 94 },
    { name: 'Sun', sales: 60 },
  ];

  const isLoading = loadingPrograms || loadingWorkouts || loadingClubs;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Creator Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Programs" 
          value={isLoading ? '-' : programsCount || 0} 
          description={`${programsCount === 1 ? 'Program' : 'Programs'} created`}
          icon={Package}
        />
        <StatCard 
          title="Total Workouts" 
          value={isLoading ? '-' : workoutsCount || 0} 
          description={`${workoutsCount === 1 ? 'Workout' : 'Workouts'} created`}
          icon={Dumbbell}
        />
        <StatCard 
          title="Clubs" 
          value={isLoading ? '-' : clubsCount || 0} 
          description={`${clubsCount === 1 ? 'Club' : 'Clubs'} managed`}
          icon={Users}
        />
        <StatCard 
          title="Sales" 
          value="$0" 
          description="Total sales this month"
          icon={DollarSign}
          iconColor="text-green-500"
        />
      </div>

      {/* Weekly Sales Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Weekly Sales</CardTitle>
          <CardDescription>
            Your sales performance during the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleSalesData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Content */}
      <h3 className="text-xl font-semibold mt-8">Recent Content</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : ((programsCount || 0) + (workoutsCount || 0) + (clubsCount || 0) === 0 ? (
          <Card className="md:col-span-3">
            <CardContent className="pt-6 text-center">
              <p className="mb-4 text-muted-foreground">You haven't created any content yet.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link to="/exercises/create">Create Exercise</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* These would be actual content cards in a real implementation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Example Program</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">This is where your recent programs would appear.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Heart className="h-3 w-3 mr-1" /> 0
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/creator">
                      View <ArrowRightIcon className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* More cards would follow... */}
          </>
        ))}
      </div>

    </div>
  );
};

export default ProductsOverview;
