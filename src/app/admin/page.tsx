"use client";

import { useState, useEffect } from 'react';
import { getTransactions } from '@/lib/services/transactionService';
import { getOrders } from '@/lib/services/orderService';
import { getProducts } from '@/lib/services/productService';
import { TrendingUp, TrendingDown, Receipt, AlertTriangle, Package, DollarSign } from 'lucide-react';
import { Product } from '@/types';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    openOrders: 0,
    ticketMedio: 0
  });
  const [lowStock, setLowStock] = useState<Product[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const [transactions, orders, products] = await Promise.all([
        getTransactions(),
        getOrders(),
        getProducts()
      ]);

      const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
      const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
      
      const openOrders = orders.filter(o => o.status === 'OPEN' || o.status === 'CLOSING_REQUESTED').length;
      const closedOrders = orders.filter(o => o.status === 'CLOSED');
      
      const totalGanho = closedOrders.reduce((acc, o) => acc + o.total, 0);
      const ticketMedio = closedOrders.length > 0 ? totalGanho / closedOrders.length : 0;
      
      const lowStockProducts = products.filter(p => (p.stockQuantity || 0) < 10);

      setMetrics({
        income,
        expenses,
        balance: income - expenses,
        openOrders,
        ticketMedio
      });
      setLowStock(lowStockProducts);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Resumo gerencial e financeiro do dia.</p>
      </div>

      {loading ? (
        <div className="text-zinc-500">Carregando dados...</div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-200 border-b border-zinc-800 pb-2">Resumo Financeiro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-zinc-400 font-medium">Entradas</span>
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <TrendingUp className="text-emerald-500" size={24} />
                  </div>
                </div>
                <span className="text-3xl font-bold text-zinc-50">R$ {metrics.income.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-zinc-400 font-medium">Saídas</span>
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <TrendingDown className="text-red-500" size={24} />
                  </div>
                </div>
                <span className="text-3xl font-bold text-zinc-50">R$ {metrics.expenses.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-zinc-400 font-medium">Saldo</span>
                  <div className={`p-2 rounded-lg ${metrics.balance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <DollarSign className={metrics.balance >= 0 ? 'text-emerald-500' : 'text-red-500'} size={24} />
                  </div>
                </div>
                <span className={`text-3xl font-bold ${metrics.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  R$ {metrics.balance.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-200 border-b border-zinc-800 pb-2">Operação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 font-medium block mb-1">Comandas Abertas</span>
                  <span className="text-3xl font-bold text-orange-500">{metrics.openOrders}</span>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-full">
                  <Receipt className="text-orange-500" size={32} />
                </div>
              </div>

              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 font-medium block mb-1">Ticket Médio</span>
                  <span className="text-3xl font-bold text-emerald-500">R$ {metrics.ticketMedio.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-full">
                  <Package className="text-emerald-500" size={32} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-200 border-b border-zinc-800 pb-2 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={24} />
              Alertas de Estoque
            </h2>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              {lowStock.length > 0 ? (
                <ul className="space-y-3">
                  {lowStock.map(p => (
                    <li key={p.id} className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                      <span className="font-medium">{p.name} <span className="text-xs text-zinc-500 ml-2">({p.category})</span></span>
                      <span className="text-red-400 font-bold bg-red-400/10 px-3 py-1 rounded-full text-sm">
                        Restam: {p.stockQuantity || 0}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500 text-center py-4">Nenhum produto com estoque baixo.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
