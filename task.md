# Kitap Okuma Uygulaması - Geliştirme Görev Listesi

Bu belge, `implementation_plan.md` baz alınarak adım adım geliştirme sürecini takip etmek amacıyla oluşturulmuştur.

## Phase 1: Foundation (Temel Yapı ve UI)
- [x] Expo projesinin sıfırdan oluşturulması (React Native, TypeScript, Expo Router).
- [x] Gerekli bağımlılıkların yüklenmesi (Supabase, Vector Icons, Fonts vb.).
- [x] Klasör yapısının oluşturulması (app, components, hooks, constants, vb.).
- [ ] Çevrimdışı senkronizasyon yetenekli yerel veritabanının (WatermelonDB veya MMKV) ayarlanması.
- [ ] Supabase bağlantısının konfigüre edilmesi.
- [x] "Liquid Glass" animasyonlu Splash Screen tasarımının uygulanması.
- [x] Alt Navigasyon (Bottom Tabs) yapısının kurulması (Active, Library, Clubs, Profile).
- [x] "Guest Mode" / Giriş Ekranı (Login/Signup) UI bileşenlerinin oluşturulması.
- [x] Active Tab: Günlük okuma süresi (Arc Timer) UI'ının hazırlanması.
- [x] Active Tab: Okuma geçmişi (Quote Stream) için temel kaydırılabilir listenin yapılması.
- [x] Active Tab: Odak Modu'na entegre Müzik Kontrol Paneli (Liquid Glass UI) eklenmesi.

## Phase 2: AI Core & Semantic Data (Yapay Zeka ve Veri Yönetimi)
- [x] Library Tab: Kitapların "Stacked" (Yığın) dizilimiyle sergilendiği temel UI'ın oluşturulması.
- [x] Google Books API / Open Library API ile Evrensel Arama (Global Search) entegrasyonu.
- [ ] Spotify benzeri "Zevk Küratörlüğü" (Onboarding) ekranlarının tasarlanması ve mantığının kurulması.
- [ ] Gemini 2.5+ API entegrasyonu: "Wise Mentor" brifing modülünün kurulması.
- [ ] "İlk Aktif Kitap" seçimi ve sayfa/hedef belirleme akışının uygulanması.
- [ ] OCR modülünün yapılandırılması (Kamera ile alıntı tarama).
- [ ] Supabase pgvector kurulumu ve Semantik Alıntı Arama (Semantic Quote Search) altyapısının yazılması.
- [ ] AI "Sana Özel" (For You) derin analiz ve kitap öneri modülünün geliştirilmesi.

## Phase 3: Social, Edge Cases & Polish (Sosyal Özellikler ve İnce Ayarlar)
- [ ] Butik Kitap Kulüpleri (Boutique Clubs) mantığının ve UI'ının geliştirilmesi.
- [ ] "Spoiler Shield" (Sürprizbozan Kalkanı) algoritmasının ve sıvı cam bulanıklık efektinin uygulanması.
- [ ] Seri (Streak) takibi ve rozet sisteminin (Gamification) eklenmesi.
- [ ] Alıntılar için "Stil Editörü" (Style Editor) ve cam dokulu not düzenleyicisinin (Pen Note) tasarlanması.
- [ ] Çevrimdışı durumlar için arka plan veri senkronizasyon onarımının (Local-First sync) mükemmelleştirilmesi.
- [ ] Kindle / Apple Books "My Clippings.txt" veya dışa aktarım dosyalarının ayrıştırılması ve sisteme aktarılması.
- [ ] Bağlamsal Anlık Bildirimlerin (Push Notifications) entegrasyonu.
- [ ] Harici Müzik Entegrasyonu (Spotify/Apple Music Remote SDK) ve Uygulama İçi Odak Sesleri (Expo-AV).

---
> Proje ilerledikçe bu belge güncellenecek ve tamamlanan adımlar işaretlenecektir.
