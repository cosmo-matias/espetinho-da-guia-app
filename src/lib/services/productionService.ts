import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { DailyProduction } from '@/types';

const COLLECTION_NAME = 'productions';

export const getProductions = async (): Promise<DailyProduction[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyProduction));
};

export const addProduction = async (production: Omit<DailyProduction, 'id'>) => {
  return await addDoc(collection(db, COLLECTION_NAME), production);
};
