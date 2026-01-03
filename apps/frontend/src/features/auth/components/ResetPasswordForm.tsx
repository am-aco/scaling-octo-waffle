import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { handleApiError } from "@/lib/error-utils";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/features/auth/schemas/auth.schemas";

interface ResetPasswordFormProps {
    token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetPasswordSchema) => {
        try {
            const response = await authApi.resetPassword({ token, newPassword: data.password });
            await logout();
            toast.success(response.message, {
                id: "reset-password-success",
            });
            navigate("/auth");
        } catch (error) {
            handleApiError(error, "reset-password-error");
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Set new password</h1>
                <p className="text-muted-foreground">
                    Your new password must be at least 8 characters
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New password</Label>
                        <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                                className={`pl-10 pr-10 h-12 border-2 ${errors.password ? "border-destructive" : ""
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
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
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
                                {...register("confirmPassword")}
                                className={`pl-10 pr-10 h-12 border-2 ${errors.confirmPassword
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
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>

                <Button type="submit" size="xl" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Resetting..." : "Reset password"}
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

