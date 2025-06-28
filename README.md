# User Selected Perks (USP) Demo

A React TypeScript application demonstrating integration with the MomentScience USP API.

## Features

- **Credential Management**: Enter API key and pub_user_id or use demo credentials
- **Session Persistence**: Credentials are stored in localStorage for seamless navigation
- **API Integration**: Fetches offers from MomentScience USP API with real-time data
- **Checkbox-based Selection**: Each offer features a checkbox for selection/unselection instead of CTA buttons
- **Auto-selection Support**: When API settings indicate `usp_all_offers_checked: true`, all offers are checked by default
- **Bulk Selection Controls**: Select All and Unselect All buttons for quick offer management
- **Select/Unselect API Calls**: Real-time POST requests when users check/uncheck offers
- **Session Management**: Get session details and update session with selected/unselected campaigns
- **Country Targeting**: Requests include country parameter set to "us" for localized offers
- **Selection Activity Tracking**: Sidebar displays all select/unselect operations with curl commands and responses
- **API Response Tracking**: Interactive sidebar to view API requests and responses
- **Loading States**: Visual feedback during API calls with loading spinner
- **Error Handling**: Comprehensive error handling with retry functionality
- **Offer Display**: Dynamic rendering of offers with images, titles, and descriptions
- **Debug Tools**: Real-time API response inspection and request tracking
- **Mobile-Friendly Design**: Responsive UI that works well on all device sizes
- **Form Validation**: Proper validation with error handling
- **React Router**: Navigation between credential entry and perks selection pages

## Project Structure

```
src/
├── pages/
│   ├── HomePage.tsx          # Main credential entry page
│   ├── HomePage.css          # Styles for home page
│   ├── SelectPerksPage.tsx   # Perks selection interface
│   └── SelectPerksPage.css   # Styles for perks page
├── App.tsx                   # Main app component with routing
├── App.css                   # Global app styles
├── index.css                 # Base CSS styles
└── main.tsx                  # App entry point
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Home Page
1. Enter your API key and pub_user_id
2. Or check "Use demo credentials" to auto-fill with demo values:
   - **API Key**: `d3468440-4124-45e2-a0ff-13d8f89bec42`
   - **pub_user_id**: `MomentScienceUSPDemo`
3. Click "Start Session" to navigate to the perks selection page

### Demo Credentials
When "Use demo credentials" is checked:
- Form fields are automatically filled with demo values
- Fields become read-only
- Form validation is bypassed

### Perks Selection Page
After entering credentials, the app will:

1. **Fetch Offers**: Automatically call the MomentScience USP API
2. **Display Loading**: Show a spinner while waiting for the API response
3. **Show Session Info**: Display the session ID, API key, and pub_user_id used
4. **Render Offers**: Display each offer as a card with:
   - Logo or creative image (if available)
   - Title and description
   - **Checkbox for selection** (replaces CTA buttons)
   - Offer ID and campaign ID for debugging
5. **Auto-select Offers**: If API settings indicate `usp_all_offers_checked: true`, all checkboxes are checked by default
6. **Bulk Selection**: Use "Select All" or "Unselect All" buttons for quick offer management
7. **Handle Selection**: When users check/uncheck offers or use bulk actions:
   - Makes POST request to `/sdk/v4/usp/{SessionID}/{CampaignID}/select.json` for selections
   - Makes POST request to `/sdk/v4/usp/{SessionID}/{CampaignID}/unselect.json` for unselections
   - Makes PUT request to `/sdk/v4/usp/session/{SessionID}.json` for bulk updates
   - Logs all API calls with curl commands and responses in the sidebar
8. **Session Management**: 
   - Get session details using the "Get Session Details" button in the sidebar
   - View selected/unselected campaign IDs and raw session data
9. **Error Handling**: Show helpful error messages if the API call fails

### API Integration Details
- **Endpoint**: `POST https://api-staging.adspostx.com/native/v2/offers.json`
- **Environment**: Staging with dev mode enabled (`dev=1`)
- **Parameters**: Includes placement, user agent, IP, fingerprint, membership ID, and country
- **Country Targeting**: Automatically sets country to "us" for localized offers
- **Error Handling**: Comprehensive error handling including CORS detection

### Debug and Tracking Features
- **API Response Sidebar**: Click "Show API Response" to view real-time API data
- **Request Details**: View all parameters sent to the API endpoint
- **Session Tracking**: Monitor session ID and offer counts
- **Offer Summary**: Quick overview of returned offers with IDs and campaign info
- **Raw Response**: Full JSON response for debugging and development
- **Mobile Responsive**: Sidebar adapts to different screen sizes

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages (builds and deploys)

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages:

1. **Automatic Deployment**: Push to the `main` branch triggers automatic deployment via GitHub Actions
2. **Manual Deployment**: Run `npm run deploy` to build and deploy manually
3. **Live Demo**: After deployment, the app will be available at `https://[username].github.io/momentscience_usp_demo/`

### Configuration

- **Base Path**: Configured for GitHub Pages in `vite.config.ts`
- **Static Assets**: Properly configured for GitHub Pages asset handling
- **Favicon**: Uses Shopify cart icon for branding
- **Title**: "MS USP Demo" for clean branding

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **CSS3** - Styling with responsive design

## API Integration

This demo app is designed to integrate with the MomentScience USP API. The credentials entered on the home page are stored in localStorage and can be used for API calls in the perks selection interface.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
