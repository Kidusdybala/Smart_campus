import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface CartItem {
  _id: string;
  name: string;
  price: number;
}

interface CartSummaryProps {
  cart: {[key: string]: number};
  menuItems: CartItem[];
  getCartTotal: () => number;
  placeOrder: () => void;
}

export function CartSummary({ cart, menuItems, getCartTotal, placeOrder }: CartSummaryProps) {
  const getCartItemsCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  if (getCartItemsCount() === 0) {
    return null;
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Cart Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(cart).map(([itemId, quantity]) => {
            const item = menuItems.find(item => item._id === itemId);
            if (!item) return null;

            return (
              <div key={itemId} className="flex justify-between text-sm">
                <span>{item.name} x{quantity}</span>
                <span>{(item.price * quantity).toFixed(2)} ETB</span>
              </div>
            );
          })}
          <div className="border-t pt-3">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{getCartTotal().toFixed(2)} ETB</span>
            </div>
          </div>
          <Button
            className="w-full bg-gradient-primary"
            onClick={placeOrder}
          >
            Place Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}