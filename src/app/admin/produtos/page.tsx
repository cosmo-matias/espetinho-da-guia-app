"use client";

import { useState, useEffect } from 'react';
import { getProducts, addProduct, deleteProduct, updateProduct } from '@/lib/services/productService';
import { Product, Category } from '@/types';
import { Trash2, Plus, Edit2 } from 'lucide-react';

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('ESPETINHOS');
  const [price, setPrice] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (product: Product) => {
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    setEditingId(product.id);
  };

  const cancelEdit = () => {
    setName('');
    setCategory('ESPETINHOS');
    setPrice('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    
    if (editingId) {
      await updateProduct(editingId, {
        name,
        category,
        price: parseFloat(price)
      });
      cancelEdit();
    } else {
      await addProduct({
        name,
        category,
        price: parseFloat(price),
        stockQuantity: 0
      });
      setName('');
      setPrice('');
    }
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      await deleteProduct(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestão de Produtos</h1>
      
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
          <div className="flex-1 w-full min-w-[200px]">
            <label className="block text-sm mb-1 text-zinc-400">Nome do Produto</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
              required 
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm mb-1 text-zinc-400">Categoria</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value as Category)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-50 outline-none focus:border-orange-500 transition-colors"
            >
              <option value="ESPETINHOS">Espetinhos</option>
              <option value="BEBIDAS">Bebidas</option>
              <option value="ADICIONAIS">Adicionais</option>
              <option value="CALDOS">Caldos</option>
              <option value="CACHACAS">Cachaças</option>
            </select>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm mb-1 text-zinc-400">Preço (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
              required 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
            <button type="submit" className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2">
              {editingId ? 'Salvar Alterações' : <><Plus size={20} /> Adicionar</>}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="p-4 font-medium text-zinc-400">Nome</th>
                <th className="p-4 font-medium text-zinc-400">Categoria</th>
                <th className="p-4 font-medium text-zinc-400">Preço</th>
                <th className="p-4 font-medium text-zinc-400">Estoque</th>
                <th className="p-4 font-medium text-zinc-400 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Carregando produtos...</td></tr> : 
                products.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4">{p.name}</td>
                    <td className="p-4"><span className="bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300">{p.category}</span></td>
                    <td className="p-4">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                    <td className="p-4 font-medium text-zinc-300">{p.stockQuantity || 0}</td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button onClick={() => handleEditClick(p)} className="text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-700">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
