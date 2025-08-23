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
- **html2canvas**: HTML to canvas conversion
- **jsPDF**: PDF generation
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

- Professional layout with sections for each data category
- Automatic filename generation based on homeowner name and date
- Print-optimized styling
- Multi-page support for long content

## Memory Management

The application implements proper memory leak prevention:
- Uses `takeUntil` with `Subject` for subscription management
- Implements `OnDestroy` lifecycle hooks
- Proper cleanup of modal references and subscriptions

## Development

This is a standalone Angular application with all components using the standalone component pattern. The application is ready for production deployment.
