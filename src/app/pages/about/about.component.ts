import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CmsInstructor } from '../../services/cms/cms.models';
import { SanityContentService } from '../../services/cms/sanity-content.service';

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
  private readonly subscriptions = new Subscription();

  constructor(private cmsContent: SanityContentService) {}

  ngOnInit(): void {
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
        if (instructors.length > 0) {
          this.instructors = instructors;
        }
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
          'Arieta Berisha Kirk, E-RYT 500, founder of A-WELL Yoga in Sanford, Florida, and online, teaches yoga as a path of honest self-inquiry.',
          'With a background in clinical psychology and neuroscience, and over a decade of yoga teaching experience, her classes begin with quiet observation of self, meeting the breath before movement so the nervous system can settle and practice can arise from awareness, not performance.',
          'Arieta believes yoga begins the moment we are willing to meet ourselves with truth. Her mission is simple: to help people understand why they practice, so yoga becomes a way of living.'
        ]
      },
      {
        name: 'Sommer Renee',
        title: 'Yoga, Breathwork, Sound Baths & Hypnotherapy',
        imageUrl: '/assets/Sommer_Bio.jpg',
        photoAlt: 'Sommer Renee - Yoga, Breathwork, Sound Baths & Hypnotherapy',
        bioParagraphs: [
          'Sommer Reńee is a guide for those ready to come home to themselves. Blending yoga, breathwork, sound baths, and hypnotherapy, her offerings are more than just classes—they’re immersive healing experiences. What began as a personal journey has evolved into a space where regulation meets release, and stillness becomes transformative.',
          'Expect soulful flows, grounding presence, and deeply restorative practices that weave together movement, sound, and subconscious exploration—inviting you to feel it all, gently, honestly, and without judgment.'
        ]
      },
      {
        name: 'Elena Rodriguez',
        title: 'Ashtanga & Power Yoga',
        imageUrl:
          'https://images.pexels.com/photos/6787201/pexels-photo-6787201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        photoAlt: 'Elena Rodriguez - Ashtanga & Power Yoga',
        bioParagraphs: [
          "Elena's dynamic teaching style challenges students to discover their strength while maintaining alignment and breath awareness."
        ]
      },
      {
        name: 'James Wilson',
        title: 'Meditation & Yoga Philosophy',
        imageUrl:
          'https://images.unsplash.com/photo-1552286450-4a669f880062?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80',
        photoAlt: 'James Wilson - Meditation & Yoga Philosophy',
        bioParagraphs: [
          'James brings ancient wisdom to modern practice, guiding students through meditation and exploring the philosophical aspects of yoga.'
        ]
      }
    ];
  }
}
