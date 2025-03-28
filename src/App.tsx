import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthenticatedRoute from "@/components/AuthenticatedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Library from "./pages/Library";
import Liked from "./pages/Liked";
import Search from "./pages/Search";
import Sheets from "./pages/Sheets";
import MainLayout from "./components/layout/MainLayout";
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <div className="dark">
          <TooltipProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route 
                path="/explore" 
                element={
                  <AuthenticatedRoute>
                    <Explore />
                  </AuthenticatedRoute>
                } 
              />
              <Route 
                path="/library" 
                element={
                  <AuthenticatedRoute>
                    <Library />
                  </AuthenticatedRoute>
                } 
              />
              <Route 
                path="/liked" 
                element={
                  <AuthenticatedRoute>
                    <Liked />
                  </AuthenticatedRoute>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <AuthenticatedRoute>
                    <Search />
                  </AuthenticatedRoute>
                } 
              />
              <Route 
                path="/sheets" 
                element={
                  <AuthenticatedRoute>
                    <Sheets />
                  </AuthenticatedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner position="top-center" />
          </TooltipProvider>
        </div>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
