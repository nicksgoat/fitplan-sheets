
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
                    <MainLayout>
                      <Explore />
                    </MainLayout>
                  </AuthenticatedRoute>
                } 
              />
              <Route 
                path="/library" 
                element={
                  <AuthenticatedRoute>
                    <MainLayout>
                      <Library />
                    </MainLayout>
                  </AuthenticatedRoute>
                } 
              />
              <Route 
                path="/liked" 
                element={
                  <AuthenticatedRoute>
                    <MainLayout>
                      <Liked />
                    </MainLayout>
                  </AuthenticatedRoute>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <AuthenticatedRoute>
                    <MainLayout>
                      <Search />
                    </MainLayout>
                  </AuthenticatedRoute>
                } 
              />
              <Route 
                path="/sheets" 
                element={
                  <AuthenticatedRoute>
                    <MainLayout>
                      <Sheets />
                    </MainLayout>
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
