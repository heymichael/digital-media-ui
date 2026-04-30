# Digital Media UI Architecture

## Overview

The Digital Media UI is a React/Vite single-page application for managing image assets. It provides upload, browse, search, and metadata editing functionality.

## Component Structure

```
src/
├── auth/
│   ├── AuthGate.tsx        # Wraps app with shared-ui AuthGate
│   └── AuthUserContext.ts  # Type-safe auth context
├── components/
│   ├── AssetGrid.tsx       # Grid of asset cards
│   ├── AssetCard.tsx       # Single asset thumbnail
│   ├── AssetDetail.tsx     # Right sidebar detail/edit panel
│   ├── SearchBar.tsx       # Search input
│   └── UploadDropzone.tsx  # Drag-and-drop upload modal
├── hooks/
│   ├── useAssets.ts        # Asset list/search/single hooks
│   └── useUpload.ts        # Upload flow with progress
├── App.tsx                 # Main layout
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Data Flow

### Authentication

1. `AuthGate` uses `@haderach/shared-ui` for Firebase auth
2. Token and active org passed via `mediaFetch` wrapper
3. API calls include `Authorization` and `X-Active-Org` headers

### Asset Loading

1. `useAssets` hook fetches from `/media/api/assets` or `/media/api/search`
2. `AssetGrid` renders `AssetCard` components
3. Each card lazy-loads its image URL via `/media/api/assets/{id}/url`

### Upload Flow

1. User drops files in `UploadDropzone`
2. `useUpload` hook manages multi-file progress
3. For each file:
   - POST `/upload/initiate` → get signed URL
   - PUT to GCS signed URL
   - POST `/upload/finalize` → get asset record
4. Grid refreshes on completion

### Metadata Editing

1. User clicks asset to open `AssetDetail` sidebar
2. Form fields update local state
3. PATCH `/media/api/assets/{id}` on save
4. Updated asset reflects in UI

## Styling

- Tailwind CSS v4 via Vite plugin
- Dark theme matching Haderach brand
- Shared tokens from `@haderach/shared-ui`

## API Integration

All API calls go through `mediaFetch` from `@haderach/shared-ui`, which:
- Adds Firebase ID token
- Adds `X-Active-Org` header
- Routes to `/media/api/*`

## Build & Deploy

- Vite builds to `dist/media/`
- GitHub Actions publishes artifact to GCS
- Firebase Hosting serves at `/media/*`
