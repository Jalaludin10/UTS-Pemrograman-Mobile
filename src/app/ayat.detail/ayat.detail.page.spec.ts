import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AyatDetailPage } from './ayat.detail.page';

describe('AyatDetailPage', () => {
  let component: AyatDetailPage;
  let fixture: ComponentFixture<AyatDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AyatDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
