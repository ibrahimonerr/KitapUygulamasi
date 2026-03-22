import { supabase } from './supabase';

export interface IntellectualIdentity {
  title: string;
  description: string;
  analysisDate: string;
  traits: string[];
}

export const analyzeIntellectualIdentity = async (
  books: any[],
  quotes: any[],
  notes: any[]
): Promise<IntellectualIdentity> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { action: 'analyzeIntellectualIdentity', payload: { books, quotes, notes } }
    });
    
    if (error) throw error;
    return {
      ...data,
      analysisDate: new Date().toISOString()
    };
  } catch (error) {
    console.error("Identity Analysis Error:", error);
    return {
      title: "Edebi Kaşif",
      description: "Okuma yolculuğun yeni başlıyor. Notlar aldıkça karakterin şekillenecek.",
      traits: ["Meraklı", "Gözlemci", "Arayışta"],
      analysisDate: new Date().toISOString()
    };
  }
};
