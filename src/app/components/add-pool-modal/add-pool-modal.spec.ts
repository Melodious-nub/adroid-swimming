import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPoolModal } from './add-pool-modal';

describe('AddPoolModal', () => {
  let component: AddPoolModal;
  let fixture: ComponentFixture<AddPoolModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPoolModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPoolModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
