import { Injectable } from '@angular/core';
import { Pool } from '../models/pool.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  async generatePoolPdf(pool: Pool): Promise<void> {
    try {
      const pdf = await this.buildPdf(pool);
      const fileName = `pool_${pool.homeOwnerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  printPoolPdf(pool: Pool): void {
    // Build the exact same PDF and print it to guarantee parity
    this.buildPdf(pool)
      .then((pdf) => {
        // Mobile-friendly behavior: open PDF in a new tab using a Blob URL.
        if (this.isMobileDevice()) {
          const blob = (pdf as any).output('blob');
          const blobUrl = URL.createObjectURL(blob);
          const newWin = window.open(blobUrl, '_blank');
          if (!newWin) {
            // Popup blocked fallback: navigate current tab
            window.location.href = blobUrl;
          }
          // Revoke later to avoid memory leaks (cannot revoke immediately)
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
          return;
        }

        // Desktop: auto print via hidden iframe to keep scaling consistent
        if (typeof (pdf as any).autoPrint === 'function') {
          (pdf as any).autoPrint();
        }
        const blobUrl = (pdf as any).output('bloburl').toString();
        const frame = document.createElement('iframe');
        frame.style.position = 'fixed';
        frame.style.right = '0';
        frame.style.bottom = '0';
        frame.style.width = '0';
        frame.style.height = '0';
        frame.style.border = '0';
        frame.src = blobUrl;
        document.body.appendChild(frame);
        frame.onload = () => {
          try {
            const cw = frame.contentWindow;
            if (cw) {
              cw.onafterprint = () => {
                try { document.body.removeChild(frame); } catch {}
              };
              cw.focus();
              cw.print();
            }
          } catch {}
          // Fallback cleanup in case onafterprint never fires
          setTimeout(() => {
            if (document.body.contains(frame)) {
              try { document.body.removeChild(frame); } catch {}
            }
          }, 60000);
        };
      })
      .catch((error) => {
        console.error('Error printing PDF:', error);
        alert('Failed to print PDF. Please try again.');
      });
  }

  private async buildPdf(pool: Pool) {
    const { default: jsPDF } = await import('jspdf');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentRight = pageWidth - margin;

    let y = margin;

    // Try to draw logo above the header (served from /public)
    try {
      const logo = await this.loadImageAsDataUrl('/logopdf.jpeg');
      const logoWidth = 40; // mm
      const logoHeight = 20; // mm
      pdf.addImage(logo.dataUrl, logo.format, margin, y, logoWidth, logoHeight);
      y += logoHeight + 6; // space below logo
    } catch {
      // If logo fails to load from public path (CORS/CDN/WebP), try inlining a small fallback
      try {
        const inlineLogo = await this.inlineFallbackLogo();
        if (inlineLogo) {
          const logoWidth = 40;
          const logoHeight = 20;
          pdf.addImage(inlineLogo, 'PNG', margin, y, logoWidth, logoHeight);
          y += logoHeight + 6;
        }
      } catch {}
    }

    pdf.setFont('helvetica', 'normal');

    // Header block
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Adroit Swimming Limited', margin, y);
    y += 5.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('207, East Kazipara, Kafrul', margin, y);
    y += 5;
    pdf.text('Mirpur, Dhaka 1216', margin, y);
    y += 5;
    pdf.text('Phone: +880-01719371826', margin, y);
    y += 8;

    pdf.setLineWidth(0.3);
    pdf.line(margin, y, contentRight, y);
    y += 8;

    // Homeowner Information section
    y = this.drawSectionTitle(pdf, 'Homeowner Information', margin, contentRight, y);
    y = this.drawTwoColumnLine(pdf,
      { label: "Homeowner's Name", value: String(pool.homeOwnerName || '') },
      { label: 'Phone', value: pool.phone != null ? String(pool.phone) : '' },
      margin, contentRight, y);
    y = this.drawSingleLine(pdf, { label: 'Address', value: String(pool.address || '') }, margin, contentRight, y);
    y = this.drawMultiColumnLine(pdf,
      [
        { label: 'City', value: String(pool.city || '') },
        { label: 'State', value: String(pool.state || '') },
        { label: 'Zip', value: pool.zipCode != null ? String(pool.zipCode) : '' }
      ],
      margin, contentRight, y);

    y += 5;

    // Size & Stats section
    y = this.drawSectionTitle(pdf, 'Size & Stats', margin, contentRight, y);
    y = this.drawMultiColumnLine(pdf,
      [
        { label: 'Length', value: pool.length != null ? `${pool.length}` : '' },
        { label: 'Width', value: pool.width != null ? `${pool.width}` : '' },
        { label: 'Round', value: '' },
        { label: 'Gallons', value: pool.gallons != null ? `${pool.gallons}` : '' }
      ],
      margin, contentRight, y);
    y = this.drawTwoColumnLine(pdf,
      { label: 'How Many Inlets?', value: pool.howManyInlets != null ? `${pool.howManyInlets}` : '' },
      { label: 'How Many Skimmers?', value: pool.howManySkimmers != null ? `${pool.howManySkimmers}` : '' },
      margin, contentRight, y);
    y = this.drawStaticLine(pdf, 'Additions:  Diving Board   Sliding Board   Above Ground Deck', margin, contentRight, y);
    y = this.drawTwoColumnLine(pdf,
      { label: 'How Many Ladders?', value: pool.howManyLadders != null ? `${pool.howManyLadders}` : '' },
      { label: 'How Many Steps?', value: pool.howManySteps != null ? `${pool.howManySteps}` : '' },
      margin, contentRight, y);

    y += 6;

    // Equipment section
    y = this.drawSectionTitle(pdf, 'Equipment', margin, contentRight, y);
    y = this.drawStaticLine(pdf, 'Type of Filter:  Sand   D.E. (Diatomaceous Earth)   Cartridge', margin, contentRight, y);
    y = this.drawMultiColumnLine(pdf,
      [
        { label: 'Filter Brand', value: String(pool.filterBrand || '') },
        { label: 'Model', value: String(pool.filterModel || '') },
        { label: 'Serial #', value: String(pool.filterSerial || '') }
      ],
      margin, contentRight, y);
    y = this.drawStaticLine(pdf, 'Type of Pump (Horse Power):  3/4 HP   1 HP   1-1/2 HP   2 HP   2-1/2 HP   3 HP', margin, contentRight, y);
    y = this.drawMultiColumnLine(pdf,
      [
        { label: 'Pump Brand', value: String(pool.pumpBrand || '') },
        { label: 'Model', value: String(pool.pumpModel || '') },
        { label: 'Serial #', value: String(pool.pumpSerial || '') }
      ],
      margin, contentRight, y);
    y = this.drawStaticLine(pdf, 'Type of Heater:  Natural Gas   Propane   Electric Heat Pump', margin, contentRight, y);
    y = this.drawMultiColumnLine(pdf,
      [
        { label: 'Heater Brand', value: String(pool.heaterBrandNG || '') },
        { label: 'Model', value: String(pool.heaterModelNG || '') },
        { label: 'Serial #', value: String(pool.heaterSerialNG || '') }
      ],
      margin, contentRight, y);
    y = this.drawStaticLine(pdf, 'Type of Chemical Feeder:  Chlorine   Bromine   Mineral Salt', margin, contentRight, y);
    y = this.drawMultiColumnLine(pdf,
      [
        { label: 'Heater Brand', value: String(pool.heaterBrandCBMS || '') },
        { label: 'Model', value: String(pool.heaterModelCBMS || '') },
        { label: 'Serial #', value: String(pool.heaterSerialCBMS || '') }
      ],
      margin, contentRight, y);
    y = this.drawStaticLine(pdf, 'Type of Automatic Pool Cleaner:  Pressure-Side   Suction-Side   Robotic', margin, contentRight, y);
    y = this.drawMultiColumnLine(pdf,
      [
        { label: 'Pool Cleaner Brand', value: String(pool.poolCleanerBrand || '') },
        { label: 'Model', value: String(pool.poolCleanerModel || '') },
        { label: 'Serial #', value: String(pool.poolCleanerSerial || '') }
      ],
      margin, contentRight, y);

    y += 10;
    // Emphasized footer line as in the reference form
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('For more information about pool care visit: www.Adroitswim.com  All Rights Reserved.', margin, y);
    pdf.setFont('helvetica', 'normal');

    return pdf;
  }

  private drawSectionTitle(pdf: any, title: string, left: number, right: number, y: number) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(title, left, y);
    pdf.setFont('helvetica', 'normal');
    return y + 6;
  }

  private drawSingleLine(pdf: any, field: { label: string; value: string }, left: number, right: number, y: number) {
    const labelFontSize = 10;
    const lineY = y + 1.8; // slightly closer to the label baseline
    pdf.setFontSize(labelFontSize);
    pdf.text(field.label + ':', left, y);
    const labelWidth = pdf.getTextWidth(field.label + ': ');
    const startX = left + labelWidth + 1;
    const endX = right;
    // lighter underline
    pdf.setLineWidth(0.2);
    pdf.line(startX, lineY, endX, lineY);
    if (field.value) {
      pdf.text(String(field.value), startX + 2, y);
    }
    return y + 8;
  }

  private drawTwoColumnLine(
    pdf: any,
    leftField: { label: string; value: string },
    rightField: { label: string; value: string },
    left: number,
    right: number,
    y: number
  ) {
    const gap = 8;
    const mid = (left + right) / 2;
    // compute where the right label begins so the left underline fills until right before it
    const rightLabelWidth = pdf.getTextWidth(rightField.label + ': ');
    const rightLabelStart = mid + gap; // where we draw the right label
    const leftEnd = rightLabelStart - 2; // end just before next label
    const nextY = this.drawSingleLine(pdf, leftField, left, leftEnd, y);
    // right column ends at the available right edge
    this.drawSingleLine(pdf, rightField, rightLabelStart, right, y);
    return nextY;
  }

  private drawMultiColumnLine(
    pdf: any,
    fields: Array<{ label: string; value: string }>,
    left: number,
    right: number,
    y: number
  ) {
    const totalWidth = right - left;
    const gap = 6;
    const colWidth = (totalWidth - gap * (fields.length - 1)) / fields.length;
    const baseY = y;
    fields.forEach((f, index) => {
      const start = left + index * (colWidth + gap);
      // for all but last, end just before next label start
      if (index < fields.length - 1) {
        const next = fields[index + 1];
        const nextLabelStart = start + colWidth + gap; // where next label is drawn
        const endBefore = nextLabelStart - 2;
        this.drawSingleLine(pdf, f, start, endBefore, baseY);
      } else {
        this.drawSingleLine(pdf, f, start, start + colWidth, baseY);
      }
    });
    return baseY + 8;
  }

  private drawStaticLine(pdf: any, text: string, left: number, right: number, y: number) {
    pdf.setFontSize(10);
    pdf.text(text, left, y);
    return y + 8;
  }

  private async loadImageAsDataUrl(path: string): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' }>
  {
    // Robust asset resolution: prefer absolute URL based on current origin and base href
    const baseHref = (document.querySelector('base')?.getAttribute('href') || '/');
    const absoluteUrl = new URL(path.startsWith('/') ? path : `${baseHref}${path}`, window.location.origin).toString();
    const bust = `v=${Date.now()}`;
    const urlWithBust = absoluteUrl.includes('?') ? `${absoluteUrl}&${bust}` : `${absoluteUrl}?${bust}`;
    const response = await fetch(urlWithBust, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load image');
    const blob = await response.blob();
    // Detect format (Vercel may serve as webp if not configured); convert to PNG to be safe
    const resolvedFormat: 'PNG' | 'JPEG' = /jpe?g/i.test(blob.type) ? 'JPEG' : 'PNG';
    return await new Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: String(reader.result), format: resolvedFormat });
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
  }

  private isMobileDevice(): boolean {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|iphone|ipad|ipod/i.test(ua);
  }

  private async inlineFallbackLogo(): Promise<string | null> {
    // Small transparent PNG placeholder (1x1) as ultimate fallback.
    // Replace this with a small embedded company mark if desired.
    const tinyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAoMBg3b8yqgAAAAASUVORK5CYII=';
    return tinyPng;
  }

  // (Cleanup) Removed unused HTML-based print helpers; PDF is the single source of truth
}
