import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TonttuTekijä",
  description: "A magical Finnish Christmas kiosk app that transforms users into Santa's helpers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@400;700&family=Mountains+of+Christmas:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-nordic-dark text-nordic-snow antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}