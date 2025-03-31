
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ItemType } from '@/lib/types';
import ContentGrid from '@/components/ui/ContentGrid';

interface ProfileTabsProps {
  workouts: ItemType[];
  programs: ItemType[];
  savedContent: ItemType[];
}

const ProfileTabs = ({ workouts, programs, savedContent }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="workouts" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="workouts">Workouts</TabsTrigger>
        <TabsTrigger value="programs">Programs</TabsTrigger>
        <TabsTrigger value="saved">Saved</TabsTrigger>
      </TabsList>
      
      <TabsContent value="workouts" className="mt-0">
        {workouts.length > 0 ? (
          <ContentGrid items={workouts} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No workouts created yet
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="programs" className="mt-0">
        {programs.length > 0 ? (
          <ContentGrid items={programs} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No programs created yet
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="saved" className="mt-0">
        {savedContent.length > 0 ? (
          <ContentGrid items={savedContent} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No saved content yet
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
