import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/types';

export const generateOrderPDF = (order: Order) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Espetinho da Guia', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Mesa: ${order.tableNumber}`, 14, 35);
  doc.text(`Cliente: ${order.responsibleName}`, 14, 42);
  doc.text(`Garçom: ${order.waiterName || '-'}`, 14, 49);
  
  let dateStr = '';
  if (order.createdAt) {
    const dateObj = order.createdAt instanceof Date ? order.createdAt : (order.createdAt as any).seconds ? new Date((order.createdAt as any).seconds * 1000) : new Date(order.createdAt);
    dateStr = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR');
  }
  doc.text(`Data: ${dateStr}`, 14, 56);

  const tableData = order.items.map(item => [
    item.name,
    item.quantity.toString(),
    `R$ ${item.unitPrice.toFixed(2).replace('.', ',')}`,
    `R$ ${(item.quantity * item.unitPrice).toFixed(2).replace('.', ',')}`
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['Produto', 'Qtd', 'V. Unit', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 65;
  
  doc.setFontSize(14);
  doc.text(`Total a Pagar: R$ ${order.total.toFixed(2).replace('.', ',')}`, 14, finalY + 15);

  doc.save(`comanda-mesa-${order.tableNumber}.pdf`);
};

export const generateDailyReportPDF = (session: any, transactions: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Relatorio de Fechamento de Caixa - Espetinho da Guia', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`ID da Sessão: ${session.id}`, 14, 35);
  
  const getFormatDate = (d: any) => {
    if (!d) return '-';
    const obj = d instanceof Date ? d : (d.seconds ? new Date(d.seconds * 1000) : new Date(d));
    return obj.toLocaleDateString('pt-BR') + ' ' + obj.toLocaleTimeString('pt-BR');
  };

  doc.text(`Abertura: ${getFormatDate(session.openedAt)}`, 14, 42);
  doc.text(`Fechamento: ${getFormatDate(session.closedAt)}`, 14, 49);
  doc.text(`Troco Inicial: R$ ${(session.initialBalance || 0).toFixed(2).replace('.', ',')}`, 14, 56);
  doc.text(`Saldo Final: R$ ${(session.finalBalance || 0).toFixed(2).replace('.', ',')}`, 14, 63);

  const tableData = transactions.map(t => [
    t.description,
    t.type === 'INCOME' ? 'Entrada' : 'Saída',
    `R$ ${t.amount.toFixed(2).replace('.', ',')}`,
    getFormatDate(t.date)
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Descrição', 'Tipo', 'Valor', 'Data']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] }
  });

  doc.save(`fechamento-caixa-${session.id}.pdf`);
};
