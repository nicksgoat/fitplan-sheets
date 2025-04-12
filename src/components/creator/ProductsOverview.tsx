
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign, Package, Users, Activity, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface StatsData {
  totalPrograms: number;
  totalWorkouts: number;
  totalRevenue: number;
  activeClubs: number;
  isLoading: boolean;
}

const ProductsOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalPrograms: 0,
    totalWorkouts: 0,
    totalRevenue: 0,
    activeClubs: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Get programs count
        const { count: programsCount } = await supabase
          .from('programs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get workouts count (that are directly monetized, not part of programs)
        const { count: workoutsCount } = await supabase
          .from('workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_purchasable', true);

        // Get clubs count
        const { count: clubsCount } = await supabase
          .from('clubs')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', user.id);

        // Calculate revenue from program purchases
        const { data: programPurchases } = await supabase
          .from('program_purchases')
          .select('amount_paid, creator_earnings')
          .eq('creator_id', user.id);

        // Calculate revenue from workout purchases
        const { data: workoutPurchases } = await supabase
          .from('workout_purchases')
          .select('amount_paid, creator_earnings')
          .eq('creator_id', user.id);

        // Calculate combined revenue
        const programRevenue = (programPurchases || []).reduce(
          (total, purchase) => total + (purchase.creator_earnings || 0),
          0
        );
        
        const workoutRevenue = (workoutPurchases || []).reduce(
          (total, purchase) => total + (purchase.creator_earnings || 0),
          0
        );

        setStats({
          totalPrograms: programsCount || 0,
          totalWorkouts: workoutsCount || 0,
          totalRevenue: programRevenue + workoutRevenue,
          activeClubs: clubsCount || 0,
          isLoading: false,
        });

      } catch (error) {
        console.error('Error fetching creator stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, [user]);

  if (stats.isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Products Overview</h2>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button asChild variant="outline" size="sm" className="h-8">
            <Link to="/programs/create">Create Program</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8">
            <Link to="/workouts/create">Create Workout</Link>
          </Button>
          <Button asChild variant="default" size="sm" className="h-8">
            <Link to="/clubs/create">Create Club</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">After platform fees</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">Total programs created</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">Monetized workouts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clubs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClubs}</div>
            <p className="text-xs text-muted-foreground">Active clubs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Your latest purchases in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-6">No recent sales data available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Products Overview</CardTitle>
            <CardDescription>View performance by product type</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-6">No product performance data available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductsOverview;
