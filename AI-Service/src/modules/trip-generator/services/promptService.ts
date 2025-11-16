// src/services/ai/promptService.ts
import { TripGenerationRequest, LanguagePrompts, SupportedLanguage, TravelInfoRequest } from '../types';

/**
 * TripPlan JSON Schema (STRICT)
 * - No fixed per-day activity limit; the model should choose a reasonable pace.
 * - Activity objects MUST NOT contain a "description" field.
 * - Transport types include: flight | bus | train | car | ferry
 */
export const tripPlanSchema = {
  name: "trip_plan",
  schema: {
    type: "object",
    required: ["title","cities","startDate","endDate","duration","heroImage","itinerary"],
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      cities: { type: "array", items: { type: "string" }, minItems: 1 },
      startDate: { type: "string" }, // e.g. "06 October"
      endDate: { type: "string" },   // e.g. "13 October"
      duration: { type: "number", minimum: 1 },
      heroImage: { type: "string" },
      itinerary: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["dayNumber","city","dateRange","activities"],
          additionalProperties: false,
          properties: {
            dayNumber: { type: "number", minimum: 1 },
            city: { type: "string" },
            dateRange: { type: "string" }, // "6-7 October" or "" if unknown
            isRoute: { type: "boolean" },
            routeInfo: {
              type: "object",
              additionalProperties: false,
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                transportType: { type: "string", enum: ["flight","bus","train","car","ferry"] },
                duration: { type: "string" }, // e.g. "2h 30m", "8–10h"
                cost: { type: "string" },
                fromTerminal: { type: "string" },
                toTerminal: { type: "string" },
                alternatives: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      transportType: { type: "string", enum: ["flight","bus","train","car","ferry"] },
                      duration: { type: "string" },
                      cost: { type: "string" },
                      fromTerminal: { type: "string" },
                      toTerminal: { type: "string" }
                    }
                  }
                }
              }
            },
            activities: {
              type: "array",
              items: {
                type: "object",
                required: ["activity","duration","icon","type"],
                additionalProperties: false,
                properties: {
                  id: { type: "string" },
                  activity: { type: "string" }, // Activity title/description
                  title: { type: "string" },    // Alternative to activity
                  duration: { type: "string" }, // "Day 1" | "Day 2" | "1. Gün" | "2. Gün"
                  icon: { type: "string" },     // Ionicons name (airplane, boat, walk, restaurant, ...)
                  type: { type: "string", enum: ["activity","accommodation","transport","food","sightseeing","beach","nature","adventure","museum","history"] }
                }
              }
            }
          }
        }
      }
    }
  },
  strict: true
} as const;

/**
 * TravelInfo JSON Schema (STRICT, separate from trip plan)
 * Country-focused guide with practical information. No city-specific or itinerary fields.
 */
export const travelInfoSchema = {
  name: 'travel_info',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['country','language','countryInfo'],
    properties: {
      country: { type: 'string' },
      language: { type: 'string' },
      countryInfo: {
        type: 'object',
        additionalProperties: false,
        required: ['overview','topHighlights','currency','power','emergency','sim','bestSeasons','safety'],
        properties: {
          overview: { type: 'string' },
          topHighlights: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 8 },
          currency: { type: 'string' },
          power: { type: 'string' },
          emergency: { type: 'string' }, // Simple string like "Police: 191, Ambulance: 1669, Fire: 199"
          sim: { type: 'string' },
          bestSeasons: { type: 'string' },
          tipping: { type: 'string' },
          safety: { type: 'string' },
          localEtiquette: { type: 'string' }
        }
      }
    }
  },
  strict: true
} as const;

/** Supported languages */
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['tr', 'en', 'es', 'fr', 'it'];

/**
 * Prompts (TR/EN)
 * - Arrival & route card rule
 * - City/day allocation with variable activity counts
 * - Strict JSON only (no prose, no fences)
 * - No specific restaurant names (use generic food items instead)
 */
