import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnDestroy {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    this.auth
      .login(this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/pools';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          console.error('Login failed', err);
          this.loading = false;
          this.error = err.error.message;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


