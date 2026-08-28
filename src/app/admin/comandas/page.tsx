"use client";

import { useState, useEffect } from 'react';
import { getOrders, updateOrder } from '@/lib/services/orderService';
import { addTransaction } from '@/lib/services/transactionService';
import { Order } from '@/types';
import { CheckCircle2, UserCircle, Receipt } from 'lucide-react';

export default function GestaoComandasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    // Filtra comandas abertas ou com fechamento solicitado
    const openOrders = data.filter(order => order.status === 'OPEN' || order.status === 'CLOSING_REQUESTED');
    
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
          description: `Fechamento Mesa ${order.tableNumber} - ${order.responsibleName} ${order.paymentMethod ? `(${order.paymentMethod})` : ''}`,
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
        <div className="text-zinc-500">Carregando comandas...</div>
      ) : orders.length === 0 ? (
        <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
          <p className="text-zinc-400">Nenhuma comanda ativa no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            const isClosing = order.status === 'CLOSING_REQUESTED';

            return (
              <div key={order.id} className={`border rounded-xl overflow-hidden flex flex-col transition-colors ${isClosing ? 'bg-orange-950/20 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'bg-zinc-900 border-zinc-800'}`}>
                <div className={`p-5 border-b flex flex-col gap-2 ${isClosing ? 'bg-orange-900/20 border-orange-500/30' : 'bg-zinc-950/50 border-zinc-800'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-orange-500">Mesa {order.tableNumber}</h2>
                      <p className="text-zinc-300 font-medium">{order.responsibleName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-md border ${isClosing ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
                        {isClosing ? 'FECHAMENTO SOLICITADO' : `Aberta às ${dateStr}`}
                      </span>
                    </div>
                  </div>
                  {order.waiterName && (
                    <div className="flex items-center gap-1.5 text-sm text-zinc-400 mt-2">
                      <UserCircle size={16} />
                      <span>Garçom: <strong className="text-zinc-300 font-medium">{order.waiterName}</strong></span>
                    </div>
                  )}
                  {isClosing && order.paymentMethod && (
                    <div className="flex items-center gap-1.5 text-sm text-orange-400 mt-1">
                      <Receipt size={16} />
                      <span>Pagamento: <strong>{order.paymentMethod}</strong></span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Itens Consumidos</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {order.items.map((item, idx) => (
                      <div key={idx} className={`flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0 ${isClosing ? 'border-orange-500/10' : 'border-zinc-800/50'}`}>
                        <div className="flex gap-2 text-zinc-300">
                          <span className="font-medium text-zinc-100">{item.quantity}x</span>
                          <span>{item.name}</span>
                        </div>
                        <span className="text-zinc-400">R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`p-5 border-t mt-auto ${isClosing ? 'bg-orange-950/40 border-orange-500/30' : 'bg-zinc-950/50 border-zinc-800'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-zinc-400 font-medium">Total</span>
                    <span className="text-2xl font-bold text-emerald-500">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button
                    onClick={() => handleCloseOrder(order)}
                    className={`w-full font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${isClosing ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                  >
                    <CheckCircle2 size={18} />
                    {isClosing ? 'Confirmar Pagamento' : 'Fechar Conta'}
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
