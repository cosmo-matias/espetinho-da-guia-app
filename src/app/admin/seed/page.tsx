"use client";
import { useState } from 'react';
import { addProduct } from '@/lib/services/productService';
import { Category } from '@/types';

const INITIAL_PRODUCTS = [
  // ESPETINHOS
  { name: 'Pão de Alho', category: 'ESPETINHOS' as Category, price: 2.00, stockQuantity: 0 },
  { name: 'Moela', category: 'ESPETINHOS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Porco', category: 'ESPETINHOS' as Category, price: 6.00, stockQuantity: 0 },
  { name: 'Frango', category: 'ESPETINHOS' as Category, price: 6.00, stockQuantity: 0 },
  { name: 'Asa c/ Coxa', category: 'ESPETINHOS' as Category, price: 6.00, stockQuantity: 0 },
  { name: 'Kafta c/ Queijo', category: 'ESPETINHOS' as Category, price: 6.00, stockQuantity: 0 },
  { name: 'Ovo c/ Bacon', category: 'ESPETINHOS' as Category, price: 7.00, stockQuantity: 0 },
  { name: 'Coração', category: 'ESPETINHOS' as Category, price: 7.00, stockQuantity: 0 },
  { name: 'Camarão', category: 'ESPETINHOS' as Category, price: 8.00, stockQuantity: 0 },
  { name: 'Carne', category: 'ESPETINHOS' as Category, price: 8.00, stockQuantity: 0 },
  { name: 'Frango c/ Bacon', category: 'ESPETINHOS' as Category, price: 8.00, stockQuantity: 0 },
  { name: 'Queijo', category: 'ESPETINHOS' as Category, price: 8.00, stockQuantity: 0 },
  { name: 'Queijo c/ Carne de Sol', category: 'ESPETINHOS' as Category, price: 10.00, stockQuantity: 0 },
  // ADICIONAIS
  { name: 'Adicional de Arroz ou Macaxeira', category: 'ADICIONAIS' as Category, price: 2.00, stockQuantity: 0 },
  // CALDOS
  { name: 'Caldo (Porção)', category: 'CALDOS' as Category, price: 5.00, stockQuantity: 0 },
  // BEBIDAS - CERVEJAS LITRÃO
  { name: 'Budweiser Litrão', category: 'BEBIDAS' as Category, price: 15.00, stockQuantity: 0 },
  { name: 'Antártica Litrão', category: 'BEBIDAS' as Category, price: 12.00, stockQuantity: 0 },
  { name: 'Skol Litrão', category: 'BEBIDAS' as Category, price: 12.00, stockQuantity: 0 },
  { name: 'Brama chopp Litrão', category: 'BEBIDAS' as Category, price: 12.00, stockQuantity: 0 },
  { name: 'Cristal Litrão', category: 'BEBIDAS' as Category, price: 10.00, stockQuantity: 0 },
  // BEBIDAS - CERVEJAS LATA
  { name: 'Heineken Lata', category: 'BEBIDAS' as Category, price: 10.00, stockQuantity: 0 },
  { name: 'Budweiser Lata', category: 'BEBIDAS' as Category, price: 8.00, stockQuantity: 0 },
  { name: 'Antártica Lata', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Skol Lata', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Brama chopp Lata', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Brama duplo malte Lata', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Petra Lata', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Cristal Lata', category: 'BEBIDAS' as Category, price: 4.00, stockQuantity: 0 },
  // BEBIDAS - REFRIGERANTES 1L
  { name: 'Coca 1L', category: 'BEBIDAS' as Category, price: 10.00, stockQuantity: 0 },
  { name: 'Kuat guarana 1L', category: 'BEBIDAS' as Category, price: 10.00, stockQuantity: 0 },
  { name: 'Fanta laranja 1L', category: 'BEBIDAS' as Category, price: 10.00, stockQuantity: 0 },
  // BEBIDAS - REFRIGERANTES 350ML
  { name: 'Coca 350ml', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Coca zero 350ml', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Guarana Antártica 350ml', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Kuat guarana 350ml', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Fanta laranja 350ml', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Fanta uva 350ml', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Sprite 350ml', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Sprite zero 350ml', category: 'BEBIDAS' as Category, price: 5.00, stockQuantity: 0 },
  // CACHAÇAS
  { name: 'Matuta (sabores) 1L', category: 'CACHACAS' as Category, price: 40.00, stockQuantity: 0 },
  { name: 'Serra de areia 1L', category: 'CACHACAS' as Category, price: 30.00, stockQuantity: 0 },
  { name: 'Montilla 1L', category: 'CACHACAS' as Category, price: 30.00, stockQuantity: 0 },
  { name: 'Dreher 1L', category: 'CACHACAS' as Category, price: 26.00, stockQuantity: 0 },
  { name: 'Matuta coco nut 300ml', category: 'CACHACAS' as Category, price: 16.00, stockQuantity: 0 },
  { name: 'Matuta (sabores) 300ml', category: 'CACHACAS' as Category, price: 15.00, stockQuantity: 0 },
  { name: 'Serra de areia 275ml', category: 'CACHACAS' as Category, price: 12.00, stockQuantity: 0 },
  { name: 'Triunfo 275ml', category: 'CACHACAS' as Category, price: 12.00, stockQuantity: 0 },
  { name: 'Matuta Dose', category: 'CACHACAS' as Category, price: 5.00, stockQuantity: 0 },
  { name: 'Serra de areia Dose', category: 'CACHACAS' as Category, price: 3.00, stockQuantity: 0 },
  { name: 'Montilla Dose', category: 'CACHACAS' as Category, price: 3.00, stockQuantity: 0 },
  { name: 'Dreher Dose', category: 'CACHACAS' as Category, price: 2.00, stockQuantity: 0 },
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const runSeed = async () => {
    setLoading(true);
    setStatus('Iniciando carga no banco...');
    try {
      for (const item of INITIAL_PRODUCTS) {
        await addProduct(item);
      }
      setStatus('Carga finalizada com sucesso! Todos os produtos foram adicionados.');
    } catch (error) {
      setStatus('Erro ao carregar produtos.');
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Popular Banco de Dados</h1>
      <button 
        onClick={runSeed} 
        disabled={loading}
        className="bg-orange-600 px-6 py-2 rounded font-bold text-white"
      >
        {loading ? 'Carregando...' : 'Adicionar Cardápio'}
      </button>
      <p className="mt-4 text-zinc-400">{status}</p>
    </div>
  );
}
