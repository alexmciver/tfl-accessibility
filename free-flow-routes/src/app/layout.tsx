import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import '../styles/globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CookieConsent from '../components/ui/CookieConsent';
import Announcements from '../components/ui/Announcements';
import BackToTop from '../components/ui/BackToTop';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['500', '600', '700'],
});

// Metadata
export const metadata: Metadata = {
  title: 'Free Flow Routes - Accessible Journey Planner',
  description: 'Plan accessible journeys on London public transport with step-free access information.',
  keywords: 'accessible travel, london transport, step-free access, wheelchair accessible, journey planner',
  authors: [{ name: 'Free Flow Routes' }],
  openGraph: {
    type: 'website',
    url: 'https://www.freeflowroutes.com/',
    title: 'Free Flow Routes - Accessible Journey Planner',
    description: 'Plan accessible journeys on London public transport with step-free access information.',
    images: [
      {
        url: 'https://www.freeflowroutes.com/assets/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free Flow Routes - Accessible Journey Planner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Flow Routes - Accessible Journey Planner',
    description: 'Plan accessible journeys on London public transport with step-free access information.',
    images: ['https://www.freeflowroutes.com/assets/images/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        {/* Skip Link for accessibility */}
        <a href="#main-content" className="skip-link">Skip to content</a>
        
        {/* Site-wide Announcements */}
        <Announcements />
        
        {/* Cookie Consent Banner */}
        <CookieConsent />
        
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
        
        {/* Back to Top Button */}
        <BackToTop />
      </body>
    </html>
  );
} 