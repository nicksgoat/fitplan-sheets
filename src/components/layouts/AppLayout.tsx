
import React from "react";
import { Outlet } from "react-router-dom";
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Home, Search, Library, Heart, User, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4">
              <h2 className="text-xl font-bold text-white mb-8">
                <span className="text-gray-100">Fit</span>
                <span className="text-purple-500">Bloom</span>
              </h2>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Home" className="mb-2">
                    <Link to="/" className="flex items-center gap-x-4">
                      <Home className="h-5 w-5" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Search" className="mb-2">
                    <Link to="/search" className="flex items-center gap-x-4">
                      <Search className="h-5 w-5" />
                      <span>Search</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="My Library" className="mb-2">
                    <Link to="/library" className="flex items-center gap-x-4">
                      <Library className="h-5 w-5" />
                      <span>My Library</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Liked" className="mb-2">
                    <Link to="/liked" className="flex items-center gap-x-4">
                      <Heart className="h-5 w-5" />
                      <span>Liked</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Sheets" className="mb-2">
                    <Link to="/sheets" className="flex items-center gap-x-4">
                      <FileText className="h-5 w-5" />
                      <span>Sheets</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Profile" className="mb-2">
                    <Link to="/profile" className="flex items-center gap-x-4">
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-grow bg-dark-100 text-white">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
