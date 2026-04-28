import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const ARIETA_BIO = 'Arieta Berisha Kirk is an internationally recognized yoga educator, somatic guide, NBHWC-certified coach, and MBSR practitioner with over 6,500 teaching hours. For more than 15 years, she has led yoga teacher trainings, transformational retreats, workshops, and large-scale events for corporations and communities across the globe.\n\nBlending neuroscience, ancient ritual, and embodied wisdom, Arieta creates deeply transformative spaces that feel both sacred and real. Her trauma-informed approach is rooted in nervous system attunement, presence, and soul-level healing—guiding others not just to practice, but to remember who they are.';

@Injectable({
  providedIn: 'root'
})
export class RetreatsService {
  private retreatsData = [
    {
      id: 'rugova-2026',
      title: 'Return to the Wild: Rugova Retreat',
      location: 'Rugova, Kosovo',
      dates: 'September 17-21, 2026',
      duration: '5 days / 4 nights',
      teachers: ['Arieta Berisha Kirk'],
      price: {
        shared: 'Coming soon',
        private: 'Coming soon',
        deposit: 'Coming soon'
      },
      earlyBird: 'Details and early booking information will be announced soon.',
      description: 'Join us in Rugova, Kosovo for a retreat immersed in mountain air, grounding practice, and deep restoration. This upcoming experience is designed for students who want space to reconnect through yoga, nervous system healing, nature, and intentional community.',
      highlights: [
        'Daily yoga, breathwork, and guided nervous system regulation practices',
        'Mountain stillness, hiking, and time in nature',
        'Intentional rest, reflection, and community connection',
        'Locally inspired meals in a peaceful retreat setting',
        'A spacious rhythm of movement, recovery, and soul-level reset'
      ],
      image: '/assets/albania7.jpg',
      featured: true,
      status: {
        year2026: 'UPCOMING'
      },
      venueDescription: 'Set against the dramatic mountain landscape of Rugova, this retreat will offer a slower, more spacious experience rooted in nature, rest, and embodied practice. Expect crisp air, grounded simplicity, and the kind of setting that makes it easier to actually exhale.',
      venueImages: [
        '/assets/albania7.jpg',
        '/assets/albania6.jpg',
        '/assets/albania3.jpg',
        '/assets/albania1.jpg'
      ],
      included: [
        '4 nights accommodation',
        'Daily yoga and breathwork sessions',
        'Group reflection and integration practices',
        'Meals during the retreat',
        'Curated local excursions and nature experiences'
      ],
      notIncluded: [
        'Flights',
        'Travel insurance',
        'Transport outside retreat itinerary',
        'Additional private treatments or excursions'
      ],
      hostInfo: {
        hosts: [
          {
            name: 'Arieta Berisha Kirk',
            bio: ARIETA_BIO,
            images: [
              '/assets/arieta12.jpg',
              '/assets/arieta10.jpg',
              '/assets/arieta11.jpg'
            ]
          }
        ]
      },
      isPast: false
    },
    {
      id: 'puglia-2025',
      title: 'Soul Reset: Puglia Edition',
      location: 'Puglia, Italy',
      dates: 'July 12-15, 2025',
      duration: '4 days / 3 nights',
      teachers: ['Arieta Berisha Kirk'],
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
      featured: false,
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
              '/assets/arieta11.jpg'
            ]
          }
        ]
      },
      isPast: true
    },
    {
      id: 'albania-2025',
      title: 'Return to Root',
      location: 'Koman Lake, Albania',
      dates: 'June 27-29, 2025',
      duration: '3 days / 2 nights',
      teachers: ['Arieta Berisha Kirk'],
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
      featured: false,
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
          }
        ]
      },
      isPast: true
    },
    {
      id: 'greece-2026',
      title: 'YOGA & WELLNESS RETREAT',
      location: 'Amorgos, Greece',
      dates: '2025 SOLD OUT -  Book for July 2026',
      duration: '6 days / 5 nights',
      teachers: ['Arieta Berisha Kirk'],
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
      featured: false,
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
          }
        ]
      },
      isPast: true
    }
  ];

  private retreatsSubject = new BehaviorSubject<any[]>(this.retreatsData);
  retreats$ = this.retreatsSubject.asObservable();

  constructor() {}

  getRetreatById(id: string) {
    return this.retreatsData.find(retreat => retreat.id === id);
  }

  getFeaturedRetreats() {
    return this.retreatsData.filter(retreat => retreat.featured && !retreat.isPast);
  }

  getAllRetreats() {
    return this.retreatsData;
  }

  getUpcomingRetreats() {
    return this.retreatsData.filter(retreat => !retreat.isPast);
  }

  getPastRetreats() {
    return this.retreatsData.filter(retreat => retreat.isPast);
  }
}
