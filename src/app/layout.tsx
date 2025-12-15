import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; 
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CookHub",
  description: "Your recipes",
  icons: {
    icon: new URL("./icon.svg", import.meta.url),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
              <Navbar />
              {children}
          </ThemeProvider>
        </AuthProvider>
        <ScrollToTop />
      </body>
    </html>
  );
}
