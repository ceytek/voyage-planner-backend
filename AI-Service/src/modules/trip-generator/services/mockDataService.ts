import { TripPlan } from '../types';

export const mockTripPlan: TripPlan = {
  id: 'thailand-trip-001',
  title: 'Tayland Gezi Planı',
  cities: ['Phuket', 'Pattaya', 'Bangkok'],
  startDate: '10 Haziran',
  endDate: '20 Haziran',
  duration: 10,
  heroImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2139&q=80',
  generatedAt: new Date().toISOString(),
  itinerary: [
    {
      dayNumber: 1,
      city: 'Phuket',
      dateRange: '10-12 Haziran',
      activities: [
        {
          id: 'act-001',
          title: "Phuket'e Varış & Otele Yerleşme",
          duration: '1. Gün',
          icon: 'airplane',
          type: 'transport',
          description: 'Havaalanından otel transferi ve check-in işlemleri'
        },
        {
          id: 'act-002',
          title: 'Patong ve Karon Plajları',
          duration: '1. Gün',
          icon: 'sunny',
          type: 'activity',
          description: 'Ünlü plajlarda dinlenme ve yüzme'
        },
        {
          id: 'act-003',
          title: 'Phi Phi Adaları Turu',
          duration: '2. Gün',
          icon: 'boat',
          type: 'activity',
          description: 'Tekne turu ile kristal berraklığında sular'
        },
        {
          id: 'act-004',
          title: 'Big Buddha Ziyareti',
          duration: '3. Gün',
          icon: 'library',
          type: 'activity',
          description: '45 metre yüksekliğindeki dev Buda heykeli'
        }
      ]
    },
    {
      dayNumber: 4,
      city: 'Pattaya',
      dateRange: '',
      activities: [],
      isRoute: true,
      routeInfo: {
        from: 'Phuket',
        to: 'Pattaya',
        transportType: 'flight',
        duration: '1.5 saat',
        cost: '~150 USD'
      }
    },
    {
      dayNumber: 5,
      city: 'Pattaya',
      dateRange: '13-16 Haziran',
      activities: [
        {
          id: 'act-005',
          title: 'Walking Street Gece Hayatı',
          duration: '1. Gün',
          icon: 'moon',
          type: 'activity',
          description: 'Ünlü gece hayatı bölgesi keşfi'
        },
        {
          id: 'act-006',
          title: 'Coral Island Tekne Turu',
          duration: '2. Gün',
          icon: 'boat',
          type: 'activity',
          description: 'Mercan adası ve su sporları'
        },
        {
          id: 'act-007',
          title: 'Nong Nooch Bahçesi',
          duration: '2. Gün',
          icon: 'leaf',
          type: 'activity',
          description: 'Tropikal botanik bahçesi ve kültür gösterileri'
        },
        {
          id: 'act-008',
          title: 'Floating Market Ziyareti',
          duration: '3. Gün',
          icon: 'storefront',
          type: 'activity',
          description: 'Geleneksel yüzen pazar deneyimi'
        }
      ]
    },
    {
      dayNumber: 8,
      city: 'Bangkok',
      dateRange: '',
      activities: [],
      isRoute: true,
      routeInfo: {
        from: 'Pattaya',
        to: 'Bangkok',
        transportType: 'bus',
        duration: '2 saat',
        cost: '~10 USD'
      }
    },
    {
      dayNumber: 9,
      city: 'Bangkok',
      dateRange: '17-20 Haziran',
      activities: [
        {
          id: 'act-009',
          title: 'Grand Palace Ziyareti',
          duration: '1. Gün',
          icon: 'business',
          type: 'activity',
          description: 'Tayland krallarının eski sarayı'
        },
        {
          id: 'act-010',
          title: 'Wat Pho Tapınağı',
          duration: '1. Gün',
          icon: 'library',
          type: 'activity',
          description: 'Ünlü yatan Buda heykeli ve geleneksel masaj'
        },
        {
          id: 'act-011',
          title: 'Chatuchak Weekend Market',
          duration: '2. Gün',
          icon: 'storefront',
          type: 'activity',
          description: 'Dünyanın en büyük hafta sonu pazarı'
        },
        {
          id: 'act-012',
          title: 'Chao Phraya Nehir Turu',
          duration: '2. Gün',
          icon: 'boat',
          type: 'activity',
          description: 'Şehri nehir üzerinden keşfetme'
        },
        {
          id: 'act-013',
          title: 'Khao San Road Keşfi',
          duration: '3. Gün',
          icon: 'restaurant',
          type: 'food',
          description: 'Backpacker cenneti ve sokak lezzetleri'
        },
        {
          id: 'act-014',
          title: 'Dönüş Uçuşu',
          duration: '4. Gün',
          icon: 'airplane',
          type: 'transport',
          description: 'Havaalanına transfer ve uçuş'
        }
      ]
    }
  ]
};
