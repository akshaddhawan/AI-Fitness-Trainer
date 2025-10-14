import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import ConvexClerkProvider from "@/providers/ConvexClerkProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeFlex AI - Premium Gamified AI Fitness Trainer",
  description: "Generate personalized workouts and macro targets using advanced AI models. Train with rest stopwatch trackers, voice integration, and custom trophies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}>
        <ConvexClerkProvider>
          <Navbar />
          
          {/* Animated aurora glow effect in background */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-aurora pointer-events-none z-0" />
          <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-cyber-violet/10 rounded-full blur-3xl animate-aurora pointer-events-none z-0" style={{ animationDelay: "-5s" }} />

          <main className="flex-grow pt-20 relative z-10">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          
          <Footer />
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
