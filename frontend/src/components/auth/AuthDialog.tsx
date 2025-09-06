import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api";

type UserRole = "student" | "staff" | "admin";
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

// Default credentials for testing
const defaultCredentials = {
  student: { email: "student@university.edu", password: "password123" },
  staff: { email: "staff@university.edu", password: "password123" },
  admin: { email: "admin@university.edu", password: "password123" },
};

export function AuthDialog({ open, onClose, onAuthSuccess }: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const data = await api.login(email, password);
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };
      onAuthSuccess(user);
      toast.success(`Welcome back, ${data.user.name}!`);
      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDefaultLogin = (role: UserRole) => {
    const creds = defaultCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In to Smart Campus</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your dashboard
          </DialogDescription>
        </DialogHeader>

        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-primary">Test Credentials</CardTitle>
            <CardDescription className="text-xs">
              Use these credentials to test the system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs font-mono space-y-2">
              <div><strong>Student:</strong> student@university.edu / password123</div>
              <div><strong>Staff:</strong> staff@university.edu / password123</div>
              <div><strong>Admin:</strong> admin@university.edu / password123</div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDefaultLogin("student")}
              >
                Student
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDefaultLogin("staff")}
              >
                Staff
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDefaultLogin("admin")}
              >
                Admin
              </Button>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}