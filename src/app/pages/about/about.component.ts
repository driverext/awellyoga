import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CmsInstructor } from '../../services/cms/cms.models';
import { SanityContentService } from '../../services/cms/sanity-content.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
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
        'Meet the teachers behind A-WELL Yoga in Sanford, Florida, and learn more about the studio’s nervous-system-aware, therapeutic approach to yoga.',
      path: '/about',
      image: '/assets/Arieta_Bio.jpg'
    });

    this.seo.setJsonLd('about-organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'A-WELL Yoga',
      url: 'https://awellyoga.com',
      email: 'info@awellyoga.com',
      telephone: '+1-321-230-8833',
      founder: 'Arieta Berisha Kirk',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '214 Hickman Dr',
        addressLocality: 'Sanford',
        addressRegion: 'FL',
        postalCode: '32771',
        addressCountry: 'US'
      }
    });

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
        title: 'Founder and Lead Instructor',
        isFounder: true,
        imageUrl: '/assets/Arieta_Bio.jpg',
        photoAlt: 'Arieta Berisha Kirk - Founder and Lead Instructor',
        bioParagraphs: [
          'Creator of the RESET Method™ (NeuroYoga-Based).',
          'E-RYT 500 • Founder of A-WELL Yoga • 7,000+ teaching hours.',
          'Arieta teaches yoga as a path of honest self-inquiry, blending science, embodied practice, and lived experience to create spaces that feel grounded and deeply transformative.'
        ]
      },
      {
        name: 'Sommer Renee',
        title: 'Yoga, Breathwork, Sound Baths & Hypnotherapy',
        imageUrl: '/assets/Sommer_Bio.jpg',
        photoAlt: 'Sommer Renee - Yoga, Breathwork, Sound Baths & Hypnotherapy',
        bioParagraphs: [
          'Sommer Reńee is a guide for those ready to come home to themselves. Blending yoga, breathwork, sound baths, and hypnotherapy, her offerings are immersive healing experiences.',
          'Expect soulful flows, grounding presence, and deeply restorative practices that weave together movement, sound, and subconscious exploration.'
        ]
      }
    ];
  }

  private mergeInstructors(cmsInstructors: CmsInstructor[]): CmsInstructor[] {
    if (cmsInstructors.length === 0) {
      return this.fallbackInstructors;
    }

    const byName = new Map<string, CmsInstructor>();

    for (const instructor of this.fallbackInstructors) {
      byName.set(instructor.name, instructor);
    }

    for (const instructor of cmsInstructors) {
      byName.set(instructor.name, instructor);
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
}
