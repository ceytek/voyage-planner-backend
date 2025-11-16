# 🌍 Voyage Planner - AI-Powered Travel Planning Platform

A full-stack travel planning application with AI-powered itinerary generation and photo recognition.

## 📦 Monorepo Structure

```
Planner/
├── AI-Service/          # AI microservice (OpenAI integration)
├── Back-end/            # GraphQL API (TypeORM + PostgreSQL)
├── Front-end/           # React Native mobile app (Expo)
├── docker-compose.yml   # Multi-service Docker setup
└── ENVIRONMENT_SETUP.md # Environment configuration guide
```

## 🚀 Services

### AI-Service (Port 3001)
- **Tech Stack:** Node.js, Express, TypeScript, OpenAI API
- **Features:**
  - Trip itinerary generation with GPT-4
  - Photo recognition for historical places
  - Multi-language support (TR, EN, ES, FR, IT)
  - Unsplash integration for hero images

### Back-end (Port 4001)
- **Tech Stack:** Node.js, TypeGraphQL, TypeORM, PostgreSQL
- **Features:**
  - GraphQL API
  - User authentication (Google, Apple Sign-In, Firebase)
  - Credit system for AI operations
  - Payment processing (Stripe, Apple IAP)
  - Trip management and favorites

### Front-end (React Native - Expo)
- **Tech Stack:** React Native, Expo, Apollo Client, i18next
- **Features:**
  - AI-powered trip planning
  - Photo scanner for tourist places
  - Multi-language UI
  - Credit purchase system
  - Trip history and favorites

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- OpenAI API Key
- Firebase credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/ceytek/voyage-planner-backend.git
cd Planner

# Install dependencies for all services
cd AI-Service && npm install && cd ..
cd Back-end && npm install && cd ..
cd Front-end && npm install && cd ..
```

### Environment Setup

Create `.env` files in each service directory:

**AI-Service/.env:**
```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

**Back-end/.env:**
```env
PORT=4001
NODE_ENV=development
AI_SERVICE_URL=http://localhost:3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=planner_db
FIREBASE_PROJECT_ID=your_firebase_project
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
```

**Front-end/.env:**
```env
EXPO_PUBLIC_GRAPHQL_URL=http://localhost:4001/graphql
EXPO_PUBLIC_AI_SERVICE_URL=http://localhost:3001
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Development Mode

```bash
# Terminal 1: Start AI Service
cd AI-Service
npm run dev

# Terminal 2: Start Backend
cd Back-end
npm run dev

# Terminal 3: Start Frontend
cd Front-end
npx expo start
```

### Docker Mode

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📱 Mobile App Deployment

### iOS (TestFlight)

```bash
cd Front-end

# Login to EAS
eas login

# Build for iOS
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android --profile production
```

## 🏗️ Architecture

### Request Flow

#### Trip Planning:
```
Frontend → AI Service (Direct) → OpenAI API
                ↓
Frontend → Backend (GraphQL) → Database (Save Trip)
```

#### Photo Recognition:
```
Frontend → AI Service (Direct) → OpenAI Vision API
                ↓
Frontend → Backend (GraphQL) → Database (Save Discovery)
```

### Database Schema

- **Users:** Authentication and profile data
- **Trips:** Generated trip plans and itineraries
- **Credits:** User credit balance and transactions
- **Discoveries:** Scanned places from photos
- **Payments:** Stripe and Apple IAP transactions

## 🔐 Security

- JWT-based authentication
- Firebase authentication integration
- API rate limiting
- Helmet security headers
- Environment variable protection

## 📊 Features

### ✅ Implemented
- AI-powered trip generation
- Photo recognition for landmarks
- Multi-language support (5 languages)
- Credit system
- Payment processing (Stripe + Apple IAP)
- Trip favorites and history
- Country/city database with translations

### 🚧 Roadmap
- Social features (share trips)
- Collaborative trip planning
- Real-time collaboration
- Flight booking integration
- Hotel recommendations

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd Back-end
npm test

# AI Service tests
cd AI-Service
npm test

# Frontend tests
cd Front-end
npm test
```

## 📝 API Documentation

### GraphQL Endpoint
`http://localhost:4001/graphql`

### AI Service REST API
- `POST /api/trip/generate-itinerary` - Generate trip plan
- `POST /api/photo/analyze` - Analyze photo
- `GET /api/trip/health` - Health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

- **Developer:** Ceyhun Tekin
- **Contact:** ceyhuntekin41@gmail.com
- **GitHub:** [@ceytek](https://github.com/ceytek)

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Unsplash for image API
- Expo team for React Native framework
- TypeGraphQL community

---

**Built with ❤️ using TypeScript, React Native, and OpenAI**
