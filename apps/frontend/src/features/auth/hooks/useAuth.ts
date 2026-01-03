import { useContext } from "react";
import { AuthContext } from "@/features/auth/context/auth-context-def";
import type { AuthContextValue } from "@/features/auth/types/auth.types";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
