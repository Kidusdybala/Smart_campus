import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CreditCard, History, Plus } from "lucide-react";

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
}

export function WalletTab({ walletData, onWalletDataChange, onTopup, loading, paymentHistory }: WalletTabProps) {
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