import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SektörPanel – Çok Sektörlü İşletme Yönetim Platformu',
  description: 'Terzi, mobilya, klinik, matbaa ve oto servis işletmeleri için tek platform. Sipariş, müşteri, randevu ve ödeme takibi.',
  keywords: 'terzi yazılımı, mobilya yönetim, klinik yazılımı, matbaa takip, oto servis programı, işletme yönetim',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
