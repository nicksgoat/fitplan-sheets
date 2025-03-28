
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Remove the old CSS import and use the new tailwind styles
import "./index.css";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Make sure each provider is properly nested
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <div className="dark">
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner position="top-center" />
        </TooltipProvider>
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
