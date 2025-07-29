import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ESCROW_UNIVERSAL_ABI, ESCROW_ADDRESS, TransactionStatus } from '../config/escrow';
import { formatEther } from 'viem';

export function useEscrowContract() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useTransaction = (transactionId: bigint) => {
    return useReadContract({
      address: ESCROW_ADDRESS,
      abi: ESCROW_UNIVERSAL_ABI,
      functionName: 'transactions',
      args: [transactionId],
    });
  };

  const useTransactionCount = () => {
    return useReadContract({
      address: ESCROW_ADDRESS,
      abi: ESCROW_UNIVERSAL_ABI,
      functionName: 'getTransactionCount',
    });
  };

  // Write functions
  const payTransaction = (transactionId: bigint, amount: bigint) => {
    writeContract({
      address: ESCROW_ADDRESS,
      abi: ESCROW_UNIVERSAL_ABI,
      functionName: 'pay',
      args: [transactionId, amount],
    });
  };

  const executeTransaction = (transactionId: bigint) => {
    writeContract({
      address: ESCROW_ADDRESS,
      abi: ESCROW_UNIVERSAL_ABI,
      functionName: 'executeTransaction',
      args: [transactionId],
    });
  };

  const acceptSettlement = (transactionId: bigint) => {
    writeContract({
      address: ESCROW_ADDRESS,
      abi: ESCROW_UNIVERSAL_ABI,
      functionName: 'acceptSettlement',
      args: [transactionId],
    });
  };

  return {
    useTransaction,
    useTransactionCount,
    payTransaction,
    executeTransaction,
    acceptSettlement,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}