import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, of, takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs';
import { Api } from '../../core/api';
import { Pool } from '../../models/pool.model';
import { AddPoolModal } from '../add-pool-modal/add-pool-modal';
import { AddMemberModal } from '../add-member-modal/add-member-modal';
import { PdfService } from '../../services/pdf.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pool-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pool-list.html',
  styleUrl: './pool-list.scss'
})
export class PoolList implements OnInit, OnDestroy {
  title = 'Adroit Swimming Pool Management';
  pools: Pool[] = [];
  loading = false;
  error = false;
  errorMessage = '';
  downloadingPdf: { [key: string]: boolean } = {};
  printingPdf: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();
  private searchTerm$ = new Subject<string>();
  isAdmin = false;

  constructor(
    private api: Api,
    private modalService: NgbModal,
    private pdfService: PdfService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // console.log('PoolList component initialized');
    const user = this.auth.getUser();
    this.isAdmin = (user?.role || '').toLowerCase() === 'admin';
    this.loadPools();

    // Debounced search stream
    this.searchTerm$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          this.loading = true;
          this.error = false;
          this.errorMessage = '';
          return q && q.trim().length > 0
            ? this.api.searchPools(q.trim())
            : this.api.getPools();
        }),
        catchError((err) => {
          console.error('Search error:', err);
          this.error = true;
          this.errorMessage = 'Failed to search pools. Please try again.';
          return of({ success: false, count: 0, data: [] } as any);
        })
      )
      .subscribe((response) => {
        this.pools = response.data;
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPools(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    // console.log('Loading pools...');
    
    this.api.getPools()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // console.log('Pools loaded successfully:', response);
          this.pools = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading pools:', error);
          this.loading = false;
          this.error = true;
          this.errorMessage = 'Failed to load pool data. Please check if the backend server is running.';
        }
      });
  }

  openAddModal(): void {
    const modalRef = this.modalService.open(AddPoolModal, {
      size: 'xl',
      backdrop: false,
      keyboard: false
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadPools();
          if (result === 'created') {
            this.toastSuccess('Pool added successfully');
          } else if (result === 'updated') {
            this.toastSuccess('Pool updated successfully');
          }
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  openEditModal(pool: Pool): void {
    if (!this.isAdmin) {
      Swal.fire({ icon: 'info', title: 'Only admins can edit', timer: 1600, showConfirmButton: false });
      return;
    }
    const modalRef = this.modalService.open(AddPoolModal, {
      size: 'xl',
      backdrop: false,
      keyboard: false
    });
    modalRef.componentInstance.pool = { ...pool };
    modalRef.componentInstance.isEditMode = true;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadPools();
          if (result === 'created') {
            this.toastSuccess('Pool added successfully');
          } else if (result === 'updated') {
            this.toastSuccess('Pool updated successfully');
          }
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  deletePool(pool: Pool): void {
    if (!this.isAdmin) {
      Swal.fire({ icon: 'info', title: 'Only admins can delete', timer: 1600, showConfirmButton: false });
      return;
    }
    Swal.fire({
      title: 'Delete pool?',
      text: `This will permanently delete ${pool.homeOwnerName}'s pool record.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((res: { isConfirmed: boolean }) => {
      if (res.isConfirmed) {
        this.api.deletePool(pool.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadPools();
              this.toastSuccess('Pool deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting pool:', error);
              Swal.fire({ icon: 'error', title: 'Failed to delete pool', timer: 2000, showConfirmButton: false });
            }
          });
      }
    });
  }

  async generatePdf(pool: Pool): Promise<void> {
    if (!pool.id) return;
    
    this.downloadingPdf[pool.id] = true;
    
    try {
      await this.pdfService.generatePoolPdf(pool);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      this.downloadingPdf[pool.id!] = false;
    }
  }

  async printPdf(pool: Pool): Promise<void> {
    if (!pool.id) return;
    
    this.printingPdf[pool.id] = true;
    
    try {
      this.pdfService.printPoolPdf(pool);
      // Set a timeout to reset the loading state after PDF printing
      setTimeout(() => {
        this.printingPdf[pool.id!] = false;
      }, 2000);
    } catch (error: any) {
      console.error('Error printing PDF:', error);
      this.printingPdf[pool.id!] = false;
      alert('Failed to print PDF. Please try again.');
    }
  }

  logout(): void {
    Swal.fire({
      title: 'Log out?',
      text: 'You will need to sign in again to access the app.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((res: { isConfirmed: boolean }) => {
      if (res.isConfirmed) {
        this.auth.logout();
      }
    });
  }

  onSearch(value: string): void {
    this.searchTerm$.next(value || '');
  }

  private toastSuccess(message: string): void {
    Swal.fire({
      icon: 'success',
      title: message,
      toast: true,
      position: 'top-end',
      timer: 1800,
      showConfirmButton: false
    });
  }

  openAddMemberModal(): void {
    if (!this.isAdmin) {
      Swal.fire({ icon: 'info', title: 'Only admins can add members', timer: 1600, showConfirmButton: false });
      return;
    }
    const modalRef = this.modalService.open(AddMemberModal, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then(
      (result) => {
        if (result === 'created') {
          this.toastSuccess('Member created');
        }
      },
      () => {}
    );
  }
}
