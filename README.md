# KYC Test Example Application

A modern React application for testing Know Your Customer (KYC) profile creation workflows. This application provides a user-friendly interface to collect and submit customer verification information to a KYC API.

## Features

- 📝 **KYC Profile Creation**: Submit customer information for identity verification
- 🎨 **Modern UI**: Built with Radix UI and Tailwind CSS v4
- ⚡ **Fast Development**: Powered by Vite with Hot Module Replacement (HMR)
- 🔒 **Type-Safe**: Full TypeScript support
- 📱 **Responsive Design**: Clean, accessible form interface
- 🔔 **Toast Notifications**: User feedback with Sonner toast notifications

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - UI component library
- **Sonner** - Toast notifications

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

## Getting Started

### Installation

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
BACKEND_API_KEY=your_api_key_here
BACKEND_API_URL=your_api_base_url_here
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Build

Build for production:

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Usage

1. Fill in the KYC form with customer information:
   - **Name**: Customer's full name
   - **User ID**: Unique identifier (required)
   - **Email**: Email address (validated)
   - **Phone Number**: Contact number
   - **Country**: Select from available countries
   - **IP Address**: Customer's IP address
   - **Document Number**: ID document number
   - **Document Type**: Select document type (NRIC, Passport, Driver License, Others)
   - **Security Level**: Choose security level (Low, Mid, High)
   - **Gender**: Select gender
   - **Language**: Preferred language

2. Click "Go to Verification" to submit the form
3. Upon successful submission, you'll be redirected to the verification URL

## Form Validation

- **User ID** is mandatory
- **Email** format is validated if provided
- **Document Number** field is disabled until a document type is selected

## Project Structure

```
├── src/
│   ├── components/
│   │   └── ui/          # Reusable UI components (shadcn/ui)
│   ├── lib/
│   │   └── utils.ts     # Utility functions
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── dist/                # Production build output
├── components.json      # shadcn/ui configuration
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The application integrates with a KYC API endpoint:

- **Endpoint**: `POST /api/profiles/create`
- **Headers**: 
  - `Content-Type: application/json`
  - `x-api-key: {VITE_API_KEY}`
- **Response**: Returns a profile object with `id` and `url` properties

## Customization

### Adding New UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). To add new components:

```bash
npx shadcn@latest add [component-name]
```

### Styling

The project uses Tailwind CSS v4. Customize styles in:
- `src/index.css` - Global styles and Tailwind directives
- Component-level styles using Tailwind classes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and not licensed for public use.
