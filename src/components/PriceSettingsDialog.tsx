
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface PriceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  currentPrice: number;
  isPurchasable: boolean;
  onSave: (price: number, isPurchasable: boolean) => void;
  isSaving: boolean;
}

export function PriceSettingsDialog({
  open,
  onOpenChange,
  title,
  currentPrice = 0,
  isPurchasable = false,
  onSave,
  isSaving
}: PriceSettingsDialogProps) {
  const [price, setPrice] = useState(currentPrice.toString());
  const [sellable, setSellable] = useState(isPurchasable);
  
  const handleSave = () => {
    // Convert price to number with 2 decimal places
    const priceNumber = parseFloat(parseFloat(price).toFixed(2));
    onSave(priceNumber, sellable);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-200 text-white border-dark-300">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set pricing details. Elite Locker takes a 10% platform fee for all sales.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-selling" className="flex-1">Make available for purchase</Label>
            <Switch
              id="enable-selling"
              checked={sellable}
              onCheckedChange={setSellable}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-8 bg-dark-100 border-dark-300"
                type="number"
                min="0"
                step="0.01"
                disabled={!sellable}
              />
            </div>
            
            {sellable && (
              <div className="text-sm text-gray-400 mt-2">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>${parseFloat(price || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (10%):</span>
                  <span>${(parseFloat(price || "0") * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-white">
                  <span>You Receive:</span>
                  <span>${(parseFloat(price || "0") * 0.9).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
