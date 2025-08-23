import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolList } from './pool-list';

describe('PoolList', () => {
  let component: PoolList;
  let fixture: ComponentFixture<PoolList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoolList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoolList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
