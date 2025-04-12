
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, BookOpen, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProductsOverviewProps {
  onNavigate: (tab: string) => void;
}

type ProductCounts = {
  programs: number;
  workouts: number;
  clubs: number;
};

export const ProductsOverview: React.FC<ProductsOverviewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  
  const { data: counts, isLoading } = useQuery({
    queryKey: ['creator-products-count', user?.id],
    queryFn: async (): Promise<ProductCounts> => {
      if (!user) return { programs: 0, workouts: 0, clubs: 0 };
      
      // Get programs count
      const { count: programsCount } = await supabase
        .from('programs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      // Get workouts count (across all weeks)
      const { count: workoutsCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .in('week_id', 
          supabase
            .from('weeks')
            .select('id')
            .in('program_id',
              supabase
                .from('programs')
                .select('id')
                .eq('user_id', user.id)
            )
        );
      
      // Get clubs count
      const { count: clubsCount } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);
      
      return {
        programs: programsCount || 0,
        workouts: workoutsCount || 0,
        clubs: clubsCount || 0
      };
    },
    enabled: !!user
  });
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-dark-200 border-dark-300 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">Programs</CardTitle>
            <Dumbbell className="h-5 w-5 text-fitbloom-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? '...' : counts?.programs || 0}</div>
            <p className="text-muted-foreground text-sm mt-1">Active Programs</p>
            <Button 
              onClick={() => onNavigate('programs')} 
              variant="outline"
              className="mt-4 w-full text-white border-gray-700 hover:bg-gray-700"
            >
              Manage Programs
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">Workouts</CardTitle>
            <BookOpen className="h-5 w-5 text-fitbloom-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? '...' : counts?.workouts || 0}</div>
            <p className="text-muted-foreground text-sm mt-1">Active Workouts</p>
            <Button 
              onClick={() => onNavigate('workouts')} 
              variant="outline"
              className="mt-4 w-full text-white border-gray-700 hover:bg-gray-700"
            >
              Manage Workouts
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">Clubs</CardTitle>
            <Users className="h-5 w-5 text-fitbloom-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? '...' : counts?.clubs || 0}</div>
            <p className="text-muted-foreground text-sm mt-1">Active Clubs</p>
            <Button 
              onClick={() => onNavigate('clubs')} 
              variant="outline"
              className="mt-4 w-full text-white border-gray-700 hover:bg-gray-700"
            >
              Manage Clubs
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-dark-200 border-dark-300 text-white">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription className="text-gray-400">
            Track your earnings across all your products
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-gray-400 mb-2">Revenue statistics will appear here once you have sales.</p>
          <Button 
            onClick={() => onNavigate('analytics')} 
            variant="default"
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          >
            View Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
