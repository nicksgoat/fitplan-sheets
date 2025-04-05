
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Fix RLS policies for club tables to resolve infinite recursion
 */
export async function fixClubRLSPolicies(): Promise<boolean> {
  try {
    console.log("Attempting to fix RLS policies...");
    
    // Call our edge function to fix the RLS policies
    const { data, error } = await supabase.functions.invoke('fix-rls-policies');
    
    if (error) {
      console.error("Error fixing RLS policies:", error);
      toast.error("Failed to fix RLS policies");
      return false;
    }
    
    console.log("RLS policies fixed successfully:", data);
    toast.success("Club security policies have been updated");
    return true;
  } catch (error) {
    console.error("Exception while fixing RLS policies:", error);
    toast.error("An error occurred while fixing security policies");
    return false;
  }
}

/**
 * Apply the SQL function creation first before fixing RLS
 */
export async function initializeClubFunctions(): Promise<boolean> {
  try {
    console.log("Initializing SQL functions...");
    
    // Call our edge function to create the SQL function
    const { data, error } = await supabase.functions.invoke('create-sql-function');
    
    if (error) {
      console.error("Error creating SQL function:", error);
      toast.error("Failed to create SQL function");
      return false;
    }
    
    console.log("SQL function created successfully:", data);
    toast.success("SQL functions initialized");
    return true;
  } catch (error) {
    console.error("Exception while creating SQL function:", error);
    toast.error("An error occurred while initializing SQL functions");
    return false;
  }
}

/**
 * Helper to execute a direct SQL query through the edge function
 */
export async function runSQLQuery(query: string): Promise<any[]> {
  try {
    console.log("Running SQL query:", query);
    
    const { data, error } = await supabase.functions.invoke('run-sql-query', {
      body: { query }
    });
    
    if (error) {
      console.error("Error running SQL query:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error executing SQL query:", error);
    throw error;
  }
}
