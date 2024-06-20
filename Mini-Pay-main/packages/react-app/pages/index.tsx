import { useEffect, useState } from "react";
import PrimaryButton from "@/components/Button";
import { useWeb3 } from "@/context/useWeb3";

export default function Home() {
    const {
        address,
        getUserAddress,
        sendCUSD,
        getBalance,
        checkIfTransactionSucceeded
    } = useWeb3();
    const [signingLoading, setSigningLoading] = useState(false);
    const [tx, setTx] = useState<any>(undefined);
    const [recipient, setRecipient] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [balance, setBalance] = useState<string>("");
    const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
   

    useEffect(() => {
        getUserAddress().then(async () => {
            if (address) {
                const userBalance = await getBalance(address);
                setBalance(userBalance);
            }
        });
    }, [address]);

    useEffect(() => {
        const checkStatus = async () => {
            if (tx) {
                const status = await checkIfTransactionSucceeded(tx.transactionHash);
                setTransactionStatus(status ? "Successful" : "Failed");
            }
        };
        checkStatus();
    }, [tx]);

    const sendingCUSD = async () => {
        if (recipient && amount) {
            const amountInCUSD = parseFloat(amount);
            const balanceInCUSD = parseFloat(balance);
            if (amountInCUSD > balanceInCUSD) {
                setErrorMessage("Less Amount to finish this transation.");
                return;
            }
            setSigningLoading(true);
            setErrorMessage(null);
            try {
                const tx = await sendCUSD(recipient, amount);
                setTx(tx);
                const userBalance = await getBalance(address!);
                setBalance(userBalance);
            } catch (error) {
                console.log(error);
            } finally {
                setSigningLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 to-gray-600">  {/* Background Gradient */}
            <div className="flex flex-col items-center justify-center h-24 w-48 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white px-8 py-4 shadow-lg hover:bg-gradient-to-l">
                <div className="text-center mb-6">
                
                    {address && (
                        <>
                        
                            <div className="text-white-500 text-sm mt-2">Balance:</div>
                            <div className="font-bold text-lg">{balance} cUSD</div>
                        </>
                    )}
                </div>
                {address && (
                    <>
                        <div className="flex flex-col items-center">
                            <div className="w-full mb-3">
                                <input
                                    type="text"
                                    placeholder="Transfer"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="w-full p-3 border border-gray-400"
                                />
                                
                            </div>
                            <div className="w-full mb-3">
                                <input
                                    type="text"
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-3 border border-gray-400"
                                />
                            </div>
                            {errorMessage && (
                                <div className="text-red-500 text-sm mb-3">
                                    {errorMessage}
                                </div>
                            )}
                            <PrimaryButton
                                loading={signingLoading}
                                onClick={sendingCUSD}
                                title="Transact"
                                widthFull
                            />
                        </div>
                        <div className="w-full px-3 mt-4">
                            <div className="text-center">
                                <div className="font-bold">Recipient:</div>
                                <div>{recipient}</div>
                            </div>
                         
                              
                            </div>
                        </div>
                        {transactionStatus && (
                            <p className="font-light mt-4">
                                Transaction Status: {transactionStatus}
                            </p>
                            
                        )}
                    </>
                )}
                {tx && (
                    <p className="font-light mt-4 ">
                        Success:{" "}
                        {(tx.transactionHash as string).substring(0, 6)}
                        ...
                        {(tx.transactionHash as string).substring(
                            tx.transactionHash.length - 6,
                            tx.transactionHash.length
                        )}
                    </p>
                )}
            </div>
        </div>
    );
}