export const languagePrompts: Record<'tr' | 'en', LanguagePrompts> = {
  tr: {
    system:
`Deneyimli bir seyahat planlama asistanısın. SADECE geçerli JSON döndür (kod bloğu/prose yok).
- Yanıt dili: Türkçe
- JSON şemasına %100 uy (tripPlanSchema, strict).
- Günlük aktivite sayısı sabit değil; mantıklı tempo uygula: varış/depar günleri hafif, tam günlerde daha fazla olabilir.
- Her şehir bloğunun ilk gününde ilk aktivite MUTLAKA: "<Şehir>'e Varış & Otele Yerleşme" (type:"transport", icon:"airplane" veya uygun).
- KRİTİK AKTİVİTE FORMATI: Her aktivite MUTLAKA şunları içermeli:
  * "activity": aktivite açıklaması (örn. "Büyük Saray'ı Ziyaret Et")
  * "duration": MUTLAKA "X. Gün" formatında olmalı, X = GLOBAL seyahat gün numarası (1. Gün = seyahatin ilk günü, 2. Gün = ikinci gün, vb.)
  * "icon": Ionicons adı (örn. "airplane", "walk", "restaurant", "camera")
  * "type": kategori (örn. "transport", "sightseeing", "food", "beach")
- ÖRNEK: 8 günlük Phuket (1-2. Gün), Pattaya (3-4. Gün), Bangkok (5-8. Gün):
  * Phuket aktiviteleri: "duration": "1. Gün", "2. Gün"
  * Pattaya aktiviteleri: "duration": "3. Gün", "4. Gün"
  * Bangkok aktiviteleri: "duration": "5. Gün", "6. Gün", "7. Gün", "8. Gün"
- Şehirler arası geçişte ROUTE KARTI ekle: { isRoute:true, routeInfo:{ from,to,transportType,duration,fromTerminal,toTerminal,alternatives } } ve bu karttan SONRA yeni şehrin "Varış" aktivitesini ekle.
- Ulaşım mantığı:
  * Kısa rota (≈2-3 saat): bus/train/car ana seçenek, uçuş gereksiz
  * Orta rota (≈4-8 saat): bus ana seçenek, uçuş alternatifi ekle (havalimanı isimleriyle)
  * Uzun rota (≈9 saat+): uçuş ana seçenek, bus alternatifi ekle
  * fromTerminal ve toTerminal alanlarını MUTLAKA doldur (havalimanı, otogar isimleri)
  * routeInfo.duration alanını her zaman doldur (örn. "2h 30m", "8–10h")
- Şehir Sırası Optimizasyonu: Kullanıcının verdiği şehirleri coğrafi yakınlığa göre yeniden sırala; geri dönüş (backtracking) yapma.
- Gün/şehir dağıtımı: toplam günleri şehirlere mantıklı ve dengeli böl (her şehir en az 1 gün). Artan günleri ilgi alanlarına en uygun şehre ekle. Varış gününde planı aşırı doldurma.
- İlgi alanlarına uygun SOMUT POI adları kullan; ancak ÖZEL RESTORAN İSİMLERİ VERME. Yiyecek için genel/yerel seçenekler kullan (örn. "<Şehir> Sokak Lezzetleri", gece pazarı vb.).
- Yalnızca verilen şehirleri kullan; yeni şehir ekleme.
- dateRange emin değilsen "" bırak ya da "GG-GG Ay" biçimi kullan.
- YALNIZCA JSON döndür.`,
    user:
`Aşağıdaki bilgilerle TripPlan JSON üret:
- Ülke: {country}
- Şehirler: {cities}
- İlgi alanları: {interests}
- Başlangıç Tarihi: {startDate}
- Bitiş Tarihi: {endDate}
- TOPLAM SEYAHAT GÜN SAYISI: {duration} (BU MAKSİMUM - AŞMA!)

KRİTİK KURALLAR - DİKKATLE OKU:
1) ⚠️ SADECE {duration} GÜN! 1. Gün'den {duration}. Gün'e kadar aktivite oluştur - FAZLA YOK, EKSİK YOK!
2) ⚠️ {duration_plus_1}. Gün veya sonrasını OLUŞTURMA! Seyahat TAM {duration} gün uzunluğunda.
3) Örnekler:
   - 8 günlük seyahat: SADECE 1. Gün, 2. Gün, 3. Gün, 4. Gün, 5. Gün, 6. Gün, 7. Gün, 8. Gün
   - 5 günlük seyahat: SADECE 1. Gün, 2. Gün, 3. Gün, 4. Gün, 5. Gün
4) Her şehir "Varış & Otele Yerleşme" ile başlasın; varış günü daha hafif planlansın.
5) ÖNEMLİ: Her activity'nin "duration" field'ını "1. Gün", "2. Gün", "3. Gün" ... "{duration}. Gün" olarak ayarla. 
6) Tek şehir örneği: {duration}=8 gün ve 1 şehir ise, 1. Gün'den 8. Gün'e kadar TÜM aktiviteleri o şehre koy.
7) Çok şehir: {duration} günü şehirlere böl (örn: 8 gün, 3 şehir → Bangkok 1-3. Gün, Pattaya 4-5. Gün, Phuket 6-8. Gün).
8) Şehirler arasında rota kartı (isRoute:true) ekle, ardından sonraki şehir için Varış aktivitesi.
9) Özel restoran adı kullanma; genel yiyecek aktiviteleri kullan.
10) Sadece JSON döndür; şema dışı alan ekleme.`
  },

  en: {
    system:
`You are an expert travel itinerary planner. Return ONLY valid JSON (no code fences, no prose).
- Obey the JSON schema strictly (tripPlanSchema).
- The number of activities per day is not fixed; use a REASONABLE pace: lighter on arrival/departure days, more on full days when appropriate.
- For EACH city block, the FIRST activity on the FIRST day MUST be: "Arrival to <City> & Hotel Check-in" (type:"transport", icon:"airplane" or matching the route).
- CRITICAL ACTIVITY FORMAT: Each activity MUST have:
  * "activity": the activity description (e.g., "Visit the Grand Palace")
  * "duration": MUST be "Day X" where X is the GLOBAL trip day number (Day 1 = first day of trip, Day 2 = second day, etc.)
  * "icon": Ionicons name (e.g., "airplane", "walk", "restaurant", "camera")
  * "type": category (e.g., "transport", "sightseeing", "food", "beach")
- EXAMPLE: 8-day trip with Phuket (Day 1-2), Pattaya (Day 3-4), Bangkok (Day 5-8):
  * Phuket activities: "duration": "Day 1", "Day 2"
  * Pattaya activities: "duration": "Day 3", "Day 4"
  * Bangkok activities: "duration": "Day 5", "Day 6", "Day 7", "Day 8"
- Insert a ROUTE CARD between cities: { isRoute:true, routeInfo:{ from,to,transportType,duration,fromTerminal,toTerminal,alternatives } }, THEN add the next city's Arrival activity.
- Transport logic:
  * For short routes (≈2-3h): use bus/train/car as primary, no flight needed
  * For medium routes (≈4-8h): use bus as primary, include flight alternative with airport names
  * For long routes (≈9h+): use flight as primary, include bus alternative
  * ALWAYS include fromTerminal and toTerminal with specific names (airports, bus stations)
  * Always fill routeInfo.duration (e.g., "2h 30m", "8–10h")
- City Order Optimization: reorder the provided cities by geographic proximity to avoid backtracking.
- Day/City allocation: distribute total days across cities sensibly (min 1 day per city). Add leftover days to the city that best matches the interests. Do not overstuff arrival days.
- Use concrete POIs aligned with interests; however, DO NOT include specific restaurant proper names. Use generic food items (e.g., "<City> Street Food", night markets).
- USE ONLY the provided cities; do not add new cities.
- If unsure of dates, set dateRange="" or "DD-DD Month".
- Output JSON ONLY.`,
    user:
`Generate a TripPlan JSON using:
- Country: {country}
- Cities: {cities}
- Interests: {interests}
- Start Date: {startDate}
- End Date: {endDate}
- TOTAL TRIP DAYS: {duration} (THIS IS THE MAXIMUM - DO NOT EXCEED!)

CRITICAL RULES - READ CAREFULLY:
1) ⚠️ MAXIMUM {duration} DAYS ONLY! Create activities from Day 1 to Day {duration} - NO MORE, NO LESS!
2) ⚠️ DO NOT create Day {duration_plus_1} or beyond! The trip is EXACTLY {duration} days long.
3) Examples:
   - 8-day trip: Create Day 1, Day 2, Day 3, Day 4, Day 5, Day 6, Day 7, Day 8 ONLY
   - 5-day trip: Create Day 1, Day 2, Day 3, Day 4, Day 5 ONLY
4) Each city block starts with "Arrival to <City> & Hotel Check-in"; keep the arrival day lighter.
5) IMPORTANT: Set each activity's "duration" field to "Day 1", "Day 2", "Day 3" ... "Day {duration}".
6) Single city example: If {duration}=8 days and 1 city, create activities for Day 1 through Day 8 ALL in that city.
7) Multiple cities: Split {duration} days across cities (e.g., 8 days, 3 cities → Bangkok Day 1-3, Pattaya Day 4-5, Phuket Day 6-8).
8) Add route cards (isRoute:true) between cities, then add Arrival activity for next city.
9) DO NOT use specific restaurant names; use generic food activities.
10) Return JSON only; no extra fields outside schema.`
  }
};

