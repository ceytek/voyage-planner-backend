# Node.js 20 Alpine tabanlı hafif image
FROM node:20-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Tüm bağımlılıkları yükle (TypeScript dahil)
RUN npm install

# TypeScript kaynak kodlarını kopyala
COPY . .

# TypeScript'i derle
RUN npm run build

# Production bağımlılıklarını yeniden yükle (build sonrası)
RUN npm install --only=production

# Port bilgisi (bilgilendirme amaçlı)
EXPOSE 4000

# Health check (GraphQL endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/graphql', (r) => {process.exit(r.statusCode === 400 ? 0 : 1)})"

# Uygulama başlat
CMD ["node", "dist/index.js"]
