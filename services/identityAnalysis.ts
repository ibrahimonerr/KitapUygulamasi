import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
    const dataString = `
      Okunan Kitaplar: ${books.map(b => b.title + " (" + b.author + ")").join(", ")}
      Önemli Alıntılar: ${quotes.slice(0, 10).map(q => q.text).join(" | ")}
      Alınan Notlar: ${notes.slice(0, 10).map(n => n.text).join(" | ")}
    `;

    const prompt = `
      Sen bir entelektüel rehber ve edebiyat eleştirmenisin. 
      Bir kullanıcının okuduğu kitaplar, altını çizdiği alıntılar ve aldığı notlardan yola çıkarak onun "Okuma Karakterini" analiz etmeni istiyorum.
      
      Veriler:
      ${dataString}

      Senden şunları bekliyorum:
      1. Kullanıcıya bir "Unvan" ver (Örn: Mağara Kaşifi, Modernist Gözlemci, Stoacı Okur, Veba Günlükçüsü vb.).
      2. Bu unvanın nedenini açıklayan 1-2 cümlelik derinlikli bir açıklama yaz.
      3. Bu okuma tarzının 3 temel özelliğini belirle.

      Yanıtını sadece aşağıdaki JSON formatında ver:
      {
        "title": "Unvan",
        "description": "Kısa ve etkileyici açıklama",
        "traits": ["Özellik 1", "Özellik 2", "Özellik 3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON parse işlemi (AI bazen markdown blokları ekleyebilir, temizleyelim)
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      ...parsed,
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
