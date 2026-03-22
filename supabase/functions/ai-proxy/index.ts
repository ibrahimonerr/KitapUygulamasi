import { serve } from "https://deno.land/std@0.177.1/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"
import { corsHeaders } from '../_shared/cors.ts'

console.log("ai-proxy edge function started.")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, payload } = await req.json()
    
    // Güvenlik: Ortam değişkenleri supabase içinden çekiliyor
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error("API Key is missing in Edge Function environment");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Genelde "gemini-2.0-flash" ve "gemini-2.5-flash" modelleri kullanılmıştı.
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const model25 = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Bazen daha iyi olabilir diye

    let resultData: any = {};

    switch (action) {
      case 'searchBooksSemantically': {
        const prompt = `Kullanıcı şu şekilde bir kitap arıyor: "${payload.query}"
        Bu isteğe en uygun, bilinen 5 farklı kitap ismini ve yazarlarını liste içerisine alarak döndür.
        Sadece şu formatta yanıt ver: "Kitap Adı - Yazar" her satırda bir tane olsun. Başka hiçbir açıklama yapma.`;
        
        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        
        const suggestions = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && line.includes('-'))
          .map(line => line.replace(/^\d+[\.\)]\s*/, ''));
        
        resultData = { suggestions };
        break;
      }

      case 'generateIdeaGraphData': {
        const { notes, quotes } = payload;
        const combinedContent = [
          ...notes.map((n: any) => ({ id: n.id, content: n.text, type: 'note' })),
          ...quotes.map((q: any) => ({ id: q.id, content: q.text, type: 'quote' }))
        ];
        
        if (combinedContent.length < 2) {
           resultData = { nodes: [], links: [] };
           break;
        }

        const prompt = `Sen bir bilgi mimarısın. Aşağıdaki notlar ve alıntılar arasındaki anlamsal (semantic) ilişkileri tespit etmeni istiyorum.
Hangi notlar birbirini tamamlıyor, hangi fikirler birbiriyle çatışıyor veya benzer temalara sahip?
İçerik Listesi:
${combinedContent.map((c, i) => `${i}: [${c.id}] ${c.content}`).join("\n")}
Senden şunları bekliyorum:
1. Aralarında güçlü bir bağ olan not/alıntı çiftlerini belirle.
2. Bu bağın gücünü (weight: 0-1) ve nedenini (label: kısa bir tema adı) yaz.
Yanıtını sadece aşağıdaki JSON formatında ver:
{
  "links": [
    { "source": "id1", "target": "id2", "weight": 0.8, "label": "Bağlantı Teması" }
  ]
}`;
        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        const nodes = combinedContent.map(c => ({
          id: c.id,
          label: c.content.substring(0, 30) + "...",
          type: c.type
        }));
        resultData = { nodes, links: parsed.links || [] };
        break;
      }

      case 'generateForYouContent': {
        const { tasteProfile, recentBooks } = payload;
        const prompt = `Sen bir bilge okuma rehberisin. Bir kullanıcının ilgi alanlarına ve son okuduklarına göre ona "Sana Özel" bir akış hazırlamanı istiyorum.
Kullanıcı Zevki: ${JSON.stringify(tasteProfile)}
Son Okudukları: ${recentBooks?.join(", ") || 'Yok'}
Senden 3 farklı öneri kartı oluşturmanı bekliyorum:
1. Bir "Kitap Önerisi" (Neden okumalı?)
2. Bir "Düşünce Akımı veya Kavram" (Kendi zevkiyle bağlantılı bir derinleşme)
3. Bir "Mentorluk Notu" (Okuma disiplinine dair bir tavsiye)
Yanıtını sadece aşağıdaki JSON formatında ver:
[
  { "id": "1", "title": "Başlık", "reason": "Neden öneriyoruz?", "type": "book", "content": "Detay", "category": "Kategori", "intensity": "deep" }
]`;
        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();
        resultData = JSON.parse(cleanJson);
        break;
      }

      case 'analyzeIntellectualIdentity': {
        const { books, quotes, notes } = payload;
        const dataString = `
Okunan Kitaplar: ${books?.map((b: any) => b.title).join(", ")}
Önemli Alıntılar: ${quotes?.slice(0, 10).map((q: any) => q.text).join(" | ")}
Alınan Notlar: ${notes?.slice(0, 10).map((n: any) => n.text).join(" | ")}
`;
        const prompt = `Sen bir entelektüel rehber ve edebiyat eleştirmenisin. 
Bir kullanıcının okuduğu kitaplar, altını çizdiği alıntılar ve aldığı notlardan yola çıkarak onun "Okuma Karakterini" analiz et.
Veriler: ${dataString}
1. Kullanıcıya bir "Unvan" ver.
2. 1-2 cümlelik derinlikli bir açıklama yaz.
3. Bu okuma tarzının 3 temel özelliğini (traits) belirle.
Yanıtını sadece aşağıdaki JSON formatında ver:
{ "title": "Unvan", "description": "Açıklama", "traits": ["1", "2", "3"] }`;
        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();
        resultData = JSON.parse(cleanJson);
        break;
      }

      case 'analyzeContentWithAI': {
        const { text: userText } = payload;
        const prompt = `Aşağıdaki metindeki ana fikirleri ve temaları analiz et. 
En fazla 5 ana tema çıkar. Her tema için kısa bir etiket (label), bir önem derecesi (0-1 arası ağırlık) 
ve bir cümlelik açıklama (description) döndür. JSON formatında döndür. [{ "id": "uuid", "label": "Ad", "weight": 0.9, "description": "..." }]
Metin: ${userText}`;
        const result = await model25.generateContent(prompt); // Use 2.5 Flash for deep analysis
        const text = await result.response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();
        resultData = JSON.parse(cleanJson);
        break;
      }

      case 'generateMentorInsight': {
         const { bookTitle, notes } = payload;
         const prompt = `Sen Bilge bir kitap mentorusun. Kullanıcı "${bookTitle}" kitabını okuyor ve şu notları aldı:
${notes.join("\n- ")}
Bu notlara dayanarak kullanıcıya okuma yolculuğunda rehberlik edecek, bilgece ve teşvik edici 2 cümlelik bir geri bildirim ver.`;
         const result = await model25.generateContent(prompt);
         const text = await result.response.text();
         resultData = { text };
         break;
      }

      case 'generateBookBriefing': {
         const { bookTitle, author, userNotes, userQuotes, tasteProfile } = payload;
         const prompt = `Sen bilge bir okuma koçusun. Kullanıcının "${bookTitle}" (${author}) kitabı için kişisel bir brifing hazırla. 
Okuyucunun alıntılardaki duygu durumunu ve fikirlerini analiz ederek, ona hem kitabı hatırlatacak hem de bilgece bir yol gösterecek bir rehber hazırla. 

Kullanıcının Genel Okuma Zevki (ÖNEMLİ): ${JSON.stringify(tasteProfile)}. 
Lütfen brifingini bu zevk profiliyle ilişkilendir (Örn: "Sabahattin Ali seven biri olarak bu kitaptaki melankoli sana tanıdık gelebilir...").

Dili samimi, bilge, teşvik edici olsun.
Notlar: ${userNotes?.length > 0 ? userNotes.join("\n- ") : "Yok."}
Alıntılar: ${userQuotes?.length > 0 ? userQuotes.join("\n- ") : "Yok."}
Sadece JSON döndür: { "focus": "...", "importance": "...", "story": "...", "message": "..." }`;
         const result = await model25.generateContent(prompt);
         const text = await result.response.text();
         const cleanJson = text.replace(/```json|```/g, "").trim();
         resultData = JSON.parse(cleanJson);
         break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(resultData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("AI Proxy Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
