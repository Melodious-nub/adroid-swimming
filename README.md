# Adroid Swimming Pool Management

A simple Angular application for managing swimming pool data with PDF generation capabilities.

## Features

- **Pool Data Management**: Add, edit, and delete pool information
- **Comprehensive Form**: Large modal form with all pool specifications
- **PDF Generation**: Download pool data as PDF
- **Print Functionality**: Print pool data directly
- **Responsive Design**: Bootstrap-based responsive UI
- **Memory Leak Prevention**: Proper subscription management

## Pool Data Fields

The application captures the following pool information:

### Homeowner Information
- Homeowner Name
- Phone Number
- Address, City, State, Zip Code

### Pool Specifications
- Length, Width, Gallons
- Number of Inlets, Skimmers, Ladders, Steps

### Equipment Information
- Filter (Brand, Model, Serial)
- Pump (Brand, Model, Serial)
- Heater NG (Brand, Model, Serial)
- Heater CBMS (Brand, Model, Serial)
- Pool Cleaner (Brand, Model, Serial)

## Technologies Used

- **Angular 20**: Latest Angular framework
- **Bootstrap 5**: UI framework
- **ng-bootstrap**: Angular Bootstrap components
- **FontAwesome**: Icons
- **jsPDF**: PDF generation (optimized for small file sizes)
- **RxJS**: Reactive programming

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open `http://localhost:4200` in your browser

## Deployment to Vercel

This application is optimized for deployment on Vercel with the following optimizations:

### Bundle Size Optimizations
- **Lazy Loading**: PDF library (`jspdf`) is dynamically imported only when needed
- **Optimized PDF Generation**: Direct PDF creation without HTML-to-image conversion for smaller file sizes
- **Tree Shaking**: Only necessary ng-bootstrap components are imported
- **Optimized Imports**: Removed unused imports from main app component
- **Production Build**: Configured with proper optimization settings

### Build Configuration
- Increased budget limits to accommodate PDF libraries
- Enabled production optimizations
- Configured proper output hashing
- Disabled source maps in production

### Vercel Configuration
The `vercel.json` file is configured for optimal Angular deployment:
- Static build configuration
- Proper routing for SPA
- Asset handling
- Function timeout settings

### Deployment Steps
1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Vercel
3. Vercel will automatically detect the Angular project and use the optimized build settings
4. The application will be deployed with all optimizations applied

### Bundle Size
The initial bundle size has been optimized to stay within Vercel's limits:
- **Before optimization**: ~1.22 MB (exceeded 1MB limit)
- **After optimization**: Should be under 1MB with lazy loading of PDF library
- **PDF File Size**: Reduced from ~10MB to ~50-100KB per document

## API Configuration

Update the API base URL in `src/app/core/api.ts` to match your backend server:

```typescript
private readonly baseUrl = 'http://localhost:3000';
```

## Usage

1. **View Pool List**: The main page displays all pool data in a table format
2. **Add New Pool**: Click "Add Pool Data" to open the modal form
3. **Edit Pool**: Click the edit button on any pool row
4. **Delete Pool**: Click the delete button to remove a pool
5. **Download PDF**: Click the download button to generate and download a PDF
6. **Print PDF**: Click the print button to open a print-friendly version

## PDF Features

- **Professional Layout**: Clean, organized sections for each data category
- **A4 Format**: Properly formatted for A4 paper printing
- **Small File Size**: Optimized PDF generation (50-100KB vs previous 10MB)
- **Mobile Compatible**: Works seamlessly on mobile devices
- **Automatic Filename**: Generated based on homeowner name and date
- **Print Optimized**: Proper CSS for print media queries
- **Multi-page Support**: Automatic page breaks for long content

## Memory Management

The application implements proper memory leak prevention:
- Uses `takeUntil` with `Subject` for subscription management
- Implements `OnDestroy` lifecycle hooks
- Proper cleanup of modal references and subscriptions

## Development

This is a standalone Angular application with all components using the standalone component pattern. The application is ready for production deployment.
