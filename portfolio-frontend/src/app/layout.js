import "./globals.css";

export const metadata = {
  title: "Narayan Paul | Secure Portfolio",
  description: "B.Tech CSE | Software Engineer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}