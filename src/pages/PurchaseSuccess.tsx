
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function PurchaseSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    if (sessionId) {
      console.log('Purchase completed with session ID:', sessionId);
      // You can add analytics or other tracking here if needed
    }
  }, [sessionId]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-dark-200 border border-dark-300 rounded-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold mb-4">Purchase Successful!</h1>
        
        <p className="text-gray-400 mb-6">
          Thank you for your purchase. You now have access to this content in your library.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={() => navigate('/library')}
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90 w-full"
          >
            Go to My Library
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