/** Language support check */
export function isLanguageSupported(lang: string): boolean {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/** Build prompt for a request */
export function generatePrompt(req: TripGenerationRequest): LanguagePrompts {
  const lang: 'tr' | 'en' = req.language === 'tr' ? 'tr' : 'en';
  const tpl = languagePrompts[lang];

  // Duration (inclusive)
  const start = new Date(req.startDate);
  const end = new Date(req.endDate);
  const duration = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const durationPlusOne = duration + 1;

  const system = tpl.system; // schema is provided via response_format in the API call
  const user = tpl.user
    .replace('{country}', safe(req.country))
    .replace('{cities}', (req.cities || []).join(', '))
    .replace('{interests}', (req.interests || []).join(', '))
    .replace('{startDate}', safe(req.startDate))
    .replace('{endDate}', safe(req.endDate))
    .replace(/{duration}/g, String(duration))
    .replace(/{duration_plus_1}/g, String(durationPlusOne));

  return { system, user };
}

function safe(v: any): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

/** Build travel info prompt (separate from itinerary) - supports all languages */
export function generateTravelInfoPrompt(req: TravelInfoRequest): LanguagePrompts {
  const lang = String(req.language).toLowerCase();
  
  // System prompts for each language
  const systemPrompts: Record<string, string> = {
    tr: `Deneyimli bir seyahat rehberisin. SADECE geçerli JSON döndür (kod bloğu/prose yok).\n- Yanıt dili: Türkçe\n- travelInfoSchema'ya %100 uy (strict).\n- Bu bir gezi planı DEĞİL; sadece ÜLKE hakkında genel bilgi ve pratik seyahat bilgileridir.\n- Kısa, net, turist odaklı ipuçları ver. Abartılı dil veya pazarlama dili kullanma.`,
    en: `You are an expert travel guide. Return ONLY valid JSON (no code fences, no prose).\n- Response language: English\n- Strictly follow travelInfoSchema.\n- This is NOT an itinerary; provide COUNTRY-LEVEL overview and practical travel info.\n- Keep it concise, tourist-focused, no hype.`,
    es: `Eres un guía de viajes experto. Devuelve SOLO JSON válido (sin bloques de código, sin prosa).\n- Idioma de respuesta: Español\n- Sigue estrictamente travelInfoSchema.\n- Esto NO es un itinerario; proporciona información general del PAÍS y consejos prácticos de viaje.\n- Mantén consejos concisos y enfocados en turistas, sin exageraciones.`,
    fr: `Vous êtes un guide de voyage expert. Retournez UNIQUEMENT du JSON valide (pas de blocs de code, pas de prose).\n- Langue de réponse: Français\n- Suivez strictement travelInfoSchema.\n- Ce n'est PAS un itinéraire; fournissez un aperçu général du PAYS et des informations pratiques de voyage.\n- Restez concis, axé touriste, sans exagération.`,
    it: `Sei una guida turistica esperta. Restituisci SOLO JSON valido (nessun blocco di codice, nessuna prosa).\n- Lingua di risposta: Italiano\n- Segui rigorosamente travelInfoSchema.\n- Questo NON è un itinerario; fornisci una panoramica generale del PAESE e informazioni pratiche di viaggio.\n- Mantieni consigli concisi, orientati ai turisti, senza esagerazioni.`,
  };

  // User prompts for each language
  const userPrompts: Record<string, string> = {
    tr: `Ülke: {country}\nDil: tr\nİstek: Aşağıdakileri üret:\n- countryInfo.overview: ülke hakkında 2-3 cümlelik genel tanıtım\n- countryInfo.topHighlights: 3-8 maddelik popüler turistik yerler/deneyimler listesi (ülke genelinde)\n- countryInfo.currency: para birimi ve ödemeler (nakit/kart)\n- countryInfo.power: priz tipi ve voltaj\n- countryInfo.emergency: acil numaralar (TEK STRING olarak, örn: "Polis: 191, Ambulans: 1669, İtfaiye: 199")\n- countryInfo.sim: SIM/eSIM ve internet seçenekleri\n- countryInfo.bestSeasons: en iyi seyahat dönemleri\n- countryInfo.tipping: bahşiş kültürü\n- countryInfo.safety: güvenlik ve dikkat notları\n- countryInfo.localEtiquette: yerel görgü kuralları`,
    en: `Country: {country}\nLanguage: en\nRequest: Provide the following:\n- countryInfo.overview: 2-3 sentence general introduction to the country\n- countryInfo.topHighlights: 3-8 popular tourist attractions/experiences (country-wide)\n- countryInfo.currency: currency and payment habits\n- countryInfo.power: plug types and voltage\n- countryInfo.emergency: emergency numbers (SINGLE STRING, e.g., "Police: 191, Ambulance: 1669, Fire: 199")\n- countryInfo.sim: SIM/eSIM and mobile data options\n- countryInfo.bestSeasons: best times to visit\n- countryInfo.tipping: tipping culture\n- countryInfo.safety: safety notes\n- countryInfo.localEtiquette: brief etiquette notes`,
    es: `País: {country}\nIdioma: es\nSolicitud: Proporciona lo siguiente:\n- countryInfo.overview: introducción general al país en 2-3 frases\n- countryInfo.topHighlights: 3-8 atracciones/experiencias turísticas populares (a nivel nacional)\n- countryInfo.currency: moneda y hábitos de pago\n- countryInfo.power: tipos de enchufes y voltaje\n- countryInfo.emergency: números de emergencia (UN SOLO STRING, ej: "Policía: 191, Ambulancia: 1669, Bomberos: 199")\n- countryInfo.sim: opciones de SIM/eSIM y datos móviles\n- countryInfo.bestSeasons: mejores épocas para visitar\n- countryInfo.tipping: cultura de propinas\n- countryInfo.safety: notas de seguridad\n- countryInfo.localEtiquette: breves notas de etiqueta`,
    fr: `Pays: {country}\nLangue: fr\nDemande: Fournissez les éléments suivants:\n- countryInfo.overview: introduction générale au pays en 2-3 phrases\n- countryInfo.topHighlights: 3-8 attractions/expériences touristiques populaires (à l'échelle nationale)\n- countryInfo.currency: devise et habitudes de paiement\n- countryInfo.power: types de prises et voltage\n- countryInfo.emergency: numéros d'urgence (UNE SEULE CHAÎNE, ex: "Police: 191, Ambulance: 1669, Pompiers: 199")\n- countryInfo.sim: options SIM/eSIM et données mobiles\n- countryInfo.bestSeasons: meilleures périodes pour visiter\n- countryInfo.tipping: culture du pourboire\n- countryInfo.safety: notes de sécurité\n- countryInfo.localEtiquette: brèves notes d'étiquette`,
    it: `Paese: {country}\nLingua: it\nRichiesta: Fornisci quanto segue:\n- countryInfo.overview: introduzione generale al paese in 2-3 frasi\n- countryInfo.topHighlights: 3-8 attrazioni/esperienze turistiche popolari (a livello nazionale)\n- countryInfo.currency: valuta e abitudini di pagamento\n- countryInfo.power: tipi di prese e voltaggio\n- countryInfo.emergency: numeri di emergenza (UNA SOLA STRINGA, es: "Polizia: 191, Ambulanza: 1669, Vigili del Fuoco: 199")\n- countryInfo.sim: opzioni SIM/eSIM e dati mobili\n- countryInfo.bestSeasons: periodi migliori per visitare\n- countryInfo.tipping: cultura della mancia\n- countryInfo.safety: note di sicurezza\n- countryInfo.localEtiquette: brevi note di galateo`,
  };

  const system = systemPrompts[lang] || systemPrompts['en'];
  const user = (userPrompts[lang] || userPrompts['en'])
    .replace('{country}', safe(req.country));

  return { system, user };
}
