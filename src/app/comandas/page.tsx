"use client";

import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/services/productService';
import { createOrder } from '@/lib/services/orderService';
import { Product, Category, OrderItem } from '@/types';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

export default function ComandasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    loadProducts();

    const savedWaiter = localStorage.getItem('@espetinho:garcom');
    if (savedWaiter) {
      setWaiterName(savedWaiter);
    }
  }, []);

  const handleQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      return { ...prev, [productId]: next };
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const product = products.find(p => p.id === id);
      if (!product) return total;
      return total + (product.price * qty);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!tableNumber || !responsibleName || !waiterName) {
      alert('Preencha a mesa, o cliente e o seu nome (garçom).');
      return;
    }

    const items: OrderItem[] = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = products.find(p => p.id === id)!;
        return {
          productId: product.id,
          name: product.name,
          quantity: qty,
          unitPrice: product.price
        };
      });

    if (items.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        tableNumber,
        responsibleName,
        waiterName,
        items,
        status: 'OPEN',
        total: calculateTotal(),
        createdAt: new Date()
      });
      alert('Pedido enviado com sucesso!');
      setTableNumber('');
      setResponsibleName('');
      setCart({});
    } catch (error) {
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<Category, Product[]>);

  // Garantindo a tipagem das chaves iteradas
  const categories = Object.keys(groupedProducts) as Category[];
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-24 font-sans">
      <header className="bg-zinc-900 p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-orange-500">Nova Comanda</h1>
        <p className="text-sm text-zinc-400 mt-1">Preencha os dados e selecione os itens</p>
      </header>

      <main className="p-4 space-y-6">
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-4">
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Mesa</label>
            <input 
              type="text" 
              placeholder="Ex: 05"
              value={tableNumber} 
              onChange={e => setTableNumber(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Cliente / Responsável</label>
            <input 
              type="text" 
              placeholder="Nome do cliente"
              value={responsibleName} 
              onChange={e => setResponsibleName(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Garçom</label>
            <input 
              type="text" 
              placeholder="Seu nome"
              value={waiterName} 
              onChange={e => {
                setWaiterName(e.target.value);
                localStorage.setItem('@espetinho:garcom', e.target.value);
              }} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-50 outline-none focus:border-orange-500 transition-colors" 
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center p-8 text-zinc-500">Carregando cardápio...</div>
        ) : (
          categories.map(category => (
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-semibold text-orange-500 border-b border-zinc-800 pb-2">{category}</h2>
              <div className="space-y-3">
                {groupedProducts[category].map(product => (
                  <div key={product.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-zinc-100">{product.name}</p>
                      <p className="text-sm text-orange-400">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-950 rounded-lg border border-zinc-800 p-1">
                      <button 
                        onClick={() => handleQuantity(product.id, -1)}
                        className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-6 text-center font-medium">{cart[product.id] || 0}</span>
                      <button 
                        onClick={() => handleQuantity(product.id, 1)}
                        className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 shadow-xl shadow-black z-50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400 font-medium">Total do Pedido</span>
          <span className="text-2xl font-bold text-emerald-500">R$ {total.toFixed(2).replace('.', ',')}</span>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-lg"
        >
          <ShoppingCart size={20} />
          {submitting ? 'Enviando...' : 'Enviar Pedido'}
        </button>
      </div>
    </div>
  );
}
