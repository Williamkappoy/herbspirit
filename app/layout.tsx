import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Kapibana's Tickets — Billetterie événementielle",
  description: "Découvrez et réservez vos billets pour les meilleurs événements. Concerts, spectacles, théâtre, festivals et plus encore.",
  openGraph: {
    title: "Kapibana's Tickets",
    description: "Découvrez et réservez vos billets pour les meilleurs événements.",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-ink-900 text-white min-h-screen antialiased flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
