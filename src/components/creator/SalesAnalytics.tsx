
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SalesAnalytics = () => {
  const { user } = useAuth();

  // Sample data for demonstration
  // In a real app, this would come from API calls to the backend
  const monthlySalesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
  ];

  const productSalesData = [
    { name: 'Programs', value: 400 },
    { name: 'Workouts', value: 300 },
    { name: 'Club Memberships', value: 300 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Charts */}
      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Sales</TabsTrigger>
          <TabsTrigger value="products">Product Breakdown</TabsTrigger>
          <TabsTrigger value="customers">Customer Growth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales</CardTitle>
              <CardDescription>
                Your sales performance over the past 6 months.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Sales ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Product Type</CardTitle>
              <CardDescription>
                Distribution of revenue across different products.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productSalesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {productSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>
                New customers acquired over time.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#82ca9d" name="New Customers" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* No Sales Yet placeholder */}
      {true && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-muted p-3">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-lg font-medium">No Sales Yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-md">
              When you start making sales, detailed analytics will appear here. 
              Try promoting your products on social media to get your first customers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesAnalytics;
