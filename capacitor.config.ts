import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'no.hesteskokasting.app',
  appName: 'Hesteskokasting',
  webDir: 'dist',
  server: {
    url: 'https://res.hesteskokasting.no',
    cleartext: false,
    allowNavigation: ['accounts.google.com', '*.supabase.co']
  }
};

export default config;
