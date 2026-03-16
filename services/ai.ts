import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCachedBriefing, saveBriefingToCache } from "./supabase";

// API Keys handled via environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ""; 
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

// Default Latest Gemini Model
const LATEST_GEMINI_MODEL = "gemini-2.5-flash";

// OpenRouter Helper
const fetchFromOpenRouter = async (prompt: string) => {
  if (!OPENROUTER_API_KEY) return null;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/ibrahimonerr/KitapUygulamasi",
        "X-Title": "BilgeOkur App"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro:free", 
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenRouter error:", error);
    return null;
  }
};

// Simple hash function for context
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
  const prompt = `Aşağıdaki metindeki ana fikirleri ve temaları analiz et. 
En fazla 5 ana tema çıkar. Her tema için kısa bir etiket (label), bir önem derecesi (0-1 arası ağırlık) 
ve bir cümlelik açıklama (description) döndür.
JSON formatında döndür. [{ "id": "uuid", "label": "Tema Adı", "weight": 0.9, "description": "..." }]

Metin: ${text}`;

  if (API_KEY) {
    try {
      const model = genAI.getGenerativeModel({ model: LATEST_GEMINI_MODEL });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini Analysis failed, trying OpenRouter...", error);
    }
  }

  const orResult = await fetchFromOpenRouter(prompt);
  if (orResult) {
    try {
      const jsonStr = orResult.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("OpenRouter parse failed:", e);
    }
  }

  return [
    { id: '1', label: 'Özgürlük Arayışı', weight: 0.8, description: 'Bireysel özgürlük ve toplumsal normlar arasındaki çatışma.' },
    { id: '2', label: 'Varoluş Sancısı', weight: 0.6, description: 'Hayatın anlamını arayan Selim Işık\'ın iç sesleri.' }
  ];
};

export const generateMentorInsight = async (bookTitle: string, notes: string[]) => {
  const prompt = `Sen Bilge bir kitap mentorusun. Kullanıcı "${bookTitle}" kitabını okuyor ve şu notları aldı:
${notes.join("\n- ")}

Bu notlara dayanarak kullanıcıya okuma yolculuğunda rehberlik edecek, bilgece ve teşvik edici 2 cümlelik bir geri bildirim ver.`;

  if (API_KEY) {
    try {
      const model = genAI.getGenerativeModel({ model: LATEST_GEMINI_MODEL });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini Mentor Insight failed, trying OpenRouter...", error);
    }
  }

  const orResult = await fetchFromOpenRouter(prompt);
  if (orResult) return orResult;

  return "Okuma yolculuğun değerli bir keşif süreci. Notların, zihnindeki kapıları aralamaya devam ediyor.";
};

export const generateBookBriefing = async (bookTitle: string, author: string, userNotes: string[] = [], userQuotes: string[] = []) => {
  const contextHash = getContextHash(userNotes, userQuotes);
  
  // 1. Try Cache First
  const cached = await getCachedBriefing(bookTitle, author, contextHash);
  if (cached) {
    console.log("Using cached briefing from Supabase for:", bookTitle);
    return cached;
  }

  const prompt = `Sen bilge bir okuma koçusun. Kullanıcının "${bookTitle}" (${author}) kitabı için kişisel bir brifing hazırla. 
Okuyucunun alıntılardaki duygu durumunu ve fikirlerini analiz ederek, ona hem kitabı hatırlatacak hem de bilgece bir yol gösterecek bir rehber hazırla. 
Dili samimi, bilge, teşvik edici ve motive edici olsun. Kısa ve yüzeysel değil; her bölümü edebi bir derinlikle, en az 3-4 cümle ile açıkla.

Kullanıcının bu kitapla ilgili notları:
${userNotes.length > 0 ? userNotes.join("\n- ") : "Henüz not alınmamış."}

Kullanıcının bu kitaptan seçtiği alıntılar:
${userQuotes.length > 0 ? userQuotes.join("\n- ") : "Henüz alıntı eklenmemiş."}

Sadece JSON döndür. JSON bloğu dışında hiçbir şey yazma. 
JSON Formatı: 
{ 
  "focus": "Kitabın bu okuyucu için odaklanması gereken ana teması (alıntılarına da dayalı detaylı analiz).", 
  "importance": "Bu kitabın okuyucunun entelektüel yolculuğundaki önemi ve ruhsal karşılığı.", 
  "story": "Kitabın yazılış amacını veya ruhunu anlatan kısa, bilgece bir hikaye veya derin bir bakış açısı.", 
  "message": "Okuyucuya, aldığı notlarla bağlantılı, bugün için bilgece, yön gösterici ve uzun bir mesaj." 
}`;

  let finalBriefing = null;

  if (API_KEY) {
    try {
      const model = genAI.getGenerativeModel({ model: LATEST_GEMINI_MODEL });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      finalBriefing = JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini Briefing failed, trying OpenRouter...", error);
    }
  }

  if (!finalBriefing) {
    const orResponse = await fetchFromOpenRouter(prompt);
    if (orResponse) {
      try {
        const jsonStr = orResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        finalBriefing = JSON.parse(jsonStr);
      } catch (e) {
        console.error("OpenRouter Briefing parse failed:", e);
      }
    }
  }

  // If we got a briefing, save to cache
  if (finalBriefing && finalBriefing.focus && !finalBriefing.focus.includes("AI bağlantısı gerekiyor")) {
    await saveBriefingToCache(bookTitle, author, contextHash, finalBriefing);
    return finalBriefing;
  }

  return finalBriefing || {
    focus: "Bu eser özelinde derinlemesine analiz için AI bağlantısı gerekiyor. Şimdilik genel bir rehberlik sunuluyor.",
    importance: `${author} tarafından kaleme alınan bu eser, edebi dünyada kendine has bir yere sahiptir.`,
    story: "Eserin yazıldığı dönemin şartları, anlatının gelişiminde önemli bir rol oynamıştır.",
    message: "Okuma yolculuğuna devam et, her sayfa yeni bir keşif."
  };
};
