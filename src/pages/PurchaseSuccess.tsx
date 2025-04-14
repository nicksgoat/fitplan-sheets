
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Share2 } from 'lucide-react';
import EnhancedShareButton from '@/components/share/EnhancedShareButton';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const [itemType, setItemType] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const type = searchParams.get('item');
    const id = searchParams.get('id');
    const guest = searchParams.get('guest') === 'true';
    
    if (type) setItemType(type);
    if (id) setItemId(id);
    setIsGuest(guest);
    
    // Track purchase conversion
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'purchase_complete', {
          item_type: type,
          item_id: id,
          is_guest: guest
        });
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
    
    // Clear last checkout from localStorage
    localStorage.removeItem('lastCheckout');
    
    // Show toast notification
    toast.success('Purchase successful!', {
      description: 'Thank you for your purchase!'
    });
  }, [searchParams]);

  // Generate share content based on purchase type
  const getShareContent = () => {
    if (itemType === 'workout') {
      return {
        title: 'I just purchased a workout on FitBloom!',
        description: 'Check out this amazing workout program on FitBloom',
        url: `/workout/${itemId}`
      };
    } else if (itemType === 'program') {
      return {
        title: 'I just purchased a training program on FitBloom!',
        description: 'Check out this comprehensive training program on FitBloom',
        url: `/program/${itemId}`
      };
    }
    
    return {
      title: 'I just made a purchase on FitBloom!',
      description: 'Check out FitBloom for amazing fitness content',
      url: '/'
    };
  };
  
  const shareContent = getShareContent();

  return (
    <div className="container max-w-2xl mx-auto p-4 py-12">
      <Card className="bg-dark-200 border-dark-300 shadow-lg overflow-hidden">
        <CardHeader className="bg-green-900/30 border-b border-green-900/20 pb-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-2xl md:text-3xl">Payment Successful!</CardTitle>
          <CardDescription className="text-gray-400">
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium">Your {itemType} purchase was successful</h3>
              <p className="text-gray-400 mt-2">
                You can now access your purchased content in your library.
              </p>
            </div>
            
            <div className="bg-dark-300 rounded-md p-4 border border-dark-400">
              <h4 className="font-medium">What's next?</h4>
              <ul className="mt-2 space-y-2 text-gray-400">
                <li>• Check out your purchase in your <Link to="/library" className="text-fitbloom-purple hover:underline">Library's Purchases tab</Link></li>
                <li>• Start using your newly purchased content right away</li>
                {isGuest && !user && (
                  <li className="text-amber-400">
                    • Creating an account will allow you to access your purchases across devices
                  </li>
                )}
                <li>• Need help? Contact customer support</li>
              </ul>
            </div>
            
            <div className="flex justify-center pt-4">
              <EnhancedShareButton
                url={shareContent.url}
                title={shareContent.title}
                description={shareContent.description}
                variant="outline"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
          <Button asChild className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90">
            <Link to="/library?tab=purchases">Go to Purchased Items</Link>
          </Button>
          {isGuest && !user ? (
            <Button variant="outline" asChild className="flex-1 border-amber-700 text-amber-400 hover:bg-amber-950/30">
              <Link to="/auth">Create Account</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild className="flex-1">
              <Link to="/">Return Home</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PurchaseSuccess;
