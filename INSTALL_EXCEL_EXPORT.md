# Installation Instructions for Excel Export Feature

## Required Package

To enable the Excel export functionality, you need to install the `exceljs` package.

### Installation

Run the following command in the `himti-api` directory:

```bash
npm install exceljs
```

or if you're using yarn:

```bash
yarn add exceljs
```

### TypeScript Types

If you're using TypeScript (which you are), you may also need to install the type definitions:

```bash
npm install --save-dev @types/exceljs
```

or with yarn:

```bash
yarn add -D @types/exceljs
```

## Verification

After installation, verify that the package has been added to your `package.json`:

```json
{
  "dependencies": {
    ...
    "exceljs": "^4.x.x"
  },
  "devDependencies": {
    ...
    "@types/exceljs": "^1.x.x"
  }
}
```

## Testing the Export Feature

1. Start your development server:
   ```bash
   npm run dev
   ```

2. In the CMS, navigate to the Anggota (Members) page

3. Select a generation from the dropdown (optional)

4. Click the "Export to Excel" button

5. The Excel file should download automatically

## Features Included

The Excel export includes:
- Member data with all fields (NIM, Name, Email, Generation, Social Media, Status, Created At)
- Beautiful formatting with colored headers
- Alternate row colors for better readability
- Status cells with conditional formatting (green for active, red for inactive)
- Summary statistics at the bottom (total, active, inactive counts)
- Dynamic filename based on generation filter and date
- Bordered cells for professional appearance

## API Endpoint

- **Endpoint**: `GET /anggota/export/excel`
- **Query Parameters**:
  - `generationId` (optional): Filter by specific generation year
- **Response**: Excel file (XLSX format)
- **Authentication**: Required (Bearer token)

## Example Usage

### Export All Members
```
GET /anggota/export/excel
```

### Export Specific Generation
```
GET /anggota/export/excel?generationId=2021
```

## Troubleshooting

If you encounter any issues:

1. Make sure the package is installed correctly
2. Restart your development server
3. Check the console for any error messages
4. Verify that the API endpoint is accessible
5. Ensure you have proper authentication token

## File Structure

```
himti-api/src/app/members/
├── members.controller.ts    # Added exportMembersController
├── members.service.ts       # Added exportMembersService
├── members.export.ts        # NEW - Excel export logic
├── members.route.ts         # Added /export/excel route
└── members.repository.ts    # No changes needed
```
