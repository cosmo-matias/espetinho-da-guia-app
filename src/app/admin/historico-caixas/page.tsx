"use client";

import { useState, useEffect } from 'react';
import { getClosedSessions, getTransactions } from '@/lib/services/transactionService';
import { CashSession, CashTransaction } from '@/types';
import { Archive, Download } from 'lucide-react';
import { generateDailyReportPDF } from '@/lib/utils/pdfGenerator';

export default function HistoricoCaixasPage() {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [sessionsData, transactionsData] = await Promise.all([
        getClosedSessions(),
        getTransactions()
      ]);
      
      const sortedSessions = sessionsData.sort((a, b) => {
        const dateA = a.openedAt instanceof Date ? a.openedAt.getTime() : (a.openedAt as any)?.seconds ? (a.openedAt as any).seconds * 1000 : new Date(a.openedAt).getTime();
        const dateB = b.openedAt instanceof Date ? b.openedAt.getTime() : (b.openedAt as any)?.seconds ? (b.openedAt as any).seconds * 1000 : new Date(b.openedAt).getTime();
        return (dateB || 0) - (dateA || 0);
      });

      setSessions(sortedSessions);
      setTransactions(transactionsData);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleDownloadPDF = (session: CashSession) => {
    const sessionTransactions = transactions.filter(t => t.sessionId === session.id);
    generateDailyReportPDF(session, sessionTransactions);
  };

  const getFormatDate = (d: any) => {
    if (!d) return '-';
    const obj = d instanceof Date ? d : (d.seconds ? new Date(d.seconds * 1000) : new Date(d));
    return obj.toLocaleDateString('pt-BR') + ' ' + obj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Archive className="text-orange-500" /> Histórico de Caixas
        </h1>
        <p className="text-zinc-400 mt-1">Consulte os fechamentos anteriores e gere relatórios.</p>
      </div>

      {loading ? (
        <div className="text-zinc-500 py-10">Carregando histórico...</div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-medium text-zinc-400">Abertura</th>
                  <th className="p-4 font-medium text-zinc-400">Fechamento</th>
                  <th className="p-4 font-medium text-zinc-400 text-right">Troco Inicial</th>
                  <th className="p-4 font-medium text-zinc-400 text-right">Saldo Final</th>
                  <th className="p-4 font-medium text-zinc-400 w-24 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {sessions.map(session => (
                  <tr key={session.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-medium text-zinc-100">{getFormatDate(session.openedAt)}</td>
                    <td className="p-4 text-zinc-300">{getFormatDate(session.closedAt)}</td>
                    <td className="p-4 text-right text-zinc-300">
                      R$ {(session.initialBalance || 0).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-medium ${session.finalBalance && session.finalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        R$ {(session.finalBalance || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </td>
                    <td className="p-4 text-center flex justify-center">
                      <button 
                        onClick={() => handleDownloadPDF(session)} 
                        className="text-orange-500 hover:text-orange-400 transition-colors p-2 rounded-lg hover:bg-orange-500/10 flex items-center gap-1"
                        title="Baixar PDF"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      Nenhum caixa fechado até o momento.
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
