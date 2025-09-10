import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SlackDori - One-Click Slack Emoji Pack Installation',
  description: 'Install curated emoji packs to your Slack workspace with a single click. Browse developer, Korean, and custom emoji collections.',
  keywords: 'slack emoji, slack emoji pack, slack custom emoji, bulk emoji upload, 슬랙 이모지',
  authors: [{ name: 'AsyncSite' }],
  creator: 'AsyncSite',
  publisher: 'AsyncSite',
  metadataBase: new URL('https://slackdori.asyncsite.com'),
  openGraph: {
    title: 'SlackDori - One-Click Slack Emoji Pack Installation',
    description: 'Install curated emoji packs to your Slack workspace instantly',
    url: 'https://slackdori.asyncsite.com',
    siteName: 'SlackDori',
    images: [
      {
        url: '/og/default.png',
        width: 1200,
        height: 630,
        alt: 'SlackDori - Slack Emoji Packs',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlackDori - Slack Emoji Packs',
    description: 'Install emoji packs to Slack with one click',
    images: ['/og/default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://slackdori.asyncsite.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}