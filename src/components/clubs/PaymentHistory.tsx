
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getUserPurchases, getUserSubscriptions, requestRefund, cancelSubscription } from '@/utils/clubUtils';
import PurchaseReceipt from './PurchaseReceipt';
import { Loader2, Receipt, AlertCircle } from 'lucide-react';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [requestingRefundId, setRequestingRefundId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('purchases');
  
  useEffect(() => {
    if (user) {
      loadPaymentHistory();
    }
  }, [user]);
  
  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      
      // Load purchases and subscriptions in parallel
      const [purchasesData, subscriptionsData] = await Promise.all([
        getUserPurchases(),
        getUserSubscriptions()
      ]);
      
      setPurchases(purchasesData);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Error loading payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestRefund = async (purchaseId: string) => {
    try {
      setRequestingRefundId(purchaseId);
      
      const result = await requestRefund(purchaseId, 'Customer requested refund');
      
      if (result.success) {
        toast.success('Refund request submitted');
        // Refresh purchases to update status
        loadPaymentHistory();
      } else {
        toast.error(result.error || 'Failed to request refund');
      }
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast.error('Failed to request refund');
    } finally {
      setRequestingRefundId(null);
    }
  };
  
  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setCancelingId(subscriptionId);
      
      const result = await cancelSubscription(subscriptionId, true);
      
      if (result.success) {
        toast.success('Subscription will be canceled at the end of the billing period');
        // Refresh subscriptions to update status
        loadPaymentHistory();
      } else {
        toast.error(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelingId(null);
    }
  };

  if (!user) {
    return (
      <Card className="bg-dark-300 border-dark-400">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium">You need to be logged in to view payment history</h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
        <span className="ml-2 text-lg">Loading payment history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment History</h2>
        <p className="text-gray-400">
          View and manage your subscriptions and one-time purchases
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases">One-time Purchases</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases" className="mt-6">
          {purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map(purchase => (
                <PurchaseReceipt 
                  key={purchase.id} 
                  purchase={purchase}
                  onRequestRefund={() => handleRequestRefund(purchase.id)}
                  isRequesting={requestingRefundId === purchase.id}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-dark-300 border-dark-400">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <Receipt className="h-12 w-12 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium">No purchases found</h3>
                  <p className="text-gray-400 mt-2">
                    You haven't made any one-time purchases yet
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="subscriptions" className="mt-6">
          {subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.map(subscription => {
                const isActive = subscription.status === 'active';
                const willCancel = subscription.cancel_at_period_end;
                const currentPeriodEnd = subscription.current_period_end ? 
                  new Date(subscription.current_period_end) : null;
                  
                return (
                  <Card key={subscription.id} className="bg-dark-300 border-dark-400">
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        <span>Club Premium Membership</span>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          isActive ? 'bg-green-900 text-green-100' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {subscription.status.replace('_', ' ')}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        ${subscription.plan_amount}/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Current period</p>
                          <p>
                            {subscription.current_period_start ? 
                              new Date(subscription.current_period_start).toLocaleDateString() : 'N/A'} - {
                              subscription.current_period_end ? 
                              new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Started on</p>
                          <p>
                            {new Date(subscription.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {willCancel && (
                        <div className="mt-4 p-3 bg-amber-900/20 border border-amber-800 rounded-md">
                          <p className="text-amber-300">
                            This subscription will be canceled on {
                              currentPeriodEnd ? currentPeriodEnd.toLocaleDateString() : 'the end of the current period'
                            }
                          </p>
                        </div>
                      )}
                      
                      <Separator className="my-4" />
                      
                      {isActive && !willCancel && (
                        <Button
                          variant="outline"
                          onClick={() => handleCancelSubscription(subscription.id)}
                          disabled={cancelingId === subscription.id}
                          className="w-full"
                        >
                          {cancelingId === subscription.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : 'Cancel Subscription'}
                        </Button>
                      )}
                      
                      {willCancel && (
                        <Button
                          variant="outline"
                          onClick={() => toast.error('This feature is not implemented yet')}
                          className="w-full"
                        >
                          Resume Subscription
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-dark-300 border-dark-400">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <Receipt className="h-12 w-12 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium">No active subscriptions</h3>
                  <p className="text-gray-400 mt-2">
                    You don't have any active subscriptions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentHistory;
