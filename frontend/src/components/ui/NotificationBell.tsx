import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { ScrollArea } from "./scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { api } from "../../api";
import { toast } from "sonner";

type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  priority: string;
};

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only load notifications if userId is defined
    if (userId) {
      loadNotifications();
      loadUnreadCount();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await api.getNotifications(1, 10, false);
      if (response && response.notifications) {
        setNotifications(response.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!userId) return;
    
    try {
      const response = await api.getUnreadNotificationCount();
      if (response && typeof response.count === 'number') {
        setUnreadCount(response.count);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!userId || !notificationId) return;
    
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grade_published': return '🎓';
      case 'grade_rejected': return '❌';
      case 'assignment_due': return '📝';
      case 'course_announcement': return '📢';
      default: return '🔔';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-white hover:text-white/80">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No new notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm">You'll see updates here when available</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification._id)}
                                className="h-6 px-2 text-xs"
                              >
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}