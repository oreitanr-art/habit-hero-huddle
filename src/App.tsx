import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DevPreview from "./pages/DevPreview";
import ShopPreview from "./pages/ShopPreview";
import Tutorials from "./pages/Tutorials";
import { CompleteProfileForm } from "./components/auth/CompleteProfileForm";
import { motion } from "framer-motion";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          🪙
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // User is logged in but has no profile (e.g., Google OAuth first time)
  if (!profile) {
    return <CompleteProfileForm />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isRecoveryMode } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          🪙
        </motion.div>
      </div>
    );
  }

  // If user is logged in but in recovery mode, let them stay on auth page to reset password
  if (user && !isRecoveryMode) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />
            <Route path="/dev" element={<DevPreview />} />
            <Route
              path="/shop-preview"
              element={
                <ProtectedRoute>
                  <ShopPreview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutorials"
              element={
                <ProtectedRoute>
                  <Tutorials />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
