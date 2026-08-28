import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { Order, OrderItem } from '@/types';

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

export const getOrdersByWaiter = async (waiterName: string): Promise<Order[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("waiterName", "==", waiterName),
    where("status", "==", "OPEN")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const addItemsToOrder = async (orderId: string, newItems: OrderItem[]) => {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const orderData = docSnap.data() as Order;
    const updatedItems = [...orderData.items, ...newItems];
    const newTotal = updatedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    await updateDoc(docRef, {
      items: updatedItems,
      total: newTotal
    });
  }
};
