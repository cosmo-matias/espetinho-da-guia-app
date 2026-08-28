import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { CashTransaction } from '@/types';

const COLLECTION_NAME = 'transactions';

export const getTransactions = async (): Promise<CashTransaction[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashTransaction));
};

export const addTransaction = async (transaction: Omit<CashTransaction, 'id'>) => {
  return await addDoc(collection(db, COLLECTION_NAME), transaction);
};
