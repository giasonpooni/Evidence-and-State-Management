import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/shell/AppShell';
import { NotationDraftHost } from '@/components/notations/NotationDraftHost';

export const viewport: Viewport = {
  themeColor: '#06060c',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: {
    default: 'Evidence and State Management',
    template: '%s · Evidence and State Management',
  },
  description:
    'Evidence and State Management — provenance-aware evidence, versioned state, admission, and release management for Notation Systems computational instrumentation and information products.',
  robots: { index: false, follow: false },
  authors: [{ name: 'Notation Systems' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
        {/* The notation draft's seat: empty until the workspace asks, then the controller for the life of the document. */}
        <NotationDraftHost />
      </body>
    </html>
  );
}
