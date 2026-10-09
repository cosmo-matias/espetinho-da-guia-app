"use client";

import { useState, useEffect } from 'react';
import { getCurrentOpenSession } from '@/lib/services/transactionService';
import { getOrders } from '@/lib/services/orderService';
import Link from 'next/link';
import { X } from 'lucide-react';

export function InactivityAlert() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkInactivity = async () => {
      try {
        const session = await getCurrentOpenSession();
        if (!session) return;

        const orders = await getOrders();
        
        const sortedOrders = orders.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : new Date(a.createdAt).getTime();
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : new Date(b.createdAt).getTime();
          return (dateB || 0) - (dateA || 0);
        });

        const now = Date.now();
        let lastActivityTime = session.openedAt instanceof Date ? session.openedAt.getTime() : (session.openedAt as any)?.seconds ? (session.openedAt as any).seconds * 1000 : new Date(session.openedAt).getTime();
        
        if (sortedOrders.length > 0) {
          const latestOrder = sortedOrders[0];
          const latestOrderTime = latestOrder.createdAt instanceof Date ? latestOrder.createdAt.getTime() : (latestOrder.createdAt as any)?.seconds ? (latestOrder.createdAt as any).seconds * 1000 : new Date(latestOrder.createdAt).getTime();
          if (latestOrderTime > lastActivityTime) {
            lastActivityTime = latestOrderTime;
          }
        }

        const diff = now - lastActivityTime;
        if (diff > 3600000) { 
          setShowAlert(true);
        }
      } catch (error) {
        console.error("Erro ao verificar inatividade:", error);
      }
    };

    checkInactivity(); 
    const interval = setInterval(checkInactivity, 5 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);

  if (!showAlert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-orange-600 text-white p-4 rounded-lg shadow-lg flex flex-col gap-2 max-w-sm">
      <div className="flex justify-between items-start gap-4">
        <p className="font-semibold text-sm">Atenção: Nenhum pedido na última hora. O expediente encerrou?</p>
        <button onClick={() => setShowAlert(false)} className="text-white hover:text-zinc-200" title="Fechar">
          <X size={20} />
        </button>
      </div>
      <Link onClick={() => setShowAlert(false)} href="/admin/caixa" className="bg-white text-orange-600 text-center py-2 rounded-md font-medium hover:bg-zinc-100 transition-colors text-sm">
        Ir para o Caixa
      </Link>
    </div>
  );
}
