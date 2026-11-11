/**
 * Configuración centralizada de variables de entorno de TickDesk Web.
 */
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  appScheme: import.meta.env.VITE_APP_SCHEME || 'tickdesk://',
  androidPackage: 'com.leonoryumi.tickdesk',
  apkDownloadUrl:
    import.meta.env.VITE_APK_DOWNLOAD_URL ||
    'https://expo.dev/accounts/leonoryumi/projects/tickdesk/builds/190510c7-f131-4792-88a5-9f50f4f06545',
} as const;
