import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { authApi } from "../api/auth.api";
import { handleApiError } from "@/lib/error-utils";

interface ForgotPasswordFormProps {
    onSwitchToSignIn: () => void;
}

export function ForgotPasswordForm({ onSwitchToSignIn }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authApi.requestPasswordReset({ email });
            setSuccessMessage(response.message);
            setIsSubmitted(true);
        } catch (error) {
            handleApiError(error, "forgot-password-error");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="space-y-8">
                <div className="space-y-2 text-center">
                    <div className="mx-auto w-16 h-16 border-2 border-border flex items-center justify-center mb-6">
                        <Mail className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
                    <p className="text-muted-foreground whitespace-pre-line">
                        {successMessage}
                        <br />
                        <span className="font-medium text-foreground">{email}</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        className="w-full"
                        onClick={() => setIsSubmitted(false)}
                    >
                        Try another email
                    </Button>

                    <button
                        type="button"
                        onClick={onSwitchToSignIn}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium cursor-pointer hover:underline underline-offset-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to sign in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
                <p className="text-muted-foreground">
                    No worries, we'll send you reset instructions
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative transition-all focus-within:shadow-sm focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="reset-email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 border-2"
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    size="xl"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Sending..." : "Send reset link"}
                </Button>
            </form>

            <button
                type="button"
                onClick={onSwitchToSignIn}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium cursor-pointer hover:underline underline-offset-4"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
            </button>
        </div>
    );
}
