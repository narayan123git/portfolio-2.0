import "./globals.css";
import HackerMode from "@/components/HackerMode";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "Narayan Paul | Engineering Portfolio",
  description: "Secure full-stack portfolio featuring projects, writing, and an admin command center.",
  applicationName: "Narayan Paul Portfolio",
  keywords: [
    "Narayan Paul",
    "portfolio",
    "full stack developer",
    "web development",
    "software engineer",
    "next.js",
    "node.js",
    "cybersecurity",
  ],
  authors: [{ name: "Narayan Paul" }],
  creator: "Narayan Paul",
  publisher: "Narayan Paul",
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Narayan Paul | Engineering Portfolio",
    description: "Secure full-stack portfolio featuring projects, writing, and an admin command center.",
    type: "website",
    locale: "en_US",
    siteName: "Narayan Paul Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Narayan Paul | Engineering Portfolio",
    description: "Secure full-stack portfolio featuring projects, writing, and an admin command center.",
  },
  verification: {
    google: "W_Jnv4c-3Gy-uMM1gRx5a4yyE8jQ-YAs0LmOuIvk0Ao",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} site-body antialiased min-h-screen flex flex-col justify-between`}>
        <CustomCursor />
        <HackerMode />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}