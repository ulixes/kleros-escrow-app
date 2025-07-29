import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { Transaction, TransactionStatus, getStatusLabel } from '../config/escrow';
import { useEscrowContract } from '../hooks/useEscrowContract';
import { Clock, User, DollarSign, Zap } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { address } = useAccount();
  const { payTransaction, executeTransaction, acceptSettlement, isPending } = useEscrowContract();

  const isSeller = address?.toLowerCase() === transaction.seller.toLowerCase();
  const isBuyer = address?.toLowerCase() === transaction.buyer.toLowerCase();
  const isExpired = BigInt(Date.now()) > transaction.deadline * 1000n;

  const handlePay = () => {
    if (isBuyer) {
      payTransaction(BigInt(transaction.id), transaction.amount);
    }
  };

  const handleExecute = () => {
    if (isSeller && isExpired && transaction.status === TransactionStatus.NoDispute) {
      executeTransaction(BigInt(transaction.id));
    }
  };

  const handleAcceptSettlement = () => {
    if ((isBuyer || isSeller) && 
        (transaction.status === TransactionStatus.WaitingForBuyer || 
         transaction.status === TransactionStatus.WaitingForSeller)) {
      acceptSettlement(BigInt(transaction.id));
    }
  };

  const getActionButton = () => {
    if (isPending) {
      return (
        <button disabled className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg">
          Processing...
        </button>
      );
    }

    // Buyer actions
    if (isBuyer) {
      if (transaction.status === TransactionStatus.NoDispute) {
        return (
          <button
            onClick={handlePay}
            className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <DollarSign className="inline w-4 h-4 mr-2" />
            Release Payment
          </button>
        );
      }
      
      if (transaction.status === TransactionStatus.WaitingForBuyer && 
          transaction.settlementBuyer > 0n) {
        return (
          <button
            onClick={handleAcceptSettlement}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Accept Settlement ({formatEther(transaction.settlementBuyer)} ETH)
          </button>
        );
      }
    }

    // Seller actions
    if (isSeller) {
      if (transaction.status === TransactionStatus.NoDispute && isExpired) {
        return (
          <button
            onClick={handleExecute}
            className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Zap className="inline w-4 h-4 mr-2" />
            Execute Transaction
          </button>
        );
      }

      if (transaction.status === TransactionStatus.WaitingForSeller && 
          transaction.settlementSeller > 0n) {
        return (
          <button
            onClick={handleAcceptSettlement}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Accept Settlement ({formatEther(transaction.settlementSeller)} ETH)
          </button>
        );
      }
    }

    return null;
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.NoDispute:
        return 'bg-green-100 text-green-800';
      case TransactionStatus.WaitingForBuyer:
      case TransactionStatus.WaitingForSeller:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionStatus.DisputeCreated:
        return 'bg-red-100 text-red-800';
      case TransactionStatus.Resolved:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">
          Transaction #{transaction.id}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
          {getStatusLabel(transaction.status)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <DollarSign className="w-4 h-4 mr-2" />
          <span>{formatEther(transaction.amount)} ETH</span>
        </div>

        <div className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {isBuyer ? 'You are the buyer' : isSeller ? 'You are the seller' : 'Not your transaction'}
          </span>
        </div>

        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm">
            Deadline: {new Date(Number(transaction.deadline) * 1000).toLocaleDateString()}
            {isExpired && ' (Expired)'}
          </span>
        </div>
      </div>

      {getActionButton()}
    </div>
  );
}