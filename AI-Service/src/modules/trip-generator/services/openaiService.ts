// src/services/ai/OpenAIService.ts
import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';
import axios from 'axios';
import { config } from '../../../config';
import {
  TripGenerationRequest,
  TripPlan,
  ServiceResponse,
  TravelInfoRequest,
  TravelInfo,
} from '../types/index';
import { generatePrompt, tripPlanSchema, generateTravelInfoPrompt, travelInfoSchema } from './promptService';
import { mockTripPlan } from './mockDataService';
import { UnsplashService } from './unsplashService';

export class OpenAIService {
  private client: OpenAI;
  private unsplashService: UnsplashService;
  private backendUrl: string;

  constructor() {
    this.client = new OpenAI({ apiKey: config.openai.apiKey });
    this.unsplashService = new UnsplashService();
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:4001';
  }

  async generateTravelInfo(request: TravelInfoRequest): Promise<ServiceResponse<TravelInfo>> {
    try {
      console.log('🤖 AI Service: Travel info requested', request);
      if (!config.openai.useGPT) {
        await this.simulateProcessingTime();
        // Lightweight mock
        return {
          success: true,
          data: {
            country: request.country,
            language: request.language,
            countryInfo: {
              overview: request.language === 'tr' ? `${request.country} genel tanıtım.` : `${request.country} general overview.`,
              topHighlights: [
                request.language === 'tr' ? 'Öne çıkan 1' : 'Highlight 1',
                request.language === 'tr' ? 'Öne çıkan 2' : 'Highlight 2',
                request.language === 'tr' ? 'Öne çıkan 3' : 'Highlight 3',
              ],
              currency: request.language === 'tr' ? 'Para birimi bilgisi' : 'Currency info',
              power: request.language === 'tr' ? 'Priz tipi ve voltaj' : 'Plug types and voltage',
              emergency: request.language === 'tr' ? 'Acil numaralar' : 'Emergency numbers',
              sim: request.language === 'tr' ? 'SIM/eSIM seçenekleri' : 'SIM/eSIM options',
              bestSeasons: request.language === 'tr' ? 'En iyi dönemler' : 'Best seasons',
              tipping: request.language === 'tr' ? 'Bahşiş kültürü' : 'Tipping culture',
              safety: request.language === 'tr' ? 'Güvenlik notları' : 'Safety notes',
              localEtiquette: request.language === 'tr' ? 'Yerel görgü kuralları' : 'Local etiquette',
            }
          },
          timestamp: new Date().toISOString(),
        };
      }

      const content = await this.callGPTForInfo(request);
      const parsed = this.parseJsonWithRepair(content);
      
      // Ensure top-level fields are populated (GPT schema may not include them by default)
      const result: TravelInfo = {
        country: request.country,
        language: request.language,
        ...(parsed as any)
      };
      
      return { success: true, data: result, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('❌ OpenAI TravelInfo Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async callGPTForInfo(request: TravelInfoRequest): Promise<string> {
    const { system, user } = generateTravelInfoPrompt(request);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), config.openai.gptTimeoutMs);
    try {
      const isGpt5 = /^gpt-5/i.test(config.openai.model);
      const tokenLimit = Math.max(400, Math.min(800, config.openai.maxTokens));
      const basePayload: any = {
        model: config.openai.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_schema', json_schema: travelInfoSchema },
      };
      if (!isGpt5) basePayload.temperature = Math.min(0.8, config.openai.temperature);
      if (isGpt5) basePayload.max_completion_tokens = tokenLimit; else basePayload.max_tokens = tokenLimit;

      let response;
      try {
        response = await this.client.chat.completions.create(
          basePayload,
          { signal: controller.signal, timeout: config.openai.gptTimeoutMs + 5000 }
        );
      } catch (e: any) {
        const msg = String(e?.message || '').toLowerCase();
        if (msg.includes('response_format') || msg.includes('json_schema')) {
          const fallbackPayload = { ...basePayload, response_format: { type: 'json_object' as const } };
          response = await this.client.chat.completions.create(
            fallbackPayload,
            { signal: controller.signal, timeout: config.openai.gptTimeoutMs + 5000 }
          );
        } else {
          throw e;
        }
      }

      const content = response?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error('Empty content from OpenAI (travel-info)');
      }
      return content;
    } finally {
      clearTimeout(t);
    }
  }

