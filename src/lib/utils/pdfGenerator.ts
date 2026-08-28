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
