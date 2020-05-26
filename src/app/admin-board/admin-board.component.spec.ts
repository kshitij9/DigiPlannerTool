import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBoardComponent } from './admin-board.component';

describe('AdminBoardComponent', () => {
  let component: AdminBoardComponent;
  let fixture: ComponentFixture<AdminBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have a title 'adminboard' `, async(() => {
    fixture = TestBed.createComponent(AdminBoardComponent);
    component = fixture.debugElement.componentInstance;
    expect(component.title).toEqual('adminboard');
  }));

});
