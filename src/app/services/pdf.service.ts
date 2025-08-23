import { Injectable } from '@angular/core';
import { Pool } from '../models/pool.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  async generatePoolPdf(pool: Pool): Promise<void> {
    try {
      // Dynamically import the heavy libraries
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const pdfContent = this.createPdfContent(pool);
      const element = document.createElement('div');
      element.innerHTML = pdfContent;
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.width = '800px'; // Set a fixed width for consistent layout
      element.style.padding = '20px';
      element.style.backgroundColor = '#ffffff';
      document.body.appendChild(element);

      const canvas = await html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF.default('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `pool_${pool.homeOwnerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  printPoolPdf(pool: Pool): void {
    const pdfContent = this.createPdfContent(pool);
    
    // Create a hidden iframe instead of a new window
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';
    
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pool Report - ${pool.homeOwnerName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .field { margin-bottom: 10px; }
            .field label { font-weight: bold; display: inline-block; width: 200px; }
            .field span { display: inline-block; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${pdfContent}
        </body>
        </html>
      `);
      frameDoc.close();
      
      // Wait for content to load, then print and remove iframe
      printFrame.onload = () => {
        const frameWindow = printFrame.contentWindow;
        if (frameWindow) {
          frameWindow.print();
          // Remove the iframe after printing
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        }
      };
    }
  }

private createPdfContent(pool: Pool): string {
  const underline = (val: any) => 
    `<span style="border-bottom:1px solid #000; display:inline-block; min-width:150px; padding:0 5px;">${val || ''}</span>`;

  return `
    <div style="font-family: Arial, sans-serif; font-size: 12px; color: #000; width: 100%;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <div>
          <span>Adroit Swimming Limited</span><br>
          <span>207, East Kazipara, Kafrul</span><br>
          <span>Mirpur, Dhaka 1216</span><br>
          <span>Phone: +880-01719371826</span>
        </div>
      </div>

      <hr style="margin: 8px 0; border: 1px solid #000;">

      <!-- Homeowner Info -->
      <h3 style="margin: 5px 0; font-size: 13px;">Homeowner Information</h3>
      <p>Homeowner’s Name: ${underline(pool.homeOwnerName)} Phone: ${underline(pool.phone)}</p>
      <p>Address: ${underline(pool.address)}</p>
      <p>City: ${underline(pool.city)} State: ${underline(pool.state)} Zip: ${underline(pool.zipCode)}</p>

      <!-- Size & Stats -->
      <h3 style="margin: 10px 0 5px; font-size: 13px;">Size & Stats</h3>
      <p>Length ${underline(pool.length)} Width ${underline(pool.width)} Round ${underline('')} Gallons ${underline(pool.gallons)}</p>
      <p>How Many Inlets? ${underline(pool.howManyInlets)} How Many Skimmers? ${underline(pool.howManySkimmers)}</p>
      <p>Additions: Diving Board&nbsp;&nbsp;Sliding Board&nbsp;&nbsp;Above Ground Deck</p>
      <p>How Many Ladders? ${underline(pool.howManyLadders)} How Many Steps? ${underline(pool.howManySteps)}</p>

      <!-- Equipment -->
      <h3 style="margin: 10px 0 5px; font-size: 13px;">Equipment</h3>
      <p>Type of Filter: Sand D.E. (Diatomaceous Earth) Cartridge</p>
      <p>Filter Brand: ${underline(pool.filterBrand)} Model: ${underline(pool.filterModel)} Serial #: ${underline(pool.filterSerial)}</p>

      <p>Type of Pump (Horse Power):  3/4 HP  1 HP  1-1/2 HP  2 HP  2-1/2 HP  3 HP</p>
      <p>Pump Brand: ${underline(pool.pumpBrand)} Model: ${underline(pool.pumpModel)} Serial #: ${underline(pool.pumpSerial)}</p>

      <p>Type of Heater: Natural Gas&nbsp;&nbsp;Propane&nbsp;&nbsp;Electric Heat Pump</p>
      <p>Heater Brand (NG): ${underline(pool.heaterBrandNG)} Model: ${underline(pool.heaterModelNG)} Serial #: ${underline(pool.heaterSerialNG)}</p>

      <p>Type of Chemical Feeder: Chlorine&nbsp;&nbsp;Bromine&nbsp;&nbsp;Mineral Salt</p>
      <p>Heater Brand (CBMS): ${underline(pool.heaterBrandCBMS)} Model: ${underline(pool.heaterModelCBMS)} Serial #: ${underline(pool.heaterSerialCBMS)}</p>

      <p>Type of Automatic Pool Cleaner: Pressure-Side&nbsp;&nbsp;Suction-Side&nbsp;&nbsp;Robotic</p>
      <p>Pool Cleaner Brand: ${underline(pool.poolCleanerBrand)} Model: ${underline(pool.poolCleanerModel)} Serial #: ${underline(pool.poolCleanerSerial)}</p>

      <div style="margin-top: 20px; font-size: 11px;">
        For more information about pool care visit: <b>www.Adroitswim.com</b> All Rights Reserved.
      </div>
    </div>
  `;
}

  
}
