import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { authApi } from "../api/auth.api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiClientError } from "@/services/api/client";

interface ResetPasswordFormProps {
  token: string;
}

interface FieldErrors {
  password?: string;
  confirmPassword?: string;
}

interface TouchedFields {
  password?: boolean;
  confirmPassword?: boolean;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

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
      case "password":
        setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(confirmPassword, password),
        }));
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });
    setTouched({ password: true, confirmPassword: true });

    if (passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword: password });
      await logout();
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 border-2 border-border flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Password reset</h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset.
            <br />
            You can now sign in with your new password.
          </p>
        </div>

        <Button
          type="button"
          size="xl"
          className="w-full"
          onClick={() => navigate("/auth")}
        >
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Set new password</h1>
        <p className="text-muted-foreground">
          Your new password must be at least 8 characters
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) {
                    setErrors((prev) => ({
                      ...prev,
                      password: validatePassword(e.target.value),
                    }));
                  }
                }}
                onBlur={() => handleBlur("password")}
                className={`pl-10 pr-10 h-12 border-2 ${
                  touched.password && errors.password ? "border-destructive" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm new password</Label>
            <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirmPassword) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateConfirmPassword(e.target.value, password),
                    }));
                  }
                }}
                onBlur={() => handleBlur("confirmPassword")}
                className={`pl-10 pr-10 h-12 border-2 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? "border-destructive"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <Button type="submit" size="xl" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => navigate("/auth")}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium cursor-pointer hover:underline underline-offset-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>
    </div>
  );
}
