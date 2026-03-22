import { supabase, getCachedBriefing, saveBriefingToCache } from "./supabase";

// Simple hash function for context cache keying
const getContextHash = (notes: string[], quotes: string[]) => {
  const str = notes.join('|') + '###' + quotes.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export const analyzeContentWithAI = async (text: string) => {
    try {
        const { data, error } = await supabase.functions.invoke('ai-proxy', {
            body: { action: 'analyzeContentWithAI', payload: { text } }
        });
        if (error) throw error;
        return data;
    } catch (e) {
        console.error("AI Analysis Error:", e);
        return [
            { id: '1', label: 'Özgürlük Arayışı', weight: 0.8, description: 'Bireysel özgürlük ve toplumsal normlar.' },
            { id: '2', label: 'Varoluş Sancısı', weight: 0.6, description: 'Hayatın anlamını aramak.' }
        ];
    }
};

export const generateMentorInsight = async (bookTitle: string, notes: string[]) => {
    try {
        const { data, error } = await supabase.functions.invoke('ai-proxy', {
            body: { action: 'generateMentorInsight', payload: { bookTitle, notes } }
        });
        if (error) throw error;
        return data?.text;
    } catch(e) {
        console.error("Gemini Mentor Insight failed", e);
        return "Okuma yolculuğun değerli bir keşif süreci. Notların zihnindeki kapıları aralıyor.";
    }
};

export const generateBookBriefing = async (bookTitle: string, author: string, userNotes: string[] = [], userQuotes: string[] = []) => {
  const contextHash = getContextHash(userNotes, userQuotes);
  
  // 1. Try Cache First
  const cached = await getCachedBriefing(bookTitle, author, contextHash);
  if (cached) {
    console.log("Using cached briefing from Supabase for:", bookTitle);
    return cached;
  }

  let finalBriefing = null;

  try {
      const { data, error } = await supabase.functions.invoke('ai-proxy', {
          body: { action: 'generateBookBriefing', payload: { bookTitle, author, userNotes, userQuotes } }
      });
      if (error) throw error;
      finalBriefing = data;
  } catch(e) {
      console.error("Briefing Generation error", e);
  }

  // If we got a briefing, save to cache
  if (finalBriefing && finalBriefing.focus && !finalBriefing.focus.includes("AI bağlantısı gerekiyor")) {
    await saveBriefingToCache(bookTitle, author, contextHash, finalBriefing);
    return finalBriefing;
  }

  return finalBriefing || {
    focus: "Eser analiz edilemedi. Geçici hizmet kesintisi.",
    importance: `${author} tarafından kaleme alınan bu eser özeldir.`,
    story: "Eserin arka planında derin bir okuma var.",
    message: "Okuma yolculuğuna devam et."
  };
};
