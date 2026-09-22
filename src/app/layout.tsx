import type { Metadata } from 'next';
import '../styles/app.css';
import '../styles/cv.css';
import '../styles/print.css';
import '../styles/hero.css';
import { LocaleProvider } from '../lib/i18n/LocaleContext';

export const metadata: Metadata = {
  title: 'CVskills',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23e60278'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700&family=Noto+Sans+Thai:wght@400;600;700&family=Syne:wght@700;800&family=Space+Grotesk:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
