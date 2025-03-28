
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="bg-dark-200 border border-dark-300 rounded-lg p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.email || "User"}</h2>
            <p className="text-gray-400">Member since {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="border-t border-dark-300 pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Email</span>
              <span className="text-gray-400">{user?.email || "email@example.com"}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Password</span>
              <Button variant="ghost" size="sm">Change</Button>
            </div>
            
            <div className="pt-4">
              <Button variant="destructive" onClick={signOut}>Sign Out</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
