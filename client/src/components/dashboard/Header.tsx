// client/src/components/dashboard/Header.tsx
import { LogOut } from 'lucide-react';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export const Header = ({ userName, onLogout }: HeaderProps) => (
  <header className="flex justify-between items-center mb-8">
    <div>
      <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Selamat datang</p>
      <h1 className="text-2xl font-bold text-white mt-1">
        {userName || 'Buddy'} <span className="text-emerald-500">👋</span>
      </h1>
    </div>
    <button
      onClick={onLogout}
      className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-400 transition-colors"
    >
      <LogOut size={20} />
    </button>
  </header>
);