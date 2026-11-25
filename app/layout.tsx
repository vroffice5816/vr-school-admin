import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import './globals.css';
import { LOGO_SRC, SCHOOL_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: { default: `${SCHOOL_NAME} – Emergency Sheets`, template: `%s | ${SCHOOL_NAME}` },
  description: 'Staff emergency sheet portal',
  icons: { icon: LOGO_SRC, apple: LOGO_SRC },
  // Private staff tool containing student data: keep it out of search engines.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (Grammarly, password managers, …) add
    // attributes to <html>/<body> before React loads. This only silences those two tags.
    <html lang="en-CA" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
