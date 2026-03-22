import { supabase } from './supabase';

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  type: 'book' | 'quote' | 'author';
  content: string;
  category: string;
  intensity: 'light' | 'deep' | 'academic';
}

export const generateForYouContent = async (
  tasteProfile: any,
  recentBooks: string[]
): Promise<Recommendation[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: { action: 'generateForYouContent', payload: { tasteProfile, recentBooks } }
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("For You Generation Error:", error);
    return [];
  }
};
