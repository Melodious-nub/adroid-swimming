import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { Api } from '../../core/api';
import { Pool } from '../../models/pool.model';
import { AddPoolModal } from '../add-pool-modal/add-pool-modal';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-pool-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pool-list.html',
  styleUrl: './pool-list.scss'
})
export class PoolList implements OnInit, OnDestroy {
  pools: Pool[] = [];
  loading = false;
  error = false;
  errorMessage = '';
  downloadingPdf: { [key: string]: boolean } = {};
  printingPdf: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();

  constructor(
    private api: Api,
    private modalService: NgbModal,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    // console.log('PoolList component initialized');
    this.loadPools();
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
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  openEditModal(pool: Pool): void {
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
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  deletePool(pool: Pool): void {
    if (confirm(`Are you sure you want to delete the pool for ${pool.homeOwnerName}?`)) {
      this.api.deletePool(pool._id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadPools();
          },
          error: (error) => {
            console.error('Error deleting pool:', error);
            alert('Failed to delete pool. Please try again.');
          }
        });
    }
  }

  async generatePdf(pool: Pool): Promise<void> {
    if (!pool._id) return;
    
    this.downloadingPdf[pool._id] = true;
    
    try {
      await this.pdfService.generatePoolPdf(pool);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      this.downloadingPdf[pool._id!] = false;
    }
  }

  async printPdf(pool: Pool): Promise<void> {
    if (!pool._id) return;
    
    this.printingPdf[pool._id] = true;
    
    try {
      this.pdfService.printPoolPdf(pool);
      // Set a timeout to reset the loading state after PDF printing
      setTimeout(() => {
        this.printingPdf[pool._id!] = false;
      }, 2000);
    } catch (error: any) {
      console.error('Error printing PDF:', error);
      this.printingPdf[pool._id!] = false;
      alert('Failed to print PDF. Please try again.');
    }
  }
}
