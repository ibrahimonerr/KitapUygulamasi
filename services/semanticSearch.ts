import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

/**
 * Perform a semantic search for books based on a natural language query.
 * It uses Gemini to interpret the mood/theme and suggest book titles,
 * which are then fetched from traditional book APIs.
 */
export const searchBooksSemantically = async (query: string): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Kullanıcı şu şekilde bir kitap arıyor: "${query}"
      Bu isteğe en uygun, bilinen 5 farklı kitap ismini ve yazarlarını liste içerisine alarak döndür.
      Sadece şu formatta yanıt ver: "Kitap Adı - Yazar" her satırda bir tane olsun. Başka hiçbir açıklama yapma.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the lines
    const suggestions = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.includes('-'))
      .map(line => line.replace(/^\d+[\.\)]\s*/, '')); // Remove numbering if AI added it

    return suggestions;
  } catch (error) {
    console.error("Semantic search error:", error);
    return [];
  }
};
