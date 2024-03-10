export const ERC721_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
  "function setApprovalForAll(address, bool) external",
];

export const NIFTY_LOANS_ABI = [
  "function getLoanDetails(address) view returns (tuple(address,address,uint256,uint256,uint256,bool))",
  "function createLoan(address, uint256, uint256) external",
  "function repayLoan() external",
];

export const ERC20_ABI = ["function approve(address spender, uint256 amount) external returns (bool)"];
