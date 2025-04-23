
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCreationForm } from '@/components/workout/EventCreationForm';

export default function ClubEventCreation() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  
  if (!clubId) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-500">Error: Club ID is missing</p>
          <Button 
            onClick={() => navigate('/clubs')} 
            variant="outline" 
            className="mt-4"
          >
            Go to Clubs
          </Button>
        </div>
      </div>
    );
  }
  
  const handleEventCreationSuccess = (eventId: string) => {
    // Navigate back to the club detail page
    navigate(`/clubs/${clubId}`);
  };
  
  const handleCancel = () => {
    navigate(`/clubs/${clubId}`);
  };
  
  return (
    <div className="container py-6 max-w-3xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="gap-2"
          onClick={() => navigate(`/clubs/${clubId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Club
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Create Club Event</h1>
      
      <EventCreationForm 
        clubId={clubId} 
        onSuccess={handleEventCreationSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
