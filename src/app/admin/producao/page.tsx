"use client";

import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/services/productService';
import { getProductions, addProduction } from '@/lib/services/productionService';
import { Product, DailyProduction } from '@/types';

export default function ProducaoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productions, setProductions] = useState<DailyProduction[]>([]);
  const [loading, setLoading] = useState(true);

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [prods, prodsData] = await Promise.all([
      getProducts(),
      getProductions()
    ]);
    
    setProducts(prods);
    
    const sorted = prodsData.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : (a.date as any)?.seconds ? (a.date as any).seconds * 1000 : new Date(a.date).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : (b.date as any)?.seconds ? (b.date as any).seconds * 1000 : new Date(b.date).getTime();
      return (dateB || 0) - (dateA || 0);
    });
    
    setProductions(sorted);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity || !unitCost) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    await addProduction({
      productId,
      productName: product.name,
      quantity: parseInt(quantity, 10),
      unitCost: parseFloat(unitCost),
      date: new Date()
    });
    
    setProductId('');
    setQuantity('');
    setUnitCost('');
    loadData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Produção do Dia</h1>
      
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Registrar Produção</h2>
        <form onSubmit={handleAdd} className="flex flex-col w-full md:flex-row gap-4 items-end flex-wrap">
          <div className="flex-1 w-full min-w-[200px]">
            <label className="block text-sm mb-1 text-zinc-400">Produto</label>
            <select 
              value={productId} 
              onChange={e => setProductId(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors"
              required
            >
              <option value="">Selecione um produto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm mb-1 text-zinc-400">Quantidade</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
              required 
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm mb-1 text-zinc-400">Custo Unit. (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={unitCost} 
              onChange={e => setUnitCost(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
              required 
            />
          </div>
          <button type="submit" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Registrar
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="p-4 font-medium text-zinc-400">Data/Hora</th>
                <th className="p-4 font-medium text-zinc-400">Produto</th>
                <th className="p-4 font-medium text-zinc-400">Qtd</th>
                <th className="p-4 font-medium text-zinc-400">Custo Unit.</th>
                <th className="p-4 font-medium text-zinc-400">Custo Total</th>
                <th className="p-4 font-medium text-zinc-400">Venda Proj.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Carregando produções...</td></tr> : 
                productions.map(prod => {
                  let dateStr = '';
                  if (prod.date) {
                    const dateObj = prod.date instanceof Date ? prod.date : (prod.date as any).seconds ? new Date((prod.date as any).seconds * 1000) : new Date(prod.date);
                    dateStr = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });
                  }
                  
                  const product = products.find(p => p.id === prod.productId);
                  const sellPrice = product ? product.price : 0;
                  const totalCost = prod.quantity * prod.unitCost;
                  const projectedSell = prod.quantity * sellPrice;
                  
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 text-zinc-400">{dateStr}</td>
                      <td className="p-4">{prod.productName}</td>
                      <td className="p-4">{prod.quantity}</td>
                      <td className="p-4 text-zinc-400">R$ {prod.unitCost.toFixed(2).replace('.', ',')}</td>
                      <td className="p-4 text-red-400 font-medium">R$ {totalCost.toFixed(2).replace('.', ',')}</td>
                      <td className="p-4 text-emerald-400 font-medium">R$ {projectedSell.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  );
                })}
              {(!loading && productions.length === 0) && (
                <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Nenhum registro de produção.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
