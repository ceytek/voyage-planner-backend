# Node.js 20 Alpine tabanlı hafif image
FROM node:20-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Tüm bağımlılıkları yükle (TypeScript dahil)
RUN npm ci

# TypeScript kaynak kodlarını kopyala
COPY . .

# TypeScript'i derle
RUN npm run build

# Production bağımlılıklarını yeniden yükle (build sonrası)
RUN npm ci --only=production

# Port bilgisi (bilgilendirme amaçlı)
EXPOSE 3001

# Uygulama başlat
CMD ["node", "dist/index.js"]
