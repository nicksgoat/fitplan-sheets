
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, BarChart3, ShoppingBag, Calendar } from 'lucide-react';
import SalesChart from '@/components/sales/SalesChart';
import PricingManagement from '@/components/sales/PricingManagement';
import PurchaseHistory from '@/components/sales/PurchaseHistory';
import SalesSummary from '@/components/sales/SalesSummary';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SalesDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SalesSummary type="revenue" icon={<DollarSign className="h-6 w-6" />} />
          <SalesSummary type="purchases" icon={<ShoppingBag className="h-6 w-6" />} />
          <SalesSummary type="conversions" icon={<BarChart3 className="h-6 w-6" />} />
          <SalesSummary type="monthlyRevenue" icon={<Calendar className="h-6 w-6" />} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-dark-200 border border-dark-300">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Management</TabsTrigger>
            <TabsTrigger value="history">Purchase History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-dark-100 border-dark-300">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Your sales performance over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesChart />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-4">
            <PricingManagement />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <PurchaseHistory />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SalesDashboard;
