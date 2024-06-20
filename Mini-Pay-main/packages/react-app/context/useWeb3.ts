import { useState } from "react";
// import StableTokenABI from "./cusd-abi.json";
// const { stableTokenABI } = require("@celo/abis");
import { stableTokenABI } from "@celo/abis";
import {
    createPublicClient,
    createWalletClient,
    custom,
    http,
    parseEther,
    getContract,
    formatEther
} from "viem";
import { celoAlfajores } from "viem/chains";

const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
});

const cUSDTokenAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Testnet address


export const useWeb3 = () => {
    const [address, setAddress] = useState<string | null>(null);

    const getUserAddress = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            let walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celoAlfajores,
            });

            let [address] = await walletClient.getAddresses();
            setAddress(address);
        }
    };

    const sendCUSD = async (to: any, amount: string) => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const amountInWei = parseEther(amount);

        const tx = await walletClient.writeContract({
            address: cUSDTokenAddress,
            abi: stableTokenABI,
            functionName: "transfer",
            account: address,
            args: [to, amountInWei],
        });

        let receipt = await publicClient.waitForTransactionReceipt({
            hash: tx,
        });

        return receipt;
    };

    
    const getBalance = async (address: any) => {
        const StableTokenContract = getContract({
            address: cUSDTokenAddress,
            abi: stableTokenABI,
            client: publicClient,
        });

        const balanceInBigNumber: any = await StableTokenContract.read.balanceOf([address]);

        const balanceInWei = balanceInBigNumber.toString();
        const balanceInCUSD = formatEther(balanceInWei);

        return balanceInCUSD;
    };

    const checkIfTransactionSucceeded = async (transactionHash: any) => {
        const receipt = await publicClient.getTransactionReceipt({ hash: transactionHash});
        return receipt.status === "success";
    };
 

    return {
        address,
        getUserAddress,
        sendCUSD,
        getBalance,
        checkIfTransactionSucceeded,
    };
};
