import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  ClubProductPurchase,
  ClubSubscription
} from '@/types/club';
import { 
  AlertTriangle, 
  ArrowDownIcon, 
  CalendarIcon, 
  ClockIcon, 
  CreditCard, 
  ExternalLink, 
  FileText, 
  Loader2, 
  RefreshCw, 
  ShoppingBag, 
  XCircle 
} from 'lucide-react';
import { 
  getUserPurchases,
  getUserSubscriptions, 
  requestRefund,
  cancelSubscription
} from '@/services/clubService';

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const { currentClub } = useClub();
  const [purchases, setPurchases] = useState<ClubProductPurchase[]>([]);
  const [subscriptions, setSubscriptions] = useState<ClubSubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch one-time purchases
      const userPurchases = await getUserPurchases();
      setPurchases(userPurchases);
      
      // Fetch subscriptions
      const userSubscriptions = await getUserSubscriptions();
      setSubscriptions(userSubscriptions);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async (purchaseId: string) => {
    if (!user) {
      toast.error('You need to be logged in to request a refund');
      return;
    }

    try {
      setLoadingAction({ ...loadingAction, [purchaseId]: true });
      
      const reason = prompt('Please provide a reason for your refund request:');
      if (!reason) {
        toast.error('Refund reason is required');
        return;
      }
      
      const result = await requestRefund(purchaseId, reason);
      
      if (result.success && result.data) {
        toast.success('Refund request submitted successfully');
        // Update the purchase in the state
        setPurchases(purchases.map(p => 
          p.id === purchaseId ? result.data as ClubProductPurchase : p
        ));
      } else {
        toast.error(result.error || 'Failed to submit refund request');
      }
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast.error('Failed to submit refund request');
    } finally {
      setLoadingAction({ ...loadingAction, [purchaseId]: false });
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, immediateCancel = false) => {
    if (!user) {
      toast.error('You need to be logged in to cancel a subscription');
      return;
    }

    const confirmationMessage = immediateCancel 
      ? 'Are you sure you want to cancel your subscription immediately? You will lose access to premium features right away.'
      : 'Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.';
    
    if (!confirm(confirmationMessage)) {
      return;
    }

    try {
      setLoadingAction({ ...loadingAction, [subscriptionId]: true });
      
      const result = await cancelSubscription(subscriptionId, !immediateCancel);
      
      if (result.success && result.data) {
        toast.success(immediateCancel ? 
          'Subscription canceled immediately' : 
          'Subscription will be canceled at the end of the billing period');
        
        // Update the subscription in the state
        setSubscriptions(subscriptions.map(s => 
          s.id === subscriptionId ? result.data as ClubSubscription : s
        ));
      } else {
        toast.error(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setLoadingAction({ ...loadingAction, [subscriptionId]: false });
    }
  };

  const renderStatusBadge = (status: string) => {
    let color = '';
    switch (status) {
      case 'completed':
        color = 'bg-green-600';
        break;
      case 'pending':
        color = 'bg-amber-600';
        break;
      case 'refunded':
        color = 'bg-red-600';
        break;
      case 'active':
        color = 'bg-green-600';
        break;
      case 'canceled':
      case 'cancelled':
        color = 'bg-red-600';
        break;
      case 'past_due':
        color = 'bg-amber-600';
        break;
      default:
        color = 'bg-gray-600';
    }
    
    return <Badge className={color}>{status}</Badge>;
  };

  const renderRefundBadge = (refundStatus?: string) => {
    if (!refundStatus) return null;
    
    let color = '';
    switch (refundStatus) {
      case 'requested':
        color = 'bg-amber-600';
        break;
      case 'approved':
        color = 'bg-blue-600';
        break;
      case 'processed':
        color = 'bg-green-600';
        break;
      case 'rejected':
        color = 'bg-red-600';
        break;
      default:
        color = 'bg-gray-600';
    }
    
    return <Badge className={`ml-2 ${color}`}>Refund {refundStatus}</Badge>;
  };

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
          View and manage your club purchases and subscriptions
        </p>
      </div>

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="purchases" className="flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4" /> One-time Purchases
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" /> Subscriptions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases" className="space-y-4">
          {purchases.length > 0 ? (
            purchases.map(purchase => (
              <Card key={purchase.id} className="bg-dark-300 border-dark-400">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {purchase.product?.name || 'Product Purchase'}
                    </CardTitle>
                    <div className="flex items-center">
                      {renderStatusBadge(purchase.status)}
                      {renderRefundBadge(purchase.refund_status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid gap-2">
                    <div className="flex items-center text-gray-400">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>${purchase.amount_paid} {purchase.currency.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{format(new Date(purchase.purchase_date), 'PPP')}</span>
                    </div>
                    
                    {purchase.refund_requested_at && (
                      <div className="flex items-center text-gray-400">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>Refund requested: {format(new Date(purchase.refund_requested_at), 'PPP')}</span>
                      </div>
                    )}
                    
                    {purchase.refund_reason && (
                      <div className="flex items-start text-gray-400 mt-2">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-1 shrink-0" />
                        <span>Reason: {purchase.refund_reason}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {purchase.status !== 'refunded' && !purchase.refund_status && (
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => handleRequestRefund(purchase.id)}
                      disabled={loadingAction[purchase.id]}
                    >
                      {loadingAction[purchase.id] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowDownIcon className="mr-2 h-4 w-4" />
                          Request Refund
                        </>
                      )}
                    </Button>
                  )}
                  {purchase.status === 'completed' && !purchase.refund_status && purchase.product?.product_type === 'event' && (
                    <Button variant="outline" className="w-full ml-2" asChild>
                      <a href={`/clubs/${purchase.product?.club_id}/events`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Event
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="bg-dark-300 border-dark-400 p-6 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400">
                You haven't made any one-time purchases yet.
              </p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-4">
          {subscriptions.length > 0 ? (
            subscriptions.map(subscription => (
              <Card key={subscription.id} className="bg-dark-300 border-dark-400">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Club Premium Subscription
                    </CardTitle>
                    <div className="flex items-center">
                      {renderStatusBadge(subscription.status)}
                      {subscription.cancel_at_period_end && (
                        <Badge className="ml-2 bg-amber-600">Canceling</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid gap-2">
                    <div className="flex items-center text-gray-400">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>${subscription.plan_amount} {subscription.plan_currency?.toUpperCase()}/{subscription.plan_interval}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-400">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Started: {format(new Date(subscription.created_at), 'PPP')}</span>
                    </div>
                    
                    {subscription.current_period_end && (
                      <div className="flex items-center text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>
                          {subscription.cancel_at_period_end 
                            ? `Access until: ${format(new Date(subscription.current_period_end), 'PPP')}` 
                            : `Next billing: ${format(new Date(subscription.current_period_end), 'PPP')}`}
                        </span>
                      </div>
                    )}
                    
                    {subscription.canceled_at && (
                      <div className="flex items-center text-gray-400">
                        <XCircle className="h-4 w-4 mr-2" />
                        <span>Canceled: {format(new Date(subscription.canceled_at), 'PPP')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleCancelSubscription(subscription.id)}
                      disabled={loadingAction[subscription.id]}
                    >
                      {loadingAction[subscription.id] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel at Period End
                        </>
                      )}
                    </Button>
                  )}
                  
                  {subscription.status === 'active' && (
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleCancelSubscription(subscription.id, true)}
                      disabled={loadingAction[`${subscription.id}-immediate`]}
                    >
                      {loadingAction[`${subscription.id}-immediate`] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Immediately
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`/clubs/${subscription.club_id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Club
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="bg-dark-300 border-dark-400 p-6 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400">
                You don't have any active subscriptions.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={fetchPaymentHistory}
          className="flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Payment History
        </Button>
      </div>
    </div>
  );
};

export default PaymentHistory;
