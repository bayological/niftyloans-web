import type { Metadata } from "next";
import { Main } from "./main";

export const metadata: Metadata = {
  title: "Nifty Loans",
  description: "Use your NFTs as collateral to borrow.",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Main />
    </main>
  );
}
