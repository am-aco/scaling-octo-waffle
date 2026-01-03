import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute, GuestRoute } from "@/features/auth";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ResetPassword from "@/pages/ResetPassword";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <GuestRoute>
                                <Index />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/auth"
                        element={
                            <GuestRoute>
                                <Auth />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
