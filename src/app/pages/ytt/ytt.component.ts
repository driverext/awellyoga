import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

const ARIETA_BIO = 'Arieta Berisha Kirk is an internationally recognized yoga educator, somatic guide, NBHWC-certified coach, and MBSR practitioner with over 6,500 teaching hours. For more than 15 years, she has led yoga teacher trainings, transformational retreats, workshops, and large-scale events for corporations and communities across the globe.\n\nBlending neuroscience, ancient ritual, and embodied wisdom, Arieta creates deeply transformative spaces that feel both sacred and real. Her trauma-informed approach is rooted in nervous system attunement, presence, and soul-level healing—guiding others not just to practice, but to remember who they are.';

@Component({
  selector: 'app-ytt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ytt.component.html',
  styleUrls: ['./ytt.component.css']
})
export class YttComponent {
  programs = [
    {
      id: '200hr',
      title: '200-Hour Teacher Training',
      subtitle: 'Foundational Yoga Teacher Certification',
      description: 'Our comprehensive 200-hour program provides the foundational knowledge and skills to begin your journey as a yoga teacher. This Yoga Alliance certified training covers asana, anatomy, philosophy, teaching methodology, and the business of yoga.',
      features: [
        'Asana techniques and alignment principles',
        'Functional anatomy and physiology',
        'Teaching methodology and practical experience',
        'Yogic philosophy and history',
        'Meditation and pranayama techniques',
        'Ethics and the business of yoga'
      ],
      formats: [
        {
          type: 'Intensive',
          duration: '4 weeks (Monday-Friday, 8am-5pm)',
          dates: 'June 3-28, 2024 | October 7-November 1, 2024',
          price: '$0'
        },
        {
          type: 'Weekend',
          duration: '10 weekends (Friday 6-9pm, Saturday & Sunday 8am-5pm)',
          dates: 'September 13, 2024 - January 26, 2025',
          price: '$0'
        }
      ],
      earlyBird: '$0 discount if registered 3 months before start date',
      paymentPlans: 'Interest-free payment plans available'
    },
    {
      id: '300hr',
      title: '300-Hour Advanced Training',
      subtitle: 'Deepen Your Practice & Teaching',
      description: 'Designed for graduates of 200-hour programs, our advanced 300-hour training provides greater depth and specialization. Complete this program to achieve your 500-hour RYT certification with Yoga Alliance.',
      features: [
        'Advanced asana and sequencing',
        'Therapeutic applications of yoga',
        'Advanced anatomy and biomechanics',
        'Sanskrit and ancient texts',
        'Energy systems and subtle body',
        'Specialized teaching methods for various populations'
      ],
      formats: [
        {
          type: 'Modular',
          duration: '6 modules of 50 hours each (can be taken individually)',
          dates: 'Various dates throughout the year',
          price: '$0 full program | $0 per module'
        }
      ],
      earlyBird: '$0 discount for full program if registered 3 months before start date',
      paymentPlans: 'Interest-free payment plans available'
    },
    {
      id: 'ce',
      title: 'Continuing Education',
      subtitle: 'Specialized Workshops for Teachers',
      description: 'Expand your knowledge and skills with our specialized continuing education workshops. Each workshop provides Yoga Alliance continuing education credits (CEUs) to maintain your certification.',
      workshops: [
        {
          name: 'Trauma-Informed Yoga',
          hours: 20,
          dates: 'May 18-19, 2024',
          price: '$0'
        },
        {
          name: 'Yoga for Seniors',
          hours: 15,
          dates: 'July 13-14, 2024',
          price: '$0'
        },
        {
          name: 'Adjustments & Assists',
          hours: 25,
          dates: 'August 24-26, 2024',
          price: '$0'
        },
        {
          name: 'Yoga for Athletes',
          hours: 20,
          dates: 'September 21-22, 2024',
          price: '$0'
        },
        {
          name: 'Advanced Sequencing',
          hours: 15,
          dates: 'November 9-10, 2024',
          price: '$0'
        }
      ]
    }
  ];
  
  faculty = [
    {
      name: 'Arieta Berisha Kirk',
      role: 'Lead Trainer, E-RYT 500',
      specialties: 'Vinyasa Flow, Philosophy, Meditation',
      bio: ARIETA_BIO,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1220&q=80'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Anatomy & Physiology Specialist, RYT 500',
      specialties: 'Anatomy, Therapeutic Applications, Yin Yoga',
      bio: 'Dr. Chen holds a Ph.D in Kinesiology and brings his extensive knowledge of the human body to our training program. His clear, practical approach to anatomy helps teachers understand the mechanics and safety considerations for every pose.',
      image: 'https://images.pexels.com/photos/4057042/pexels-photo-4057042.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Asana & Sequencing Expert, E-RYT 500',
      specialties: 'Advanced Asana, Sequencing, Ashtanga Yoga',
      bio: 'Elena\'s dynamic teaching style and extensive knowledge of alignment principles make her an invaluable asset to our teacher training faculty. She specializes in helping trainees develop their authentic teaching voice and creative sequencing skills.',
      image: 'https://images.pexels.com/photos/6787201/pexels-photo-6787201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      name: 'James Wilson',
      role: 'Philosophy & Meditation Guide, E-RYT 500',
      specialties: 'Philosophy, Sanskrit, Meditation Techniques',
      bio: 'James brings ancient wisdom to modern practice. With his background in Eastern philosophy and ten years of meditation retreats, he guides trainees through the philosophical aspects of yoga and how to incorporate them into contemporary teaching.',
      image: 'https://images.unsplash.com/photo-1552286450-4a669f880062?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80'
    }
  ];
  
  testimonials = [
    {
      quote: "The 200-hour YTT at A - WELL YOGA completely transformed my practice and my life. The comprehensive curriculum, expert faculty, and supportive environment provided the perfect foundation for beginning my teaching journey.",
      author: "Maya S., 200-Hour Graduate",
      year: "2023"
    },
    {
      quote: "The 300-hour advanced program was exactly what I needed to take my teaching to the next level. The modular format allowed me to specialize in areas I'm passionate about while working around my teaching schedule.",
      author: "Thomas R., 500-Hour Graduate",
      year: "2022"
    },
    {
      quote: "As someone who was nervous about teacher training, I found the 200-hour program to be challenging yet incredibly supportive. The faculty met each of us where we were while encouraging growth and exploration.",
      author: "Jamie K., 200-Hour Graduate",
      year: "2023"
    }
  ];
} 