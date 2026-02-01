import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.351fcd386c0344f3b52abbae4bce8a16',
  appName: 'Ready Set Coins',
  webDir: 'dist',
  server: {
    url: 'https://351fcd38-6c03-44f3-b52a-bbae4bce8a16.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      releaseType: 'AAB'
    }
  }
};

export default config;
