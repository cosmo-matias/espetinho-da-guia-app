"use client";

import { useState, useEffect, useMemo } from 'react';
import { getClosedOrders } from '@/lib/services/orderService';
import { Order } from '@/types';
import { Calendar, Trophy, DollarSign, ReceiptText } from 'lucide-react';

interface WaiterStats {
  waiterName: string;
  orderCount: number;
  totalSales: number;
}

export default function RelatoriosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const data = await getClosedOrders();
      setOrders(data);
      setLoading(false);
    };
    
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    let filtered = orders;
    
    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);
      filtered = filtered.filter(o => {
        const dateObj = o.createdAt instanceof Date ? o.createdAt : (o.createdAt as any).seconds ? new Date((o.createdAt as any).seconds * 1000) : new Date(o.createdAt);
        return dateObj >= start;
      });
    }
    
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59`);
      filtered = filtered.filter(o => {
        const dateObj = o.createdAt instanceof Date ? o.createdAt : (o.createdAt as any).seconds ? new Date((o.createdAt as any).seconds * 1000) : new Date(o.createdAt);
        return dateObj <= end;
      });
    }
    
    const waiterMap: Record<string, WaiterStats> = {};
    
    filtered.forEach(o => {
      const wName = o.waiterName || 'Sem Identificação';
      if (!waiterMap[wName]) {
        waiterMap[wName] = { waiterName: wName, orderCount: 0, totalSales: 0 };
      }
      waiterMap[wName].orderCount += 1;
      waiterMap[wName].totalSales += o.total;
    });
    
    const statsArray = Object.values(waiterMap);
    statsArray.sort((a, b) => b.totalSales - a.totalSales);
    
    return statsArray;
  }, [orders, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="text-orange-500" /> Relatório de Desempenho
          </h1>
          <p className="text-zinc-400 mt-1">Acompanhe as vendas por garçom no período.</p>
        </div>
        
        <div className="flex gap-4 items-center bg-zinc-900 p-3 rounded-lg border border-zinc-800">
          <Calendar className="text-zinc-500" />
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Data Inicial</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-sm outline-none focus:border-orange-500" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Data Final</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-sm outline-none focus:border-orange-500" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-500 py-10">Processando dados...</div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-medium text-zinc-400 w-16 text-center">Posição</th>
                  <th className="p-4 font-medium text-zinc-400">Garçom</th>
                  <th className="p-4 font-medium text-zinc-400 text-center">Comandas Atendidas</th>
                  <th className="p-4 font-medium text-zinc-400 text-right">Valor Total Vendido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {stats.map((stat, idx) => (
                  <tr key={stat.waiterName} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-zinc-300/20 text-zinc-300' : idx === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-zinc-800 text-zinc-500'}`}>
                        {idx + 1}º
                      </span>
                    </td>
                    <td className="p-4 font-medium text-zinc-100">{stat.waiterName}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-zinc-300">
                        <ReceiptText size={16} className="text-zinc-500" />
                        {stat.orderCount}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-emerald-400 font-medium">
                        <DollarSign size={16} />
                        {stat.totalSales.toFixed(2).replace('.', ',')}
                      </div>
                    </td>
                  </tr>
                ))}
                {stats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500">
                      Nenhuma venda registrada para o período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
