// Photo Analyzer Prompt Service
// Trip generator'dan tamamen ayrı, sadece yer tanıma için

import type { PhotoAnalysisRequest } from '../types';

interface LanguagePrompts {
  tr: string;
  en: string;
  es: string;
  fr: string;
  it: string;
  [key: string]: string;
}

/**
 * Generate vision analysis prompt for place recognition
 */
export function generatePhotoAnalysisPrompt(req: PhotoAnalysisRequest): string {
  const lang = req.language.toLowerCase().split('-')[0];
  
  const prompts: LanguagePrompts = {
    tr: `Sen bir seyahat uzmanı ve tarihi yer tanıma asistanısın.

GÖREVİN:
Bu fotoğrafı analiz et ve eğer ünlü bir yer, tarihi eser, turistik mekan veya mimari yapıysa tanımla.

ÖNEMLİ KURALLAR:
1. SADECE tanınabilir, ünlü, turistik veya tarihi yerleri tanımla
2. Sıradan sokak, bina, doğa manzarası gibi genel görüntüleri REDDET
3. Eğer yer tanınamıyorsa: recognized: false döndür
4. Tüm metinler Türkçe olmalı

DÖNDÜRMEK İSTEDİĞİM JSON FORMATI:
{
  "recognized": true/false,
  "place": {
    "name": "Yer adı (Türkçe)",
    "localName": "Yerel dildeki adı (varsa)",
    "location": {
      "city": "Şehir",
      "country": "Ülke",
      "coordinates": { "latitude": 41.0, "longitude": 29.0 }
    },
    "description": "2-3 cümlelik kısa açıklama",
    "detailedInfo": {
      "history": "Tarihi bilgi (2-3 paragraf)",
      "architecture": "Mimari özellikleri",
      "culturalSignificance": "Kültürel ve tarihsel önemi",
      "bestTimeToVisit": "En iyi ziyaret zamanı",
      "entryFee": "Giriş ücreti bilgisi (varsa)",
      "openingHours": "Açılış saatleri (varsa)"
    },
    "rating": {
      "average": 4.5,
      "count": 2000
    },
    "userReviews": [
      {
        "author": "Örnek Kullanıcı",
        "rating": 5,
        "comment": "Muhteşem bir deneyim...",
        "date": "2024-06-15"
      }
    ],
    "categories": ["Tarih", "Mimari", "Müze"]
  }
}

EĞER YER TANINAMAZSA:
{
  "recognized": false,
  "message": "Bu görüntüde tanınabilir bir turistik yer veya tarihi eser bulunamadı."
}`,

    en: `You are a travel expert and historical place recognition assistant.

YOUR TASK:
Analyze this photo and identify it if it's a famous landmark, historical site, tourist attraction, or notable architectural structure.

IMPORTANT RULES:
1. ONLY identify recognizable, famous, tourist, or historical places
2. REJECT generic images like random streets, buildings, nature scenes
3. If the place cannot be identified: return recognized: false
4. All text should be in English

RETURN THIS JSON FORMAT:
{
  "recognized": true/false,
  "place": {
    "name": "Place name (English)",
    "localName": "Name in local language (if different)",
    "location": {
      "city": "City",
      "country": "Country",
      "coordinates": { "latitude": 41.0, "longitude": 29.0 }
    },
    "description": "2-3 sentence brief description",
    "detailedInfo": {
      "history": "Historical information (2-3 paragraphs)",
      "architecture": "Architectural features",
      "culturalSignificance": "Cultural and historical significance",
      "bestTimeToVisit": "Best time to visit",
      "entryFee": "Entry fee information (if applicable)",
      "openingHours": "Opening hours (if applicable)"
    },
    "rating": {
      "average": 4.5,
      "count": 2000
    },
    "userReviews": [
      {
        "author": "Example User",
        "rating": 5,
        "comment": "Amazing experience...",
        "date": "2024-06-15"
      }
    ],
    "categories": ["History", "Architecture", "Museum"]
  }
}

IF PLACE CANNOT BE RECOGNIZED:
{
  "recognized": false,
  "message": "No recognizable tourist attraction or historical site found in this image."
}`,

    es: `Eres un experto en viajes y asistente de reconocimiento de lugares históricos.

INSTRUCCIONES:
Analiza esta foto e identifícala si es un lugar famoso, sitio histórico, atracción turística o estructura arquitectónica notable.

REGLAS IMPORTANTES:
1. SOLO identifica lugares reconocibles, famosos, turísticos o históricos
2. RECHAZA imágenes genéricas como calles, edificios o paisajes naturales comunes
3. Si no puedes identificar el lugar: devuelve recognized: false
4. Todo el texto debe estar en español

DEVOLVER ESTE FORMATO JSON: {...}

SI NO SE PUEDE RECONOCER:
{
  "recognized": false,
  "message": "No se encontró ningún lugar turístico o histórico reconocible en esta imagen."
}`,

    fr: `Vous êtes un expert en voyages et assistant de reconnaissance de lieux historiques.

VOTRE TÂCHE:
Analysez cette photo et identifiez-la s'il s'agit d'un lieu célèbre, site historique, attraction touristique ou structure architecturale remarquable.

RÈGLES IMPORTANTES:
1. Identifiez UNIQUEMENT les lieux reconnaissables, célèbres, touristiques ou historiques
2. REJETEZ les images génériques comme les rues, bâtiments ou paysages naturels ordinaires
3. Si le lieu ne peut être identifié: retourner recognized: false
4. Tout le texte doit être en français

RETOURNER CE FORMAT JSON: {...}

SI LE LIEU NE PEUT ÊTRE RECONNU:
{
  "recognized": false,
  "message": "Aucun lieu touristique ou historique reconnaissable trouvé dans cette image."
}`,

    it: `Sei un esperto di viaggi e assistente per il riconoscimento di luoghi storici.

IL TUO COMPITO:
Analizza questa foto e identificala se è un luogo famoso, sito storico, attrazione turistica o struttura architettonica notevole.

REGOLE IMPORTANTI:
1. Identifica SOLO luoghi riconoscibili, famosi, turistici o storici
2. RIFIUTA immagini generiche come strade, edifici o paesaggi naturali comuni
3. Se il luogo non può essere identificato: restituire recognized: false
4. Tutto il testo deve essere in italiano

RESTITUIRE QUESTO FORMATO JSON: {...}

SE IL LUOGO NON PUÒ ESSERE RICONOSCIUTO:
{
  "recognized": false,
  "message": "Nessun luogo turistico o storico riconoscibile trovato in questa immagine."
}`
  };

  return prompts[lang] || prompts.en;
}

/**
 * JSON schema for structured output
 */
export const photoAnalysisSchema = {
  type: 'object',
  properties: {
    recognized: { type: 'boolean' },
    message: { type: 'string' },
    place: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        localName: { type: 'string' },
        location: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            country: { type: 'string' },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' }
              }
            }
          },
          required: ['country']
        },
        description: { type: 'string' },
        detailedInfo: {
          type: 'object',
          properties: {
            history: { type: 'string' },
            architecture: { type: 'string' },
            culturalSignificance: { type: 'string' },
            bestTimeToVisit: { type: 'string' },
            entryFee: { type: 'string' },
            openingHours: { type: 'string' }
          }
        },
        rating: {
          type: 'object',
          properties: {
            average: { type: 'number', minimum: 0, maximum: 5 },
            count: { type: 'number', minimum: 0 }
          }
        },
        userReviews: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              author: { type: 'string' },
              rating: { type: 'number', minimum: 0, maximum: 5 },
              comment: { type: 'string' },
              date: { type: 'string' }
            }
          }
        },
        categories: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  },
  required: ['recognized']
};
