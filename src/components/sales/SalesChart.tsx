
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesChart() {
  const { user } = useAuth();
  
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-chart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get sales data by month for the past 6 months
      const { data } = await supabase.rpc('run_sql_query', {
        query: `
          WITH months AS (
            SELECT generate_series(
              date_trunc('month', NOW() - INTERVAL '5 months'),
              date_trunc('month', NOW()),
              '1 month'::interval
            ) AS month
          ),
          workout_data AS (
            SELECT 
              date_trunc('month', purchase_date) AS month,
              COALESCE(SUM(amount_paid), 0) AS workout_revenue,
              COUNT(*) AS workout_count
            FROM workout_purchases
            WHERE user_id = '${user.id}'
            AND purchase_date >= NOW() - INTERVAL '6 months'
            GROUP BY date_trunc('month', purchase_date)
          ),
          program_data AS (
            SELECT 
              date_trunc('month', purchase_date) AS month,
              COALESCE(SUM(amount_paid), 0) AS program_revenue,
              COUNT(*) AS program_count
            FROM program_purchases
            WHERE user_id = '${user.id}'
            AND purchase_date >= NOW() - INTERVAL '6 months'
            GROUP BY date_trunc('month', purchase_date)
          )
          SELECT 
            to_char(months.month, 'Mon') AS name,
            COALESCE(workout_revenue, 0) AS workout_revenue,
            COALESCE(program_revenue, 0) AS program_revenue,
            COALESCE(workout_count, 0) AS workout_count,
            COALESCE(program_count, 0) AS program_count,
            COALESCE(workout_revenue, 0) + COALESCE(program_revenue, 0) AS total_revenue
          FROM months
          LEFT JOIN workout_data ON months.month = workout_data.month
          LEFT JOIN program_data ON months.month = program_data.month
          ORDER BY months.month
        `
      });
      
      return data || [];
    },
    enabled: !!user
  });
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading chart data...</div>;
  }
  
  if (!salesData?.length) {
    // If no data, provide sample data
    const sampleData = [
      { name: 'Jan', workout_revenue: 0, program_revenue: 0, total_revenue: 0 },
      { name: 'Feb', workout_revenue: 0, program_revenue: 0, total_revenue: 0 },
      { name: 'Mar', workout_revenue: 0, program_revenue: 0, total_revenue: 0 },
      { name: 'Apr', workout_revenue: 0, program_revenue: 0, total_revenue: 0 },
      { name: 'May', workout_revenue: 0, program_revenue: 0, total_revenue: 0 },
      { name: 'Jun', workout_revenue: 0, program_revenue: 0, total_revenue: 0 },
    ];
    
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sampleData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorWorkout" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProgram" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
            <Area type="monotone" dataKey="workout_revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorWorkout)" name="Workout Revenue" />
            <Area type="monotone" dataKey="program_revenue" stroke="#82ca9d" fillOpacity={1} fill="url(#colorProgram)" name="Program Revenue" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="text-center mt-4 text-gray-400">No sales data available yet</div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={salesData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorWorkout" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProgram" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
          <Area type="monotone" dataKey="workout_revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorWorkout)" name="Workout Revenue" />
          <Area type="monotone" dataKey="program_revenue" stroke="#82ca9d" fillOpacity={1} fill="url(#colorProgram)" name="Program Revenue" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
