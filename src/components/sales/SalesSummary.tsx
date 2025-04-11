
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalesSummaryProps {
  type: 'revenue' | 'purchases' | 'conversions' | 'monthlyRevenue';
  icon: React.ReactNode;
}

export default function SalesSummary({ type, icon }: SalesSummaryProps) {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['sales-summary', type, user?.id],
    queryFn: async () => {
      if (!user) return { value: 0, change: 0 };
      
      let query;
      
      // Different queries based on the summary type
      switch (type) {
        case 'revenue':
          // Total revenue from all sales
          const { data: revenueData } = await supabase.rpc('run_sql_query', {
            query: `
              SELECT COALESCE(SUM(creator_earnings), 0) as value,
              (SELECT COALESCE(SUM(creator_earnings), 0) FROM 
                (SELECT * FROM workout_purchases WHERE user_id = '${user.id}'
                 UNION ALL SELECT * FROM program_purchases WHERE user_id = '${user.id}') p
               WHERE purchase_date > (NOW() - INTERVAL '30 days')
              ) / NULLIF((SELECT COALESCE(SUM(creator_earnings), 0) FROM 
                (SELECT * FROM workout_purchases WHERE user_id = '${user.id}'
                 UNION ALL SELECT * FROM program_purchases WHERE user_id = '${user.id}') p
               WHERE purchase_date BETWEEN (NOW() - INTERVAL '60 days') AND (NOW() - INTERVAL '30 days')
              ), 0) - 1 as change
              FROM 
              (SELECT * FROM workout_purchases WHERE user_id = '${user.id}'
               UNION ALL SELECT * FROM program_purchases WHERE user_id = '${user.id}') combined
            `
          });
          return revenueData?.[0] || { value: 0, change: 0 };
          
        case 'purchases':
          // Count of total purchases
          const { data: purchaseData } = await supabase.rpc('run_sql_query', {
            query: `
              SELECT COUNT(*) as value,
              (SELECT COUNT(*) FROM 
                (SELECT * FROM workout_purchases WHERE user_id = '${user.id}'
                 UNION ALL SELECT * FROM program_purchases WHERE user_id = '${user.id}') p
               WHERE purchase_date > (NOW() - INTERVAL '30 days')
              ) / NULLIF((SELECT COUNT(*) FROM 
                (SELECT * FROM workout_purchases WHERE user_id = '${user.id}'
                 UNION ALL SELECT * FROM program_purchases WHERE user_id = '${user.id}') p
               WHERE purchase_date BETWEEN (NOW() - INTERVAL '60 days') AND (NOW() - INTERVAL '30 days')
              ), 0) - 1 as change
              FROM 
              (SELECT * FROM workout_purchases WHERE user_id = '${user.id}'
               UNION ALL SELECT * FROM program_purchases WHERE user_id = '${user.id}') combined
            `
          });
          return purchaseData?.[0] || { value: 0, change: 0 };
        
        case 'conversions':
          // Simple sample conversion rate (we don't have view data, so this is a placeholder)
          return { value: 4.8, change: 0.2 };
        
        case 'monthlyRevenue':
          // This month's revenue
          const { data: monthlyData } = await supabase.rpc('run_sql_query', {
            query: `
              SELECT COALESCE(SUM(creator_earnings), 0) as value,
              (SELECT COALESCE(SUM(creator_earnings), 0) FROM 
                (SELECT * FROM workout_purchases WHERE user_id = '${user.id}'
                 UNION ALL SELECT * FROM program_purchases WHERE user_id = '${user.id}') p
               WHERE purchase_date > (NOW() - INTERVAL '30 days')
              ) / NULLIF((SELECT COALESCE(SUM(creator_earnings), 0) FROM 
                (SELECT * FROM workout_purchases WHERE user_id = '${user.id}'
                 UNION ALL SELECT * FROM program_purchases WHERE user_id = '${user.id}') p
               WHERE purchase_date BETWEEN (NOW() - INTERVAL '60 days') AND (NOW() - INTERVAL '30 days')
              ), 0) - 1 as change
              FROM 
              (SELECT * FROM workout_purchases WHERE user_id = '${user.id}'
               UNION ALL SELECT * FROM program_purchases WHERE user_id = '${user.id}') combined
              WHERE purchase_date > (NOW() - INTERVAL '30 days')
            `
          });
          return monthlyData?.[0] || { value: 0, change: 0 };
        
        default:
          return { value: 0, change: 0 };
      }
    },
    enabled: !!user
  });
  
  const getTitle = () => {
    switch (type) {
      case 'revenue':
        return 'Total Revenue';
      case 'purchases':
        return 'Total Purchases';
      case 'conversions':
        return 'Conversion Rate';
      case 'monthlyRevenue':
        return 'Monthly Revenue';
      default:
        return '';
    }
  };
  
  const formatValue = () => {
    if (isLoading) return '...';
    
    switch (type) {
      case 'revenue':
      case 'monthlyRevenue':
        return `$${Number(data?.value || 0).toFixed(2)}`;
      case 'conversions':
        return `${Number(data?.value || 0).toFixed(1)}%`;
      default:
        return Number(data?.value || 0);
    }
  };
  
  const formatChange = () => {
    if (isLoading || data?.change === undefined) return '';
    
    const change = Number(data.change || 0);
    const isPositive = change > 0;
    const formattedChange = 
      type === 'conversions' ? 
        `${Math.abs(change).toFixed(1)}%` : 
        `${Math.abs(change * 100).toFixed(1)}%`;
    
    return (
      <span className={isPositive ? "text-green-500" : "text-red-500"}>
        {isPositive ? '↑' : '↓'} {formattedChange}
      </span>
    );
  };

  return (
    <Card className="bg-dark-100 border-dark-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{getTitle()}</CardTitle>
        <div className="rounded-full p-2 bg-dark-200">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatChange()} from last period
        </p>
      </CardContent>
    </Card>
  );
}
