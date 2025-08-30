import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Nathan Dsouza — Portfolio",
  description: "Computing Science portfolio timeline"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const year = 2025;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-gray-900/60 border-b border-black/5 dark:border-white/10">
            <div className="container flex items-center justify-between h-14">
              <Link href="/" className="font-semibold tracking-tight">Nathan Dsouza</Link>
              <nav className="flex items-center gap-4 text-sm">
                <a href="#projects" className="hover:underline">Projects</a>
                <a href="#contact" className="hover:underline">Contact</a>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="container py-10 text-sm text-gray-500 dark:text-gray-400">
            © <span id="year">{year}</span> Nathan Dsouza. All rights reserved.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
