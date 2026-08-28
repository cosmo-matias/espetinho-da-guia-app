"use client";

import { useState, useEffect } from 'react';
import { getOrdersByWaiter, addItemsToOrder } from '@/lib/services/orderService';
import { getProducts } from '@/lib/services/productService';
import { Order, Product, Category, OrderItem } from '@/types';
import { ChevronLeft, Plus, Minus, Check } from 'lucide-react';
import Link from 'next/link';

export default function MinhasComandasPage() {
  const [waiterName, setWaiterName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [addingToOrderId, setAddingToOrderId] = useState<string | null>(null);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});

  const loadData = async (waiter: string) => {
    setLoading(true);
    const [ordersData, productsData] = await Promise.all([
      getOrdersByWaiter(waiter),
      getProducts()
    ]);
    
    // Sort from newest to oldest
    ordersData.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : new Date(a.createdAt).getTime();
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : new Date(b.createdAt).getTime();
      return (dateB || 0) - (dateA || 0);
    });

    setOrders(ordersData);
    setProducts(productsData);
    setLoading(false);
  };

  useEffect(() => {
    const savedWaiter = localStorage.getItem('@espetinho:garcom');
    if (savedWaiter) {
      setWaiterName(savedWaiter);
      loadData(savedWaiter);
    } else {
      setLoading(false);
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

  const handleAddItemsSubmit = async (orderId: string) => {
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
      alert('Adicione pelo menos um item.');
      return;
    }

    try {
      await addItemsToOrder(orderId, items);
      alert('Itens adicionados com sucesso!');
      setAddingToOrderId(null);
      setCart({});
      loadData(waiterName);
    } catch (error) {
      alert('Erro ao adicionar itens.');
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<Category, Product[]>);
  const categories = Object.keys(groupedProducts) as Category[];

  if (!loading && !waiterName) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Identificação Necessária</h2>
        <p className="text-zinc-400 mb-6">Você precisa abrir pelo menos uma comanda informando seu nome para acessar o dashboard.</p>
        <Link href="/comandas" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          Nova Comanda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans pb-10">
      <header className="bg-zinc-900 p-6 border-b border-zinc-800 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/comandas" className="text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-orange-500">Minhas Comandas</h1>
          <p className="text-sm text-zinc-400 mt-1">Garçom: <strong className="text-zinc-200">{waiterName}</strong></p>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {loading ? (
          <div className="text-center p-8 text-zinc-500">Carregando suas comandas...</div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 bg-zinc-900 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 mb-4">Nenhuma comanda aberta vinculada ao seu nome no momento.</p>
            <Link href="/comandas" className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Abrir Nova Comanda
            </Link>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="p-5 border-b border-zinc-800 flex justify-between items-start bg-zinc-950/30">
                <div>
                  <h2 className="text-2xl font-bold text-orange-500">Mesa {order.tableNumber}</h2>
                  <p className="text-zinc-300 font-medium">{order.responsibleName}</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-500 font-bold text-xl">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Itens Consumidos</h3>
                  <span className="text-[10px] text-zinc-500 uppercase">Para cancelar itens, chame o supervisor.</span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-zinc-800/30 pb-2 last:border-0 last:pb-0">
                      <div className="flex gap-2 text-zinc-300">
                        <span className="font-medium text-zinc-100">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="text-zinc-400">R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {addingToOrderId === order.id ? (
                <div className="p-5 bg-zinc-950 border-t border-zinc-800 space-y-4">
                  <h3 className="font-semibold text-orange-500 flex justify-between items-center">
                    Adicionar Mais Itens
                    <button onClick={() => { setAddingToOrderId(null); setCart({}); }} className="text-sm font-normal text-zinc-400 hover:text-white">Cancelar</button>
                  </h3>
                  <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {categories.map(category => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-500 uppercase">{category}</h4>
                        <div className="space-y-2">
                          {groupedProducts[category].map(product => (
                            <div key={product.id} className="flex justify-between items-center bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                              <span className="text-sm">{product.name}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleQuantity(product.id, -1)} className="p-1 text-zinc-400 hover:text-white bg-zinc-950 rounded border border-zinc-800"><Minus size={14}/></button>
                                <span className="w-4 text-center text-sm">{cart[product.id] || 0}</span>
                                <button onClick={() => handleQuantity(product.id, 1)} className="p-1 text-zinc-400 hover:text-white bg-zinc-950 rounded border border-zinc-800"><Plus size={14}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleAddItemsSubmit(order.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check size={18} /> Confirmar Adição
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-zinc-950/50 border-t border-zinc-800">
                  <button 
                    onClick={() => setAddingToOrderId(order.id)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg transition-colors text-sm"
                  >
                    + Adicionar Mais Itens
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
