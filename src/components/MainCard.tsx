import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useSDK } from "@metamask/sdk-react";
import { ethers, BrowserProvider, BigNumberish, parseEther, formatUnits } from "ethers";
import { COLLATERAL_NFT_ADDRESS, LOAN_TOKEN_ADDRESS, NIFTY_LOANS_ADDRESS } from "@/lib/addresses";
import { ERC20_ABI, ERC721_ABI, NIFTY_LOANS_ABI } from "@/lib/abis";
import { formatLoanStartTime } from "@/lib/utils";

// This is the interface for the loan details returned from the contract
interface Loan {
  borrower: string;
  nftAddress: string;
  nftId: BigNumberish;
  loanAmount: BigNumberish;
  loanStartTime: BigNumberish;
  isRepaid: boolean;
}

export const MainCard = () => {
  const { account } = useSDK();
  const [nftIds, setNftIds] = useState<string[]>([]);
  const [selectedNftId, setSelectedNftId] = useState<string>("");
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [loanDetails, setLoanDetails] = useState<Loan | null>(null);

  /**
   * Initializes the Ethereum provider using metamask
   */
  const initProvider = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setProvider(new BrowserProvider(window.ethereum));
      } catch (error) {
        console.error("Error initializing provider", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  useEffect(() => {
    initProvider();
  }, []);

  useEffect(() => {
    if (!account || !provider) return;

    /**
     * Fetches the loan details for the connected account
     */
    async function getLoans() {
      try {
        const contract = new ethers.Contract(NIFTY_LOANS_ADDRESS, NIFTY_LOANS_ABI, provider);
        const details = await contract.getLoanDetails(account);
        // TODO: fix typing
        if (details[4] === 0n) {
          setLoanDetails({
            borrower: account || "",
            nftAddress: "",
            nftId: 0,
            loanAmount: 0,
            loanStartTime: 0n,
            isRepaid: true,
          });
        } else {
          setLoanDetails({
            ...details,
            loanStartTime: details[4] || 0,
            loanAmount: details[3] || 0,
            nftId: details[2] || 0,
            nftAddress: details[1] || "",
          });
        }
      } catch (error) {
        console.error("Error fetching loans", error);
      }
    }

    /**
     * Fetches the NFTs owned by the connected account
     */
    async function loadNFTs() {
      try {
        const contract = new ethers.Contract(COLLATERAL_NFT_ADDRESS, ERC721_ABI, provider);
        const balance = await contract.balanceOf(account);

        const ids = [];
        for (let i = 0; i < balance; i++) {
          const id = await contract.tokenOfOwnerByIndex(account, i);
          ids.push(id.toString());
        }
        setNftIds(ids);
      } catch (error) {
        console.error("Error loading NFTs", error);
      }
    }

    loadNFTs();
    getLoans();
  }, [account, provider]);

  const hasLoan = (loan: Loan) => loan && loan.loanStartTime !== 0n;
  const canTakeLoan = () => {
    return !!loanDetails && !hasLoan(loanDetails) && !!selectedNftId && loanAmount > 0;
  };

  /**
   * Takes a loan using the selected NFT as collateral
   */
  const takeLoan = async () => {
    if (!selectedNftId || !loanAmount || loanAmount <= 0) {
      alert("Please enter a valid loan amount and select an NFT as collateral.");
      return;
    }

    if (!provider) {
      alert("Ethereum provider is not available. Please ensure MetaMask is connected.");
      return;
    }

    const signer = await provider.getSigner();
    const amount = parseEther(loanAmount.toString());

    try {
      const erc721Contract = new ethers.Contract(COLLATERAL_NFT_ADDRESS, ERC721_ABI, signer); 
      // await approveTx.wait();

      const niftyLoansContract = new ethers.Contract(NIFTY_LOANS_ADDRESS, NIFTY_LOANS_ABI, signer); 
      // await createLoanTx.wait();

      alert("Loan taken successfully!");
    } catch (error) {
      console.error("Error taking loan", error);
      alert("There was an error taking out the loan.");
    }
  };

  /**
   * Repays the outstanding loan
   */
  const repayLoan = async () => {
    if (!provider || !loanDetails) {
      alert("Cannot proceed without a provider and loan details.");
      return;
    }

    const signer = await provider.getSigner();

    const tokenContract = new ethers.Contract(LOAN_TOKEN_ADDRESS, ERC20_ABI, signer);
    await tokenContract.approve(NIFTY_LOANS_ADDRESS, loanDetails.loanAmount);

    const niftyLoansContract = new ethers.Contract(NIFTY_LOANS_ADDRESS, NIFTY_LOANS_ABI, signer);
    await niftyLoansContract.repayLoan();

    alert("Loan repaid successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nifty Loans</CardTitle>
        <CardDescription>Take a loan using an NFT as collateral</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 items-center">
          <p className="font-semibold">Choose collateral NFT</p>
          {nftIds.length > 0 ? (
            <div className="flex flex-col items-center gap-1">
              <Carousel className="mx-auto">
                <CarouselContent className="flex gap-2">
                  {nftIds.map((id, index) => (
                    <CarouselItem key={id} className="w-full">
                      <Card className={`${selectedNftId === id ? "bg-blue-100" : ""}`}>
                        <CardContent
                          className="flex flex-col items-center justify-center p-2 cursor-pointer"
                          onClick={() => setSelectedNftId(prevId => (prevId === id ? "" : id))}
                        >
                          <span className="text-md font-semibold">NFT: {id}</span>
                          <div className="w-full text-center">{<button>Use as collateral</button>}</div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          ) : (
            <p>No NFTs found</p>
          )}
          <div className="flex flex-col items-center w-full">
            <p className="font-semibold">Set Loan Amount</p>
            <input
              type="number"
              value={loanAmount}
              onChange={e => setLoanAmount(Number(e.target.value))}
              disabled={!selectedNftId}
              className="border-2 border-gray-200 rounded-md p-1 text-right w-3/4"
              placeholder="Enter amount"
            />
          </div>

          <div className="flex flex-col items-center w-full">
            <p className="font-semibold">Outstanding Loan</p>
            {loanDetails && hasLoan(loanDetails) ? (
              <div className="text-center">
                <p>Loan Start Time: {formatLoanStartTime(loanDetails.loanStartTime)}</p>
                <p>Loan Amount: {formatUnits(loanDetails.loanAmount)} ETH</p>
                <p>NFT ID: {loanDetails.nftId.toString()}</p>
                <p>{loanDetails.isRepaid ? "Loan Repaid" : "Loan Active"}</p>
              </div>
            ) : (
              <p>No outstanding loan</p>
            )}
          </div>

          <div className="flex flex-col items-center w-full mt-4">
            <button
              className={`font-bold py-2 px-4 rounded ${
                !canTakeLoan() ? "bg-red-500 hover:bg-red-700 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
              } text-white`}
              onClick={takeLoan}
              disabled={!canTakeLoan()}
              style={{ cursor: !canTakeLoan() ? "not-allowed" : "pointer" }}
            >
              Take Loan
            </button>
          </div>

          {loanDetails && hasLoan(loanDetails) && (
            <div className="flex flex-col items-center w-full mt-4">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={repayLoan}
              >
                Repay Loan
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
