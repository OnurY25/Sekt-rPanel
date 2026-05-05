// Deployment: 2024-05-04
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SektörPanel – Çok Sektörlü İşletme Yönetim Platformu',
  description: 'Terzi, mobilya, klinik, matbaa ve oto servis işletmeleri için tek platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Force clear old corrupted session keys only once */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const cleanupKey = 'sp_cleanup_v2';
            if (!localStorage.getItem(cleanupKey)) {
              console.log('Performing one-time storage cleanup...');
              ['saas-store', 'saas_user', 'saas_tenant', 'saas_token'].forEach(k => localStorage.removeItem(k));
              localStorage.setItem(cleanupKey, 'true');
            }
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
