import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout, ResetPasswordForm, authApi } from "@/features/auth";
import { toast } from "sonner";
import { handleApiError } from "@/lib/error-utils";

type TokenStatus = "loading" | "valid";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [tokenStatus, setTokenStatus] = useState<TokenStatus>("loading");

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                toast.error("No reset token provided. Please request a new one.", {
                    id: "reset-token-error",
                });
                navigate("/auth", { replace: true });
                return;
            }

            try {
                await authApi.validateResetToken({ token });
                setTokenStatus("valid");
            } catch (error) {
                handleApiError(error, "reset-token-error");
                navigate("/auth", { replace: true });
            }
        };

        validateToken();
    }, [token, navigate]);

    if (tokenStatus === "loading") {
        return (
            <AuthLayout>
                <div className="space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Validating...</h1>
                        <p className="text-muted-foreground">
                            Please wait while we verify your reset link.
                        </p>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <ResetPasswordForm token={token!} />
        </AuthLayout>
    );
};

export default ResetPassword;
