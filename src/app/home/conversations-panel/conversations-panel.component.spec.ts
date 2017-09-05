import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationsPanelComponent } from './conversations-panel.component';

describe('ConversationsPanelComponent', () => {
  let component: ConversationsPanelComponent;
  let fixture: ComponentFixture<ConversationsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
