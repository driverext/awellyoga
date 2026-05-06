import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface SeoPayload {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
}

interface JsonLdEntry {
  id: string;
  data: unknown;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  updatePage(payload: SeoPayload): void {
    const baseUrl = 'https://awellyoga.com';
    const canonicalUrl = `${baseUrl}${payload.path || this.document.location?.pathname || '/'}`;
    const imageUrl = payload.image ? (payload.image.startsWith('http') ? payload.image : `${baseUrl}${payload.image}`) : `${baseUrl}/assets/brand/awell-yoga-logo.jpg`;
    const fullTitle = payload.title.includes('A-WELL Yoga') ? payload.title : `${payload.title} | A-WELL Yoga`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: payload.description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: payload.description });
    this.meta.updateTag({ property: 'og:type', content: payload.type || 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: payload.description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });

    this.ensureCanonical(canonicalUrl);
  }

  setJsonLd(id: string, data: unknown): void {
    this.updateJsonLd([{ id, data }]);
  }

  updateJsonLd(entries: JsonLdEntry[]): void {
    this.document.querySelectorAll('script[id^="jsonld-"]').forEach((script) => script.remove());
    for (const entry of entries) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `jsonld-${entry.id}`;
      script.text = JSON.stringify(entry.data);
      this.document.head.appendChild(script);
    }
  }

  removeJsonLd(id: string): void {
    this.document.getElementById(`jsonld-${id}`)?.remove();
  }

  private ensureCanonical(href: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = href;
  }
}
