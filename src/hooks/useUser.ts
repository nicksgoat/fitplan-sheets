
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

export function useUser() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple check to determine if user data is loaded
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  return {
    user,
    isLoading
  };
}
