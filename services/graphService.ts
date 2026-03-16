import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface GraphNode {
  id: string;
  label: string;
  type: 'book' | 'note' | 'quote';
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
  label?: string;
}

export const generateIdeaGraphData = async (
  notes: any[],
  quotes: any[]
): Promise<{ nodes: GraphNode[], links: GraphLink[] }> => {
  try {
    const combinedContent = [
      ...notes.map(n => ({ id: n.id, content: n.text, type: 'note' })),
      ...quotes.map(q => ({ id: q.id, content: q.text, type: 'quote' }))
    ];

    if (combinedContent.length < 2) return { nodes: [], links: [] };

    const prompt = `
      Sen bir bilgi mimarısın. Aşağıdaki notlar ve alıntılar arasındaki anlamsal (semantic) ilişkileri tespit etmeni istiyorum.
      Hangi notlar birbirini tamamlıyor, hangi fikirler birbiriyle çatışıyor veya benzer temalara sahip?
      
      İçerik Listesi:
      ${combinedContent.map((c, i) => `${i}: [${c.id}] ${c.content}`).join("\n")}

      Senden şunları bekliyorum:
      1. Aralarında güçlü bir bağ olan not/alıntı çiftlerini belirle.
      2. Bu bağın gücünü (weight: 0-1) ve nedenini (label: kısa bir tema adı) yaz.

      Yanıtını sadece aşağıdaki JSON formatında ver:
      {
        "links": [
          { "source": "id1", "target": "id2", "weight": 0.8, "label": "Varoluşçu Sancı" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const { links } = JSON.parse(cleanJson);

    const nodes: GraphNode[] = combinedContent.map(c => ({
      id: c.id,
      label: c.content.substring(0, 30) + "...",
      type: c.type as any
    }));

    return { nodes, links };
  } catch (error) {
    console.error("Idea Graph Data Error:", error);
    return { nodes: [], links: [] };
  }
};
