
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Remove the old CSS import and use the new tailwind styles
import "./index.css";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-dark-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>;
  }
  
  if (!session) {
    return <Navigate to="/auth" />;
  }

  return children;
};

// Make sure each provider is properly nested
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <div className="dark">
          <TooltipProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner position="top-center" />
          </TooltipProvider>
        </div>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
