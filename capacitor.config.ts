import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hasboba.app',
  appName: 'Hasboba',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'none',
      style: 'dark',
    },
    CapacitorUpdater: {
      autoUpdate: false,
    },
  },
};

export default config;
