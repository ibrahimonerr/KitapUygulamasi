import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * AI Brifinglerini getiren/kaydeden yardımcılar
 */
export const getCachedBriefing = async (bookTitle: string, author: string, contextHash: string) => {
  try {
    const { data, error } = await supabase
      .from('ai_briefings')
      .select('*')
      .eq('book_title', bookTitle)
      .eq('author', author)
      .eq('user_context_hash', contextHash)
      .single();

    if (error || !data) return null;
    return data.briefing_json;
  } catch (error) {
    console.error('Supabase get cache error:', error);
    return null;
  }
};

export const saveBriefingToCache = async (bookTitle: string, author: string, contextHash: string, briefing: any) => {
  try {
    const { error } = await supabase
      .from('ai_briefings')
      .upsert({
        book_title: bookTitle,
        author: author,
        user_context_hash: contextHash,
        briefing_json: briefing,
        created_at: new Date().toISOString()
      }, { onConflict: 'book_title,author,user_context_hash' });

    if (error) console.error('Supabase save cache error:', error);
  } catch (error) {
    console.error('Supabase save cache exception:', error);
  }
};
