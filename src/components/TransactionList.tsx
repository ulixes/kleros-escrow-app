import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { TransactionCard } from './TransactionCard';
import { Transaction, TransactionStatus, getStatusLabel } from '../config/escrow';
import { Filter } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { address } = useAccount();
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'all'>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'buyer' | 'seller'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Status filter
      if (selectedStatus !== 'all' && tx.status !== selectedStatus) {
        return false;
      }

      // User role filter
      if (userFilter === 'buyer' && tx.buyer.toLowerCase() !== address?.toLowerCase()) {
        return false;
      }
      if (userFilter === 'seller' && tx.seller.toLowerCase() !== address?.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [transactions, selectedStatus, userFilter, address]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    filteredTransactions.forEach(tx => {
      const status = getStatusLabel(tx.status);
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TransactionStatus | 'all')}
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value={TransactionStatus.NoDispute}>Active</option>
            <option value={TransactionStatus.WaitingForBuyer}>Awaiting Buyer</option>
            <option value={TransactionStatus.WaitingForSeller}>Awaiting Seller</option>
            <option value={TransactionStatus.DisputeCreated}>In Dispute</option>
            <option value={TransactionStatus.Resolved}>Resolved</option>
          </select>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value as 'all' | 'buyer' | 'seller')}
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Transactions</option>
            <option value="buyer">As Buyer</option>
            <option value="seller">As Seller</option>
          </select>
        </div>
      </div>

      {/* Grouped Transactions */}
      {Object.entries(groupedTransactions).map(([status, txs]) => (
        <div key={status} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
            {status} ({txs.length})
          </h2>
          <div className="grid gap-4">
            {txs.map(tx => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        </div>
      ))}

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No transactions found matching your filters.</p>
        </div>
      )}
    </div>
  );
}