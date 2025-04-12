
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SalesData = {
  title: string;
  amount: number;
  type: 'program' | 'workout' | 'club';
  date: string;
};

type SalesByPeriod = {
  period: string;
  programs: number;
  workouts: number;
  clubs: number;
  total: number;
};

export const SalesAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'year'>('30days');
  
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['creator-sales', user?.id, timeRange],
    queryFn: async () => {
      if (!user) return { total: 0, items: [], byPeriod: [] };
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      // Fetch program sales
      const { data: programSales, error: programError } = await supabase
        .from('program_purchases')
        .select('program_id, amount_paid, purchase_date, programs(name)')
        .gte('purchase_date', startDate.toISOString())
        .lte('purchase_date', endDate.toISOString())
        .in('program_id', 
          supabase
            .from('programs')
            .select('id')
            .eq('user_id', user.id)
        );
      
      if (programError) {
        console.error('Error fetching program sales:', programError);
      }
      
      // Fetch workout sales
      const { data: workoutSales, error: workoutError } = await supabase
        .from('workout_purchases')
        .select('workout_id, amount_paid, purchase_date, workouts(name)')
        .gte('purchase_date', startDate.toISOString())
        .lte('purchase_date', endDate.toISOString())
        .in('workout_id', 
          supabase
            .from('workouts')
            .select('id')
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
            )
        );
      
      if (workoutError) {
        console.error('Error fetching workout sales:', workoutError);
      }
      
      // Fetch club membership payments
      const { data: clubSales, error: clubError } = await supabase
        .from('club_subscriptions')
        .select('club_id, plan_amount, created_at, clubs(name)')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .in('club_id', 
          supabase
            .from('clubs')
            .select('id')
            .eq('creator_id', user.id)
        );
      
      if (clubError) {
        console.error('Error fetching club sales:', clubError);
      }
      
      // Combine and format data
      const salesItems: SalesData[] = [
        ...(programSales || []).map(sale => ({
          title: sale.programs?.name || 'Unknown Program',
          amount: sale.amount_paid || 0,
          type: 'program' as const,
          date: sale.purchase_date
        })),
        ...(workoutSales || []).map(sale => ({
          title: sale.workouts?.name || 'Unknown Workout',
          amount: sale.amount_paid || 0,
          type: 'workout' as const,
          date: sale.purchase_date
        })),
        ...(clubSales || []).map(sale => ({
          title: sale.clubs?.name || 'Unknown Club',
          amount: sale.plan_amount || 0,
          type: 'club' as const,
          date: sale.created_at
        })),
      ];
      
      // Calculate total earnings
      const total = salesItems.reduce((sum, item) => sum + item.amount, 0);
      
      // Group data by period for chart
      const periodData: SalesByPeriod[] = [];
      
      // Group by appropriate periods based on time range
      const getFormattedPeriod = (date: string): string => {
        const d = new Date(date);
        
        if (timeRange === '7days') {
          return d.toLocaleDateString('en-US', { weekday: 'short' }); // Day of week
        } else if (timeRange === '30days') {
          return `${d.getMonth() + 1}/${d.getDate()}`; // MM/DD
        } else if (timeRange === '90days') {
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Month Day
        } else {
          return d.toLocaleDateString('en-US', { month: 'short' }); // Month
        }
      };
      
      // Group sales by period
      salesItems.forEach(item => {
        const period = getFormattedPeriod(item.date);
        
        // Find or create period in data
        let periodEntry = periodData.find(p => p.period === period);
        if (!periodEntry) {
          periodEntry = { period, programs: 0, workouts: 0, clubs: 0, total: 0 };
          periodData.push(periodEntry);
        }
        
        // Add amount to appropriate category
        if (item.type === 'program') {
          periodEntry.programs += item.amount;
        } else if (item.type === 'workout') {
          periodEntry.workouts += item.amount;
        } else if (item.type === 'club') {
          periodEntry.clubs += item.amount;
        }
        
        periodEntry.total += item.amount;
      });
      
      // Sort periods chronologically
      periodData.sort((a, b) => {
        // Simple string comparison for basic sorting
        // This works fine for most date formats but might need improvement
        return a.period.localeCompare(b.period);
      });
      
      return {
        total,
        items: salesItems,
        byPeriod: periodData
      };
    },
    enabled: !!user
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sales Analytics</h2>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px] bg-dark-300 border-dark-300 text-white">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="bg-dark-300 border-dark-300 text-white">
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-dark-200 border-dark-300 text-white">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription className="text-gray-400">All time earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? '...' : formatCurrency(salesData?.total || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-200 border-dark-300 text-white">
          <CardHeader>
            <CardTitle>Products Sold</CardTitle>
            <CardDescription className="text-gray-400">Total products sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? '...' : salesData?.items.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-200 border-dark-300 text-white">
          <CardHeader>
            <CardTitle>Avg. Order Value</CardTitle>
            <CardDescription className="text-gray-400">Average revenue per sale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? '...' : 
                salesData?.items.length ? 
                formatCurrency((salesData.total / salesData.items.length)) : 
                '$0.00'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-dark-200 border-dark-300 text-white">
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
          <CardDescription className="text-gray-400">
            {timeRange === '7days' ? 'Daily' : 
             timeRange === '30days' ? 'Daily' :
             timeRange === '90days' ? 'Daily' : 'Monthly'} sales breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              Loading chart data...
            </div>
          ) : salesData?.byPeriod.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No sales data available for the selected time period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData?.byPeriod || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="period" stroke="#aaa" />
                <YAxis tickFormatter={(value) => `$${value}`} stroke="#aaa" />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}
                />
                <Bar dataKey="total" name="Total" fill="#8884d8" radius={[4, 4, 0, 0]}>
                  {salesData?.byPeriod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#8884d8" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
