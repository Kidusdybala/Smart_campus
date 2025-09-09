import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface Order {
  _id: string;
  items: { food: { name: string } }[];
  status: string;
  orderedAt: string;
  total: number;
}

interface OrderHistoryProps {
  orders: Order[];
  ordersLoading: boolean;
}

export function OrderHistory({ orders, ordersLoading }: OrderHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-success animate-pulse-glow";
      case "preparing": return "bg-warning";
      case "completed": return "bg-muted";
      default: return "bg-secondary";
    }
  };

  return (
    <Card id="order-history" className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Order History</CardTitle>
        <CardDescription className="text-sm md:text-base">Your recent food orders</CardDescription>
      </CardHeader>
      <CardContent>
        {ordersLoading ? (
          <div className="text-center py-4">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm md:text-base">
            No orders yet. Place your first order!
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 max-h-96 overflow-y-auto">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="p-3 md:p-4 rounded-lg border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 space-y-2 md:space-y-0">
                  <div className="font-medium text-sm md:text-base">Order #{order._id.slice(-6)}</div>
                  <Badge className={`${getStatusColor(order.status)} text-xs`}>
                    {order.status === "ready" ? "Ready for Pickup!" :
                     order.status === "preparing" ? "Preparing" :
                     order.status === "picked" ? "Completed" : "Ordered"}
                  </Badge>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                  {order.items.map(item => item.food.name).join(", ")}
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-1 md:space-y-0">
                  <span className="text-xs md:text-sm text-muted-foreground">Ordered: {new Date(order.orderedAt).toLocaleString()}</span>
                  <span className="font-medium text-sm md:text-base text-primary">{order.total} ETB</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}