
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { 
  ClubProductPurchase, 
  ClubProduct, 
  ClubSubscription, 
  PurchaseStatus, 
  SubscriptionStatus 
} from '@/types/club';
import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  Loader2,
  MapPin,
  Receipt,
  RefreshCw
} from 'lucide-react';

const PurchaseReceipt: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState<ClubProductPurchase | null>(null);
  const [subscription, setSubscription] = useState<ClubSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError('You must be logged in to view receipts');
        setLoading(false);
        return;
      }
      
      try {
        const sessionId = searchParams.get('session_id');
        const type = searchParams.get('type') || 'product'; // 'product' or 'subscription'
        
        if (!sessionId) {
          setError('No session ID provided');
          setLoading(false);
          return;
        }
        
        if (type === 'product') {
          const { data: purchaseData, error } = await supabase
            .from('club_product_purchases')
            .select(`
              *,
              product:club_products(*)
            `)
            .eq('stripe_session_id', sessionId)
            .single();
          
          if (error) throw error;
          
          if (purchaseData) {
            setPurchase({
              ...purchaseData,
              status: purchaseData.status as PurchaseStatus,
              refund_status: purchaseData.refund_status as any,
              product: purchaseData.product ? {
                ...purchaseData.product,
                product_type: purchaseData.product.product_type as any
              } : undefined
            } as ClubProductPurchase);
          }
        } else if (type === 'subscription') {
          // Use the edge function to get subscription data
          const { data, error } = await supabase.functions.invoke('get-subscription-rpcs', {
            body: {
              action: 'get_subscription_by_session',
              session_id: sessionId
            }
          });
          
          if (error) throw error;
          
          if (data && Array.isArray(data) && data.length > 0) {
            const subData = data[0];
            
            // Create a properly typed subscription object
            const typedSubscription: ClubSubscription = {
              id: subData.id,
              user_id: subData.user_id,
              club_id: subData.club_id,
              stripe_subscription_id: subData.stripe_subscription_id,
              status: subData.status as SubscriptionStatus,
              created_at: subData.created_at,
              updated_at: subData.updated_at,
              current_period_start: subData.current_period_start,
              current_period_end: subData.current_period_end,
              cancel_at_period_end: subData.cancel_at_period_end,
              canceled_at: subData.canceled_at,
              plan_amount: subData.plan_amount,
              plan_currency: subData.plan_currency,
              plan_interval: subData.plan_interval
            };
            
            setSubscription(typedSubscription);
          } else {
            throw new Error('Subscription not found');
          }
        }
      } catch (err) {
        console.error('Error fetching receipt data:', err);
        setError('Failed to fetch receipt data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, searchParams]);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPPP');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'p');
    } catch (e) {
      return '';
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-fitbloom-purple mb-4" />
        <p className="text-lg text-gray-300">Loading receipt...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-lg text-gray-300 mb-4">{error}</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="bg-dark-300 border-dark-400">
        <CardHeader className="border-b border-gray-700 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 mr-3 text-fitbloom-purple" />
              <CardTitle className="text-2xl">
                {subscription ? 'Subscription Confirmation' : 'Purchase Receipt'}
              </CardTitle>
            </div>
            <Badge className="bg-green-600">
              <Check className="h-4 w-4 mr-1" /> 
              {subscription ? 'Active' : 'Completed'}
            </Badge>
          </div>
          <p className="text-gray-400 mt-2">
            {subscription 
              ? 'Your subscription has been successfully activated' 
              : 'Thank you for your purchase!'}
          </p>
        </CardHeader>
        
        <CardContent className="pt-6">
          {purchase && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  {purchase.product?.name || 'Product Purchase'}
                </h3>
                <p className="text-gray-400">
                  {purchase.product?.description || 'No description available'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Date of Purchase</h4>
                  <p className="text-lg">{formatDate(purchase.purchase_date)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Amount Paid</h4>
                  <p className="text-lg">${purchase.amount_paid} {purchase.currency.toUpperCase()}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {purchase.product?.product_type === 'event' && (
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-fitbloom-purple" />
                    Event Details
                  </h3>
                  
                  {purchase.product.date_time && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Date & Time</h4>
                      <p>
                        {formatDate(purchase.product.date_time)} at {formatTime(purchase.product.date_time)}
                      </p>
                    </div>
                  )}
                  
                  {purchase.product.location && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Location</h4>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-2 shrink-0 text-gray-500" />
                        <p>{purchase.product.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 text-sm text-gray-400">
                    <p>Please save this receipt as proof of purchase for the event.</p>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-fitbloom-purple" />
                  Receipt Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Transaction ID</h4>
                    <p className="text-sm break-all">{purchase.id}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Product Type</h4>
                    <p className="capitalize">{purchase.product?.product_type || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {subscription && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  Premium Membership Subscription
                </h3>
                <p className="text-gray-400">
                  You now have access to premium features and content
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Start Date</h4>
                  <p className="text-lg">{formatDate(subscription.created_at)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Amount</h4>
                  <p className="text-lg">${subscription.plan_amount} {subscription.plan_currency?.toUpperCase()}/{subscription.plan_interval}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Current Period</h4>
                  <div className="flex items-center">
                    <p>
                      {subscription.current_period_start 
                        ? formatDate(subscription.current_period_start) 
                        : 'N/A'} 
                      {' to '} 
                      {subscription.current_period_end 
                        ? formatDate(subscription.current_period_end) 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Renewal Status</h4>
                  <div className="flex items-center">
                    {subscription.cancel_at_period_end ? (
                      <Badge className="bg-amber-600">Cancels at period end</Badge>
                    ) : (
                      <Badge className="bg-green-600">
                        <RefreshCw className="h-3 w-3 mr-1" /> 
                        Auto-renews
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-fitbloom-purple" />
                  Membership Benefits
                </h3>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Exclusive premium workouts & programs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Priority access to club events</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Premium badge on profile</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Full access to all club features</span>
                  </li>
                </ul>
                
                <div className="mt-4 text-sm text-gray-400">
                  <p>You can manage your subscription in your account settings.</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="border-t border-gray-700 pt-6 flex flex-wrap gap-3">
          <Button 
            onClick={() => window.print()} 
            variant="outline" 
            className="flex-1"
          >
            <FileText className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          
          {purchase?.product?.club_id && (
            <Button 
              onClick={() => navigate(`/clubs/${purchase.product?.club_id}`)} 
              className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            >
              Return to Club
            </Button>
          )}
          
          {subscription?.club_id && (
            <Button 
              onClick={() => navigate(`/clubs/${subscription.club_id}`)} 
              className="flex-1 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            >
              Go to Club
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PurchaseReceipt;
