import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherReportComponent } from './voucher-report.component';

describe('VoucherReportComponent', () => {
  let component: VoucherReportComponent;
  let fixture: ComponentFixture<VoucherReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
