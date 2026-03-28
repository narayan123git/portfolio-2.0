import "./globals.css";
import HackerMode from "@/components/HackerMode";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Narayan Paul | Secure Portfolio",
  description: "B.Tech CSE | Software Engineer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 antialiased min-h-screen flex flex-col justify-between">
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