# Kitap Okuma Uygulaması - Teknik Uygulama Planı

## Amaç
`implementation_plan.md` dosyasındaki vizyona sadık kalarak, "Kitap-Okuma-Uygulamasi" klasörü içinde yepyeni, modern ve premium hissettiren bir React Native (Expo) projesi başlatmak.

## Teknik Yığın (Tech Stack)
1.  **Framework:** Expo SDK 52+ (React Native)
2.  **Routing:** Expo Router (Dosya tabanlı yönlendirme)
3.  **Dil:** TypeScript
4.  **UI/Styling:**
    *   Klasik StyleSheet (React Native)
    *   İsteğe bağlı olarak NativeWind kullanılabilir ancak "Liquid Glass" gibi özel efektler için Reanimated ve özel SVG/BlurView çözümlerine ağırlık verilecektir.
    *   `expo-blur` (Glassmorphism / Liquid Glass efektleri için kritik)
5.  **Animasyonlar & Haptikler:**
    *   `react-native-reanimated` v3 (Akıcı, performanslı animasyonlar)
    *   `expo-haptics` (Dokunsal geri bildirimler)
6.  **Veritabanı & Backend:**
    *   **Local-First:** `@nozbe/watermelondb` (Çevrimdışı öncelikli, yüksek performanslı yerel veritabanı).
    *   **Remote/Auth:** `@supabase/supabase-js` (Kullanıcı doğrulaması, bulut senkronizasyonu ve pgvector ile semantik arama için).
7.  **Yapay Zeka:** `@google/generative-ai` (Gemini 2.5+ API erişimi için).
8.  **Donanım Erişimleri:** `expo-camera`, `expo-image-picker`.
9.  **İkonlar & Fontlar:** `@expo/vector-icons`, `@expo-google-fonts/inter` (modern görünüm) ve `@expo-google-fonts/lora` (edebi/serif görünüm).

## Proposed Changes (Önerilen Değişiklikler)

### Phase 1: Foundation (Temel Kurulum)

Bu aşamada boş bir Expo projesi ayağa kaldırılacak ve temel klasör/navigasyon yapısı kurulacaktır.

#### [NEW] Proje İskeleti (`npx create-expo-app`)
*   Uygulama dizini oluşturulacak ve bağımlılıklar yüklenecektir.
*   TypeScript konfigürasyonu yapılacaktır (`tsconfig.json`).

#### [NEW] Klasör Yapısı (app dizini)
Expo Router kullanılarak aşağıdaki sayfa yapısı oluşturulacaktır:
*   `app/_layout.tsx` (Ana sağlayıcılar, font yüklemeleri, haptik ayarları)
*   `app/index.tsx` (Splash Screen ve yönlendirme başlangıcı)
*   `app/(auth)/login.tsx` (Giriş ekranı)
*   `app/(tabs)/_layout.tsx` (Bottom Tab navigatörü)
*   `app/(tabs)/active.tsx` (Aktif okuma ekranı)
*   `app/(tabs)/library.tsx` (Kütüphane ekranı)
*   `app/(tabs)/clubs.tsx` (Sosyal kulüpler ekranı)
*   `app/(tabs)/profile.tsx` (Profil ve ayarlar ekranı)

#### [NEW] Bileşenler (components dizini)
*   `components/ui/LiquidGlassButton.tsx` (Özel bulanıklık ve haptik efektli buton)
*   `components/ui/BlurHeader.tsx` (Sayfa üst kısımları için parallax etkili başlık)
*   `components/books/BookCoverElement.tsx` (Kitap kapağı render bileşeni)

#### [NEW] Temalar & Sabitler (constants & theme)
*   `constants/theme.ts` (Renk paletleri, tipografi sabitleri)
*   `constants/typography.ts` (Font aileleri tanımları)

