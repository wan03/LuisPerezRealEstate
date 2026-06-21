import type { Metadata } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { LocaleProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import ThemeToggle from "@/components/ThemeToggle";

// Applies the persisted theme before first paint to avoid a flash of the
// wrong theme. Default is dark, so we only set the attribute for light.
const themeScript = `(function(){try{if(localStorage.getItem('lp-theme')==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Luis Perez Real Estate | Lakeland & Tampa Bay FL",
  description: "High-performance real estate for the I-4 corridor — Lakeland & Tampa Bay, FL. TikTok-style walkthroughs, precise PITI+ math, and a completely transparent transaction roadmap.",
  openGraph: {
    title: "Luis Perez Real Estate | Lakeland & Tampa Bay FL",
    description: "Own the I-4 corridor. High-performance real estate with transparent PITI+ calculators and a bilingual team.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${archivo.variable} ${spaceMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LocaleProvider>
            <ToastProvider>
              {children}
              <ThemeToggle />
            </ToastProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
