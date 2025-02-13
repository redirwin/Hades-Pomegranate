# Hade's Pomegranates

A Next.js application providing RPG tools for gamers, with the primary tool being Lodestone - a resource list generator.

## Features

- **Lodestone**: Create and manage inventory lists for RPG characters
  - Weighted random generation based on rarity
  - Resource hub management
  - Provision/item management
  - Generation history tracking

## Prerequisites

- Node.js 18.x or higher
- Firebase account with:
  - Firestore Database
  - Storage
  - Authentication (Google provider)

## Environment Variables

Create a `.env.local` file with the following:

```bash
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin Config
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_PROJECT_ID=

# Admin Access
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,another@example.com
```

## Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser

## Project Structure

- `/app/(apps)/lodestone` - Lodestone application code
- `/app/api` - API routes
- `/components` - Shared UI components
- `/lib` - Utility functions and configurations
- `/hooks` - Custom React hooks

## Firebase Setup

1. Create a new Firebase project
2. Enable Google Authentication
3. Create a Firestore database
4. Set up Firebase Storage
5. Configure security rules (documentation needed)

## Deployment

The project is configured for deployment on Vercel. Follow these steps:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy
