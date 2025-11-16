# 🔄 Environment Configuration Guide

Bu proje iki farklı modda çalışabilir:

## 📋 Mode'lar

### 1. 💻 **DEV MODE** (Local Development)
Backend ve AI-Service local'de `npm run dev` ile çalışır.
- **Backend Port**: 4001
- **AI-Service Port**: 3001
- **GraphQL URL**: `http://localhost:4001/graphql`
- **Hot-reload**: ✅ Aktif
- **Database**: AWS RDS veya Local PostgreSQL

### 2. 🐳 **DOCKER MODE** (Production-like)
Backend ve AI-Service Docker container'larında çalışır.
- **Backend Port**: 4001 (aynı port!)
- **AI-Service Port**: 3001
- **GraphQL URL**: `http://192.168.1.171:4001/graphql` (LAN IP)
- **Hot-reload**: ❌ Pasif (rebuild gerekir)
- **Database**: Docker PostgreSQL

> **💡 Önemli**: Backend port her iki modda da **4001**'dir. Tek fark URL'de `localhost` yerine LAN IP kullanılması.

---

## 🔧 Geçiş Nasıl Yapılır?

### Dev Mode'a Geçiş (Local):

1. **Docker'ı Durdur:**
   ```bash
   docker-compose down
   ```

2. **Backend ve AI-Service'i Başlat:**
   ```bash
   # Terminal 1
   cd Back-end && npm run dev
   
   # Terminal 2
   cd AI-Service && npm run dev
   ```

3. **Frontend .env Dosyasını Güncelle:**
   ```bash
   cp Front-end/.env.dev Front-end/.env
   ```

4. **Expo'yu Restart Et:**
   - Expo terminalde `Ctrl+C` ile durdur
   - `npx expo start` ile yeniden başlat

---

### Docker Mode'a Geçiş:

1. **Local Servisleri Durdur:**
   - Backend ve AI-Service terminallerinde `Ctrl+C`

2. **Docker'ı Başlat:**
   ```bash
   docker-compose up -d
   ```

3. **Frontend .env Dosyasını Güncelle:**
   ```bash
   cp Front-end/.env.docker Front-end/.env
   ```
   
   ⚠️ **Önemli**: `.env.docker` içindeki IP adresini kendi local network IP'niz ile değiştirin:
   ```bash
   # macOS'ta IP adresinizi öğrenmek için:
   ipconfig getifaddr en0
   ```

4. **Expo'yu Restart Et:**
   - Expo terminalde `Ctrl+C` ile durdur
   - `npx expo start` ile yeniden başlat

---

## 📝 Quick Reference

| Mode | Backend Port | GraphQL URL | Fark |
|------|-------------|-------------|------|
| **Dev** | 4001 | `http://localhost:4001/graphql` | `localhost` |
| **Docker** | 4001 | `http://192.168.1.171:4001/graphql` | LAN IP |

---

## 🐛 Troubleshooting

### "Network request failed" hatası alıyorsanız:

1. Backend çalışıyor mu kontrol edin:
   ```bash
   # Dev mode
   curl http://localhost:4001/graphql
   
   # Docker mode (kendi IP'nizi yazın)
   curl http://192.168.1.171:4001/graphql
   ```

2. `.env` dosyasında doğru URL olduğundan emin olun

3. Expo'yu restart etmeyi deneyin (cache temizliği):
   ```bash
   npx expo start -c
   ```

### Docker'da port conflict:

```bash
# Çakışan container'ları bul
docker ps

# Durdurup temizle
docker-compose down
docker system prune
```

---

## 🎯 Özet

- Backend her zaman **port 4001**'de çalışır
- Dev modda: `localhost:4001`
- Docker modda: `LAN_IP:4001` 
- Sadece `.env` dosyasını değiştir, port standardize!

EPROMONOV5
Sepetlipınar mh. başiskele sanayi site
