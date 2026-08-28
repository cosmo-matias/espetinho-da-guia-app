import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, doc, updateDoc } from 'firebase/firestore';
import { CashTransaction, CashSession } from '@/types';

const COLLECTION_NAME = 'transactions';
const SESSIONS_COLLECTION = 'cash_sessions';

export const getTransactions = async (): Promise<CashTransaction[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashTransaction));
};

export const getCurrentOpenSession = async (): Promise<CashSession | null> => {
  const q = query(collection(db, SESSIONS_COLLECTION), where('status', '==', 'OPEN'));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const sessionDoc = querySnapshot.docs[0];
  return { id: sessionDoc.id, ...sessionDoc.data() } as CashSession;
};

export const addTransaction = async (transaction: Omit<CashTransaction, 'id'>) => {
  if (!transaction.sessionId) {
    const session = await getCurrentOpenSession();
    if (session) {
      transaction.sessionId = session.id;
    }
  }
  return await addDoc(collection(db, COLLECTION_NAME), transaction);
};

export const openSession = async (initialBalance: number) => {
  return await addDoc(collection(db, SESSIONS_COLLECTION), {
    openedAt: new Date(),
    initialBalance,
    status: 'OPEN'
  });
};

export const closeSession = async (sessionId: string, finalBalance: number) => {
  const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
  return await updateDoc(docRef, {
    closedAt: new Date(),
    finalBalance,
    status: 'CLOSED'
  });
};
