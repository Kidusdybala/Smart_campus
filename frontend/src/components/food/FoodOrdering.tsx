import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "../../api";
import { FoodOrderingHeader } from "./FoodOrderingHeader";
import { MenuDisplay } from "./MenuDisplay";
import { OrderHistory } from "./OrderHistory";
import { CartSummary } from "./CartSummary";
import { Recommendations } from "./Recommendations";
import { useNavigate } from "react-router-dom";

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
   const navigate = useNavigate();
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

  // Function to handle authentication errors
  const handleAuthError = (error: Error | { message?: string }) => {
    if (error.message && error.message.includes('User not found')) {
      toast.error("Authentication error. Please log in again.");
      api.clearToken();
      navigate('/');
      return true;
    }
    return false;
  };

  // Function to refresh wallet balance
  const refreshWalletBalance = async () => {
    try {
      const walletResponse = await api.getWalletBalance();
      setWalletBalance(walletResponse.balance);
    } catch (error) {
      console.error("Failed to refresh wallet balance:", error);
      // Don't show error toast for wallet refresh failures
      // as this might be due to authentication issues
      handleAuthError(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menu, wallet, userOrders] = await Promise.all([
          api.getMenu(),
          api.getWalletBalance().catch(err => {
            console.error('Wallet balance error:', err);
            if (!handleAuthError(err)) {
              // Return default balance if wallet not found (not auth error)
              return { balance: 0 };
            }
            return { balance: 0 };
          }),
          api.getOrders()
        ]);
        setMenuItems(menu);
        setWalletBalance(wallet.balance);
        setOrders(userOrders);
        checkForNotifications(userOrders);
      } catch (error) {
        console.error('Failed to load data:', error);
        if (!handleAuthError(error)) {
          toast.error("Failed to load data. Some features may not work properly.");
        }
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    };
    fetchData();

    // Check URL for payment completion
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    if (paymentId) {
      // Complete the payment and refresh wallet balance
      api.completePayment(paymentId).then(() => {
        refreshWalletBalance();
        toast.success("Payment completed successfully! Wallet balance updated.");
      }).catch((error) => {
        console.error('Failed to complete payment:', error);
        toast.error("Failed to complete payment. Please contact support.");
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

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
      const paymentResponse = await api.payForOrder(orderResponse._id);

      toast.success("Order placed and paid successfully!", {
        description: "You'll receive a notification when it's ready for pickup"
      });

      // Update wallet balance from server response and refresh orders
      if (paymentResponse.newBalance !== undefined) {
        setWalletBalance(paymentResponse.newBalance);
      } else {
        // Fallback: refresh wallet balance from server
        try {
          const walletResponse = await api.getWalletBalance();
          setWalletBalance(walletResponse.balance);
        } catch (error) {
          console.error("Failed to refresh wallet balance after payment:", error);
          // Calculate new balance locally as fallback
          setWalletBalance(prevBalance => Math.max(0, prevBalance - totalAmount));
        }
      }
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
      <FoodOrderingHeader
        onBack={onBack}
        walletBalance={walletBalance}
        topupAmount={topupAmount}
        setTopupAmount={setTopupAmount}
        topupDialogOpen={topupDialogOpen}
        setTopupDialogOpen={setTopupDialogOpen}
        getCartItemsCount={getCartItemsCount}
        getCartTotal={getCartTotal}
        placeOrder={placeOrder}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu */}
          <div className="lg:col-span-2">
            <MenuDisplay
              menuItems={menuItems}
              loading={loading}
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <OrderHistory orders={orders} ordersLoading={ordersLoading} />
            <CartSummary
              cart={cart}
              menuItems={menuItems}
              getCartTotal={getCartTotal}
              placeOrder={placeOrder}
            />
            <Recommendations />
          </div>
        </div>
      </div>
    </div>
  );
}