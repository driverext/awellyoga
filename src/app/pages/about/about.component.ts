import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CmsInstructor } from '../../services/cms/cms.models';
import { SanityContentService } from '../../services/cms/sanity-content.service';
import { SeoService } from '../../services/seo.service';
import { SITE_URL, STUDIO_CONTACT } from '../../config/site-constants';

const ARIETA_ABOUT_TITLE = 'Founder, A-WELL Yoga Studio & School';
const ARIETA_ABOUT_IMAGE = '/assets/teachers/arieta/arieta-team.jpg';
const ARIETA_ABOUT_BIO = [
  "Creator of NeuroNidra™ and the RESET Method™",
  "Yoga Therapist & Anxiety Coach · E-RYT 500 · Trauma-Informed Yoga",
  "Developer of Neuro-Informed 200hr & 300hr Yoga Teacher Trainings",
  "Rooted in the Sivananda lineage and with more than 15 years and 15,000+ teaching hours, Arieta bridges classical yoga, psychology, neuroscience and embodied practice.",
  "Her work begins with the breath, letting the nervous system settle so that movement, rest and insight arise from awareness, not performance. Today she guides people through anxiety, grief, overthinking and old emotional patterns, working where words alone can't reach: through the body, the breath and the brain. Trained in trauma-informed yoga, she creates spaces where safety comes first and every person stays in choice.",
  "Through NeuroNidra™, her guided deep-rest practice grown from the yoga nidra tradition of her lineage, and the RESET Method™, she creates spaces that feel both grounded and deeply transformative, blending science, embodied practice and lived experience.",
  "She believes yoga begins the moment we are willing to meet ourselves with truth. Her mission is simple: to help people understand why they practice, so yoga becomes a way of living."
];

const MELITA_ABOUT_BIO = [
  'A devoted advocate for human rights and a passionate yoga teacher, Melita has spent years creating positive change in her community. As the founder of DRITH YOGA, a vibrant studio in the heart of Prishtina, Kosovo, she has inspired and empowered hundreds of students to embrace the transformative power of yoga.',
  'Beyond the studio, Melita dedicated years of her life to Save the Children, championing the rights and well-being of children across Kosovo. Her work didn’t stop there—she has played a significant role in bringing yoga into schools, helping students discover mindfulness, balance, and resilience at an early age.',
  'With a warm and approachable spirit, Melita’s mission is to make yoga and its benefits accessible to all, creating a ripple of growth, healing, and empowerment throughout her community.'
];

