import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupJsonComponent } from './popup-json.component';

describe('PopupJsonComponent', () => {
  let component: PopupJsonComponent;
  let fixture: ComponentFixture<PopupJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupJsonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
