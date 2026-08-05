import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Bodoni } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/app/app-header";
import { SiteFooter } from "@/components/app/site-footer";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const libreBodoni = Libre_Bodoni({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Atelier — Digital Wardrobe & Style Hub",
    template: "%s · Atelier",
  },
  description:
    "A smart digital wardrobe. Track cost-per-wear, manage inventory and laundry, and get colour-wheel-matched outfit recommendations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${libreBodoni.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <AppHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </TooltipProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