const SOMMER_ABOUT_BIO = [
  'Sommer Reńee is a guide for those ready to come home to themselves. Blending yoga, breathwork, sound baths, and hypnotherapy, her offerings are more than just classes—they’re immersive healing experiences. What began as a personal journey has evolved into a space where regulation meets release, and stillness becomes transformative.',
  'Expect soulful flows, grounding presence, and deeply restorative practices that weave together movement, sound, and subconscious exploration—inviting you to feel it all, gently, honestly, and without judgment.'
];

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  readonly contact = STUDIO_CONTACT;
  teamSectionHeading = 'Meet Our Team';
  teamSectionSubheading = 'Experienced teachers dedicated to guiding your practice';
  instructors: CmsInstructor[] = this.getFallbackInstructors();
  private readonly fallbackInstructors = this.getFallbackInstructors();
  private readonly subscriptions = new Subscription();

  constructor(
    private cmsContent: SanityContentService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.updatePage({
      title: 'About A-WELL Yoga',
      description:
        'Meet the teachers behind A-WELL Yoga and explore a grounded, therapeutic, nervous-system-aware approach to yoga.',
      path: '/about',
      image: ARIETA_ABOUT_IMAGE
    });

    this.seo.updateJsonLd([
      {
        id: 'about-organization',
        data: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: STUDIO_CONTACT.name,
          url: SITE_URL,
          email: STUDIO_CONTACT.email,
          telephone: STUDIO_CONTACT.phoneSchema,
          founder: 'Arieta Berisha Kirk'
        }
      },
      {
        id: 'about-breadcrumbs',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` }
          ]
        }
      }
    ]);

    this.subscriptions.add(
      this.cmsContent.getAboutPageMeta().subscribe((meta) => {
        if (!meta) {
          return;
        }

        if (meta.teamSectionHeading) {
          this.teamSectionHeading = meta.teamSectionHeading;
        }

        if (meta.teamSectionSubheading) {
          this.teamSectionSubheading = meta.teamSectionSubheading;
        }
      })
    );

    this.subscriptions.add(
      this.cmsContent.getInstructors().subscribe((instructors) => {
        this.instructors = this.mergeInstructors(instructors);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getFallbackInstructors(): CmsInstructor[] {
    return [
      {
        name: 'Arieta Berisha Kirk',
        title: ARIETA_ABOUT_TITLE,
        isFounder: true,
        imageUrl: ARIETA_ABOUT_IMAGE,
        photoAlt: 'Arieta Berisha Kirk - Founder',
        bioParagraphs: ARIETA_ABOUT_BIO
      },
      {
        name: 'Sommer Renee',
        title: 'Yoga, Breathwork, Sound Baths & Hypnotherapy Teacher',
        imageUrl: '/assets/teachers/sommer/sommer-bio.jpg',
        photoAlt: 'Sommer Renee - Yoga, Breathwork, Sound Baths & Hypnotherapy Teacher',
        bioParagraphs: SOMMER_ABOUT_BIO
      },
      {
        name: 'Melita Kabashi',
        title: 'Yoga Teacher',
        imageUrl: '/assets/teachers/melita/melita-kabashi.jpg',
        photoAlt: 'Melita Kabashi - Yoga Teacher',
        bioParagraphs: MELITA_ABOUT_BIO
      }
    ];
  }

  private mergeInstructors(cmsInstructors: CmsInstructor[]): CmsInstructor[] {
    if (cmsInstructors.length === 0) {
      return this.fallbackInstructors;
    }

    const byName = new Map<string, CmsInstructor>();

    for (const instructor of this.fallbackInstructors) {
      byName.set(this.normalizeName(instructor.name), instructor);
    }

    for (const instructor of cmsInstructors) {
      const key = this.normalizeName(instructor.name);
      const fallback = byName.get(key);

      if (!fallback) {
        byName.set(key, this.normalizeInstructor(instructor));
        continue;
      }

      byName.set(key, this.normalizeInstructor({
        ...fallback,
        ...instructor,
        title: instructor.title?.trim() || fallback.title,
        bioParagraphs: instructor.bioParagraphs?.length ? instructor.bioParagraphs : fallback.bioParagraphs,
        imageUrl:
          instructor.imageUrl && instructor.imageUrl !== '/assets/teachers/arieta/arieta-bio.jpg'
            ? instructor.imageUrl
            : fallback.imageUrl,
        photoAlt: instructor.photoAlt?.trim() || fallback.photoAlt,
        isFounder: instructor.isFounder ?? fallback.isFounder
      }));
    }

    return Array.from(byName.values()).sort((a, b) => {
      if (a.isFounder && !b.isFounder) {
        return -1;
      }

      if (!a.isFounder && b.isFounder) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });
  }

  private normalizeInstructor(instructor: CmsInstructor): CmsInstructor {
    const normalizedName = instructor.name.trim();
    const isArieta = this.normalizeName(normalizedName) === this.normalizeName('Arieta Berisha Kirk');
    const isSommer = this.normalizeName(normalizedName) === this.normalizeName('Sommer Renee');

    if (!isArieta) {
      if (isSommer) {
        return {
          ...instructor,
          name: 'Sommer Renee',
          title: 'Yoga, Breathwork, Sound Baths & Hypnotherapy Teacher',
          imageUrl:
            instructor.imageUrl && instructor.imageUrl !== '/assets/teachers/arieta/arieta-bio.jpg'
              ? instructor.imageUrl
              : '/assets/teachers/sommer/sommer-bio.jpg',
          photoAlt: 'Sommer Renee - Yoga, Breathwork, Sound Baths & Hypnotherapy Teacher',
          bioParagraphs: SOMMER_ABOUT_BIO
        };
      }
      return {
        ...instructor,
        name: normalizedName
      };
    }

    return {
      ...instructor,
      name: 'Arieta Berisha Kirk',
      imageUrl: ARIETA_ABOUT_IMAGE,
      title: ARIETA_ABOUT_TITLE,
      isFounder: true,
      photoAlt: 'Arieta Berisha Kirk - Founder',
      bioParagraphs: ARIETA_ABOUT_BIO
    };
  }

  private normalizeName(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }
}
