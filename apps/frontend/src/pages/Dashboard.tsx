import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { LogOut, Shield, User, FileText, Eye, Pencil, Trash2, PlusCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/* Metadata for known permissions to display nice icons and descriptions */
const PERMISSION_METADATA: Record<string, { label: string; description: string; icon: any }> = {
  "profile:read": { label: "profile:read", description: "View own profile", icon: User },
  "profile:update": { label: "profile:update", description: "Update own profile", icon: Pencil },
  "users:read": { label: "users:read", description: "View all users", icon: Eye },
  "users:create": { label: "users:create", description: "Create new users", icon: PlusCircle },
  "users:update": { label: "users:update", description: "Update any user", icon: Pencil },
  "users:delete": { label: "users:delete", description: "Delete any user", icon: Trash2 },
  "posts:create": { label: "posts:create", description: "Create new posts", icon: PlusCircle },
  "posts:read": { label: "posts:read", description: "View all posts", icon: FileText },
  "posts:update": { label: "posts:update", description: "Update any post", icon: Pencil },
  "posts:delete": { label: "posts:delete", description: "Delete any post", icon: Trash2 },
  "posts:moderate": { label: "posts:moderate", description: "Moderate posts", icon: ShieldCheck },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const displayName = user?.email?.split("@")[0] || "User";
  const userPermissions = user?.permissions || [];
  
  /* Naive check: If they have 'users:delete', they are likely an admin in our simple model */
  const isAdmin = userPermissions.includes("users:delete");

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
              Welcome, {displayName}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's an overview of your account permissions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Your Permissions</h2>
              <span className={`px-2 py-1 text-xs font-medium border-2 ${isAdmin 
                ? "border-foreground bg-primary text-primary-foreground" 
                : "border-muted-foreground bg-secondary text-secondary-foreground"
              }`}>
                {isAdmin ? "admin" : "user"}
              </span>
            </div>

            <div className="grid gap-4">
              {userPermissions.length > 0 ? (
                userPermissions.map((permissionName) => {
                  const meta = PERMISSION_METADATA[permissionName] || {
                    label: permissionName,
                    description: "Custom permission",
                    icon: Shield
                  };
                  const Icon = meta.icon;

                  return (
                    <div
                      key={permissionName}
                      className="flex items-start gap-4 p-4 border-2 border-border bg-card"
                    >
                      <div className="w-10 h-10 border-2 border-border flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-mono text-sm font-medium">{meta.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {meta.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-muted text-muted-foreground">
                  No permissions assigned to this account.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
