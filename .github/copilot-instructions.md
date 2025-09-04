<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Custom Microsoft Teams Application - ACTR1

This is a custom Microsoft Teams application built with React, TypeScript, and the Microsoft Teams SDK. The application is designed to collect user input within the Teams environment.

## Key Technologies
- **React 18** with TypeScript
- **Microsoft Teams SDK** (@microsoft/teams-js)
- **Fluent UI React Components** for Teams-consistent design
- **Webpack** for bundling and development server

## Architecture Guidelines
- Use functional React components with hooks
- Implement proper Teams SDK initialization and error handling
- Follow Fluent UI design patterns for consistency with Teams
- Handle both Teams environment and standalone mode gracefully

## Development Notes
- The app runs on localhost:3000 with HTTPS enabled for Teams compatibility
- Teams context is automatically retrieved and used to pre-populate user information
- Form validation ensures required fields are completed before submission
- Notifications are sent through Teams SDK when available

## Code Style
- Use TypeScript interfaces for all data structures
- Implement proper error handling for Teams SDK calls
- Use semantic HTML and accessible form controls
- Follow React best practices for state management and component composition
