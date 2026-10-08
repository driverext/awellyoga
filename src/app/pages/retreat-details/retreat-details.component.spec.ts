import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { RetreatDetailsComponent } from './retreat-details.component';
import { SeoService } from '../../services/seo.service';

describe('RetreatDetailsComponent', () => {
  let component: RetreatDetailsComponent;
  let fixture: ComponentFixture<RetreatDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetreatDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'rugova-2026' }) } }
        },
        {
          provide: SeoService,
          useValue: jasmine.createSpyObj<SeoService>('SeoService', ['updatePage', 'updateJsonLd'])
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetreatDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load and render the retreat selected by the route', () => {
    expect(component.retreat.id).toBe('rugova-2026');
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toBe('RESET™ RETREAT');
  });
});
