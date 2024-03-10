"use client";

import { useSDK } from "@metamask/sdk-react";
import { MainCard } from "@/components/MainCard";

export function Main() {
  const { connected, account } = useSDK();
  const isConnected = connected && !!account;

  return (
    <div className="flex flex-col max-w-md w-full mx-auto gap-3 px-4 sm:pt-20 pt-4 pb-4">
      {isConnected ? (
        <MainCard />
      ) : (
        <div className="text-center">
          <p>Please connect your Metamask wallet to continue.</p>
        </div>
      )}
    </div>
  );
}
