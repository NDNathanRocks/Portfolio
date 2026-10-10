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
import SideRail from "@/components/SideRail";
import SmoothScroll from "@/components/SmoothScroll";
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
  title: "Nathan Nicholas D'Souza | AI & Full-Stack Engineer",
  description:
    "Portfolio of Nathan Nicholas D'Souza, an AI & Full-Stack Engineer based in Vancouver, BC.",
};

const fontVars = [archivo, bricolage, dmMono, deva, arab, guru, guj, beng, tamil, thai]
  .map((f) => f.variable)
  .join(" ");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <SmoothScroll />
        <SideRail />
        <main className="md:pl-[76px]">{children}</main>
      </body>
    </html>
  );
}
