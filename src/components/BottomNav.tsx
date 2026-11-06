import React from 'react';
import { Swords, Users, History, User } from 'lucide-react';

export type NavTab = 'arena' | 'lobby' | 'history' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'arena' as NavTab, label: 'ARÈNE', icon: Swords },
    { id: 'lobby' as NavTab, label: 'LOBBY', icon: Users },
    { id: 'history' as NavTab, label: 'HISTORIQUE', icon: History },
    { id: 'profile' as NavTab, label: 'PROFIL', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,229,255,0.15)] ring-1 ring-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] mt-1 font-display tracking-wider ${isActive ? 'font-bold text-cyan-300' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
