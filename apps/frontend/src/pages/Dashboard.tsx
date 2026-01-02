import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, User, FileText, Eye, Pencil, Trash2, PlusCircle, ShieldCheck } from "lucide-react";

const MOCK_PERMISSIONS = [
  { id: "profile:read", label: "profile:read", description: "View own profile", icon: User },
  { id: "profile:update", label: "profile:update", description: "Update own profile", icon: Pencil },
  { id: "users:read", label: "users:read", description: "View all users", icon: Eye },
  { id: "users:update", label: "users:update", description: "Update any user", icon: Pencil },
  { id: "users:delete", label: "users:delete", description: "Delete any user", icon: Trash2 },
  { id: "posts:create", label: "posts:create", description: "Create new posts", icon: PlusCircle },
  { id: "posts:read", label: "posts:read", description: "View all posts", icon: FileText },
  { id: "posts:update", label: "posts:update", description: "Update any post", icon: Pencil },
  { id: "posts:delete", label: "posts:delete", description: "Delete any post", icon: Trash2 },
  { id: "posts:moderate", label: "posts:moderate", description: "Moderate posts", icon: ShieldCheck },
];

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = location.state?.name || "User";

  const handleLogout = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-2 gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome, {userName}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's an overview of your account permissions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Your Permissions</h2>
              <span className="px-2 py-1 text-xs font-medium border-2 border-foreground bg-primary text-primary-foreground">
                admin
              </span>
            </div>

            <div className="grid gap-4">
              {MOCK_PERMISSIONS.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start gap-4 p-4 border-2 border-border bg-card"
                >
                  <div className="w-10 h-10 border-2 border-border flex items-center justify-center shrink-0">
                    <permission.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-mono text-sm font-medium">{permission.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
