import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Clock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { handleApiError } from "@/lib/error-utils";

interface SignInFormProps {
    onSwitchToSignUp: () => void;
    onSwitchToForgotPassword: () => void;
}

interface FieldErrors {
    email?: string;
    password?: string;
}

export function SignInForm({ onSwitchToSignUp, onSwitchToForgotPassword }: SignInFormProps) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

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

    const handleBlur = (field: "email" | "password") => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        if (field === "email") {
            setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
        } else {
            setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        setErrors({ email: emailError, password: passwordError });
        setTouched({ email: true, password: true });

        if (emailError || passwordError) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await login({ email, password, rememberMe });
            toast.success(response.message, { id: "signin-success" });
            navigate("/dashboard");
        } catch (error) {
            handleApiError(error, "signin-error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground">
                    Enter your credentials to access your account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
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
                        <Label htmlFor="password">Password</Label>
                        <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
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
                        {touched.password && errors.password && (
                            <p className="text-sm text-destructive">{errors.password}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                            Remember me
                        </Label>
                    </div>
                    <button
                        type="button"
                        onClick={onSwitchToForgotPassword}
                        className="text-sm font-medium cursor-pointer hover:underline underline-offset-4"
                    >
                        Forgot password?
                    </button>
                </div>

                <Button
                    type="submit"
                    size="xl"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Signing in..." : "Sign in"}
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
                Google sign-in coming soon
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="font-medium text-foreground cursor-pointer hover:underline underline-offset-4"
                >
                    Sign up
                </button>
            </p>
        </div>
    );
}
