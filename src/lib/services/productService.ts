import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Product } from '@/types';

const COLLECTION_NAME = 'products';

export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  return await addDoc(collection(db, COLLECTION_NAME), product);
};

export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id'>>) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, product);
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(docRef);
};
