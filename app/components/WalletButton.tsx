"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function WalletButton() {
  return (
    <WalletMultiButton style={{ 
      background: 'white', 
      color: 'black', 
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: 600,
      fontSize: '14px'
    }} />
  );
}
