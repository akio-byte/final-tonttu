import type { Metadata } from "next";
import { Cinzel, Lato, Mountains_of_Christmas } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" });
const mountains = Mountains_of_Christmas({ weight: ["700"], subsets: ["latin"], variable: "--font-mountains" });

export const metadata: Metadata = {
  title: "TonttuTekijä - Elf Generator",
  description: "Transform yourself into Santa's helper!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${lato.variable} ${mountains.variable} bg-nordic-dark text-nordic-snow antialiased min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}