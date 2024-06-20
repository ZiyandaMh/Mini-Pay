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
                setErrorMessage("Insufficient balance to complete the transaction.");
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
        <div className="flex flex-col items-center p-4 bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-lg">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">X-wave Minipay</h1>
                    {address && (
                        <>
                            <div className="text-gray-500 text-sm mt-2">Your address:</div>
                            <div className="font-bold text-sm break-all">{address}</div>
                            <div className="text-gray-500 text-sm mt-2">Your balance:</div>
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
                                    placeholder="Recipient Address"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>
                            <div className="w-full mb-3">
                                <input
                                    type="text"
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-3 border rounded-xl"
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
                                title="Send cUSD"
                                widthFull
                            />
                        </div>
                        <div className="w-full px-3 mt-4">
                            <div className="text-center">
                                <div className="font-bold">Recipient:</div>
                                <div>{recipient}</div>
                            </div>
                            <div className="text-center mt-2">
                                <div className="font-bold">Amount:</div>
                                <div>{amount} cUSD</div>
                            </div>
                        </div>
                        {transactionStatus && (
                            <p className="font-bold mt-4">
                                Transaction: {transactionStatus}
                            </p>
                            
                        )}
                    </>
                )}
                {tx && (
                    <p className="font-bold mt-4">
                        Tx Completed:{" "}
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
