"use client";

import { useState, useEffect } from 'react';
import { getProducts, addProduct, deleteProduct } from '@/lib/services/productService';
import { Product, Category } from '@/types';
import { Trash2 } from 'lucide-react';

const CATEGORIES: Category[] = ['ESPETINHOS', 'BEBIDAS', 'CACHACAS', 'CALDOS', 'ADICIONAIS'];

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('ESPETINHOS');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    await addProduct({ name, category, price: parseFloat(price) });
    setName('');
    setPrice('');
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover este produto?')) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciamento de Produtos</h1>
      
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Produto</h2>
        <form onSubmit={handleAdd} className="flex flex-col w-full md:flex-row gap-4 items-end flex-wrap">
          <div className="flex-1 w-full min-w-[200px]">
            <label className="block text-sm mb-1 text-zinc-400">Nome do Produto</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors" required />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm mb-1 text-zinc-400">Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm mb-1 text-zinc-400">Preço (R$)</label>
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-50 outline-none focus:border-orange-500 transition-colors" required />
          </div>
          <button type="submit" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Adicionar
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="p-4 font-medium text-zinc-400">Nome</th>
              <th className="p-4 font-medium text-zinc-400">Categoria</th>
              <th className="p-4 font-medium text-zinc-400">Preço</th>
              <th className="p-4 font-medium text-zinc-400 w-20 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Carregando produtos...</td></tr> : 
              products.map(p => (
                <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4">{p.name}</td>
                  <td className="p-4"><span className="bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300">{p.category}</span></td>
                  <td className="p-4">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            {(!loading && products.length === 0) && (
              <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Nenhum produto cadastrado.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
