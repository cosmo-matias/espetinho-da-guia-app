import Link from 'next/link';
import { LayoutDashboard, Package, DollarSign, ClipboardList, ClipboardCheck, ChefHat } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="fixed bottom-0 left-0 right-0 z-50 md:relative md:w-64 md:h-screen bg-zinc-900 border-t md:border-t-0 md:border-r border-zinc-800 text-zinc-50 flex flex-col">
      <div className="hidden md:block p-6 border-b border-zinc-800">
        <h2 className="text-2xl font-bold text-orange-500">Espetinho Central</h2>
      </div>
      <nav className="flex flex-row md:flex-col justify-around md:justify-start px-2 py-3 md:px-4 md:py-6 gap-2 md:space-y-2 flex-1">
        <Link href="/admin" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-zinc-800 transition-colors flex-1 md:flex-none justify-center md:justify-start text-xs md:text-base">
          <LayoutDashboard size={24} className="md:w-5 md:h-5" /> <span className="hidden sm:inline-block md:inline">Dashboard</span>
        </Link>
        <Link href="/admin/produtos" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-zinc-800 transition-colors flex-1 md:flex-none justify-center md:justify-start text-xs md:text-base">
          <Package size={24} className="md:w-5 md:h-5" /> <span className="hidden sm:inline-block md:inline">Produtos</span>
        </Link>
        <Link href="/admin/caixa" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-zinc-800 transition-colors flex-1 md:flex-none justify-center md:justify-start text-xs md:text-base">
          <DollarSign size={24} className="md:w-5 md:h-5" /> <span className="hidden sm:inline-block md:inline">Caixa</span>
        </Link>
        <Link href="/admin/comandas" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-zinc-800 transition-colors flex-1 md:flex-none justify-center md:justify-start text-xs md:text-base">
          <ClipboardCheck size={24} className="md:w-5 md:h-5" /> <span className="hidden sm:inline-block md:inline">Comandas</span>
        </Link>
        <Link href="/admin/producao" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-zinc-800 transition-colors flex-1 md:flex-none justify-center md:justify-start text-xs md:text-base">
          <ChefHat size={24} className="md:w-5 md:h-5" /> <span className="hidden sm:inline-block md:inline">Produção</span>
        </Link>
        <Link href="/comandas" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-zinc-800 transition-colors flex-1 md:flex-none justify-center md:justify-start text-xs md:text-base">
          <ClipboardList size={24} className="md:w-5 md:h-5" /> <span className="hidden sm:inline-block md:inline">Garçons</span>
        </Link>
      </nav>
    </aside>
  );
}
