import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { ChefHat, Clock, CheckCircle, AlertCircle, Users, TrendingUp, LogOut } from "lucide-react";
import { api } from "../../api";

type User = {
   id: string;
   name: string;
   email: string;
   role: "student" | "staff" | "admin" | "cafeteria";
};

type OrderItem = {
   food: {
      name: string;
   } | null;
   quantity: number;
   _id: string;
};

type Order = {
   _id: string;
   user: User | null;
   items: OrderItem[];
   status: string;
   orderedAt: string;
   updatedAt?: string;
   total: number;
};

interface CafeteriaDashboardProps {
   user: User;
   onLogout?: () => void;
}

export function CafeteriaDashboard({ user, onLogout }: CafeteriaDashboardProps) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const allOrders = await api.getAllOrders();
      setOrders(allOrders);

      // Calculate stats
      const pending = allOrders.filter(order => order.status === 'ordered' || order.status === 'preparing').length;
      const completed = allOrders.filter(order => order.status === 'ready' || order.status === 'picked').length;
      const todayRevenue = allOrders
        .filter(order => {
          const orderDate = new Date(order.orderedAt);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString() && order.status !== 'ordered';
        })
        .reduce((sum, order) => sum + order.total, 0);

      setStats({
        totalOrders: allOrders.length,
        pendingOrders: pending,
        completedOrders: completed,
        todayRevenue
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered": return "bg-blue-500";
      case "preparing": return "bg-yellow-500";
      case "ready": return "bg-green-500";
      case "picked": return "bg-gray-500";
      default: return "bg-secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ordered": return <AlertCircle className="w-4 h-4" />;
      case "preparing": return <ChefHat className="w-4 h-4" />;
      case "ready": return <CheckCircle className="w-4 h-4" />;
      case "picked": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Smart Campus Logo"
                className="w-10 h-10 rounded-lg object-contain bg-white/20 p-1"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Cafeteria Dashboard</h1>
                <p className="text-white/80 text-sm">Manage food orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-white/80 text-sm">
                 Welcome, {user.name}
               </div>
               {stats.pendingOrders > 0 && (
                 <div className="relative">
                   <AlertCircle className="w-6 h-6 text-white" />
                   <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                     {stats.pendingOrders}
                   </Badge>
                 </div>
               )}
               {onLogout && (
                 <AlertDialog>
                   <AlertDialogTrigger asChild>
                     <Button
                       variant="ghost"
                       size="sm"
                       className="text-white hover:bg-white/20"
                     >
                       <LogOut className="w-4 h-4 mr-2" />
                       Logout
                     </Button>
                   </AlertDialogTrigger>
                   <AlertDialogContent>
                     <AlertDialogHeader>
                       <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                       <AlertDialogDescription>
                         You will be redirected to the login page and will need to sign in again to access your dashboard.
                       </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                       <AlertDialogCancel>Cancel</AlertDialogCancel>
                       <AlertDialogAction onClick={onLogout}>
                         Logout
                       </AlertDialogAction>
                     </AlertDialogFooter>
                   </AlertDialogContent>
                 </AlertDialog>
               )}
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold">{stats.todayRevenue} ETB</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>Process and track food orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">Pending ({orders.filter(o => o.status === 'ordered').length})</TabsTrigger>
                <TabsTrigger value="preparing">Preparing ({orders.filter(o => o.status === 'preparing').length})</TabsTrigger>
                <TabsTrigger value="ready">Ready ({orders.filter(o => o.status === 'ready').length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({orders.filter(o => o.status === 'picked').length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {orders.filter(order => order.status === 'ordered').map((order) => (
                  <div key={order._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Order #{order._id.slice(-6)}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Customer: {order.user?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Items: {(order.items || [])
                        .filter(item => item)
                        .map((item: OrderItem) => item?.food?.name || "")
                        .filter(Boolean)
                        .join(", ") || "Unknown"}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ordered: {new Date(order.orderedAt).toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                          className="bg-yellow-500 hover:bg-yellow-600"
                        >
                          Start Preparing
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="preparing" className="space-y-4">
                {orders.filter(order => order.status === 'preparing').map((order) => (
                  <div key={order._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Order #{order._id.slice(-6)}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Customer: {order.user?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Items: {(order.items || [])
                        .filter(item => item)
                        .map((item: OrderItem) => item?.food?.name || "")
                        .filter(Boolean)
                        .join(", ") || "Unknown"}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ordered: {new Date(order.orderedAt).toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order._id, 'ready')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Mark as Ready
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="ready" className="space-y-4">
                {orders.filter(order => order.status === 'ready').map((order) => (
                  <div key={order._id} className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Order #{order._id.slice(-6)}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Customer: {order.user?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Items: {(order.items || [])
                        .filter(item => item)
                        .map((item: OrderItem) => item?.food?.name || "")
                        .filter(Boolean)
                        .join(", ") || "Unknown"}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ready since: {new Date(order.updatedAt || order.orderedAt).toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order._id, 'picked')}
                        >
                          Mark as Picked Up
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {orders.filter(order => order.status === 'picked').map((order) => (
                  <div key={order._id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Order #{order._id.slice(-6)}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Customer: {order.user?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Items: {(order.items || [])
                        .filter(item => item)
                        .map((item: any) => item?.food?.name || item?.name || "")
                        .filter(Boolean)
                        .join(", ") || "Unknown"}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed: {new Date(order.updatedAt || order.orderedAt).toLocaleString()}</span>
                      <span className="font-medium">{order.total} ETB</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}