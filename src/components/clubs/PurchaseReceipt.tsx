
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Receipt, AlertCircle } from 'lucide-react';
import { ClubProductPurchase, RefundStatus, PurchaseStatus } from '@/types/club';

interface PurchaseReceiptProps {
  purchase: ClubProductPurchase | null; // Allow null for loading state
  onRequestRefund?: () => void;
  isRequesting?: boolean;
}

const PurchaseReceipt: React.FC<PurchaseReceiptProps> = ({ 
  purchase, 
  onRequestRefund, 
  isRequesting = false 
}) => {
  // If no purchase data is available, show loading state
  if (!purchase) {
    return (
      <Card className="bg-dark-300 border-dark-400 max-w-lg mx-auto my-8">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <div>Loading Receipt...</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const isCompleted = purchase.status === 'completed';
  const isRefunded = purchase.status === 'refunded';
  const hasRefundRequest = purchase.refund_status === 'requested';
  const isRefundProcessing = purchase.refund_status === 'processing';
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Determine status badge color
  const getBadgeColor = () => {
    if (isRefunded) return 'bg-gray-700 text-gray-300';
    if (hasRefundRequest || isRefundProcessing) return 'bg-yellow-700 text-yellow-300';
    return 'bg-green-700 text-green-300';
  };
  
  // Determine status text
  const getStatusText = () => {
    if (isRefunded) return 'Refunded';
    if (hasRefundRequest) return 'Refund Requested';
    if (isRefundProcessing) return 'Refund Processing';
    return purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1);
  };
  
  // Check if eligible for refund (within 30 days and not already refunded)
  const isRefundEligible = () => {
    if (isRefunded || hasRefundRequest || isRefundProcessing) return false;
    
    const purchaseDate = new Date(purchase.purchase_date);
    const now = new Date();
    const daysSincePurchase = Math.floor(
      (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSincePurchase <= 30;
  };
  
  return (
    <Card className="bg-dark-300 border-dark-400 max-w-lg mx-auto my-8">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div>
            {purchase.product?.name || 'Product Purchase'}
          </div>
          <Badge className={`${getBadgeColor()}`}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Amount Paid</p>
            <p className="text-xl font-bold">
              ${purchase.amount_paid} {purchase.currency.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Purchase Date</p>
            <p>{formatDate(purchase.purchase_date)}</p>
          </div>
        </div>
        
        {purchase.product && (
          <div>
            <p className="text-sm text-gray-400">Product Type</p>
            <p className="capitalize">
              {purchase.product.product_type}
              {purchase.product.date_time && 
                ` (${new Date(purchase.product.date_time).toLocaleDateString()})`
              }
            </p>
          </div>
        )}
        
        {isRefundEligible() && onRequestRefund && (
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={onRequestRefund}
              disabled={isRequesting}
              className="w-full text-red-400 hover:text-red-300 border-red-900 hover:bg-red-950/30"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Request Refund
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Eligible for refund within 30 days of purchase
            </p>
          </div>
        )}
        
        {(hasRefundRequest || isRefundProcessing) && (
          <div className="bg-amber-900/20 border border-amber-800 rounded-md p-3 text-amber-300">
            <p className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              {isRefundProcessing ? 
                'Your refund is being processed.' : 
                'Your refund request is pending review.'}
            </p>
          </div>
        )}
        
        {isRefunded && purchase.refund_processed_at && (
          <div className="bg-green-900/20 border border-green-800 rounded-md p-3">
            <p className="text-green-400">
              Refunded on {formatDate(purchase.refund_processed_at)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseReceipt;
