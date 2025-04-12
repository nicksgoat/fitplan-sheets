
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface SalesData {
  month: string;
  programs: number;
  workouts: number;
  clubs: number;
  total: number;
}

interface ProductTypeSales {
  name: string;
  value: number;
}

const SalesAnalytics = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [monthlySales, setMonthlySales] = useState<SalesData[]>([]);
  const [productTypeSales, setProductTypeSales] = useState<ProductTypeSales[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchSalesData = async () => {
      setIsLoading(true);
      
      try {
        // Define date range - last 6 months
        const endDate = new Date();
        const startDate = subMonths(endDate, 5); // 6 months including current
        
        // Get all months in the interval
        const months = eachMonthOfInterval({
          start: startDate,
          end: endDate
        });
        
        // Initialize sales data
        const salesByMonth: SalesData[] = months.map(month => ({
          month: format(month, 'MMM yyyy'),
          programs: 0,
          workouts: 0,
          clubs: 0,
          total: 0
        }));
        
        // Fetch program sales
        const { data: programSales, error: programError } = await supabase
          .from('program_purchases')
          .select('purchase_date, creator_earnings')
          .eq('creator_id', user.id)
          .gte('purchase_date', startDate.toISOString())
          .lte('purchase_date', endDate.toISOString());
          
        if (programError) throw programError;
        
        // Fetch workout sales
        const { data: workoutSales, error: workoutError } = await supabase
          .from('workout_purchases')
          .select('purchase_date, creator_earnings')
          .eq('creator_id', user.id)
          .gte('purchase_date', startDate.toISOString())
          .lte('purchase_date', endDate.toISOString());
          
        if (workoutError) throw workoutError;
        
        // Fetch club subscription data
        const { data: clubSubs, error: clubError } = await supabase
          .from('club_subscriptions')
          .select('created_at, plan_amount')
          .eq('owner_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
          
        if (clubError) throw clubError;
        
        // Process program sales
        (programSales || []).forEach(sale => {
          const saleMonth = format(new Date(sale.purchase_date), 'MMM yyyy');
          const monthData = salesByMonth.find(m => m.month === saleMonth);
          if (monthData) {
            monthData.programs += sale.creator_earnings || 0;
            monthData.total += sale.creator_earnings || 0;
          }
        });
        
        // Process workout sales
        (workoutSales || []).forEach(sale => {
          const saleMonth = format(new Date(sale.purchase_date), 'MMM yyyy');
          const monthData = salesByMonth.find(m => m.month === saleMonth);
          if (monthData) {
            monthData.workouts += sale.creator_earnings || 0;
            monthData.total += sale.creator_earnings || 0;
          }
        });
        
        // Process club subscriptions
        (clubSubs || []).forEach(sub => {
          const subMonth = format(new Date(sub.created_at), 'MMM yyyy');
          const monthData = salesByMonth.find(m => m.month === subMonth);
          if (monthData) {
            monthData.clubs += (sub.plan_amount * 0.9) || 0; // Apply platform fee
            monthData.total += (sub.plan_amount * 0.9) || 0;
          }
        });
        
        setMonthlySales(salesByMonth);
        
        // Calculate product type breakdown
        const programTotal = programSales?.reduce((sum, sale) => sum + (sale.creator_earnings || 0), 0) || 0;
        const workoutTotal = workoutSales?.reduce((sum, sale) => sum + (sale.creator_earnings || 0), 0) || 0;
        const clubTotal = clubSubs?.reduce((sum, sub) => sum + ((sub.plan_amount * 0.9) || 0), 0) || 0;
        
        setProductTypeSales([
          { name: 'Programs', value: programTotal },
          { name: 'Workouts', value: workoutTotal },
          { name: 'Club Memberships', value: clubTotal }
        ]);
        
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalesData();
  }, [user]);
  
  // Calculate total earnings
  const totalEarnings = monthlySales.reduce((sum, month) => sum + month.total, 0);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-6">Sales Analytics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <CardDescription>After platform fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Selling Product</CardTitle>
            <CardDescription>Based on earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productTypeSales.length > 0 
                ? productTypeSales.sort((a, b) => b.value - a.value)[0]?.name
                : 'No data'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Month</CardTitle>
            <CardDescription>Based on earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlySales.length > 0 
                ? monthlySales.sort((a, b) => b.total - a.total)[0]?.month
                : 'No data'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Last 6 months earnings breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {monthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="programs"
                    name="Programs"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="workouts"
                    name="Workouts"
                    stroke="#ffc658"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Revenue Distribution</CardTitle>
            <CardDescription>Earnings by product type</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {productTypeSales.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productTypeSales}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="value" name="Revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalytics;
