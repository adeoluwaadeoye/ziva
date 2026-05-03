import type { Metadata, Viewport } from "next";
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

// ── SITE CONSTANTS ────────────────────────────────────────────────────────────
const siteUrl         = "https://zivaclothings.vercel.app";
const siteName        = "ZIVA";
const siteTitle       = "ZIVA | Premium Nigerian Fashion";
const siteDescription = "Shop premium Nigerian attire — Ankara, Aso-Oke, Agbada, Kaftan, Adire and more. Designed in Lagos, crafted by master artisans, delivered worldwide.";
const cardImage       = "https://res.cloudinary.com/dzplca4gb/image/upload/v1777758011/card_sgg96p.jpg";
const iconImage       = "/assets/icon.jpg"; // public/assets/icon.jpg

// ── VIEWPORT ──────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0f0f0f" },
  ],
  colorScheme:  "light",
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ── METADATA ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase:    new URL(siteUrl),
  applicationName: siteName,

  title: {
    default:  siteTitle,
    template: "%s | ZIVA",
  },
  description: siteDescription,
  keywords: [
    "Nigerian fashion", "Nigerian clothing", "buy Nigerian clothes online",
    "Ankara fabric", "Ankara dress", "Aso-Oke gown", "Agbada", "Kaftan",
    "Adire dress", "Senator suit", "Dashiki", "Cord lace", "native attire",
    "African fashion", "African attire", "African wear",
    "Lagos fashion", "Made in Nigeria", "Nigerian designer brand",
    "traditional Nigerian wear", "premium African fashion",
    "women's Nigerian fashion", "men's Nigerian fashion",
    "ZIVA fashion", "ZIVA clothing", "handcrafted Nigerian clothing",
    "Nigerian artisan fashion", "Balogun market", "Iseyin Aso-Oke",
  ],
  authors:   [{ name: siteName, url: siteUrl }],
  creator:   siteName,
  publisher: siteName,
  category:  "fashion",
  referrer:  "origin-when-cross-origin",

  alternates: { canonical: "/" },

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  // ── OPEN GRAPH ───────────────────────────────────────────────────────────────
  openGraph: {
    type:        "website",
    locale:      "en_NG",
    url:         siteUrl,
    siteName,
    title:       siteTitle,
    description: siteDescription,
    images: [{
      url:    cardImage,
      width:  1200,
      height: 630,
      alt:    "ZIVA — Premium Nigerian Fashion, crafted in Lagos",
    }],
  },

  // ── TWITTER / X ──────────────────────────────────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    title:       siteTitle,
    description: siteDescription,
    images:      [cardImage],
    creator:     "@AdeDadB",
  },

  // ── ICONS ────────────────────────────────────────────────────────────────────
  icons: {
    icon:     [{ url: iconImage, sizes: "any" }],
    apple:    [{ url: iconImage, sizes: "180x180" }],
    shortcut: iconImage,
  },

  // ── MANIFEST ─────────────────────────────────────────────────────────────────
  manifest: "/manifest.json",
};

// ── STRUCTURED DATA (JSON-LD) ─────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type":  "Organization",
      "@id":    `${siteUrl}/#organization`,
      name:     siteName,
      url:      siteUrl,
      logo: {
        "@type":  "ImageObject",
        url:      `${siteUrl}${iconImage}`,
        width:    512,
        height:   512,
      },
      description:     siteDescription,
      foundingDate:    "2019",
      foundingLocation: { "@type": "Place", name: "Lagos, Nigeria" },
      address: {
        "@type":          "PostalAddress",
        streetAddress:    "15 Bode Thomas Street, Surulere",
        addressLocality:  "Lagos",
        addressCountry:   "NG",
      },
      contactPoint: {
        "@type":             "ContactPoint",
        telephone:           "+234-801-234-5678",
        contactType:         "customer service",
        email:               "hello@ziva.ng",
        availableLanguage:   "English",
      },
    },
    {
      "@type":       "WebSite",
      "@id":         `${siteUrl}/#website`,
      url:           siteUrl,
      name:          siteName,
      description:   siteDescription,
      inLanguage:    "en-NG",
      publisher:     { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type":      "EntryPoint",
          urlTemplate:  `${siteUrl}/products?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type":          "OnlineStore",
      "@id":            `${siteUrl}/#store`,
      name:             siteName,
      url:              siteUrl,
      currenciesAccepted: "NGN",
      paymentAccepted:  "Credit Card, Debit Card",
      priceRange:       "₦₦₦",
      areaServed:       { "@type": "Country", name: "Nigeria" },
      hasMap:           "https://maps.google.com/?q=15+Bode+Thomas+Street+Surulere+Lagos",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" data-scroll-behavior="smooth" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
