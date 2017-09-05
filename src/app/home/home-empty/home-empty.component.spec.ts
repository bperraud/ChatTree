import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeEmptyComponent } from './home-empty.component';

describe('HomeEmptyComponent', () => {
  let component: HomeEmptyComponent;
  let fixture: ComponentFixture<HomeEmptyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeEmptyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