  private parseJsonWithRepair(content: string): any {
    let text = (content || '').trim();
    text = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
    try { return JSON.parse(text); } catch { /* fallthrough */ }
    try { return JSON.parse(jsonrepair(text)); } catch { /* fallthrough */ }
    return JSON.parse('{}');
  }
  async generateTripPlan(request: TripGenerationRequest): Promise<ServiceResponse<TripPlan>> {
    try {
      console.log('🤖 AI Service: Trip generation requested', {
        country: request.country,
        cities: request.cities,
        language: request.language,
        dates: `${request.startDate} - ${request.endDate}`
      });

      if (!config.openai.useGPT) {
        await this.simulateProcessingTime();
      }

      const tripPlan = config.openai.useGPT
        ? await this.tryGenerateWithGPT(request)
        : await this.generateMockTripPlan(request);

      return { success: true, data: tripPlan, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('❌ OpenAI Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ========================= Core GPT flow =========================
  private async tryGenerateWithGPT(request: TripGenerationRequest): Promise<TripPlan> {
    try {
      const raw = await this.callGPTWithRetry(request);
      const parsed = this.parseTripPlanFromContent(raw);
      const normalized = await this.normalizeTripPlan(request, parsed);
      if (!normalized.itinerary || normalized.itinerary.filter((d: any) => !d.isRoute).length === 0) {
        throw new Error('Empty itinerary after normalization');
      }
      return {
        ...normalized,
        id: normalized.id || this.generateId(),
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('⚠️ GPT parse/generate failed, falling back to mock. Reason:', (err as Error).message);
      return await this.generateMockTripPlan(request);
    }
  }

  private async callGPTWithRetry(request: TripGenerationRequest): Promise<string> {
    const attempts = 2;
    let lastError: any;

    for (let i = 0; i < attempts; i++) {
      const start = Date.now();
      try {
        if (i === 1) {
          request = { ...request, interests: (request.interests || []).slice(0, 5) };
        }
        const content = await this.callGPT(request);
        const ms = Date.now() - start;
        console.log(`🧠 OpenAI call success in ${ms}ms (try ${i + 1}/${attempts})`);
        return content;
      } catch (err) {
        lastError = err;
        const ms = Date.now() - start;
        console.warn(`⏳ OpenAI call failed in ${ms}ms (try ${i + 1}/${attempts}): ${(err as Error).message}`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
    throw lastError || new Error('OpenAI call failed');
  }

  private async callGPT(request: TripGenerationRequest): Promise<string> {
    const { system, user } = generatePrompt(request);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), config.openai.gptTimeoutMs);

    try {
      const isGpt5 = /^gpt-5/i.test(config.openai.model);
      const tokenLimit = Math.max(600, Math.min(1200, config.openai.maxTokens));

      const basePayload: any = {
        model: config.openai.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_schema', json_schema: tripPlanSchema },
      };
      if (!isGpt5) basePayload.temperature = config.openai.temperature;
      if (isGpt5) basePayload.max_completion_tokens = tokenLimit; else basePayload.max_tokens = tokenLimit;

      let response;
      try {
        response = await this.client.chat.completions.create(
          basePayload,
          { signal: controller.signal, timeout: config.openai.gptTimeoutMs + 5000 }
        );
      } catch (e: any) {
        const msg = String(e?.message || '').toLowerCase();
        // Fallback: if this model/route doesn't support json_schema on chat.completions
        if (msg.includes('response_format') || msg.includes('json_schema')) {
          const fallbackPayload = { ...basePayload, response_format: { type: 'json_object' as const } };
          response = await this.client.chat.completions.create(
            fallbackPayload,
            { signal: controller.signal, timeout: config.openai.gptTimeoutMs + 5000 }
          );
        } else {
          throw e;
        }
      }

      const content = response?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error('Empty content from OpenAI');
      }
      console.log('🔍 RAW GPT RESPONSE:', JSON.stringify(JSON.parse(content), null, 2));
      return content;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error(`OpenAI call aborted after ${config.openai.gptTimeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(t);
    }
  }

  // ========================= Parsing / Repair =========================
  private parseTripPlanFromContent(content: string): TripPlan {
    let text = (content || '').trim();
    text = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();

    const extracted = this.extractOutermostJsonObject(text);
    const candidate = extracted || text;

    let parsed: any;
    try {
      parsed = JSON.parse(candidate);
    } catch (_) {
      try {
        const repaired = this.repairJson(candidate);
        parsed = JSON.parse(repaired);
      } catch {
        const repaired = jsonrepair(candidate);
        parsed = JSON.parse(repaired);
      }
    }

    // GPT sends {tripPlan: {cities: [...]}} but we need {itinerary: [...]}
    if (parsed?.tripPlan && Array.isArray(parsed.tripPlan.cities)) {
      return {
        ...parsed.tripPlan,
        itinerary: parsed.tripPlan.cities,
      } as TripPlan;
    }

    return parsed as TripPlan;
  }

  private extractOutermostJsonObject(input: string): string | null {
    let start = -1;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (inString) {
        if (escape) { escape = false; }
        else if (ch === '\\') { escape = true; }
        else if (ch === '"') { inString = false; }
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === '{') { if (depth === 0) start = i; depth++; }
      else if (ch === '}') {
        depth--;
        if (depth === 0 && start !== -1) return input.slice(start, i + 1);
      }
    }
    return null;
  }

  private repairJson(input: string): string {
    let s = input;
    s = s.replace(/\/\*[\s\S]*?\*\//g, '');
    s = s.replace(/(^|[^:])\/\/.*$/gm, '$1');
    s = s.replace(/,\s*([}\]])/g, '$1');
    s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    s = s.replace(/([,{\s])([A-Za-z_][A-Za-z0-9_\-]*)\s*:/g, (m, p1, p2) => `${p1}"${p2}":`);
    s = s.replace(/(:\s*)'([^'\\]*(?:\\.[^'\\]*)*)'/g, '$1"$2"');
    s = s.replace(/([\[,]\s*)'([^'\\]*(?:\\.[^'\\]*)*)'/g, '$1"$2"');
    s = s.replace(/`/g, '"');
    return s;
  }

  // ========================= Normalization =========================
  private async normalizeTripPlan(request: TripGenerationRequest, plan: Partial<TripPlan>): Promise<TripPlan> {
    const countryName = request.country || 'Travel';
    const titleByLang: Record<string, string> = {
      tr: `${countryName} Gezi Planı`,
      en: `${countryName} Travel Plan`,
      es: `Plan de Viaje a ${countryName}`,
      fr: `Plan de Voyage en ${countryName}`,
      it: `Piano di Viaggio in ${countryName}`,
    };

    // Get hero image for the country
    const heroImage = await this.getCountryHeroImage(countryName);
    console.log('🖼️ Hero image fetched:', heroImage);

    const itinerary = Array.isArray(plan.itinerary) ? plan.itinerary : [];
    console.log('📦 BEFORE normalizeDayPlan - cities:', itinerary.filter((d: any) => !d.isRoute).map((d: any) => `${d.city} (${d.activities?.length} acts)`));
    const cleanedDays = itinerary.map((d, idx) => this.normalizeDayPlan(d as any, idx + 1, request.language));
    console.log('📦 AFTER normalizeDayPlan - cities:', cleanedDays.filter(d => !d.isRoute).map(d => `${d.city} (${d.activities?.length} acts)`));

    // Merge consecutive same-city blocks (keep order)
    const mergedCities = this.mergeCityBlocks(cleanedDays, request.language);
    console.log('📦 AFTER mergeCityBlocks - cities:', mergedCities.filter(d => !d.isRoute).map(d => `${d.city} (${d.activities?.length} acts)`));

    // Keep GPT order; append missing requested cities at the end (with arrival)
    const completed = this.ensureAllCitiesIncluded(mergedCities, request.cities, request.language);

    // Allocate days/dateRange; then insert route cards between blocks
    const withDays = this.assignDaysAndDateRanges(
      completed,
      typeof (plan as any)?.duration === 'number' && (plan as any).duration > 0
        ? (plan as any).duration
        : Math.max(1, Math.floor((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1),
      request.startDate,
      request.language
    );

    const routeMap = this.extractRouteMap(cleanedDays);
    const cleaned = this.insertRoutesBetweenCityBlocks(withDays, request.language, routeMap);

    const citiesOrder =
      Array.isArray((plan as any)?.sortedCities) && (plan as any).sortedCities.length
        ? (plan as any).sortedCities as string[]
        : cleaned.filter(b => !b.isRoute).map(b => b.city);

    const finalPlan = {
      id: (plan as TripPlan).id || this.generateId(),
      title: plan.title || titleByLang[request.language] || titleByLang.en,
      cities: citiesOrder,
      startDate: plan.startDate || request.startDate,
      endDate: plan.endDate || request.endDate,
      duration: typeof plan.duration === 'number' && plan.duration > 0
        ? plan.duration
        : Math.max(1, Math.floor((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1),
      heroImage: plan.heroImage || heroImage,
      itinerary: cleaned,
      generatedAt: (plan as TripPlan).generatedAt || new Date().toISOString(),
    };
    console.log('📦 Final plan heroImage:', finalPlan.heroImage);
    return finalPlan;
  }

  private ensureAllCitiesIncluded(blocks: TripPlan['itinerary'], cityList: string[], language: string): TripPlan['itinerary'] {
    const have = new Set((blocks || []).filter(b => !b.isRoute).map(b => (b.city || '').toLowerCase()));
    const out: TripPlan['itinerary'] = [...blocks];
    for (const city of cityList || []) {
      const key = (city || '').toLowerCase();
      if (!have.has(key)) {
        out.push({ dayNumber: 1, city, dateRange: '', activities: this.ensureArrival(city, [], language) });
      }
    }
    return out;
  }

  private extractRouteMap(days: TripPlan['itinerary']): Map<string, any> {
    const map = new Map<string, any>();
    for (const d of days || []) {
      const anyD: any = d as any;
      if (anyD && anyD.isRoute && anyD.routeInfo) {
        const from = String(anyD.routeInfo.from || '').trim().toLowerCase();
        const to = String(anyD.routeInfo.to || '').trim().toLowerCase();
        if (from && to) map.set(`${from}|${to}`, anyD);
      }
    }
    return map;
  }

  private normalizeDayPlan(day: any, fallbackDayNumber: number, language: string) {
    const dayNumber = typeof day?.dayNumber === 'number' ? day.dayNumber : fallbackDayNumber;
    // GPT sometimes sends 'name' field instead of 'city'
    const city = typeof day?.city === 'string' ? day.city : (typeof day?.name === 'string' ? day.name : (day?.routeInfo?.to || ''));
    const dateRange = typeof day?.dateRange === 'string' ? day.dateRange : '';
    const isRoute = day?.isRoute === true;

    const allowedTT = ['flight','bus','train','car','ferry'] as const;
    const tt = allowedTT.includes(day?.routeInfo?.transportType) ? day.routeInfo.transportType : undefined;

    const alternatives = Array.isArray(day?.routeInfo?.alternatives)
      ? day.routeInfo.alternatives.map((alt: any) => {
          const tAlt = allowedTT.includes(alt?.transportType) ? alt.transportType : undefined;
          return {
            transportType: tAlt || 'bus',
            duration: alt?.duration ? String(alt.duration) : '',
            cost: alt?.cost ? String(alt.cost) : undefined,
            fromTerminal: alt?.fromTerminal ? String(alt.fromTerminal) : undefined,
            toTerminal: alt?.toTerminal ? String(alt.toTerminal) : undefined,
          };
        })
      : undefined;

    const routeInfo = isRoute && day?.routeInfo ? {
      from: String(day.routeInfo.from || ''),
      to: String(day.routeInfo.to || ''),
      transportType: tt || 'bus',
      duration: day.routeInfo.duration ? String(day.routeInfo.duration) : '',
      cost: day.routeInfo.cost ? String(day.routeInfo.cost) : undefined,
      fromTerminal: day.routeInfo.fromTerminal ? String(day.routeInfo.fromTerminal) : undefined,
      toTerminal: day.routeInfo.toTerminal ? String(day.routeInfo.toTerminal) : undefined,
      alternatives,
    } : undefined;

    const acts = Array.isArray(day?.activities) ? day.activities : [];
    const normalized = acts.map((a: any, idx: number) => this.normalizeActivity(a, dayNumber, idx, city, language));

    return {
      dayNumber,
      city,
      dateRange,
      activities: normalized,
      isRoute: isRoute || undefined,
      routeInfo,
    };
  }

  // ========================= Activity helpers =========================
  private isRestaurantProperName(title: string): boolean {
    const t = (title || '').trim();
    if (/^(?:dinner|lunch|breakfast)\s+(?:at|@)\s+/i.test(t)) return true;         // "Lunch at Nahm"
    if (/\b(?:at|@)\s+[A-Z][A-Za-z0-9'’&.\-]+/.test(t)) return true;              // "at Nahm"
    if (/\b(restaurant|bistro|brasserie|trattoria|ristorante|osteria|steakhouse|eatery|kitchen|cafe|café|bar|pub|bakery|patisserie)\b/i.test(t)) return true;
    if (/\bmichelin\b/i.test(t)) return true;
    return false;
  }

  private normalizeActivity(a: any, dayNumber: number, idx: number, city: string, language: string) {
    const id = typeof a?.id === 'string' && a.id ? a.id : `gpt-${dayNumber}-${idx + 1}`;
    // GPT may send "activity" field instead of "title"
    let title = typeof a?.title === 'string' && a.title ? String(a.title).trim() : '';
    if (!title && typeof a?.activity === 'string' && a.activity) {
      title = String(a.activity).trim();
    }
    if (!title || /^(activity|aktivite|to do|thing to do)$/i.test(title)) {
      title = this.genericActivityFallback(city, idx, language);
    }
    const duration = typeof a?.duration === 'string' ? a.duration : '';
    if (this.isRestaurantProperName(title)) {
      const generic = language === 'tr' ? `${city} Sokak Lezzetleri` : `${city} Street Food`;
      return { id, title: generic, duration, icon: 'restaurant', type: 'food' as const };
    }
    const icon = typeof a?.icon === 'string' && a.icon ? a.icon : 'walk';
    const validTypes = ['activity','accommodation','transport','food'] as const;
    const type = validTypes.includes(a?.type) ? a?.type : 'activity';
    return { id, title, duration, icon, type };
  }

  private genericActivityFallback(city: string, idx: number, language: string) {
    const n = (idx % 4);
    const itemsEn = [
      `Explore ${city} Highlights`,
      `${city} Walking Tour`,
      `${city} Local Market Visit`,
      `${city} Cultural Spot`
    ];
    const itemsTr = [
      `${city} Öne Çıkanlar`,
      `${city} Yürüyüş Turu`,
      `${city} Yerel Pazar Ziyareti`,
      `${city} Kültürel Nokta`
    ];
    return language === 'tr' ? itemsTr[n] : itemsEn[n];
  }

  // ========================= Route helpers =========================
  private parseDurationToHours(s?: string): number | null {
    if (!s) return null;
    const t = s.toLowerCase().replace(/\s+/g,'').replace(/[~≈]/g,'');
    const hm = t.match(/(\d+)\s*h(?:\s*(\d+)\s*m)?/i);
    if (hm) { const h = +hm[1]; const m = hm[2] ? +hm[2] : 0; return h + m/60; }
    const range = t.match(/(\d+)[\-–](\d+)h/); if (range) return (+range[1]+ +range[2])/2;
    const onlyH = t.match(/(\d+(?:\.\d+)?)h/); if (onlyH) return +onlyH[1];
    const trRange = t.match(/(\d+)[\-–](\d+)saat/); if (trRange) return (+trRange[1]+ +trRange[2])/2;
    const trOnly = t.match(/(\d+(?:\.\d+)?)saat/); if (trOnly) return +trOnly[1];
    return null;
  }

  private ensureAlternativesByDuration(route: any) {
    if (!route?.routeInfo) return route;
    const info = route.routeInfo;
    const hours = this.parseDurationToHours(info.duration);
    if (hours == null) return route;

    // Short hops: flight should not be primary
    if (hours <= 3) {
      if (String(info.transportType).toLowerCase() === 'flight') {
        route.routeInfo = {
          ...info,
          transportType: 'bus',
          alternatives: [
            ...(info.alternatives || []),
            { transportType: 'flight', duration: info.duration, fromTerminal: info.fromTerminal, toTerminal: info.toTerminal }
          ]
        };
      }
      return route;
    }

    // Long routes: flight alternative must exist
    if (hours >= 6) {
      // If primary is flight but duration looks long, normalize duration
      if (String(info.transportType).toLowerCase() === 'flight') {
        route.routeInfo = {
          ...info,
          duration: info.duration && /h/i.test(String(info.duration)) ? '≈1–2h' : (info.duration || '≈1–2h')
        };
        return route;
      }

      const hasFlightAlt = Array.isArray(info.alternatives) && info.alternatives.some((a:any) => String(a.transportType).toLowerCase() === 'flight');
      const from = String(info.from || '').toLowerCase();
      const to = String(info.to || '').toLowerCase();
      const key = `${from}|${to}`;
      const preferFlight = new Set([
        'bangkok|phuket','phuket|bangkok','pattaya|phuket','phuket|pattaya','bangkok|chiang mai','chiang mai|bangkok'
      ]);

      // Prefer flight for known long routes; make ground option an alternative
      if (preferFlight.has(key) && String(info.transportType).toLowerCase() !== 'flight') {
        route.routeInfo = {
          ...info,
          transportType: 'flight',
          duration: '≈1–2h',
          alternatives: [
            { transportType: String(info.transportType || 'bus') as any, duration: info.duration, fromTerminal: info.fromTerminal, toTerminal: info.toTerminal },
            ...(hasFlightAlt ? info.alternatives : [])
          ]
        };
      } else if (!hasFlightAlt) {
        route.routeInfo = {
          ...info,
          alternatives: [
            ...(info.alternatives || []),
            { transportType: 'flight', duration: '≈1–2h', fromTerminal: info.fromTerminal, toTerminal: info.toTerminal }
          ]
        };
      }
    }
    return route;
  }

  private enrichRouteInfo(route: any) {
    const from = (route?.routeInfo?.from || '').toLowerCase();
    const to   = (route?.routeInfo?.to   || '').toLowerCase();

    // Simple terminal enrichers (optional UI nicety)
    const airports: Record<string, string> = {
      bangkok: 'Suvarnabhumi Airport (BKK)',
      pattaya: 'U-Tapao–Rayong–Pattaya Intl (UTP)',
      phuket: 'Phuket International Airport (HKT)',
      'chiang mai': 'Chiang Mai International Airport (CNX)'
    };
    const busTerms: Record<string, string> = {
      bangkok: 'Bangkok (Ekkamai) Bus Terminal',
      pattaya: 'Pattaya Bus Terminal',
      phuket: 'Phuket Bus Terminal 2',
      'chiang mai': 'Chiang Mai Arcade Bus Terminal'
    };
    const guess = (map: Record<string,string>, key: string) => {
      const hit = Object.keys(map).find(k => key.includes(k));
      return hit ? map[hit] : undefined;
    };

  const base = { ...route, routeInfo: { ...route.routeInfo } };
    const t = String(base.routeInfo.transportType || '').toLowerCase();

    if (!base.routeInfo.fromTerminal) {
      if (t === 'flight' && guess(airports, from)) base.routeInfo.fromTerminal = guess(airports, from)!;
      else if (t === 'bus' && guess(busTerms, from)) base.routeInfo.fromTerminal = guess(busTerms, from)!;
    }
    if (!base.routeInfo.toTerminal) {
      if (t === 'flight' && guess(airports, to)) base.routeInfo.toTerminal = guess(airports, to)!;
      else if (t === 'bus' && guess(busTerms, to)) base.routeInfo.toTerminal = guess(busTerms, to)!;
    }

    // Ensure duration and sensible primary transport when missing
    if (!base.routeInfo.duration || !String(base.routeInfo.duration).trim()) {
      base.routeInfo.duration = this.estimateDuration(base.routeInfo.from, base.routeInfo.to);
    }
    if (!t) {
      base.routeInfo.transportType = this.estimatePrimaryTransport(base.routeInfo.from, base.routeInfo.to);
    }

    return this.ensureAlternativesByDuration(base);
  }

  // Heuristic duration estimates for common Thailand routes
  private estimateDuration(from?: string, to?: string): string {
    const f = (from || '').toLowerCase();
    const t = (to || '').toLowerCase();
    const key = `${f}|${t}`;
    const table: Record<string, string> = {
      'bangkok|pattaya': '2–3h',
      'pattaya|bangkok': '2–3h',
      'bangkok|phuket': '10–12h',
      'phuket|bangkok': '10–12h',
      'bangkok|chiang mai': '9–10h',
      'chiang mai|bangkok': '9–10h',
      'pattaya|phuket': '14–16h',
      'phuket|pattaya': '14–16h',
    };
    return table[key] || '';
  }

  private estimatePrimaryTransport(from?: string, to?: string): 'flight' | 'bus' | 'train' | 'car' | 'ferry' {
    const f = (from || '').toLowerCase();
    const t = (to || '').toLowerCase();
    const key = `${f}|${t}`;
    const flightPreferred = new Set([
      'bangkok|phuket', 'phuket|bangkok',
      'pattaya|phuket', 'phuket|pattaya',
      'bangkok|chiang mai', 'chiang mai|bangkok',
    ]);
    const groundPreferred = new Set([
      'bangkok|pattaya', 'pattaya|bangkok',
    ]);
    if (flightPreferred.has(key)) return 'flight';
    if (groundPreferred.has(key)) return 'bus';
    return 'bus';
  }

  private mergeCityBlocks(days: TripPlan['itinerary'], language: string): TripPlan['itinerary'] {
    const merged: TripPlan['itinerary'] = [];
    for (const day of days) {
      if (day.isRoute) { merged.push(day); continue; }
      const last = merged.length > 0 ? merged[merged.length - 1] : undefined;
      if (last && !last.isRoute && last.city === day.city) {
        last.activities = this.mergeCityActivities(last.activities, day.activities, language);
        if (!last.dateRange && day.dateRange) last.dateRange = day.dateRange;
      } else {
        const activities = this.mergeCityActivities([], day.activities, language);
        merged.push({ ...day, activities: this.ensureArrival(day.city, activities, language) });
      }
    }
    return merged;
  }

  private mergeCityActivities(base: any[], extra: any[], language: string) {
    const all = [...(base || []), ...(extra || [])];
    const seen = new Set<string>();

    const uniques: any[] = [];
    for (const a of all) {
      const title = String(a?.title || '').trim();
      // Include duration in the key to distinguish activities on different days
      const duration = String(a?.duration || '').trim();
      const key = `${title.toLowerCase()}|${duration.toLowerCase()}`;
      if (!title || seen.has(key)) continue;
      seen.add(key);
      // PRESERVE DURATION AS-IS from GPT - don't modify it!
      uniques.push({ ...a, title });
    }

    return uniques;
  }

  private dayLabel(language: string, n: number) {
    return language === 'tr' ? `${n}. Gün` : `Day ${n}`;
  }

  private ensureArrival(city: string, activities: any[], language: string) {
    const hasArrival = (activities || []).some(a => /arrival|varış|check-?in/i.test(String(a?.title || '')) || a?.type === 'transport');
    if (hasArrival) return activities;
    
    // If we need to add arrival, use the first activity's day or fallback to Day 1
    const firstActivityDay = activities.length > 0 && activities[0].duration ? activities[0].duration : this.dayLabel(language, 1);
    const title = language === 'tr' ? `${city}'e Varış & Otele Yerleşme` : `Arrival to ${city} & Hotel Check-in`;
    const arrival = { id: `arr-${city.toLowerCase()}`, title, duration: firstActivityDay, icon: 'airplane', type: 'transport' as const };
    return [arrival, ...(activities || [])];
  }

  private assignDaysAndDateRanges(blocks: TripPlan['itinerary'], totalDays: number, startDateStr: string, language: string): TripPlan['itinerary'] {
    const out: TripPlan['itinerary'] = [];
    const cityBlocks = blocks.filter(b => !b.isRoute);
    if (cityBlocks.length === 0) return blocks;

    let remainingDays = Math.max(1, totalDays);
    let currentStartDayIndex = 1;

    for (let i = 0; i < cityBlocks.length; i++) {
      const block = { ...cityBlocks[i], activities: [...(cityBlocks[i].activities || [])] };
      const remainingCities = cityBlocks.length - i;
      const daysForThisCity = Math.max(1, Math.floor(remainingDays / remainingCities));

      // Check if GPT already provided good day labels (Day 1, Day 2, etc.)
      const hasValidDayLabels = block.activities.some(a => {
        const d = String(a?.duration || '');
        return /Day\s*[1-9][0-9]*|[1-9][0-9]*\.\s*Gün/i.test(d);
      });

      // If GPT already gave us proper day distribution, use it as-is (GPT sends global day numbers)
      if (hasValidDayLabels && block.activities.length >= daysForThisCity * 1.5) {

  // GPT now sends global day numbers (Day 1 = trip day 1, not city day 1)
  // Use the actual min day in the block as the block start, to align UI badges
  // Get the actual day range from activities
  const allDays = block.activities.map(a => this.extractDayNumber(a.duration, language)).filter(n => n > 0);
  let minDayInBlock = Math.min(...allDays);
  let maxDayInBlock = Math.max(...allDays);
        
        // CRITICAL: Cap maxDay to totalDays (GPT sometimes generates activities beyond trip duration)
        if (maxDayInBlock > totalDays) {
          console.warn(`⚠️ ${block.city}: GPT generated activities up to Day ${maxDayInBlock}, but trip is only ${totalDays} days. Capping to Day ${totalDays}.`);
          maxDayInBlock = totalDays;
          // Filter out activities beyond total trip days
          block.activities = block.activities.filter(a => {
            const dayNum = this.extractDayNumber(a.duration, language);
            return dayNum === 0 || dayNum <= totalDays;
          });
        }
        
  const actualDaysUsed = maxDayInBlock - minDayInBlock + 1;
        
        console.log(`🔍 ${block.city}: minDay=${minDayInBlock}, maxDay=${maxDayInBlock}, actualDaysUsed=${actualDaysUsed}, currentStartDayIndex=${currentStartDayIndex}`);
        
        const tripStart = new Date(startDateStr);
        const cityStart = new Date(tripStart);
        cityStart.setDate(tripStart.getDate() + (minDayInBlock - 1));
        const cityEnd = new Date(cityStart);
        cityEnd.setDate(cityStart.getDate() + (actualDaysUsed - 1));
        block.dateRange = this.formatDateRange(cityStart, cityEnd, language);
  // Align block start day with real min day in activities (for UI badges)
  block.dayNumber = minDayInBlock;
        
        out.push(block);
        remainingDays -= actualDaysUsed;
        currentStartDayIndex = maxDayInBlock + 1;
        continue;
      }

      // Otherwise, redistribute activities across days
      const arrivalIdx = block.activities.findIndex(a => a?.type === 'transport' || /arrival|varış|check-?in/i.test(String(a?.title || '')));
      let suggestions = block.activities.filter((_, idx) => idx !== arrivalIdx);

      // Ensure a healthy number of activities (min 2 per full day)
      const minPerDay = 2;
      const target = daysForThisCity * minPerDay;
      if (suggestions.length < target) {
        const needed = target - suggestions.length;
        for (let n = 0; n < needed; n++) {
          const fillerIdx = suggestions.length + 1;
          const title = language === 'tr' ? `${block.city} Keşfi` : `${block.city} Highlights`;
          suggestions.push({ id: `fill-${block.city}-${fillerIdx}`, title, duration: '', icon: 'walk', type: 'activity' });
        }
      }

      const counts = this.allocateItemsAcrossDays(suggestions.length, daysForThisCity);
      let k = 0;
      for (let d = 0; d < daysForThisCity; d++) {
        const countForDay = counts[d] || 0;
        for (let c = 0; c < countForDay; c++) {
          const act = suggestions[k++];
          if (act) act.duration = this.dayLabel(language, d + 1);
        }
      }

      if (arrivalIdx >= 0 && block.activities[arrivalIdx]) {
        block.activities[arrivalIdx].duration = this.dayLabel(language, 1);
      }

      block.dayNumber = currentStartDayIndex;

      const tripStart = new Date(startDateStr);
      const cityStart = new Date(tripStart);
      cityStart.setDate(tripStart.getDate() + (currentStartDayIndex - 1));
      const parsedMax = this.getLastDayIndex(block.activities, language) || 0;
      const lastIdx = Math.max(parsedMax, daysForThisCity);
      const cityEnd = new Date(cityStart);
      cityEnd.setDate(cityStart.getDate() + (lastIdx - 1));
      block.dateRange = this.formatDateRange(cityStart, cityEnd, language);

      if (arrivalIdx >= 0) {
        const arrival = block.activities[arrivalIdx];
        block.activities = [arrival, ...suggestions];
      } else {
        block.activities = suggestions;
      }

      out.push(block);
      remainingDays -= daysForThisCity;
      currentStartDayIndex += daysForThisCity;
    }

    return out;
  }

  private allocateItemsAcrossDays(totalItems: number, days: number): number[] {
    const base = Math.floor(totalItems / days);
    const rem = totalItems % days;
    const arr: number[] = new Array(days).fill(base);
    for (let i = days - rem; i < days; i++) {
      if (i >= 0 && i < days) arr[i] += 1;
    }
    return arr;
  }

  private insertRoutesBetweenCityBlocks(cityBlocks: TripPlan['itinerary'], language: string, existingRoutes?: Map<string, any>): TripPlan['itinerary'] {
    const out: TripPlan['itinerary'] = [];
    const citiesOnlyRaw = cityBlocks.filter(b => !b.isRoute);
    const citiesOnly = this.condenseCityBlocks(citiesOnlyRaw, language);
    for (let i = 0; i < citiesOnly.length; i++) {
      const block = citiesOnly[i];
      out.push(block);
      if (i < citiesOnly.length - 1) {
        const next = citiesOnly[i + 1];
        if (!next.city || next.city === block.city) continue;
        // Use next city's starting day as the route day to align with UI expectations
        const nextDays = (next.activities || [])
          .map(a => this.extractDayNumber(a?.duration || '', language))
          .filter(n => Number.isFinite(n) && n > 0);
        let nextStart = nextDays.length > 0 ? Math.min(...nextDays) : (next.dayNumber || 1);
        // If GPT used local labels (min=1), fallback to normalized block start day
        if (nextDays.length > 0 && Math.min(...nextDays) === 1 && typeof next.dayNumber === 'number') {
          nextStart = next.dayNumber;
        }
        const routeDay = nextStart;
        const key = `${String(block.city || '').trim().toLowerCase()}|${String(next.city || '').trim().toLowerCase()}`;
        const gptRoute = existingRoutes?.get(key);
        const routeInfo = gptRoute?.routeInfo ? { ...gptRoute.routeInfo } : {
          from: block.city,
          to: next.city,
          transportType: this.estimatePrimaryTransport(block.city, next.city),
          duration: this.estimateDuration(block.city, next.city),
        };
        const routeCard = {
          dayNumber: routeDay,
          city: next.city,
          dateRange: '',
          activities: [],
          isRoute: true,
          routeInfo,
        } as const;
        out.push(this.enrichRouteInfo(routeCard));
      }
    }
    return out;
  }

  private condenseCityBlocks(blocks: TripPlan['itinerary'], language: string): TripPlan['itinerary'] {
    const out: TripPlan['itinerary'] = [];
    const seen = new Map<string, number>();
    for (const b of blocks) {
      const key = (b.city || '').trim();
      if (!key) continue;
      if (seen.has(key)) {
        const idx = seen.get(key)!;
        out[idx] = {
          ...out[idx],
          dateRange: out[idx].dateRange || b.dateRange || '',
          activities: this.mergeCityActivities(out[idx].activities, b.activities, language),
        };
      } else {
        seen.set(key, out.length);
        out.push({ ...b, activities: this.mergeCityActivities([], b.activities, language) });
      }
    }
    return out;
  }

  private extractDayNumber(durationStr: string, language: string): number {
    const reEn = /Day\s*(\d+)/i;
    const reTr = /(\d+)\.\s*Gün/i;
    const d = String(durationStr || '');
    const m1 = d.match(reEn);
    const m2 = d.match(reTr);
    if (m1 && m1[1]) return parseInt(m1[1], 10);
    if (m2 && m2[1]) return parseInt(m2[1], 10);
    return 0;
  }

  private getLastDayIndex(activities: any[] = [], language: string): number | null {
    let max = 0;
    const reEn = /Day\s*(\d+)/i;
    const reTr = /(\d+)\.\s*Gün/i;
    for (const a of activities || []) {
      const d = String(a?.duration || '');
      let n = 0;
      const m1 = d.match(reEn);
      const m2 = d.match(reTr);
      if (m1 && m1[1]) n = parseInt(m1[1], 10);
      else if (m2 && m2[1]) n = parseInt(m2[1], 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
    return max || null;
  }

  // ========================= Utilities / Mock =========================
  private async simulateProcessingTime(): Promise<void> {
    const delay = Math.random() * 2000 + 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async generateMockTripPlan(request: TripGenerationRequest): Promise<TripPlan> {
    const { language, startDate, endDate, cities, country } = request;
    const countryName = country || 'Travel';

    const titles = {
      tr: `${countryName} Gezi Planı`,
      en: `${countryName} Travel Plan`,
      es: `Plan de Viaje a ${countryName}`,
      fr: `Plan de Voyage en ${countryName}`,
      it: `Piano di Viaggio in ${countryName}`,
    } as const;

    // Get hero image for the country
    const heroImage = await this.getCountryHeroImage(countryName);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Build itinerary directly without normalization (activities already have correct day labels)
    const itinerary = this.buildMockItinerary(cities, start, totalDays, language, request.interests || []);

    return {
      id: this.generateId(),
      title: titles[language as keyof typeof titles] || titles.en,
      cities,
      startDate: this.formatDate(startDate, language),
      endDate: this.formatDate(endDate, language),
      duration: totalDays,
      heroImage,
      itinerary,
      generatedAt: new Date().toISOString(),
    };
  }

  // Renamed to buildMockItinerary: mock activities are already correct, no GPT normalization
  private buildMockItinerary(cities: string[], startDate: Date, totalDays: number, language: string, interests: string[]): TripPlan['itinerary'] {
    const safeCities = (cities && cities.length > 0) ? cities : ['Bangkok'];
    const parts: TripPlan['itinerary'] = [];

    let remainingDays = totalDays;
    let currentDay = 1;
    for (let i = 0; i < safeCities.length; i++) {
      const remainingCities = safeCities.length - i;
      const daysForThisCity = Math.max(1, Math.floor(remainingDays / remainingCities));

      const cityStart = new Date(startDate);
      cityStart.setDate(startDate.getDate() + (currentDay - 1));
      const cityEnd = new Date(cityStart);
      cityEnd.setDate(cityStart.getDate() + (daysForThisCity - 1));

      parts.push({
        dayNumber: currentDay,
        city: safeCities[i],
        dateRange: this.formatDateRange(cityStart, cityEnd, language),
        activities: this.buildActivitiesForCity(safeCities[i], daysForThisCity, language, interests),
      });

      currentDay += daysForThisCity;
      remainingDays -= daysForThisCity;

      if (i < safeCities.length - 1) {
        const from = safeCities[i];
        const to = safeCities[i + 1];
        const routeCard = this.enrichRouteInfo({
          dayNumber: currentDay,
          city: to,
          dateRange: '',
          activities: [],
          isRoute: true,
          routeInfo: {
            from,
            to,
            transportType: this.estimatePrimaryTransport(from, to),
            duration: this.estimateDuration(from, to),
          },
        });
        parts.push(routeCard);
      }
    }

    return parts;
  }

  private pickTransport(_index: number): 'flight' | 'bus' | 'train' | 'car' | 'ferry' {
    return 'bus';
  }

  private buildActivitiesForCity(city: string, days: number, language: string, interests: string[] = []) {
    const labels = this.activityLabels(language);
    // Normalize city name for lookup (trim, lowercase)
    const cityKey = (city || '').trim();
    const pois: Record<string, { activity: string; icon: string; type: 'activity' | 'food' | 'transport'; tags?: string[] }[]> = {
      Bangkok: [
        { activity: 'Grand Palace & Wat Phra Kaew', icon: 'business', type: 'activity', tags: ['culture','history','landmark'] },
        { activity: 'Wat Pho (Reclining Buddha)', icon: 'library', type: 'activity', tags: ['culture','temple','history'] },
        { activity: 'Wat Arun (Temple of Dawn)', icon: 'sunny', type: 'activity', tags: ['culture','temple','views'] },
        { activity: 'Chao Phraya River Cruise', icon: 'boat', type: 'activity', tags: ['scenic','relax'] },
        { activity: 'Chatuchak Weekend Market', icon: 'storefront', type: 'activity', tags: ['shopping','local'] },
        { activity: 'Yaowarat (Chinatown) Street Food', icon: 'restaurant', type: 'food', tags: ['food','street-food'] },
        { activity: 'Erawan Shrine & Ratchaprasong Walk', icon: 'walk', type: 'activity', tags: ['culture','shopping'] },
      ],
      'Chiang Mai': [
        { activity: 'Doi Suthep Temple', icon: 'leaf', type: 'activity', tags: ['culture','temple','views'] },
        { activity: 'Old City Temples Walk', icon: 'walk', type: 'activity', tags: ['culture','temple','history'] },
        { activity: 'Sunday Night Market (Ratchadamnoen)', icon: 'storefront', type: 'activity', tags: ['shopping','local'] },
        { activity: 'Elephant Nature Park (ethical visit)', icon: 'paw', type: 'activity', tags: ['nature','wildlife'] },
        { activity: 'Nimmanhaemin Cafe Hopping', icon: 'cafe', type: 'food', tags: ['food','coffee'] },
      ],
      Phuket: [
        { activity: 'Phang Nga Bay Boat Tour', icon: 'boat', type: 'activity', tags: ['nature','boat','scenic'] },
        { activity: 'Phi Phi Islands Day Trip', icon: 'boat', type: 'activity', tags: ['beach','snorkeling','boat'] },
        { activity: 'Big Buddha & Karon Viewpoint', icon: 'leaf', type: 'activity', tags: ['views','culture'] },
        { activity: 'Kata Noi Beach', icon: 'sunny', type: 'activity', tags: ['beach','relax'] },
        { activity: 'Old Phuket Town (Thalang Rd.)', icon: 'map', type: 'activity', tags: ['culture','architecture'] },
        { activity: 'Patong Nightlife Walk', icon: 'moon', type: 'activity', tags: ['nightlife'] },
        { activity: 'Laem Phromthep Sunset', icon: 'partly-sunny', type: 'activity', tags: ['views','sunset'] },
      ],
      'Koh Samui': [
        { activity: "Fisherman’s Village (Bophut)", icon: 'map', type: 'activity', tags: ['local','shopping'] },
        { activity: 'Big Buddha Temple (Wat Phra Yai)', icon: 'leaf', type: 'activity', tags: ['culture','temple'] },
        { activity: 'Ang Thong Marine Park Boat Tour', icon: 'boat', type: 'activity', tags: ['nature','boat','snorkeling'] },
        { activity: 'Lamai Viewpoint & Overlap Stone', icon: 'walk', type: 'activity', tags: ['views','hike'] },
      ],
      Ayutthaya: [
        { activity: 'Ayutthaya Historical Park Temple Circuit', icon: 'library', type: 'activity', tags: ['culture','temple','history'] },
        { activity: 'Chao Phrom Market Local Food', icon: 'restaurant', type: 'food', tags: ['food','local'] },
      ],
      Pattaya: [
        { activity: 'Sanctuary of Truth', icon: 'library', type: 'activity', tags: ['culture','architecture'] },
        { activity: 'Coral Island Speedboat Trip', icon: 'boat', type: 'activity', tags: ['beach','snorkeling','boat'] },
        { activity: 'Walking Street Nightlife', icon: 'moon', type: 'activity', tags: ['nightlife'] },
        { activity: 'Nong Nooch Tropical Garden', icon: 'leaf', type: 'activity', tags: ['nature','garden'] },
      ],
    };

    // Lookup by exact city name (pois keys are exact like 'Bangkok', 'Phuket', 'Pattaya')
    const selected = (pois[cityKey] || []).slice();
    const normalizedInterests = (interests || []).map(s => s.toLowerCase());
    selected.sort((a, b) => {
      const aScore = (a.tags || []).filter(t => normalizedInterests.includes(t)).length;
      const bScore = (b.tags || []).filter(t => normalizedInterests.includes(t)).length;
      if (aScore !== bScore) return bScore - aScore;
      return 0;
    });

    const acts: any[] = [];
    // Arrival & check-in (always Day 1)
    acts.push({ id: `act-${cityKey}-arrive`, title: labels.arrival(cityKey), duration: language === 'tr' ? '1. Gün' : 'Day 1', icon: 'airplane', type: 'transport' });
    
    // Spread POIs across multiple days
    const maxPerDay = 3;
    const totalTarget = Math.min(selected.length, Math.max(2, days * maxPerDay));
    const chosen = selected.slice(0, totalTarget);
    const spread = this.allocateItemsAcrossDays(chosen.length, days);
    let k = 0;
    for (let d = 0; d < days; d++) {
      const n = spread[d] || 0;
      for (let c = 0; c < n; c++) {
        const poi = chosen[k++];
        if (!poi) break;
        acts.push({
          id: `act-${cityKey}-${d + 1}-${c + 1}`,
          title: poi.activity,
          duration: language === 'tr' ? `${d + 1}. Gün` : `Day ${d + 1}`,
          icon: poi.icon,
          type: poi.type,
        });
      }
    }
    return acts;
  }

  private activityLabels(language: string) {
    if (language === 'tr') {
      return {
        arrival: (city: string) => `${city}'e Varış & Otele Yerleşme`,
        explore: (city: string) => `${city} Şehir Keşfi`,
        food: (city: string) => `${city} Sokak Lezzetleri`,
      };
    }
    return {
      arrival: (city: string) => `Arrival to ${city} & Hotel Check-in`,
      explore: (city: string) => `${city} City Exploration`,
      food: (city: string) => `${city} Street Food`,
    };
  }

  private async getCountryHeroImage(country: string): Promise<string> {
    console.log('🏞️ === GET COUNTRY HERO IMAGE CALLED ===');
    console.log('🌍 Country requested:', country);
    try {
      // First check if we have the image in DB
      const query = `
        query GetCountryImage($country: String!) {
          getCountryImage(country: $country)
        }
      `;

      try {
        const response = await axios.post(`${this.backendUrl}/graphql`, {
          query,
          variables: { country: country.toLowerCase() }
        });

        if (response.data?.data?.getCountryImage) {
          console.log(`✅ Using cached country image for ${country}`);
          return response.data.data.getCountryImage;
        }
      } catch (error) {
        console.log(`📥 No cached image found for ${country}, fetching from Unsplash...`);
      }

      // If not in DB, fetch from Unsplash
      const imageData = await this.unsplashService.getCountryImage(country);
      if (!imageData) {
        return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200';
      }

      // Save to DB for future use
      try {
        const mutation = `
          mutation SaveCountryImage($country: String!, $imageUrl: String!, $photographer: String, $photoSource: String) {
            saveCountryImage(country: $country, imageUrl: $imageUrl, photographer: $photographer, photoSource: $photoSource)
          }
        `;

        const saveResponse = await axios.post(`${this.backendUrl}/graphql`, {
          query: mutation,
          variables: {
            country: country.toLowerCase(),
            imageUrl: imageData.url,
            photographer: imageData.photographer,
            photoSource: imageData.source
          }
        });

        if (saveResponse.data?.errors) {
          console.error(`⚠️ GraphQL errors saving country image:`, JSON.stringify(saveResponse.data.errors, null, 2));
        } else {
          console.log(`💾 Saved country image for ${country} to database`);
        }
      } catch (saveError: any) {
        console.error(`⚠️ Failed to save country image to DB:`, saveError?.response?.data || saveError?.message || saveError);
      }

      return imageData.url;
    } catch (error) {
      console.error('Error getting country hero image:', error);
      return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200';
    }
  }

  private generateId(): string {
    return `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatDate(dateString: string, language: string): string {
    const date = new Date(dateString);
    const monthNames = {
      tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
      fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
      it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
    };
    const months = monthNames[language as keyof typeof monthNames] || monthNames.en;
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  private formatDateRange(start: Date, end: Date, language: string): string {
    const monthNames = {
      tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
      fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
      it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
    } as const;
    const months = monthNames[language as keyof typeof monthNames] || monthNames.en;
    // Same day -> single date (avoid 3-3 style)
    if (start.getTime() === end.getTime()) {
      return `${start.getDate()} ${months[start.getMonth()]}`;
    }
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${months[start.getMonth()]}`;
    }
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
  }

  // (Optional direct GPT call wrapper)
  async generateWithGPT(request: TripGenerationRequest) {
    try {
      const gptResponse = await this.callGPT(request);
      const parsedPlan = JSON.parse(gptResponse) as TripPlan;
      parsedPlan.generatedAt = new Date().toISOString();
      return { success: true, data: parsedPlan, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('❌ GPT Generation Error:', error);
      return this.generateTripPlan(request);
    }
  }
}
