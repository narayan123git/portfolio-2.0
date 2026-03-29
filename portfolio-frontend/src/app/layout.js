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