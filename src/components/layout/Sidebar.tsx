import Link from 'next/link';
import { LayoutDashboard, Package, DollarSign, ClipboardList } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-900 h-screen border-r border-zinc-800 text-zinc-50 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-2xl font-bold text-orange-500">Espetinho Central</h2>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link href="/admin/produtos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors">
          <Package size={20} /> Produtos
        </Link>
        <Link href="/admin/caixa" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors">
          <DollarSign size={20} /> Caixa
        </Link>
        <Link href="/comandas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors">
          <ClipboardList size={20} /> Comandas (Garçons)
        </Link>
      </nav>
    </aside>
  );
}
