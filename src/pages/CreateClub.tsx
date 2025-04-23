
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CreateClubForm } from '@/components/clubs/CreateClubForm';

const CreateClub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-lg mx-auto py-6 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/clubs')}
        className="flex items-center mb-4"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Clubs
      </Button>
      
      <Card className="p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create a New Club</h1>
        <CreateClubForm />
      </Card>
    </div>
  );
};

export default CreateClub;
