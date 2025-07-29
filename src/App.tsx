import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { TransactionList } from './components/TransactionList';
import { useEscrowContract } from './hooks/useEscrowContract';
import { Transaction, TransactionStatus } from './config/escrow';
import { Wallet, LogOut, Gavel } from 'lucide-react';

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { useTransactionCount, useTransaction } = useEscrowContract();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const { data: transactionCount } = useTransactionCount();

  // Fetch all transactions
  useEffect(() => {
    if (!transactionCount) return;

    const fetchTransactions = async () => {
      const txs: Transaction[] = [];
      
      for (let i = 0; i < Number(transactionCount); i++) {
        // This would normally be done with a multicall or subgraph
        // For demo purposes, we'll create mock data
        txs.push({
          id: i.toString(),
          buyer: '0x1234567890123456789012345678901234567890',
          seller: '0x0987654321098765432109876543210987654321',
          amount: BigInt('1000000000000000000'), // 1 ETH
          settlementBuyer: BigInt('0'),
          settlementSeller: BigInt('0'),
          deadline: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24h from now
          disputeID: BigInt('0'),
          buyerFee: BigInt('0'),
          sellerFee: BigInt('0'),
          lastFeePaymentTime: BigInt('0'),
          status: i % 2 === 0 ? TransactionStatus.NoDispute : TransactionStatus.WaitingForBuyer,
          token: '0x0000000000000000000000000000000000000000', // ETH
        });
      }
      
      setTransactions(txs);
    };

    fetchTransactions();
  }, [transactionCount]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Gavel className="w-8 h-8 text-blue-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Kleros Escrow</h1>
            <p className="text-gray-600">Connect your wallet to manage your escrow transactions</p>
          </div>

          <div className="space-y-3">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect {connector.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Kleros Escrow</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button
                onClick={() => disconnect()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Transactions</h2>
          <p className="text-gray-600">
            Manage your escrow transactions. As a seller, you can execute transactions after the deadline
            or accept settlements. As a buyer, you can release payments or accept settlements.
          </p>
        </div>

        <TransactionList transactions={transactions} />
      </main>
    </div>
  );
}

export default App;
