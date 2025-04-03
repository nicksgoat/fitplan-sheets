
import React, { useState, useEffect } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  CircleDollarSign, 
  Info,
  Star,
  Loader2,
  CreditCard,
  Receipt 
} from 'lucide-react';
import PaymentHistory from './PaymentHistory';

interface ClubMembershipsProps {
  clubId: string;
}

const ClubMemberships: React.FC<ClubMembershipsProps> = ({ clubId }) => {
  const { 
    currentClub, 
    members, 
    isUserClubMember, 
    getUserClubRole,
    upgradeToMembership,
    products,
    purchaseProduct,
    refreshProducts
  } = useClub();
  
  const { user } = useAuth();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    free: false,
    premium: false,
    vip: false
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('memberships');

  const currentMembership = isUserClubMember(clubId) ? 
    members.find(member => member.user_id === user?.id)?.membership_type : null;

  useEffect(() => {
    // Load products when component mounts
    if (currentClub && products.length === 0) {
      refreshProducts();
    }
  }, [currentClub, products.length, refreshProducts]);

  const handleUpgrade = async (membershipType: 'free' | 'premium' | 'vip') => {
    if (!user) {
      toast.error('You need to log in to upgrade membership');
      return;
    }

    try {
      setLoading({ ...loading, [membershipType]: true });
      
      if (membershipType === 'premium') {
        // For premium, we'll use Stripe Checkout
        setCheckoutLoading(true);
        
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            membershipType: 'premium',
            clubId,
            userId: user.id
          }
        });
        
        if (error) throw error;
        
        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } else if (membershipType === 'free') {
        // Downgrade to free
        await upgradeToMembership(clubId, membershipType);
        toast.success(`Your membership has been changed to Free`);
      }
    } catch (error) {
      console.error('Error upgrading membership:', error);
      toast.error('Failed to upgrade membership. Please try again.');
    } finally {
      setLoading({ ...loading, [membershipType]: false });
      setCheckoutLoading(false);
    }
  };

  const handlePurchaseProduct = async (productId: string) => {
    if (!user) {
      toast.error('You need to log in to purchase this product');
      return;
    }

    try {
      setSelectedProduct(productId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          productId,
          clubId,
          userId: user.id
        }
      });
      
      if (error) throw error;
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error purchasing product:', error);
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setSelectedProduct(null);
    }
  };

  if (!currentClub) return null;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="memberships" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="memberships" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Membership Tiers
          </TabsTrigger>
          {user && (
            <TabsTrigger value="payment-history" className="flex items-center">
              <Receipt className="h-4 w-4 mr-2" />
              Payment History
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="memberships">
          <div>
            <h2 className="text-2xl font-bold mb-2">Club Membership</h2>
            <p className="text-gray-400">
              Choose a membership tier to access different levels of content and features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Free Tier */}
            <Card className="bg-dark-300 border-dark-400">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Free Membership</span>
                  <Badge className="bg-gray-600">90%</Badge>
                </CardTitle>
                <CardDescription>Basic club access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">$0</div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Access to club posts and updates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Join club events</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Participate in community discussions</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {currentMembership === 'free' ? (
                  <Button disabled className="w-full bg-green-700">
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleUpgrade('free')}
                    disabled={loading.free || !currentMembership}
                  >
                    {loading.free ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Processing...
                      </>
                    ) : 'Downgrade to Free'}
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Premium Tier */}
            <Card className="bg-dark-300 border-dark-400 relative overflow-hidden">
              {currentMembership === 'premium' && (
                <div className="absolute top-0 right-0 bg-fitbloom-purple text-white px-2 py-1 text-xs transform translate-x-[30%] translate-y-[-30%] rotate-45">
                  Current
                </div>
              )}
              <div className="absolute top-0 left-0 right-0 h-1 bg-fitbloom-purple"></div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Premium</span>
                  <Badge className="bg-fitbloom-purple">10%</Badge>
                </CardTitle>
                <CardDescription>Enhanced club benefits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">
                  {currentClub.premium_price ? 
                    `$${currentClub.premium_price}/mo` : 
                    `$9.99/mo`}
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>All Free tier benefits</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Exclusive premium workouts & programs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Priority access to club events</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                    <span>Premium badge on profile</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {currentMembership === 'premium' ? (
                  <Button 
                    className="w-full bg-fitbloom-purple"
                    onClick={() => setActiveTab('payment-history')}
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90" 
                    onClick={() => handleUpgrade('premium')}
                    disabled={loading.premium || checkoutLoading}
                  >
                    {loading.premium || checkoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Processing...
                      </>
                    ) : 'Upgrade to Premium'}
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* VIP Tier - One-off purchases */}
            <Card className="bg-dark-300 border-dark-400">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>VIP Exclusives</span>
                  <Badge className="bg-amber-600">1%</Badge>
                </CardTitle>
                <CardDescription>Premium one-off purchases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">Custom Pricing</div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Star className="h-5 w-5 mr-2 text-amber-500 shrink-0" />
                    <span>Exclusive coaching sessions</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-5 w-5 mr-2 text-amber-500 shrink-0" />
                    <span>Special in-person events</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-5 w-5 mr-2 text-amber-500 shrink-0" />
                    <span>Custom workout programs</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                    <span className="text-gray-400">One-time purchases</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-amber-600 text-amber-500 hover:bg-amber-950/30"
                  onClick={() => document.getElementById('vip-products')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <CircleDollarSign className="h-5 w-5 mr-2" />
                  See Available Products
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Separator className="my-8" />

          <div id="vip-products">
            <h2 className="text-2xl font-bold mb-2">Exclusive VIP Products</h2>
            <p className="text-gray-400 mb-6">
              Premium one-time purchases that give you access to exclusive coaching and events.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.length > 0 ? (
                products.map(product => (
                  <Card key={product.id} className="bg-dark-300 border-dark-400">
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>{product.product_type}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-2xl font-bold">${product.price_amount}</div>
                      <p className="text-gray-400">{product.description}</p>
                      
                      {product.date_time && (
                        <div className="flex items-start mt-2">
                          <Info className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                          <div>
                            <p className="font-semibold">Date & Time</p>
                            <p className="text-sm text-gray-400">
                              {new Date(product.date_time).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {product.location && (
                        <div className="flex items-start mt-2">
                          <Info className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                          <div>
                            <p className="font-semibold">Location</p>
                            <p className="text-sm text-gray-400">{product.location}</p>
                          </div>
                        </div>
                      )}
                      
                      {product.max_participants && (
                        <div className="flex items-start mt-2">
                          <Info className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                          <div>
                            <p className="font-semibold">Limited Spots</p>
                            <p className="text-sm text-gray-400">
                              {product.max_participants} participants max
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-amber-600 hover:bg-amber-700"
                        onClick={() => handlePurchaseProduct(product.id)}
                        disabled={selectedProduct === product.id}
                      >
                        {selectedProduct === product.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Processing...
                          </>
                        ) : (
                          <>
                            <CircleDollarSign className="h-5 w-5 mr-2" />
                            Purchase
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="bg-dark-300 border-dark-400 text-center p-8 col-span-3">
                  <CircleDollarSign className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">
                    No VIP products are currently available. Check back later or ask the club admin to add some!
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="payment-history">
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubMemberships;
