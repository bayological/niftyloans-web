"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { MetaMaskProvider } from "@metamask/sdk-react";

const inter = Inter({ subsets: ["latin"] });

const host = typeof window !== "undefined" ? window.location.host : "defaultHost";

const sdkOptions = {
  logging: { developerMode: true },
  checkInstallationImmediately: false,
  dappMetadata: {
    name: "Nifty Loans",
    url: host,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MetaMaskProvider debug={true} sdkOptions={sdkOptions}>
          <NavBar />
          {children}
        </MetaMaskProvider>
      </body>
    </html>
  );
}
