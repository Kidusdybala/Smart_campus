import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CreditCard, History, Plus, Wrench } from "lucide-react";
import { api } from "../../api";
import { toast } from "sonner";

interface WalletData {
  balance: number;
  topupAmount: string;
}

interface PaymentHistory {
  _id: string;
  description: string;
  amount: number;
  type: 'topup' | 'payment';
  status: string;
  createdAt: string;
}

interface WalletTabProps {
  walletData: WalletData;
  onWalletDataChange: (data: WalletData) => void;
  onTopup: () => Promise<void>;
  loading: boolean;
  paymentHistory: PaymentHistory[];
  onBalanceFix?: () => Promise<void>;
}

export function WalletTab({ walletData, onWalletDataChange, onTopup, loading, paymentHistory, onBalanceFix }: WalletTabProps) {
  const handleFixBalance = async () => {
    try {
      const result = await api.fixWalletBalance();
      toast.success(`Wallet balance fixed! New balance: ${result.newBalance.toFixed(2)} ETB`);
      // Trigger parent component to refresh data
      if (onBalanceFix) {
        await onBalanceFix();
      }
    } catch (error) {
      toast.error("Failed to fix wallet balance");
      console.error("Balance fix error:", error);
    }
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
          <CardDescription>Manage your campus wallet and view transaction history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {walletData.balance.toFixed(2)} ETB
            </div>
            <div className="text-lg text-green-700 font-medium">Current Balance</div>
          </div>

          {/* Top-up Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Top Up Wallet
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topupAmount">Amount (ETB)</Label>
                <Input
                  id="topupAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={walletData.topupAmount}
                  onChange={(e) => onWalletDataChange({ ...walletData, topupAmount: e.target.value })}
                  min="10"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={onTopup} disabled={loading} className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? "Processing..." : "Top Up"}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Minimum top-up amount: 10 ETB</p>
          </div>

          {/* Fix Balance Button - Only show if there are completed payments but balance is 0 */}
          {paymentHistory.some(p => p.status === 'completed') && walletData.balance === 0 && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleFixBalance}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <Wrench className="w-4 h-4 mr-2" />
                {loading ? "Fixing..." : "Fix Wallet Balance"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Use this to sync your balance with completed payments
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{payment.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${payment.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                      {payment.type === 'topup' ? '+' : '-'}{payment.amount} ETB
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">{payment.status}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}