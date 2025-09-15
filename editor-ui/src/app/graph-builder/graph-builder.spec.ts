import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphBuilder } from './graph-builder';

describe('GraphBuilder', () => {
  let component: GraphBuilder;
  let fixture: ComponentFixture<GraphBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
