import React from 'react';
import { Coins, Download, Wifi, WifiOff, Users } from 'lucide-react';
import { UserProfile } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  userProfile: UserProfile;
  playerCount?: number;
  onOpenPWAInfo: () => void;
  onResetTokens?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  playerCount = 1,
  onOpenPWAInfo,
  onResetTokens,
}) => {
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 px-3.5 py-2.5 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-300/40">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm-1 6h2v3h3v2h-3v5h-2v-5H8v-2h3V8z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold tracking-wider text-base text-white leading-none">
                BATTLE<span className="text-cyan-400">ARENA</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded px-1.5 py-0.2">
                EN LIGNE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <Users className="w-3 h-3 text-slate-400" />
              <span>{playerCount} joueur{playerCount > 1 ? 's' : ''} en direct</span>
            </div>
          </div>
        </div>

        {/* Right Actions: Tokens & PWA Button */}
        <div className="flex items-center gap-2">
          {/* Virtual Tokens balance */}
          <div
            onClick={onResetTokens}
            title="Solde de jetons (cliquer pour recharger)"
            className="flex items-center gap-1.5 bg-[#131b2e] hover:bg-[#1a253e] transition-colors border border-cyan-500/30 rounded-lg px-2.5 py-1 cursor-pointer group"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-[10px] font-black text-black">
              ₿
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
                {userProfile.tokens.toLocaleString('fr-FR')}
              </span>
              <span className="text-[9px] text-slate-400 font-medium leading-none">
                jetons
              </span>
            </div>
          </div>

          {/* PWA Install Trigger / Guide */}
          {!isInstalled && (
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  onOpenPWAInfo();
                }
              }}
              className="flex items-center gap-1 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-2.5 py-1.5 rounded-lg shadow-md shadow-blue-900/40 transition active:scale-95"
              title="Installer la PWA sur Android"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Installer</span>
            </button>
          )}

          {/* Network Connection status */}
          <div
            title={isOnline ? 'En ligne' : 'Mode hors-ligne (PWA)'}
            className="p-1 rounded-md bg-[#131b2e] border border-slate-800"
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
