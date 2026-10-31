# My English

A2 seviyesinden sağlam B1 İngilizceye ilerlemek için tasarlanmış, iPhone ve Mac'te kullanılabilen web uygulaması.

## Uygulamayı aç

Uygulama: https://aycndmrblk-alt.github.io/my-english/

iPhone'da Safari ile bağlantıyı açıp **Paylaş → Ana Ekrana Ekle** seçeneğini kullanabilirsin. Mac ve iPhone'da ilerlemenin eşitlenmesi için uygulamada aynı Google hesabıyla giriş yap.

## Öğrenme özellikleri

- A2 kelime kartları ve aralıklı tekrar
- A1–B1 gramer dersleri ve kısa testler
- Dinleme ve dikte
- Konuşma alıştırması
- Procurement English
- Günlük hedef ve gelişim takibi
- PWA manifesti, iPhone ana ekran ikonu ve temel çevrimdışı destek

## İlerleme ve gizlilik

İlerlemen tarayıcıda saklanır ve giriş yaptığında Firebase Firestore ile cihazların arasında eşitlenir. Veritabanı güvenlik kuralları yalnızca uygulama sahibinin Google hesabına erişim verir; diğer hesapların veritabanına erişimi kapalıdır.

`firebase-config.js` içindeki Firebase web yapılandırması herkese açık istemci ayarıdır. Güvenlik, Firestore kurallarıyla sağlanır. Service account veya yönetici anahtarını web uygulamasına ekleme.

## Mac'te yerel geliştirme

Proje klasöründe Terminal'i açıp şu komutu çalıştır:

```sh
python3 -m http.server 4173
```

Ardından tarayıcıda `http://localhost:4173` adresini aç. Sunucuyu durdurmak için Terminal'de `Control-C` tuşlarına bas.

Yapay zekâ konuşma öğretmeni bu sürümde bağlı değildir; gerçek bağlantı için ileride güvenli bir sunucu tarafı API gerekir.
