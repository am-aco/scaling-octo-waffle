import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, User, Clock } from "lucide-react";

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface TouchedFields {
  name?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const validateName = (value: string) => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    return undefined;
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
    return undefined;
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return undefined;
  };

  const validateConfirmPassword = (value: string, pwd: string) => {
    if (!value) return "Please confirm your password";
    if (value !== pwd) return "Passwords don't match";
    return undefined;
  };

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    switch (field) {
      case "name":
        setErrors((prev) => ({ ...prev, name: validateName(name) }));
        break;
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
        break;
      case "password":
        setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, password) }));
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);
    
    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    
    if (nameError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Account created successfully!");
    setIsLoading(false);
    
    // Navigate to dashboard with user info
    navigate("/dashboard", { state: { name: name.split(" ")[0] } });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">
          Enter your details to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) {
                    setErrors((prev) => ({ ...prev, name: validateName(e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur("name")}
                className={`pl-10 h-12 border-2 ${touched.name && errors.name ? "border-destructive" : ""}`}
              />
            </div>
            {touched.name && errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) {
                    setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur("email")}
                className={`pl-10 h-12 border-2 ${touched.email && errors.email ? "border-destructive" : ""}`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) {
                    setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur("password")}
                className={`pl-10 pr-10 h-12 border-2 ${touched.password && errors.password ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.password && errors.password ? (
              <p className="text-sm text-destructive">{errors.password}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(e.target.value, password) }));
                  }
                }}
                onBlur={() => handleBlur("confirmPassword")}
                className={`pl-10 pr-10 h-12 border-2 ${touched.confirmPassword && errors.confirmPassword ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          size="xl"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="xl"
        className="w-full"
        disabled
      >
        <Clock className="mr-2 h-4 w-4" />
        Google sign-up coming soon
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-medium text-foreground cursor-pointer hover:underline underline-offset-4"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
