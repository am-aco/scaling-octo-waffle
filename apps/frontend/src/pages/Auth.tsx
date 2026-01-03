import { useState } from "react";
import {
  AuthLayout,
  SignInForm,
  SignUpForm,
  ForgotPasswordForm,
} from "@/features/auth";

type AuthView = "signin" | "signup" | "forgot-password";

const Auth = () => {
  const [view, setView] = useState<AuthView>("signin");

  return (
    <AuthLayout>
      {view === "signin" && (
        <SignInForm
          onSwitchToSignUp={() => setView("signup")}
          onSwitchToForgotPassword={() => setView("forgot-password")}
        />
      )}
      {view === "signup" && (
        <SignUpForm onSwitchToSignIn={() => setView("signin")} />
      )}
      {view === "forgot-password" && (
        <ForgotPasswordForm onSwitchToSignIn={() => setView("signin")} />
      )}
    </AuthLayout>
  );
};

export default Auth;
