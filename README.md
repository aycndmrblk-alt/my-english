# My English

A2 seviyesinden sağlam B1 İngilizceye ilerlemek için tasarlanmış, mobil öncelikli bir öğrenme uygulaması.

## Şu anda Mac'te açma

Uygulama bu bilgisayarda yerel web adresinde çalışıyor: **http://localhost:4173**. Bu adresi aynı bilgisayardaki Safari veya Chrome'da aç. PWA ve çevrimdışı özellikleri çalışsın diye `index.html` dosyasını Finder'dan çift tıklamak yerine yerel adresi kullan.

Sunucu daha sonra kapatılırsa yeniden açmak için Terminal'i açıp proje klasöründe şu komutu çalıştır:

```sh
python3 -m http.server 4173
```

Ardından tarayıcıda `http://localhost:4173` adresini aç. Sunucuyu durdurmak için Terminal'de `Control-C` tuşlarına bas.

## iPhone'a ekleme

Uygulama PWA olarak hazırdır. iPhone'a ana ekrandan eklemek için uygulama dosyalarının HTTPS kullanan bir web adresinde yayımlanması gerekir. Yayımlandıktan sonra Safari'de adresi aç, Paylaş düğmesine ve **Ana Ekrana Ekle** seçeneğine dokun. Bu adım tamamlanmadı; şu anki sürüm yerel olarak çalışıyor.

## Özellikler

- 12 A2 kelime kartı ve 1, 3, 7, 14, 30 günlük aralıklı tekrar planı
- A1, A2 ve B1 seviyelerine yayılan 6 gramer dersi; her derste 3 cevap kontrollü soru
- Tarayıcının konuşma senteziyle dinleme ve beş cümlelik dikte çalışması
- API anahtarı gerektirmeyen örnek diyaloglu konuşma alıştırması
- Satın alma İngilizcesi terimleri ve teklif isteme senaryosu
- Günlük çalışma hedefi, seri ve ilerleme takibi
- PWA manifesti, iPhone ana ekran ikonu ve çevrimdışı temel ekranlar

Öğrenme verisi şu anda aynı cihazdaki tarayıcıda saklanır. Cihazlar arası eşitleme için ücretsiz Firebase Spark kurulumu gerekir; proje oluşturulunca `firebase-config.js` içine yalnızca herkese açık web yapılandırması eklenir. Firebase konsolunda Google ile giriş etkinleştirilmeli, Firestore veritabanı açılmalı ve `firestore.rules` içeriği yayımlanmalıdır. Bu kurallar her kullanıcının yalnızca kendi `/users/{uid}` kaydını okuyup yazmasına izin verir. Yönetici/service account anahtarını asla web uygulamasına ekleme.

Firebase kurulumu tamamlanana kadar Eşitle düğmesi kurulum bilgisini gösterir ve mevcut yerel kayıt etkilenmez. Google ile giriş açıldığında aynı hesapla iPhone ve Mac'te oturum açarak ilerlemeyi eşitleyebilirsin. Yapay zekâ konuşma öğretmeni bu sürümde bağlı değildir; gerçek yapay zekâ bağlantısı için ileride sunucu tarafında güvenli bir API gerekir.
