import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, UtensilsCrossed, Clock, Star, Plus, Minus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
};

interface FoodOrderingProps {
  onBack: () => void;
  user: User;
}

// Static menu for now - will be replaced with API data
const menuCategories = [
  {
    id: "mains",
    name: "Main Courses",
    items: []
  },
  {
    id: "drinks",
    name: "Beverages",
    items: []
  }
];

const currentOrders = [
  {
    id: "order-1",
    items: ["Chicken Caesar Salad"],
    status: "ready",
    orderTime: "12:30 PM",
    pickupCode: "A47",
    total: 11.99
  },
  {
    id: "order-2", 
    items: ["Classic Burger", "Caffe Latte"],
    status: "preparing",
    orderTime: "1:15 PM",
    pickupCode: "B23",
    total: 17.98
  }
];

export function FoodOrdering({ onBack, user }: FoodOrderingProps) {
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [activeCategory, setActiveCategory] = useState("mains");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menu, wallet] = await Promise.all([
          api.getMenu(),
          api.getWalletBalance()
        ]);
        setMenuItems(menu);
        setWalletBalance(wallet.balance);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    toast.success("Added to cart");
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = {...prev};
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const placeOrder = async () => {
    if (getCartItemsCount() === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const totalAmount = getCartTotal();
    if (walletBalance < totalAmount) {
      toast.error("Insufficient wallet balance", {
        description: `You need ${totalAmount.toFixed(2)} ETB but only have ${walletBalance.toFixed(2)} ETB`
      });
      return;
    }

    try {
      const items = Object.entries(cart).map(([itemId, quantity]) => ({
        food: itemId,
        quantity
      }));

      // Place the order first
      const orderResponse = await api.placeOrder(items);

      // Then pay using wallet
      await api.payForOrder(orderResponse._id);

      toast.success("Order placed and paid successfully!", {
        description: "You'll receive a notification when it's ready for pickup"
      });

      // Update wallet balance
      setWalletBalance(prev => prev - totalAmount);
      setCart({});
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-success animate-pulse-glow";
      case "preparing": return "bg-warning";
      case "completed": return "bg-muted";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <div className="text-white/80 text-sm">
                Wallet: {walletBalance.toFixed(2)} ETB
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6">
              {menuCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-8">Loading menu...</div>
              ) : (
                menuCategories
                  .filter(cat => cat.id === activeCategory)
                  .map((category) => (
                    <div key={category.id}>
                      <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                      <div className="grid gap-4">
                        {menuItems
                          .filter(item => item.category === category.id || !item.category)
                          .map((item) => (
                            <Card key={item._id} className="shadow-card hover:shadow-hover transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex gap-4">
                                    <div className="text-4xl">🍽️</div>
                                    <div>
                                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                                      <p className="text-muted-foreground mb-2">{item.description}</p>
                                      <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                          <Star className="w-4 h-4 fill-warning text-warning" />
                                          <span>4.5</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          <span>15-20 min</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xl font-bold text-primary mb-3">
                                      {item.price} ETB
                                    </div>
                                    {cart[item._id] ? (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => removeFromCart(item._id)}
                                        >
                                          <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="w-8 text-center">{cart[item._id]}</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => addToCart(item._id)}
                                        >
                                          <Plus className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => addToCart(item._id)}
                                      >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Orders */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>Track your active orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <div key={order.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Order #{order.pickupCode}</div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status === "ready" ? "Ready for Pickup!" : "Preparing"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {order.items.join(", ")}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ordered: {order.orderTime}</span>
                        <span className="font-medium">${order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cart Summary */}
            {getCartItemsCount() > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Cart Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(cart).map(([itemId, quantity]) => {
                      const item = menuCategories
                        .flatMap(cat => cat.items)
                        .find(item => item.id === itemId);
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
            )}

            {/* Recommendations */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your previous orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <span className="text-2xl">🥪</span>
                    <div>
                      <div className="font-medium text-sm">Turkey Club</div>
                      <div className="text-xs text-muted-foreground">$9.99</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <span className="text-2xl">🍲</span>
                    <div>
                      <div className="font-medium text-sm">Soup of the Day</div>
                      <div className="text-xs text-muted-foreground">$6.99</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}