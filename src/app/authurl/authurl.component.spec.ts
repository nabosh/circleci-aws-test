import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthurlComponent } from './authurl.component';

describe('AuthurlComponent', () => {
  let component: AuthurlComponent;
  let fixture: ComponentFixture<AuthurlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthurlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthurlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
