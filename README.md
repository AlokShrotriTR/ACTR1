# ACTR1 - Custom Microsoft Teams Application

A custom Microsoft Teams application designed to collect and process user input with seamless Teams integration. Built with React, TypeScript, and the Microsoft Teams SDK.

## Features

- **Teams Integration**: Automatically detects Teams context and pre-fills user information
- **User Input Forms**: Comprehensive form handling with validation
- **Fluent UI Design**: Consistent with Microsoft Teams design language
- **Responsive Design**: Works in Teams desktop, web, and mobile clients
- **Standalone Mode**: Gracefully handles non-Teams environments for testing

## Technologies Used

- React 18 with TypeScript
- Microsoft Teams SDK (@microsoft/teams-js)
- Fluent UI React Components
- Webpack for bundling and development
- CSS3 for styling

## Project Structure

```
ACTR1/
├── src/
│   ├── App.tsx          # Main application component
│   ├── index.tsx        # Application entry point
│   └── index.css        # Global styles
├── public/
│   └── index.html       # HTML template
├── teams/
│   ├── manifest.json    # Teams app manifest
│   ├── icon-color.png   # Teams app icon (color)
│   └── icon-outline.png # Teams app icon (outline)
├── .github/
│   └── copilot-instructions.md # Copilot customization
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── webpack.config.js    # Webpack configuration
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Microsoft Teams (for testing Teams integration)

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

1. Start the development server:
   ```bash
   npm start
   ```
   This will start the application at `https://localhost:3000`

2. For Teams testing, you'll need to:
   - Upload the Teams app manifest from the `teams/` folder
   - Configure the app in your Teams environment
   - Access the app through Teams

### Building for Production

```bash
npm run build
```

This creates a `build/` directory with optimized production files.

## Teams App Manifest

The Teams app manifest is located in `teams/manifest.json`. Key features:

- **Static Tab**: Personal tab for individual users
- **Configurable Tab**: Can be added to team channels
- **Permissions**: Identity access for user context
- **Valid Domains**: Configured for localhost development

### Deployment Notes

For production deployment:

1. Update the `validDomains` in the manifest to your production domain
2. Replace placeholder icons with proper PNG files (32x32 and 192x192)
3. Update the `webApplicationInfo.id` with your actual Azure AD app registration ID
4. Configure proper HTTPS endpoints

## Application Features

### User Input Form
- Name (auto-populated from Teams context)
- Email address
- Category selection (General, Support, Feedback, etc.)
- Message text area
- Form validation and submission

### Teams Integration
- Automatic Teams context detection
- User information pre-population
- Teams notifications on success/failure
- Responsive design for Teams environments

### Error Handling
- Graceful fallback for non-Teams environments
- Comprehensive error logging
- User-friendly error messages

## Development Guidelines

- Use TypeScript for all new code
- Follow React functional component patterns
- Implement proper error boundaries
- Test in both Teams and standalone modes
- Use Fluent UI components for consistency

## Troubleshooting

### Common Issues

1. **HTTPS Certificate Warnings**: Use `--ignore-certificate-errors` flag or accept the certificate in your browser for localhost development

2. **Teams Context Not Loading**: Ensure the app is accessed through Teams, not directly in a browser

3. **Build Errors**: Check that all dependencies are installed and TypeScript configuration is correct

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new interfaces
3. Test functionality in both Teams and standalone modes
4. Update documentation for new features

## License

ISC License - see package.json for details
