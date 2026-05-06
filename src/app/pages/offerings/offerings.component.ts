import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { SITE_URL } from '../../config/site-constants';

interface OfferingClass {
  id: string;
  name: string;
  level: string;
  description: string;
  benefits: string[];
  image: string;
  programMeta?: string;
  ctaLabel?: string;
  ctaRoute?: string;
  ctaFragment?: string;
}

@Component({
  selector: 'app-offerings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './offerings.component.html',
  styleUrls: ['./offerings.component.css']
})
export class OfferingsComponent {
  readonly scheduleRoute = '/schedule';

  constructor(private seo: SeoService) {
    this.seo.updatePage({
      title: 'Yoga Classes and Offerings',
      description:
        'Explore A-WELL Yoga class styles, therapeutic formats, and movement practices designed for real-life nervous system support.',
      path: '/offerings'
    });

    this.seo.updateJsonLd([
      {
        id: 'offerings-breadcrumbs',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Classes', item: `${SITE_URL}/offerings` }
          ]
        }
      },
      {
        id: 'offerings-item-list',
        data: {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: this.classes.map((classItem, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/offerings#${classItem.id}`,
            name: classItem.name,
            description: classItem.description
          }))
        }
      }
    ]);
  }

  classes: OfferingClass[] = [
    {
      id: 'vinyasa',
      name: 'NeuroYoga™ Therapeutic Yoga',
      level: 'All Levels',
      description:
        'A guided, therapeutic nervous system-based practice designed to help you regulate your body through breath, intentional movement, and awareness. This offering now runs as a 4-week program with one 90-minute session each week, giving the body time to settle, integrate, and build steadiness over time.',
      benefits: [
        'Regulates the nervous system and reduces stress',
        'Decreases anxiety and emotional overwhelm',
        'Enhances mind-body awareness and presence',
        'Builds resilience and emotional stability'
      ],
      image: '/assets/classes/neuroyoga-therapeutic-yoga.jpg',
      programMeta: '$280 • 4 weeks • 4 sessions • 90 minutes each',
      ctaLabel: 'Apply Now',
      ctaRoute: '/neuroyoga-program'
    },
    {
      id: 'gentle',
      name: 'Gentle Vinyasa Flow',
      level: 'Beginner Friendly',
      description: 'A slow-paced, nurturing practice focusing on basic poses, proper alignment, and breathwork. Perfect for beginners or those seeking a restorative experience.',
      benefits: [
        'Reduces tension and stress',
        'Improves flexibility and mobility',
        'Builds foundational strength',
        'Enhances body awareness'
      ],
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      ctaLabel: 'Book a Class',
      ctaRoute: '/schedule',
      ctaFragment: 'calendar'
    },
    {
      id: 'yin',
      name: 'Yin Yoga',
      level: 'All Levels',
      description: 'A meditative practice that targets the deep connective tissues of the body. Poses are held for extended periods to improve flexibility and joint mobility.',
      benefits: [
        'Increases flexibility in joints and fascia',
        'Improves circulation to tissues',
        'Reduces stress and anxiety',
        'Balances the nervous system'
      ],
      image: '/assets/classes/yin-yoga.jpg',
      ctaLabel: 'Book a Class',
      ctaRoute: '/schedule',
      ctaFragment: 'calendar'
    },
    {
      id: 'hatha',
      name: 'Hatha Yoga',
      level: 'All Levels',
      description: 'A traditional approach to yoga that balances strength and flexibility. Poses are held longer with focus on alignment and breathing techniques.',
      benefits: [
        'Improves physical balance and stability',
        'Enhances breath control',
        'Reduces stress',
        'Increases bodily awareness'
      ],
      image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      ctaLabel: 'Book a Class',
      ctaRoute: '/schedule',
      ctaFragment: 'calendar'
    },
    {
      id: 'restorative',
      name: 'Restorative Yoga',
      level: 'All Levels',
      description: 'A relaxing practice that uses props to support the body in gentle stretches and comfortable positions. Perfect for stress relief and deep relaxation.',
      benefits: [
        'Deeply relaxes the body and mind',
        'Balances the nervous system',
        'Improves sleep quality',
        'Enhances emotional wellbeing'
      ],
      image: '/assets/classes/restorative-yoga.jpg',
      ctaLabel: 'Book a Class',
      ctaRoute: '/schedule',
      ctaFragment: 'calendar'
    },
    {
      id: 'prenatal',
      name: 'Prenatal Yoga',
      level: 'Specialized',
      description: 'A gentle practice designed specifically for expectant mothers. Focuses on breathing, gentle stretching, and preparing the body for childbirth.',
      benefits: [
        'Reduces pregnancy discomfort',
        'Improves flexibility for labor',
        'Strengthens the pelvic floor',
        'Creates community with other mothers'
      ],
      image: '/assets/classes/prenatal-yoga.jpg',
      ctaLabel: 'Book a Class',
      ctaRoute: '/schedule',
      ctaFragment: 'calendar'
    },
    {
      id: 'kids',
      name: 'Kids Yoga',
      level: 'Kids',
      description: 'A playful, supportive class designed to help children build body awareness, focus, confidence, and calm through age-appropriate movement, breath, and mindfulness.',
      benefits: [
        'Supports focus and emotional regulation',
        'Builds confidence and body awareness',
        'Encourages healthy movement habits',
        'Creates a fun introduction to mindfulness'
      ],
      image: '/assets/classes/kids-yoga.jpg',
      ctaLabel: 'Book a Class',
      ctaRoute: '/schedule',
      ctaFragment: 'calendar'
    }
  ];
}
