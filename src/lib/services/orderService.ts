import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Order } from '@/types';

const COLLECTION_NAME = 'orders';

export const getOrders = async (): Promise<Order[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const createOrder = async (order: Omit<Order, 'id'>) => {
  return await addDoc(collection(db, COLLECTION_NAME), order);
};

export const updateOrder = async (id: string, order: Partial<Omit<Order, 'id'>>) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, order);
};
