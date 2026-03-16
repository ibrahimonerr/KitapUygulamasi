import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Supabase Configuration Check:');
console.log('- URL defined:', !!supabaseUrl);
console.log('- Key defined:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase environment variables are missing! Authentication will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Diagnostic: Ping Supabase to verify connectivity
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.warn('Supabase Connection Test (Profiles):', error.message);
    } else {
      console.log('Supabase Connection Test: SUCCESS');
    }
  } catch (err) {
    console.error('Supabase Connection Test EXCEPTION:', err);
  }
};
testConnection();

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
