import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const ARIETA_BIO = 'Arieta Berisha Kirk is an internationally recognized yoga educator, somatic guide, NBHWC-certified coach, and MBSR practitioner with over 6,500 teaching hours. For more than 15 years, she has led yoga teacher trainings, transformational retreats, workshops, and large-scale events for corporations and communities across the globe.\n\nBlending neuroscience, ancient ritual, and embodied wisdom, Arieta creates deeply transformative spaces that feel both sacred and real. Her trauma-informed approach is rooted in nervous system attunement, presence, and soul-level healing—guiding others not just to practice, but to remember who they are.';

const AURORA_BIO = 'Aurora Kopliku began her journey with Yoga in 2021, motivated by a personal experience that led her to self-taught practice. The healing power of daily practice awakened in her a deep passion and sincere love for this ancient discipline, which pushed her in November of that year to enroll in the "Studio Yoga Brescia" Academy in Italy.\n\nIn 2023, she graduated as a Yoga Teacher, basic level RYT 250h. In 2022, she furthered her training with a Master\'s in Vinyasa Yoga and Myofascial Movement during a retreat held in Tuscany, Italy. Since 2024, she has been offering private lessons in her studio in Shkodra, in a warm and dedicated space for deep inner exploration.\n\nFor her, yoga is not just a physical practice, but a journey toward the self, an act of remembrance, a quiet path that illuminates the hidden light within each of us. Not to change us, but to bring us back to where we\'ve always been… close to ourselves, in love, in peace with our being.';

