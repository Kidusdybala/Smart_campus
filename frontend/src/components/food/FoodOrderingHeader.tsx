import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, UtensilsCrossed, Clock, Star, Plus, Minus, ShoppingCart, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api";

interface FoodOrderingHeaderProps {
  onBack: () => void;
  walletBalance: number;
  topupAmount: string;
  setTopupAmount: (amount: string) => void;
  topupDialogOpen: boolean;
  setTopupDialogOpen: (open: boolean) => void;
  getCartItemsCount: () => number;
  getCartTotal: () => number;
  placeOrder: () => void;
}

export function FoodOrderingHeader({
  onBack,
  walletBalance,
  topupAmount,
  setTopupAmount,
  topupDialogOpen,
  setTopupDialogOpen,
  getCartItemsCount,
  getCartTotal,
  placeOrder
}: FoodOrderingHeaderProps) {
  const topupWallet = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const paymentResponse = await api.topupWallet(amount);

      if (paymentResponse.checkoutUrl) {
        // Redirect to Chapa payment page
        window.location.href = paymentResponse.checkoutUrl;
      } else {
        toast.error("Payment initialization failed");
      }
    } catch (error) {
      console.error("Top-up error:", error);
      toast.error("Failed to initialize payment: " + (error.message || "Unknown error"));
    }
  };

  return (
    <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Food Ordering</h1>
                <p className="text-white/80 text-sm">Campus Cafeteria</p>
              </div>
            </div>
          </div>

          {/* Cart Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-white/80 text-sm">
                Wallet: {walletBalance.toFixed(2)} ETB
              </div>
              <Dialog open={topupDialogOpen} onOpenChange={setTopupDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <CreditCard className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Top Up Wallet</DialogTitle>
                    <DialogDescription>
                      Add funds to your wallet to pay for food orders.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount (ETB)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                      />
                    </div>
                    <Button onClick={topupWallet} className="w-full">
                      Top Up Wallet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={placeOrder}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({getCartItemsCount()}) - {getCartTotal().toFixed(2)} ETB
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}