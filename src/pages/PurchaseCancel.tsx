
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PurchaseCancel() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-dark-200 border border-dark-300 rounded-lg p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold mb-4">Purchase Cancelled</h1>
        
        <p className="text-gray-400 mb-6">
          Your purchase has been cancelled. No payment has been processed.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={() => navigate(-1)}
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90 w-full"
          >
            Go Back
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
