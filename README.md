# Make a Sound 🔊

"Capturing the essence of life, one frequency at a time."

Make a Sound is an industrial-grade monorepo for high-fidelity audio capture and discovery. It features a mobile-first recording engine (The Sampler) and a web-based exploration layer.

## Architecture

- **Monorepo**: Turborepo with Yarn/pnpm workspaces.
- **Mobile (apps/mobile)**: Expo (React Native) + `expo-av` + `expo-location`. Featuring a real-time RMS monitoring engine and precise geotagging.
- **Web (apps/web)**: Next.js + Tone.js + Lucide. A premium discovery layer for exploring audio archives.
- **Shared State (packages/state)**: Zustand-powered persistent state for seamless offline-first experiences.
- **Backend (packages/database)**: Supabase (PostgreSQL) for metadata and auth, linked with Cloudflare R2 for zero-egress asset storage.
- **Security**: Edge Functions for presigned URL generation.

## Key Features

- ✅ **High-Fidelity Recording**: 44.1kHz AAC capture via `expo-av`.
- ✅ **Rich Metadata**: Timestamp, Latitude, Longitude, and Reverse Geocoded labels for every sound.
- ✅ **Dynamic Waveforms**: Real-time amplitude feedback during capture.
- ✅ **Premium Discovery**: A glassmorphism-inspired web archive for high-performance playback.
- ✅ **Zero-Egress Storage**: Optimized asset delivery via Cloudflare R2.

## Development

```bash
# Install dependencies
npm install

# Start the mobile app
cd apps/mobile
npm start

# Start the web app
cd apps/web
npm run dev
```

## Infrastructure

See [CLOUDFLARE_R2.md](packages/database/CLOUDFLARE_R2.md) for storage configuration.
Supabase migrations are located in `packages/database/supabase/migrations`.
