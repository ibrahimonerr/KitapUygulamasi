import { supabase } from './supabase';

/**
 * Perform a semantic search for books based on a natural language query.
 * This function securely proxies the request through the Supabase Edge Function 'ai-proxy'.
 */
export const searchBooksSemantically = async (query: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { action: 'searchBooksSemantically', payload: { query } }
    });
    
    if (error) throw error;
    return data?.suggestions || [];
  } catch (error) {
    console.error("Semantic search error:", error);
    return [];
  }
};
