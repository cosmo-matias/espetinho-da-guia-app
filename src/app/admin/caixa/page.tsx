"use client";

import { useState, useEffect } from 'react';
import { getTransactions, addTransaction, getCurrentOpenSession, openSession, closeSession } from '@/lib/services/transactionService';
import { CashTransaction, CashSession } from '@/types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function CaixaPage() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  
  const [initialBalance, setInitialBalance] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [transData, sessionData] = await Promise.all([
      getTransactions(),
      getCurrentOpenSession()
    ]);
    
    const sorted = transData.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : (a.date as any)?.seconds ? (a.date as any).seconds * 1000 : new Date(a.date).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : (b.date as any)?.seconds ? (b.date as any).seconds * 1000 : new Date(b.date).getTime();
      return (dateB || 0) - (dateA || 0);
    });
    
    setTransactions(sorted);
    setCurrentSession(sessionData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    await addTransaction({
      description,
      amount: parseFloat(amount),
      type,
      date: new Date(),
      sessionId: currentSession?.id
    });
    
    setDescription('');
    setAmount('');
    loadData();
  };

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    await openSession(parseFloat(initialBalance || '0'));
    setInitialBalance('');
    loadData();
  };

  const handleCloseSession = async () => {
    if (!currentSession) return;
    if (confirm('Tem certeza que deseja fechar o caixa?')) {
      await closeSession(currentSession.id, filteredBalance);
      loadData();
    }
  };

  const filteredTransactions = transactions.filter(t => {
    let dateObj = t.date instanceof Date ? t.date : (t.date as any).seconds ? new Date((t.date as any).seconds * 1000) : new Date(t.date);
    
    if (startDate && new Date(`${startDate}T00:00:00`) > dateObj) return false;
    if (endDate && new Date(`${endDate}T23:59:59`) < dateObj) return false;
    
    if (!startDate && !endDate && currentSession) {
      return t.sessionId === currentSession.id;
    }
    
    return true;
  });

  const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const expenses = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  
  const sessionInitial = (!startDate && !endDate && currentSession) ? currentSession.initialBalance : 0;
  const filteredBalance = sessionInitial + income - expenses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Controle de Caixa</h1>
        {currentSession && (
          <button onClick={handleCloseSession} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Fechar Caixa
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="text-zinc-500">Carregando dados...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-start mb-4">
                <span className="text-zinc-400 font-medium">Entradas</span>
                <TrendingUp className="text-emerald-500" size={24} />
              </div>
              <span className="text-3xl font-bold text-emerald-500">R$ {income.toFixed(2).replace('.', ',')}</span>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-start mb-4">
                <span className="text-zinc-400 font-medium">Saídas</span>
                <TrendingDown className="text-red-500" size={24} />
              </div>
              <span className="text-3xl font-bold text-red-500">R$ {expenses.toFixed(2).replace('.', ',')}</span>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-start mb-4">
                <span className="text-zinc-400 font-medium">Saldo Atual {sessionInitial > 0 && '(com troco)'}</span>
                <DollarSign className={filteredBalance >= 0 ? "text-emerald-500" : "text-red-500"} size={24} />
              </div>
              <span className={`text-3xl font-bold ${filteredBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                R$ {filteredBalance.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {!currentSession ? (
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4 text-orange-500">Caixa Fechado</h2>
              <p className="text-zinc-400 mb-4">Abra o caixa informando o troco inicial para começar a registrar movimentações.</p>
              <form onSubmit={handleOpenSession} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full md:max-w-xs">
                  <label className="block text-sm mb-1 text-zinc-400">Troco Inicial (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={initialBalance} 
                    onChange={e => setInitialBalance(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
                    required 
                  />
                </div>
                <button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                  Abrir Caixa
                </button>
              </form>
            </div>
          ) : (
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
          )}

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row gap-4 justify-between md:items-end">
              <h3 className="font-semibold text-lg">Histórico</h3>
              <div className="flex gap-4 items-center">
                <div className="flex flex-col">
                  <label className="text-xs text-zinc-400 mb-1">Data Início</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-50 outline-none focus:border-orange-500" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-zinc-400 mb-1">Data Fim</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-50 outline-none focus:border-orange-500" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="p-4 font-medium text-zinc-400">Data</th>
                    <th className="p-4 font-medium text-zinc-400">Descrição</th>
                    <th className="p-4 font-medium text-zinc-400">Tipo</th>
                    <th className="p-4 font-medium text-zinc-400">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredTransactions.map(t => {
                    let dateStr = '';
                    if (t.date) {
                      const dateObj = t.date instanceof Date ? t.date : (t.date as any).seconds ? new Date((t.date as any).seconds * 1000) : new Date(t.date);
                      dateStr = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });
                    }

                    return (
                      <tr key={t.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4 text-zinc-400 whitespace-nowrap">{dateStr}</td>
                        <td className="p-4">{t.description}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className={`p-4 font-medium whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                          R$ {t.amount.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500">
                        Nenhuma movimentação encontrada para o período/sessão.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
