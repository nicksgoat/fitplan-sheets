
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/ui/container';
import CreatorHeader from '@/components/creator/CreatorHeader';
import ProductsOverview from '@/components/creator/ProductsOverview';
import ProgramsManagement from '@/components/creator/ProgramsManagement';
import WorkoutsManagement from '@/components/creator/WorkoutsManagement';
import ClubsManagement from '@/components/creator/ClubsManagement';
import SalesAnalytics from '@/components/creator/SalesAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const CreatorDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-semibold mb-4">
            Please sign in to access your Creator Dashboard
          </h1>
          <p className="text-muted-foreground">
            You need to be signed in to manage your products and view analytics
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <CreatorHeader />
      
      <Tabs 
        defaultValue="overview" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <TabsList className="grid grid-cols-5 h-auto w-full max-w-4xl mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="overview" className="mt-0">
            <ProductsOverview />
          </TabsContent>
          
          <TabsContent value="programs" className="mt-0">
            <ProgramsManagement />
          </TabsContent>
          
          <TabsContent value="workouts" className="mt-0">
            <WorkoutsManagement />
          </TabsContent>
          
          <TabsContent value="clubs" className="mt-0">
            <ClubsManagement />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <SalesAnalytics />
          </TabsContent>
        </div>
      </Tabs>
    </Container>
  );
};

export default CreatorDashboard;
