import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/Toast";
import RevealObserver from "@/components/RevealObserver";
import StoreHydration from "@/components/StoreHydration";
import ChatWidget from "@/components/ChatWidget";
import TrackVisit from "@/components/TrackVisit";

const cormorant = Cormorant_Garamond({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ziva.ng";
const siteDescription =
  "Shop premium Nigerian attire — Ankara, Aso-Oke, Agbada, Kaftan and more. Designed in Lagos, crafted by master artisans, worn worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "ZIVA | Premium Nigerian Fashion",
    template: "%s | ZIVA",
  },
  description: siteDescription,
  keywords: [
    "Nigerian fashion", "Ankara", "Aso-Oke", "Agbada", "Kaftan", "Adire",
    "African attire", "Nigerian clothing", "Lagos fashion", "Senator suit",
    "traditional Nigerian wear", "premium African fashion", "buy Nigerian clothes",
  ],
  authors: [{ name: "ZIVA", url: siteUrl }],
  creator: "ZIVA",
  publisher: "ZIVA",
  category: "fashion",

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

  icons: {
    icon: [{ url: "/assets/icon.png", type: "image/png" }],
    shortcut: "/assets/icon.png",
    apple: [{ url: "/assets/icon.png", sizes: "180x180", type: "image/png" }],
  },

  openGraph: {
    type: "website",
    siteName: "ZIVA",
    locale: "en_NG",
    url: siteUrl,
    title: "ZIVA | Premium Nigerian Fashion",
    description: siteDescription,
    images: [
      {
        url: "/assets/aso-oke-W4.jpg",
        width: 1200,
        height: 630,
        alt: "ZIVA — Premium Nigerian Fashion, crafted in Lagos",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ZIVA | Premium Nigerian Fashion",
    description: siteDescription,
    images: ["/assets/aso-oke-W4.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1 pt-26 lg:pt-34">{children}</main>
        <Footer />
        <ToastContainer />
        <RevealObserver />
        <StoreHydration />
        <ChatWidget />
        <TrackVisit />
      </body>
    </html>
  );
}
