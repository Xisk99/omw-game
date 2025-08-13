import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "$OMW Reaction Test | On My Way Game - Test Your Lightning Reflexes",
  description: "Test your reaction time with the ultimate $OMW (On My Way) game! Lightning-fast reflexes challenge for Solana adventurers. Can you beat 250ms? Play now and share your results!",
  keywords: "OMW, On My Way, reaction test, Solana, meme token, game, reflexes, speed test, crypto game",
  authors: [{ name: "xisk_99" }],
  creator: "xisk_99",
  publisher: "OMW Solana",
  
  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://omwsol.com",
    title: "$OMW Reaction Test | On My Way Game - Test Your Lightning Reflexes",
    description: "Test your reaction time with the ultimate $OMW (On My Way) game! Lightning-fast reflexes challenge for Solana adventurers. Can you beat 250ms?",
    siteName: "On My Way - $OMW Game",
    images: [
      {
        url: "https://omwsol.com/assets/image_1753646078640-CHFF5TY9.png",
        width: 1200,
        height: 675,
        alt: "$OMW On My Way - Reaction Test Game",
        type: "image/png",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "$OMW Reaction Test | On My Way Game",
    description: "Test your reaction time with the ultimate $OMW game! Lightning-fast reflexes challenge for Solana adventurers.",
    creator: "@xisk_99",
    site: "@omwsolana",
    images: [
      {
        url: "https://omwsol.com/assets/image_1753646078640-CHFF5TY9.png",
        alt: "$OMW On My Way - Reaction Test Game",
      },
    ],
  },

  // Icons / Favicon
  icons: {
    icon: [
      { url: "/game/omw-idle.png", sizes: "32x32", type: "image/png" },
      { url: "/game/omw-idle.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/game/omw-idle.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/game/omw-idle.png",
  },

  // Additional Meta
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (add if needed)
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
