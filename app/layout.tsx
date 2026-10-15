import type { Metadata } from "next";
import {
  Archivo,
  Bricolage_Grotesque,
  DM_Mono,
  Noto_Sans_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Tamil,
  Noto_Sans_Thai,
} from "next/font/google";
import Providers from "@/components/Providers";
import SideRail from "@/components/SideRail";
import SmoothScroll from "@/components/SmoothScroll";
import { previewImage, siteDescription, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });

const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-deva", display: "swap", preload: false });
const arab = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arab", display: "swap", preload: false });
const guru = Noto_Sans_Gurmukhi({ subsets: ["gurmukhi"], variable: "--font-guru", display: "swap", preload: false });
const guj = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-guj", display: "swap", preload: false });
const beng = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-beng", display: "swap", preload: false });
const tamil = Noto_Sans_Tamil({ subsets: ["tamil"], variable: "--font-tamil", display: "swap", preload: false });
const thai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-thai", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Nathan Nicholas D'Souza",
  authors: [{ name: "Nathan Nicholas D'Souza" }],
  keywords: ["AI/ML engineer", "full-stack developer", "computer vision", "Vancouver", "portfolio"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Nathan Nicholas D'Souza",
    title: siteTitle,
    description: siteDescription,
    locale: "en_CA",
    images: [{ url: previewImage, width: 1200, height: 630, alt: siteTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [previewImage],
  },
};

// Runs before first paint: stored choice wins, otherwise follow the OS.
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

const fontVars = [archivo, bricolage, dmMono, deva, arab, guru, guj, beng, tamil, thai]
  .map((f) => f.variable)
  .join(" ");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <SmoothScroll />
          <SideRail />
          <main className="overflow-x-clip md:pl-[76px]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