@Injectable({
  providedIn: 'root'
})
export class RetreatsService {
  private retreatsData = [
    {
      id: 'puglia-2025',
      title: 'Soul Reset: Puglia Edition',
      location: 'Puglia, Italy',
      dates: 'July 12-15, 2025',
      duration: '4 days / 3 nights',
      teachers: ['Arieta Berisha Kirk', 'Aurora Kopliku'],
      price: {
        shared: '€1000/per person',
        private: '€1500/per person',
        deposit: '€0'
      },
      earlyBird: 'Come with a friend & save! Shared room with double booking: €800/each',
      description: 'Join us for an intimate, 4-day retreat in Puglia, Italy. This retreat includes a unique blend of yoga, ritual, rest, and soul-awakening experiences. Not performative, but personal - no pressure to "keep up" or "look the part." This is a retreat for real people in real healing, not curated perfection.',
      highlights: [
        'Hatha, Yin, Kundalini and breath-led sunrise sessions under the golden Puglian sky',
        'Somatic nervous system resets through meditation and trauma-informed practices',
        'Sound Bath Session and journaling circles',
        'Creative workshops: pottery, pasta making, and olive oil tasting',
        'Content creation sessions with a professional photographer',
        'Farm-to-table meals with Mediterranean simplicity',
        'Day trips to charming local towns',
        'Airport transfers from Brindisi or Bari Airports'
      ],
      image: '/assets/mainpuglia.png',
      featured: true,
      venueDescription: 'We\'ll stay in a charming, historic & eco-friendly farmhouse in Puglia, Italy. Nestled into a gentle hill surrounded by 20 hectares of exclusive private land, the property is walking distance from the Ionian Sea.',
      venueImages: [
        '/assets/puglia7.jpg',
        '/assets/puglia8.jpg',
        '/assets/puglia9.jpg',
        '/assets/puglia10.jpg',
        '/assets/puglia11.jpg',
         '/assets/pugliak.jpg'
      ],
      included: [
        '3 nights at Masseria Specula historical farmhouse',
        'Breath work workshops',
        'One-on-one strategy sessions',
        'Content Creation',
        'Yoga practices (Hatha, Yin, and Beach yoga)',
        'Kundalini Session',
        'Breakfast, Lunch & Dinner (vegetarian meals, with vegan options available)',
        'Airport transfers (July 12th & July 15th, from & to Brindisi or Bari Airports)',
        'Pasta making',
        'Olive oil tasting',
        'Ceramic Pottery workshop',
        'Day trips to explore charming, historic towns',
        'Local hikes, visit to a salt lake with flamingos'
      ],
      notIncluded: [
        'Flights',
        'Airport transfers outside of times/location mentioned above',
        'Alcohol & extra food outside of venue meals'
      ],
      hostInfo: {
        hosts: [
          {
            name: 'Arieta Berisha Kirk',
            bio: ARIETA_BIO,
            images: [
              '/assets/arieta12.jpg',
              '/assets/arieta10.jpg',
              '/assets/arieta11.jpg',
            ]
          },
          {
            name: 'Aurora Kopliku',
            bio: AURORA_BIO,
            images: [
              '/assets/aurora1.jpg',
              '/assets/aurora2.jpg',
              '/assets/aurora3.jpg'
            ]
          }
        ]
      }
    },
    {
      id: 'albania-2025',
      title: 'Return to Root',
      location: 'Koman Lake, Albania',
      dates: 'June 27-29, 2025',
      duration: '3 days / 2 nights',
      teachers: ['Arieta Berisha Kirk', 'Aurora Kopliku'],
      price: {
        shared: '€180',
        private: 'N/A',
        deposit: '€0'
      },
      description: 'Join me for an intimate, 3-day retreat in Koman Lake, Albania. This retreat includes a unique blend of yoga, ritual, nature, and adventure.',
      highlights: [
        'Breath-led yoga practices inspired by the elements—earth, water, sky',
        'Morning meditations by the lake to restore clarity and nervous system balance',
        'Evening candlelit yin + reflection under the stars',
        'Boat journey through Koman\'s sacred canyons, where time stands still and silence heals',
        'Traditional Albanian meals, made with love and seasonal ingredients',
        'Nature-immersed rituals and ancestral connection practices',
        'Story circles, journal prompts, and soul inquiry sessions',
        'Space to rest deeply—on hammocks, on sun-warmed stones, by the water\'s edge',
        'Content Creation'
      ],
      image: '/assets/mainalbania.png',
      featured: true,
      venueDescription: 'We\'ll stay in a charming villa nestled along the untouched shores of Koman Lake. Villa Frenceze is more than just a place to sleep—it\'s a sacred pause from the noise of the world.\n\nSurrounded by majestic peaks, emerald waters, and a silence so pure it echoes, this lakeside haven offers the perfect setting for restoration, reflection, and deep soul remembering.\n\nBuilt with traditional Albanian charm and natural, grounding materials, every corner of the villa invites you to slow down, breathe deeper, and soften into presence.',
      venueImages: [
        '/assets/albania1.jpg',
        '/assets/albania2.jpg',
        '/assets/albania3.jpg',
        '/assets/albania4.jpg',
        '/assets/albania5.png',
        '/assets/albania6.jpg'
      ],
      included: [
        '3 nights at Villa Franceze A Hidden Sanctuary Between Mountains and Mystic Waters',
        'Breath work workshops',
        'One-on-one strategy sessions',
        'Content Creation',
        'Yoga practices (Hatha, Yin, and Beach yoga)',
        'Kundalini Session',
        'Breakfast, Lunch & Dinner (vegetarian meals, with vegan options available)',
        'Local hikes, kayaking, boat tours'
      ],
      notIncluded: [
        'Flights',
        'Airport transfers outside of times/location mentioned above',
        'Alcohol & extra food outside of venue meals'
      ],
      hostInfo: {
        hosts: [
          {
            name: 'Arieta Berisha Kirk',
            bio: ARIETA_BIO,
            images: [
              '/assets/arieta13.jpg',
              '/assets/arieta10.jpg',
              '/assets/arieta14.jpg'
            ]
          },
          {
            name: 'Aurora Kopliku',
            bio: AURORA_BIO,
            images: [
              '/assets/aurora1.jpg',
              '/assets/aurora2.jpg',
              '/assets/aurora3.jpg'
            ]
          }
        ]
      }
    },
    {
      id: 'greece-2026',
      title: 'YOGA & WELLNESS RETREAT',
      location: 'Amorgos, Greece',
      dates: '2025 SOLD OUT -  Book for July 2026',
      duration: '6 days / 5 nights',
      teachers: ['Arieta Berisha Kirk', 'Aurora Kopliku'],
      price: {
        shared: 'SOLD OUT',
        private: '€3200',
        deposit: '€0'
      },
      earlyBird: 'Come with a friend & you both SAVE!\nInstallment plans are available at time of booking',
      description: 'Join me for a transformative retreat in the mystical island of Amorgos, Greece. 2025 is FULLY BOOKED - Now booking for 2026!',
      highlights: [
        'Daily yoga and meditation practices',
        'Sacred rituals and ceremonies',
        'Traditional Greek experiences',
        'Healing workshops and sessions',
        'Deep rest and restoration',
        'Connection with nature and self'
      ],
      image: '/assets/maingreece.png',
      featured: true,
      status: {
        year2025: 'FULLY BOOKED',
        year2026: 'BOOKING NOW'
      },
      venueDescription: 'Experience the magic of Amorgos, a hidden gem in the Greek islands. Our carefully selected venue offers the perfect blend of traditional Cycladic architecture and modern comfort, creating an ideal setting for deep transformation and renewal.',
      venueImages: [
        '/assets/greece1.png',
        '/assets/greece2.png',
        '/assets/greece3.png',
        '/assets/greece4.png',
        '/assets/greece6.png'
      ],
      included: [
        '6 nights luxury accommodation',
        'Daily yoga and meditation sessions',
        'All meals (organic, locally-sourced)',
        'Sacred ceremonies and rituals',
        'Group workshops and healing sessions',
        'Traditional Greek experiences',
        'Airport transfers',
        'Welcome package'
      ],
      notIncluded: [
        'Flights',
        'Travel insurance',
        'Additional activities or treatments',
        'Personal expenses'
      ],
      hostInfo: {
        hosts: [
          {
            name: 'Arieta Berisha Kirk',
            bio: ARIETA_BIO,
            images: [
              '/assets/arieta4.jpg',
              '/assets/arieta5.png',
              '/assets/arieta9.jpg',
              '/assets/arieta7.jpg'
            ]
          },
          {
            name: 'Aurora Kopliku',
            bio: AURORA_BIO,
            images: [
              '/assets/aurora1.jpg',
              '/assets/aurora2.jpg',
              '/assets/aurora3.jpg'
            ]
          }
        ]
      }
    }
  ];

  private retreatsSubject = new BehaviorSubject<any[]>(this.retreatsData);
  retreats$ = this.retreatsSubject.asObservable();

  constructor() {}

  getRetreatById(id: string) {
    return this.retreatsData.find(retreat => retreat.id === id);
  }

  getFeaturedRetreats() {
    return this.retreatsData.filter(retreat => retreat.featured);
  }

  getAllRetreats() {
    return this.retreatsData;
  }
}
