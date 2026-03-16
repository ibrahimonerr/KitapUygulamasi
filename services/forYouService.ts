import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
    const prompt = `
      Sen bir bilge okuma rehberisin. Bir kullanıcının ilgi alanlarına ve son okuduklarına göre ona "Sana Özel" bir akış hazırlamanı istiyorum.
      
      Kullanıcı Zevki: ${JSON.stringify(tasteProfile)}
      Son Okudukları: ${recentBooks.join(", ")}

      Senden 3 farklı öneri kartı oluşturmanı bekliyorum:
      1. Bir "Kitap Önerisi" (Neden okumalı?)
      2. Bir "Düşünce Akımı veya Kavram" (Kendi zevkiyle bağlantılı bir derinleşme)
      3. Bir "Mentorluk Notu" (Okuma disiplinine dair bir tavsiye)

      Yanıtını sadece aşağıdaki JSON formatında ver:
      [
        {
          "id": "1",
          "title": "Başlık",
          "reason": "Neden öneriyoruz?",
          "type": "book",
          "content": "Kitap veya içerik detayı",
          "category": "Kategori",
          "intensity": "deep"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("For You Generation Error:", error);
    return [];
  }
};
