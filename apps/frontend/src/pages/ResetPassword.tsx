import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout, ResetPasswordForm, authApi } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { ApiClientError } from "@/services/api/client";

type TokenStatus = "loading" | "valid" | "invalid";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenStatus("invalid");
        setErrorMessage("No reset token provided");
        return;
      }

      try {
        await authApi.validateResetToken({ token });
        setTokenStatus("valid");
      } catch (error) {
        setTokenStatus("invalid");
        if (error instanceof ApiClientError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Invalid or expired reset link");
        }
      }
    };

    validateToken();
  }, [token]);

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

  if (tokenStatus === "invalid") {
    return (
      <AuthLayout>
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 border-2 border-destructive flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Invalid link</h1>
            <p className="text-muted-foreground">
              {errorMessage || "This password reset link is invalid or has expired."}
              <br />
              Please request a new one.
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
