import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Exporter } from './exporter';

describe('Exporter', () => {
  let component: Exporter;
  let fixture: ComponentFixture<Exporter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exporter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Exporter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
