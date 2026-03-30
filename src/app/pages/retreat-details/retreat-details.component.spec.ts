import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetreatDetailsComponent } from './retreat-details.component';

describe('RetreatDetailsComponent', () => {
  let component: RetreatDetailsComponent;
  let fixture: ComponentFixture<RetreatDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetreatDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetreatDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
