import { Sidebar } from '@/components/layout/Sidebar';
import { InactivityAlert } from '@/components/admin/InactivityAlert';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
      <InactivityAlert />
    </div>
  );
}
