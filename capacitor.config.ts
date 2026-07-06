import type { CapacitorConfig } from '@capacitor/cli';

const PRODUCTION_URL = 'https://res.hesteskokasting.no';

// Override for local testing only, e.g.:
//   $env:CAPACITOR_SERVER_URL = "https://res.hesteskokasting.no/dev"
//   $env:CAPACITOR_SERVER_URL = "http://10.0.2.2:5173"   (Vite dev server, Android emulator)
// Leave unset for release builds — this must default to production so a forgotten
// override can never end up in a Play Store upload.
const serverUrl = process.env.CAPACITOR_SERVER_URL ?? PRODUCTION_URL;
const isLocalHttp = serverUrl.startsWith('http://');

if (serverUrl !== PRODUCTION_URL) {
  console.warn(`[capacitor.config.ts] Using non-production server.url: ${serverUrl}`);
}

const config: CapacitorConfig = {
  appId: 'no.hesteskokasting.app',
  appName: 'Hesteskokasting',
  webDir: 'dist',
  server: {
    url: serverUrl,
    cleartext: isLocalHttp,
    allowNavigation: ['accounts.google.com', '*.supabase.co']
  }
};

export default config;
