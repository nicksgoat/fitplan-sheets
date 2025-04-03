
import React, { useState } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createClubProduct } from '@/utils/clubUtils';
import { ProductType } from '@/types/club';
import { CirclePlus, CircleDollarSign, Loader2 } from 'lucide-react';

interface ClubProductAdminProps {
  clubId: string;
}

const ClubProductAdmin: React.FC<ClubProductAdminProps> = ({ clubId }) => {
  const { isUserClubAdmin, refreshProducts } = useClub();
  const { user } = useAuth();
  const [isAdmin] = useState(isUserClubAdmin(clubId));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceAmount: 0,
    priceCurrency: 'usd',
    productType: 'event' as ProductType,
    maxParticipants: undefined as number | undefined,
    dateTime: '',
    location: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value)
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create products');
      return;
    }

    if (!formData.name || formData.priceAmount <= 0) {
      toast.error('Please provide a name and valid price');
      return;
    }

    try {
      setLoading(true);
      
      const result = await createClubProduct({
        clubId,
        name: formData.name,
        description: formData.description,
        priceAmount: formData.priceAmount,
        priceCurrency: formData.priceCurrency,
        productType: formData.productType,
        maxParticipants: formData.maxParticipants,
        dateTime: formData.dateTime ? new Date(formData.dateTime).toISOString() : undefined,
        location: formData.location
      });

      if (result.success) {
        toast.success('Product created successfully!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          priceAmount: 0,
          priceCurrency: 'usd',
          productType: 'event' as ProductType,
          maxParticipants: undefined,
          dateTime: '',
          location: ''
        });
        // Close dialog
        setOpen(false);
        // Refresh products list
        refreshProducts();
      } else {
        throw new Error(result.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Manage VIP Products</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <CirclePlus className="h-5 w-5 mr-2" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New VIP Product</DialogTitle>
              <DialogDescription>
                Create a new premium product for your club members to purchase.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priceAmount" className="text-right">Price ($)</Label>
                  <Input
                    id="priceAmount"
                    name="priceAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.priceAmount}
                    onChange={handleNumberChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productType" className="text-right">Type</Label>
                  <Select
                    name="productType"
                    value={formData.productType}
                    onValueChange={(value) => handleSelectChange('productType', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="coaching">Coaching</SelectItem>
                      <SelectItem value="program">Program</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxParticipants" className="text-right">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants || ''}
                    onChange={handleNumberChange}
                    className="col-span-3"
                    placeholder="Leave blank for unlimited"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dateTime" className="text-right">Date & Time</Label>
                  <Input
                    id="dateTime"
                    name="dateTime"
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Online or physical location"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CircleDollarSign className="h-5 w-5 mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <p className="text-gray-400 mb-4">
        Create premium products or events that club members can purchase. These appear in the VIP Products section.
      </p>
      
      <div className="bg-dark-300 p-4 rounded-md border border-dark-400">
        <h3 className="font-medium mb-2">Tips for creating products:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
          <li>Set a clear name and description so members know what they're purchasing</li>
          <li>For events, add a date/time and location</li>
          <li>For limited-availability offers, set a maximum number of participants</li>
          <li>Products will appear in the VIP Products section of the Memberships tab</li>
        </ul>
      </div>
    </div>
  );
};

export default ClubProductAdmin;
