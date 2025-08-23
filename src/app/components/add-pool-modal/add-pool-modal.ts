import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { Api } from '../../core/api';
import { Pool } from '../../models/pool.model';

@Component({
  selector: 'app-add-pool-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-pool-modal.html',
  styleUrl: './add-pool-modal.scss'
})
export class AddPoolModal implements OnInit, OnDestroy {
  @Input() pool?: Pool;
  @Input() isEditMode = false;

  poolForm!: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private api: Api
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.pool && this.isEditMode) {
      this.poolForm.patchValue(this.pool);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.poolForm = this.fb.group({
      homeOwnerName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(9)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.minLength(3)]],
      length: ['', [Validators.required, Validators.min(1)]],
      width: ['', [Validators.required, Validators.min(1)]],
      gallons: ['', [Validators.required, Validators.min(1)]],
      howManyInlets: ['', [Validators.required, Validators.min(0)]],
      howManySkimmers: ['', [Validators.required, Validators.min(0)]],
      howManyLadders: ['', [Validators.required, Validators.min(0)]],
      howManySteps: ['', [Validators.required, Validators.min(0)]],
      filterBrand: [''],
      filterModel: [''],
      filterSerial: [''],
      pumpBrand: [''],
      pumpModel: [''],
      pumpSerial: [''],
      heaterBrandNG: [''],
      heaterModelNG: [''],
      heaterSerialNG: [''],
      heaterBrandCBMS: [''],
      heaterModelCBMS: [''],
      heaterSerialCBMS: [''],
      poolCleanerBrand: [''],
      poolCleanerModel: [''],
      poolCleanerSerial: ['']
    });
  }

  onSubmit(): void {
    if (this.poolForm.valid) {
      this.loading = true;
      const poolData = this.poolForm.value;

      const request = this.isEditMode && this.pool?._id
        ? this.api.putPool({ ...poolData, _id: this.pool._id })
        : this.api.postPool(poolData);

      request.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.activeModal.close(true);
          },
          error: (error) => {
            console.error('Error saving pool:', error);
            this.loading = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.poolForm.controls).forEach(key => {
      const control = this.poolForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.poolForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.poolForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['pattern']) return 'Invalid format';
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    }
    return '';
  }

  close(): void {
    this.activeModal.dismiss();
  }
}
