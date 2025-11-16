import { Service } from 'typedi';
import { WelcomeSlide } from '../types/WelcomeSlide';

@Service()
export class WelcomeService {
  getSlides(language: string = 'tr'): WelcomeSlide[] {
    // NOTE: Hard-coded copy; can be localized by `language` later
    const slides: WelcomeSlide[] = [
      {
        id: 'plan',
        title: 'Hayalinizdeki Tatil, Mükemmel Plan.',
        description:
          'Destinasyonlardan aktivitelere kadar ilgi alanlarınıza göre size özel seyahat rotalarını kolayca oluşturun.',
        imageUrl: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1200&auto=format&fit=crop',
        primaryActionLabel: 'Planımı Oluştur',
        secondaryActionLabel: 'İleri',
        order: 1,
      },
      {
        id: 'camera',
        title: 'Kameranla Keşfet',
        description:
          'Kameranı etrafındaki tarihi yerlere, restoranlara veya müzelere doğrult. Hakkında bilgi al, yorumları oku ve favorilerine ekle.',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
        primaryActionLabel: 'Devam Et',
        secondaryActionLabel: 'Atla',
        order: 2,
      },
      {
        id: 'start',
        title: 'Hayalindeki Tatil Sadece Bir Adım Uzağında',
        description:
          'Hem detaylı seyahat planları yapın hem de spontane yeni yerler keşfedin, hepsi tek bir yerde.',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop',
        primaryActionLabel: 'Hadi Başlayalım!',
        secondaryActionLabel: undefined,
        order: 3,
      },
    ];

    // Future: per-language mapping
    return slides.sort((a, b) => a.order - b.order);
  }
}
