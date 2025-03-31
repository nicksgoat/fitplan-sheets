import { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyPhoneCode: (phone: string, code: string) => Promise<void>;
  signUpWithPhone: (phone: string, password: string, code: string) => Promise<void>;
  signInWithPhonePassword: (phone: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        toast.error('Error loading user session');
      } else {
        setSession(data.session);
        setUser(data.session?.user || null);
      }
      
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Signed in successfully');
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Account created! Check your email for confirmation.');
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      // Success message will be shown after redirect
    } catch (err) {
      console.error('Google sign in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ 
        phone,
        options: {
          channel: 'sms'
        }
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Verification code sent to your phone');
    } catch (err) {
      console.error('Phone sign in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneCode = async (phone: string, code: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms'
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Signed in successfully');
    } catch (err) {
      console.error('Phone verification error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithPhone = async (phone: string, password: string, code: string) => {
    try {
      setLoading(true);
      
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms'
      });
      
      if (verifyError) {
        toast.error(verifyError.message);
        throw verifyError;
      }
      
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });
      
      if (updateError) {
        toast.error(updateError.message);
        throw updateError;
      }
      
      toast.success('Account created with phone and password');
    } catch (err) {
      console.error('Phone sign up error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithPhonePassword = async (phone: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        phone,
        password
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Signed in successfully');
    } catch (err) {
      console.error('Phone and password sign in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Signed out successfully');
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithPhone,
    verifyPhoneCode,
    signUpWithPhone,
    signInWithPhonePassword,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
