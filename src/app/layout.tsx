import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from './client-layout'
import { cn } from '@/lib/utils'
import { SITE_URL, COMPANY } from '@/lib/constants'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${COMPANY.NAME} | ${COMPANY.TAGLINE}`,
  description: COMPANY.DESCRIPTION,
  openGraph: {
    title: `${COMPANY.NAME} | ${COMPANY.TAGLINE}`,
    description: COMPANY.LONG_DESCRIPTION,
    url: SITE_URL,
    siteName: COMPANY.NAME,
    images: [
      {
        url: "/og.png",
        width: 2044,
        height: 1564,
        alt: `${COMPANY.NAME} Movement`
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY.NAME} | ${COMPANY.TAGLINE}`,
    description: COMPANY.LONG_DESCRIPTION,
    images: ["/og.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
