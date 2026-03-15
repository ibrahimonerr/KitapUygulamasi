# Geliştirme Sözleşmesi

Bu belge, uygulama üzerindeki kritik tasarım ve içerik değişikliklerine dair kuralları belirler.

## Önemli Kural

- **Ana sayfa ve içeriklerinde**, kullanıcıdan (USER) açıkça ve doğrudan onay alınmadan hiçbir şekilde tasarım, yerleşim veya fonksiyonel değişiklik yapılmayacaktır.
- **Aktif Okuma Sınırı**: Kullanıcı aynı anda en fazla **2 kitap** aktif olarak okuyabilir. 3. kitap eklenmeye çalışıldığında kullanıcı uyarılmalıdır.
- **Raf Etkileşimi**: Biten ve bekleyen raflarında bir kitaba ilk tıklandığında kart öne doğru büyüyerek odaklanır, aynı kitaba ikinci kez tıklandığında detay sayfası açılır.
- **Kazanılmış Haklar ve Etkileşim Sadakati**: Yeni bir özellik (örn. global state, yeni kütüphane) eklenirken veya refactoring yapılırken, mevcut onaylanmış karmaşık etkileşimler (örn. Aktif Okuma'daki kart değiştirme animasyonu/mantığı) asla basitleştirilmeyecek veya bozulmayacaktır. Her geliştirme, mevcut UX derinliğini korumak zorundadır.
- Mevcut "Liquid Glass" estetiği ve onaylanmış yerleşim düzeni, yeni bir talep gelmediği sürece korunacaktır.

---
*Son Güncelleme: 15 Mart 2026*
