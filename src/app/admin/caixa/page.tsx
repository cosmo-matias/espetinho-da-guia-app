"use client";

import { useState, useEffect } from 'react';
import { getTransactions, addTransaction } from '@/lib/services/transactionService';
import { CashTransaction } from '@/types';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function CaixaPage() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    const data = await getTransactions();
    
    // Ordena as transações da mais recente para a mais antiga
    const sorted = data.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : (a.date as any)?.seconds ? (a.date as any).seconds * 1000 : new Date(a.date).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : (b.date as any)?.seconds ? (b.date as any).seconds * 1000 : new Date(b.date).getTime();
      return (dateB || 0) - (dateA || 0);
    });
    setTransactions(sorted);
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    await addTransaction({
      description,
      type,
      amount: parseFloat(amount),
      date: new Date()
    });
    
    setDescription('');
    setAmount('');
    loadTransactions();
  };

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Controle de Caixa</h1>
      
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Entradas</p>
            <p className="text-2xl font-bold text-emerald-500">R$ {totalIncome.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Saídas</p>
            <p className="text-2xl font-bold text-red-500">R$ {totalExpense.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Saldo Atual</p>
            <p className="text-2xl font-bold text-orange-500">R$ {balance.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </div>

      {/* Formulário de Lançamento */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Novo Lançamento</h2>
        <form onSubmit={handleAdd} className="flex flex-col w-full md:flex-row gap-4 items-end flex-wrap">
          <div className="flex-1 w-full min-w-[200px]">
            <label className="block text-sm mb-1 text-zinc-400">Descrição</label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
              required 
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm mb-1 text-zinc-400">Tipo</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value as 'INCOME' | 'EXPENSE')} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors"
            >
              <option value="INCOME">Entrada</option>
              <option value="EXPENSE">Saída</option>
            </select>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm mb-1 text-zinc-400">Valor (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
              required 
            />
          </div>
          <button type="submit" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Registrar
          </button>
        </form>
      </div>

      {/* Histórico de Movimentações */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="p-4 font-medium text-zinc-400">Data</th>
              <th className="p-4 font-medium text-zinc-400">Descrição</th>
              <th className="p-4 font-medium text-zinc-400">Tipo</th>
              <th className="p-4 font-medium text-zinc-400">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Carregando transações...</td></tr> : 
              transactions.map(t => {
                let dateStr = '';
                if (t.date) {
                  const dateObj = t.date instanceof Date ? t.date : (t.date as any).seconds ? new Date((t.date as any).seconds * 1000) : new Date(t.date);
                  dateStr = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });
                }
                
                return (
                  <tr key={t.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 text-zinc-400">{dateStr}</td>
                    <td className="p-4">{t.description}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {t.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}
                      </span>
                    </td>
                    <td className={`p-4 font-medium ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                );
              })}
            {(!loading && transactions.length === 0) && (
              <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Nenhuma movimentação registrada.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
