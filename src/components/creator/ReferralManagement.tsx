
import React, { useState } from 'react';
import { useReferralCodes, ReferralCode } from '@/hooks/useReferralCodes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Copy, CheckCircle, X, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/workout';
import { format } from 'date-fns';

export const ReferralManagement: React.FC = () => {
  const { 
    referralCodes, 
    referralStats, 
    isLoading, 
    isStatsLoading, 
    createReferralCode, 
    DISCOUNT_PERCENT, 
    COMMISSION_PERCENT 
  } = useReferralCodes();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [description, setDescription] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateCode = async () => {
    if (!newCode.trim()) {
      toast.error('Please enter a valid code');
      return;
    }
    
    try {
      await createReferralCode.mutateAsync({
        code: newCode.trim(),
        description: description.trim() || undefined
      });
      
      // Reset form and close dialog on success
      setNewCode('');
      setDescription('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Referral code copied to clipboard');
    
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  const generateReferralLink = (code: string): string => {
    // Create a URL with the referral code as a query parameter
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${code}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Referral Management</h2>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Referral Code
        </Button>
      </div>
      
      {(isLoading || isStatsLoading) ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
        </div>
      ) : (
        <>
          {/* Referral Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-dark-200 border-dark-300 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(referralStats?.totalCommissionEarnings || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-200 border-dark-300 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Active Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {referralStats?.totalReferralCodes || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-200 border-dark-300 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {referralStats?.totalReferrals || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-200 border-dark-300 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Discount Given</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(referralStats?.totalDiscountGiven || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Referral Codes Table */}
          <Card className="bg-dark-200 border-dark-300 text-white overflow-hidden">
            <CardHeader>
              <CardTitle>Your Referral Codes</CardTitle>
              <CardDescription className="text-gray-400">
                Share these codes with others to earn {COMMISSION_PERCENT}% commission on their purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-300">
                    <tr>
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-center">Discount</th>
                      <th className="px-4 py-3 text-center">Commission</th>
                      <th className="px-4 py-3 text-center">Usage</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-300">
                    {referralCodes?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                          No referral codes created yet
                        </td>
                      </tr>
                    ) : (
                      referralCodes?.map((code: ReferralCode) => (
                        <tr key={code.id} className="hover:bg-dark-300/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-2 text-fitbloom-purple" />
                              <span className="font-medium">{code.code}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {code.description || 'No description'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {code.discount_percent}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            {code.commission_percent}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            {code.usage_count}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => copyCodeToClipboard(code.code)}
                                title="Copy code"
                              >
                                {copiedCode === code.code ? 
                                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                  <Copy className="h-4 w-4" />
                                }
                              </Button>
                              {code.is_active && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-500 hover:text-red-400"
                                  title="Deactivate code"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Transactions */}
          <Card className="bg-dark-200 border-dark-300 text-white">
            <CardHeader>
              <CardTitle>Recent Referral Transactions</CardTitle>
              <CardDescription className="text-gray-400">
                Recent activity from your referral codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-300">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-right">Purchase Amount</th>
                      <th className="px-4 py-3 text-right">Commission</th>
                      <th className="px-4 py-3 text-right">Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-300">
                    {referralStats?.recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                          No transactions yet
                        </td>
                      </tr>
                    ) : (
                      referralStats?.recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-dark-300/50">
                          <td className="px-4 py-3">
                            {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {transaction.referral_codes.code}
                          </td>
                          <td className="px-4 py-3">
                            {transaction.product_type.charAt(0).toUpperCase() + transaction.product_type.slice(1)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(transaction.purchase_amount)}
                          </td>
                          <td className="px-4 py-3 text-right text-green-500">
                            +{formatCurrency(transaction.commission_amount)}
                          </td>
                          <td className="px-4 py-3 text-right text-amber-500">
                            -{formatCurrency(transaction.discount_amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Create Referral Code Dialog - Simplified */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-dark-100 border-dark-300 text-white">
          <DialogHeader>
            <DialogTitle>Create Referral Code</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new referral code for others to use during checkout. 
              Your referrals will get a {DISCOUNT_PERCENT}% discount and you'll earn {COMMISSION_PERCENT}% commission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Referral Code</Label>
              <div className="flex">
                <Input
                  id="code"
                  placeholder="SUMMER20"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="bg-dark-200 border-dark-300"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Summer promotion code"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-dark-200 border-dark-300"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCode}
              disabled={createReferralCode.isPending}
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            >
              {createReferralCode.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Code'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