### Phase 2: Veri ve AI Altyapısı (Gelecek Adımlar)
*Bu kısım Phase 1 tamamlandıktan sonra detaylandırılacaktır.*
*   WatermelonDB şemasının oluşturulması (`model/schema.ts`).
*   Supabase istemcisinin ayarlanması (`lib/supabase.ts`).
*   [ ] Gemini 2.5+ API entegrasyonu: "Wise Mentor" brifing modülünün kurulması.

## Verification Plan (Doğrulama Planı)

### Otomatik Testler
Şu an için kapsamlı bir birim testi süiti (Jest/Testing Library) tam olarak kurulmayacak, öncelik çalışan bir iskeletin ayağa kaldırılması olacaktır. Ancak Expo'nun dahili TypeScript derleyici kontrolleri aktif olacaktır.
*   `npx tsc --noEmit` komutu ile tip hataları kontrol edilecektir.

### Manuel Doğrulama
1.  Kullanıcının makinesinde `npx expo start` veya `npm run web` çalıştırılacaktır.
2.  Expo Go (veya iOS/Android simülatörü) üzerinden uygulamanın açıldığı doğrulanacaktır.
3.  "Liquid Glass" konseptli Splash Screen'in çalıştığı görülecektir.
4.  Bottom Tab## Phase 4: Görsel Cila & Stil Editörü
Uygulamanın "Premium" hissini pekiştirecek görsel dokunuşlar ve kullanıcıların içeriklerini paylaşmasını sağlayacak modüller.

### Değişiklikler:

#### [NEW] [QuoteShareEditor.tsx](file:///Users/ibrahimoner/Desktop/Kitap-Okuma-Uygulamasi/components/active/QuoteShareEditor.tsx)
- [ ] Alıntıları farklı arka plan (Glassmorphism, Gradient, Solid) ve yazı tipi seçenekleriyle görselleştiren modül.
- [ ] Görüntü olarak kaydetme (Save as Image) yeteneği.

#### [MODIFY] [ActiveBooksStack.tsx](file:///Users/ibrahimoner/Desktop/Kitap-Okuma-Uygulamasi/components/active/ActiveBooksStack.tsx)
- [ ] Kitap kapağına tıklandığında kapağın büyümesi ve detaylara yumuşak bir geçişle (Shared Element Transition benzeri) açılması.

#### [NEW] [ISBNSync.tsx](file:///Users/ibrahimoner/Desktop/Kitap-Okuma-Uygulamasi/components/library/ISBNSync.tsx)
- [ ] `expo-camera` kullanarak barkod tarama.
- [ ] Google Books API entegrasyonu ile kitap bilgilerini otomatik çekme.

## Phase 5: Sosyal & İleri Seviye Özellikler
- [ ] **Butik Kulüpler v2:** Eş zamanlı okuma etkinlikleri ve kulüp içi challenge'lar.
- [ ] **Semantik Arama:** Alıntılar arasında anlamsal (AI destekli) arama motoru.
- [ ] **Akıllı Bildirimler:** "Bugün kaç sayfa okudun?" ve kişiselleştirilmiş alıntı bildirimleri.
- [ ] **Sana Özel Sekmesi:** Alıntıların analizi ile derin entelektüel karakter analizi ve yeni öneriler.
yönlendirmelerinin (Active, Library, Clubs, Profile) sayfalar arası geçişi sağladığı test edilecektir.
5.  Özel fontların (Inter, Lora) sisteme yüklendiği ve metinlerde düzgün render edildiği kontrol edilecektir.

## User Review Required
Bu plan, projenin "sıfırdan" Expo kullanılarak ayağa kaldırılması ve klasör/navigasyon mimarisinin belirlenmesi içindir. Özel bir state management aracı (Redux vs.) belirtilmemiştir, Context API ve/veya Zustand kullanımı (gerektiğinde) öngörülmektedir. Veritabanı olarak performans ve offline-first yapısı nedeniyle WatermelonDB seçilmiştir.

Lütfen bu teknik iskeleti onaylayın. Onayınızın ardından `npx create-expo-app` komutu ile projeyi dizine oluşturmaya ve Phase 1 görevlerini tamamlamaya başlayacağım.
