"use client";

import { useState, useEffect } from 'react';
import { getOrders, updateOrder } from '@/lib/services/orderService';
import { addTransaction } from '@/lib/services/transactionService';
import { Order } from '@/types';
import { CheckCircle2 } from 'lucide-react';

export default function GestaoComandasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    // Filtra apenas comandas abertas
    const openOrders = data.filter(order => order.status === 'OPEN');
    
    // Ordena da mais antiga para a mais recente
    openOrders.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : new Date(a.createdAt).getTime();
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : new Date(b.createdAt).getTime();
      return (dateA || 0) - (dateB || 0);
    });
    
    setOrders(openOrders);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCloseOrder = async (order: Order) => {
    if (confirm(`Deseja realmente fechar a conta da Mesa ${order.tableNumber}?`)) {
      try {
        await updateOrder(order.id, { status: 'CLOSED' });
        
        await addTransaction({
          type: 'INCOME',
          amount: order.total,
          description: `Fechamento Mesa ${order.tableNumber} - ${order.responsibleName}`,
          date: new Date()
        });
        
        loadOrders();
      } catch (error) {
        console.error("Erro ao fechar comanda:", error);
        alert("Ocorreu um erro ao tentar fechar a comanda.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestão de Comandas</h1>
      
      {loading ? (
        <div className="text-zinc-500">Carregando comandas abertas...</div>
      ) : orders.length === 0 ? (
        <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
          <p className="text-zinc-400">Nenhuma comanda aberta no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map(order => {
            let dateStr = '';
            if (order.createdAt) {
              const dateObj = order.createdAt instanceof Date 
                ? order.createdAt 
                : (order.createdAt as any).seconds 
                  ? new Date((order.createdAt as any).seconds * 1000) 
                  : new Date(order.createdAt);
              dateStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });
            }

            return (
              <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-orange-500">Mesa {order.tableNumber}</h2>
                    <p className="text-zinc-300 font-medium">{order.responsibleName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                      Aberta às {dateStr}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Itens Consumidos</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                        <div className="flex gap-2 text-zinc-300">
                          <span className="font-medium text-zinc-100">{item.quantity}x</span>
                          <span>{item.name}</span>
                        </div>
                        <span className="text-zinc-400">R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-5 bg-zinc-950/50 border-t border-zinc-800 mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-zinc-400 font-medium">Total</span>
                    <span className="text-2xl font-bold text-emerald-500">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button
                    onClick={() => handleCloseOrder(order)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Fechar Conta
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
