import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, UtensilsCrossed, Clock, Star, Plus, Minus, ShoppingCart, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin" | "cafeteria";
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
    name: "Soft Drinks",
    items: []
  }
];


export function FoodOrdering({ onBack, user }: FoodOrderingProps) {
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [activeCategory, setActiveCategory] = useState("mains");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menu, wallet, userOrders] = await Promise.all([
          api.getMenu(),
          api.getWalletBalance(),
          api.getOrders()
        ]);
        setMenuItems(menu);
        setWalletBalance(wallet.balance);
        setOrders(userOrders);
        checkForNotifications(userOrders);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    };
    fetchData();

    // Check for order updates every 30 seconds
    const interval = setInterval(async () => {
      try {
        const updatedOrders = await api.getOrders();
        checkForNotifications(updatedOrders);
        setOrders(updatedOrders);
      } catch (error) {
        console.error("Failed to check order updates:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
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
      const item = menuItems.find(item => item._id === itemId);
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

      // Update wallet balance and refresh orders
      setWalletBalance(prev => prev - totalAmount);
      setCart({});

      // Refresh orders
      try {
        const updatedOrders = await api.getOrders();
        setOrders(updatedOrders);
      } catch (error) {
        console.error("Failed to refresh orders:", error);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Failed to place order: " + (error.message || "Unknown error"));
    }
  };

  const checkForNotifications = (currentOrders) => {
    const readyOrders = currentOrders.filter(order => order.status === 'ready');
    const newNotifications = readyOrders.map(order => ({
      id: order._id,
      message: `Your order #${order._id.slice(-6)} is ready for pickup!`,
      type: 'ready',
      orderId: order._id
    }));

    // Show notifications for new ready orders
    newNotifications.forEach(notification => {
      if (!notifications.find(n => n.id === notification.id)) {
        toast.success(notification.message, {
          duration: 10000,
          action: {
            label: "View Order",
            onClick: () => {
              // Scroll to order history section
              document.getElementById('order-history')?.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      }
    });

    setNotifications(newNotifications);
  };

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
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
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
            {/* Order History */}
            <Card id="order-history" className="shadow-card">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Your recent food orders</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-4">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No orders yet. Place your first order!
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Order #{order._id.slice(-6)}</div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === "ready" ? "Ready for Pickup!" :
                             order.status === "preparing" ? "Preparing" :
                             order.status === "picked" ? "Completed" : "Ordered"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {order.items.map(item => item.food.name).join(", ")}
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ordered: {new Date(order.orderedAt).toLocaleString()}</span>
                          <span className="font-medium">{order.total} ETB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    <span className="text-2xl">🍛</span>
                    <div>
                      <div className="font-medium text-sm">Tibs</div>
                      <div className="text-xs text-muted-foreground">200 ETB</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <span className="text-2xl">🥘</span>
                    <div>
                      <div className="font-medium text-sm">Misir Wat</div>
                      <div className="text-xs text-muted-foreground">120 ETB</div>
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