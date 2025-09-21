import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Api } from '../../core/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-member-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-member-modal.html',
  styleUrl: './add-member-modal.scss'
})
export class AddMemberModal implements OnDestroy {
  form: FormGroup;
  submitting = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private api: Api
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      username: ['', [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]]
    });
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.error = null;
    const payload = {
      email: this.form.value.email,
      fullName: this.form.value.fullName,
      password: this.form.value.password,
      username: this.form.value.username?.trim() || undefined
    };
    this.api.createMember(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.submitting = false;
        this.activeModal.close('created');
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || 'Failed to create member';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


