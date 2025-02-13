import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata = {
  title: "Hade's Pomegranates",
  description: "Digital Tools for Tabletop Gaming",
  openGraph: {
    title: "Hade's Pomegranates",
    description: "Digital Tools for Tabletop Gaming",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hade's Pomegranates",
    description: "Digital Tools for Tabletop Gaming"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
