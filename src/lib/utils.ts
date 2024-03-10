import { type ClassValue, clsx } from "clsx";
import { BigNumberish } from "ethers";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBalance = (rawBalance: string) => {
  const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
  return balance;
};

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = parseInt(chainIdHex);
  return chainIdNum;
};

export const formatAddress = (addr: string | undefined) => {
  return `${addr?.substring(0, 8)}...`;
};

export const formatLoanStartTime = (timestamp: BigNumberish) => {
  console.log("timestamp", timestamp);
  if (!timestamp) return "Timestamp not available";

  const numberTimestamp = Number(timestamp);
  if (Number.isNaN(numberTimestamp)) return "Invalid timestamp";

  const date = new Date(numberTimestamp * 1000);

  try {
    return date.toLocaleString("en-US", {
      weekday: "long",
      day: "numeric",
      year: "numeric",
      month: "long",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error formatting date";
  }
};
