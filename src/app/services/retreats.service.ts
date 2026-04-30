import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const ARIETA_BIO = 'Creator of the RESET Method™ (NeuroYoga-Based)\n\nE-RYT 500 • Founder of A-WELL Yoga\nWith over 7,000 teaching hours and a background in clinical psychology and neuroscience\n\nArieta teaches yoga as a path of honest self-inquiry.\nHer work begins with the breath—allowing the nervous system to settle so movement arises from awareness, not performance.\n\nBlending science, embodied practice, and lived experience, she creates spaces that feel both grounded and deeply transformative.\n\nShe believes yoga begins the moment we are willing to meet ourselves with truth.\nHer mission is simple: to help people understand why they practice—so yoga becomes a way of living.';

@Injectable({
  providedIn: 'root'
})
export class RetreatsService {
  private retreatsData = [
    {
      id: 'rugova-2026',
      title: 'RESET™ RETREAT',
      subtitle: 'A 3-Day Nervous System Reset',
      location: 'Shkrel, Rugova Valley, Kosovo',
      dates: 'June 19-21, 2026',
      startDateIso: '',
      endDateIso: '',
      duration: '3 days / 2 nights',
      teachers: ['Arieta Berisha Kirk', 'Melita Kabashi'],
      price: {
        shared: '€480',
        private: '€550',
        deposit: 'Inquire to reserve'
      },
      earlyBird: '2 nights / 3 days, all inclusive excluding alcohol. Limited spots to keep the experience intimate.',
      introTitle: 'This is not a yoga retreat. This is a reset of your nervous system.',
      introLead: 'A return to the part of you that exists underneath the noise, the pressure, and the constant doing.',
      description: 'Over three days, we move through a carefully designed arc that mirrors how real change happens in the body. You do not just relax. You release, regulate, rebuild, and return differently. Through NeuroYoga™, a method blending neuroscience, breathwork, and embodied practice, you learn how to work with your system instead of against it. No performance. No pressure to be good at yoga. Just real, applicable tools that shift how you feel in your body.',
      experienceTitle: 'The Experience',
      experienceDescription: 'Set between the majestic Albanian Alps and Dinaric Alps chains, this retreat is designed to hold you physically, mentally, and emotionally. You will move, breathe, reset, reflect, and reconnect. Not to escape your life, but to return to it with clarity, steadiness, and a different internal state.',
      highlights: [
        'Release -> regulate -> rebuild -> return differently',
        'NeuroYoga™ sessions rooted in breath, neuroscience, and embodied practice',
        'Tools for regulation that work in real life, not just on retreat',
        'No performance, no expectation, no pressure to do yoga a certain way',
        'A slower, deeper experience designed for clarity, steadiness, and lasting change'
      ],
      journey: [
        {
          day: 'Friday - Root',
          title: 'Letting go. Grounding. Arriving.',
          description: 'We begin by slowing everything down and returning awareness to the body, where regulation actually happens.',
          practices: [
            'Nervous system down-regulation',
            'Breathwork for anxiety release',
            'Slow, intentional movement',
            'Evening integration'
          ],
          theme: 'You cannot build on a system that is still in survival mode.'
        },
        {
          day: 'Saturday - Rise & Radiate',
          title: 'Growth. Expansion. Expression.',
          description: 'Once the body feels safe, it opens. This is where we begin to build capacity physically and mentally.',
          practices: [
            'Structured NeuroYoga™ method',
            'Breath-led activation practices',
            'Somatic + intuitive movement',
            'Strength, balance, and resilience work',
            'Radiate Circle for reflection, integration, and connection'
          ],
          theme: 'Expansion without overwhelm. Strength without tension.'
        },
        {
          day: 'Sunday - Return',
          title: 'Integration. Coming back differently.',
          description: 'This is where the shift locks in through stillness, restoration, and practical tools to carry home.',
          practices: [
            'Gentle, restorative practice',
            'Breath + stillness work',
            'Integration tools to take home',
            'Closing ritual'
          ],
          theme: 'You do not need a new life. You need a new relationship with your body.'
        }
      ],
      whoItsFor: [
        'You feel overwhelmed, anxious, or constantly on',
        'You have tried to relax, but your body does not follow',
        'You want tools that actually work in real life',
        'You are ready to understand your nervous system instead of fight it'
      ],
      whatYouLeaveWith: [
        'Practical tools to regulate your state anytime',
        'A deeper understanding of your body and nervous system',
        'A calmer, more stable baseline',
        'A different relationship with stress',
        'The NeuroYoga™ 4-Week Guided Journal to support integration beyond the retreat',
        'A circle of like-minded women rooted in shared experience and genuine connection',
        'Ongoing access to support and continued guidance from Arieta and Melita'
      ],
      detailedExperience: [
        {
          day: 'Friday - Root',
          items: [
            'Arrival and check-in',
            'Opening space + intention setting',
            'The NeuroYoga™ Method ROOT session with breathwork, slow movement, and sensory awareness',
            'Evening mindful dining ritual',
            'Guided wind-down with breath and stillness',
            'Focus: shifting out of survival mode into safety'
          ]
        },
        {
          day: 'Saturday - Rise & Radiate',
          items: [
            'Morning RISE activation session to build strength, resilience, and stability',
            'Breakfast',
            'Free time, SPA, and integration',
            'Guided nature immersion (Shinrin-yoku) or silent meditation',
            'Afternoon integration flow balancing effort and ease',
            'Mindful dining ritual',
            'Radiate Circle with reflection, nervous system education, and connection',
            'Optional salt room meditation for deep rest + reset',
            'Focus: expansion without overwhelm, expression without pressure'
          ]
        },
        {
          day: 'Sunday - Return',
          items: [
            'The NeuroYoga™ Method RETURN session with gentle restorative integration',
            'Breakfast',
            'Closing integration + reflection',
            'Departure',
            'Focus: leaving grounded, clear, and resourced, not just relaxed'
          ]
        }
      ],
      pricingCards: [
        {
          label: 'Single Occupancy',
          price: '€550',
          usdPrice: '$625 USD',
          amountCents: 55000,
          currency: 'eur',
          details: [
            'Private room with king-size bed',
            'Front-facing with majestic mountain views'
          ],
          videoLabel: 'View single room video',
          videoUrl: '/assets/standard.mov'
        },
        {
          label: 'Shared Occupancy',
          price: '€480',
          usdPrice: '$545 USD',
          amountCents: 48000,
          currency: 'eur',
          details: [
            'Twin room with two single beds',
            'Back-facing with peaceful forest and tree views'
          ],
          videoLabel: 'View shared room video',
          videoUrl: '/assets/twin.mov'
        }
      ],
      pricingIncludes: [
        'Accommodation',
        'Breakfast & dinner',
        'Spa access',
        'Full NeuroYoga™ method'
      ],
      cardImage: '/assets/shkrel.png',
      image: '/assets/rugova-photos/mountains.jpeg',
      featured: true,
      status: {
        year2026: 'UPCOMING'
      },
      venueDescription: 'Grand Hotel Belushi is our home for the weekend, nestled in Shkrel in the heart of Rugova Valley. Surrounded by mountain air, forest stillness, and expansive alpine views, the setting supports exactly what this retreat is designed to do: help the body exhale, soften, and reset.',
      venueImages: [
        '/assets/rugova-photos/hotel_drone_front.JPG',
        '/assets/rugova-photos/balcony_with_landscape_view.jpeg',
        '/assets/rugova-photos/pool2.JPG',
        '/assets/rugova-photos/food_on_table.JPG',
        '/assets/rugova-photos/beautiful_nature_shot.heic',
        '/assets/rugova-photos/balcony_relaxing_vertical.heic'
      ],
      atmosphereVideos: [
        {
          title: 'Rugova stream',
          url: '/assets/rugova-photos/stream_through_rocks_vertical.mov'
        }
      ],
      included: [
        '2 nights / 3 days accommodation',
        'The NeuroYoga™ Method daily immersive guided sessions',
        'Breathwork and nervous system regulation practices',
        'Guided salt room meditation (halotherapy experience)',
        'Guided nature immersion (Shinrin-yoku) and silent meditation',
        'SPA access including sauna, jacuzzi, pool, and relaxation areas',
        'Breakfast',
        'Evening mindful dining experience with shared group dinners',
        'Vegetarian, pescetarian, and gluten-friendly options',
        'Evening integration through the Radiate Circle',
        'Full retreat experience + closing integration',
        'And so much more'
      ],
      notIncluded: [
        'Flights',
        'Travel insurance',
        'Transport to and from the retreat venue',
        'Alcohol',
        'Additional private treatments or personal expenses'
      ],
      hostInfo: {
        hosts: [
          {
            name: 'Arieta Berisha Kirk',
            bio: ARIETA_BIO,
            images: [
              '/assets/rugova-photos/arieta.jpeg'
            ]
          },
          {
            name: 'Melita Kabashi',
            bio: 'MELITA KABASHI – a devoted advocate for human rights and a passionate yoga teacher, Melita has spent years creating positive change in her community. As the founder of DRITH YOGA, a vibrant studio in the heart of Prishtina, Kosovo, she has inspired and empowered hundreds of students to embrace the transformative power of yoga.\n\nBeyond the studio, Melita dedicated years of her life to Save the Children, championing the rights and well-being of children across Kosovo. Her work didn’t stop there—she has played a significant role in bringing yoga into schools, helping students discover mindfulness, balance, and resilience at an early age.\n\nWith a warm and approachable spirit, Melita’s mission is to make yoga and its benefits accessible to all, creating a ripple of growth, healing, and empowerment throughout her community.',
            images: [
              '/assets/rugova-photos/melita_kabashi.JPG'
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
