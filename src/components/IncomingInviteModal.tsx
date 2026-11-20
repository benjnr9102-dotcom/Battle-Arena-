import React from 'react';
import {
  Swords,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { ChallengeInvite } from '../types';

interface IncomingInviteModalProps {
  invite: ChallengeInvite | null;
  acceptedMessage: string | null;
  closedNotice: string | null;
  isResponding: boolean;
  errorMessage: string;
  onAccept: (invite: ChallengeInvite) => void;
  onDecline: (invite: ChallengeInvite) => void;
  onDismissNotice: () => void;
}

export const IncomingInviteModal: React.FC<IncomingInviteModalProps> = ({
  invite,
  acceptedMessage,
  closedNotice,
  isResponding,
  errorMessage,
  onAccept,
  onDecline,
  onDismissNotice,
}) => {
  // 1. Accepted confirmation screen
  if (acceptedMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
        <div className="w-full max-w-sm bg-[#0d1322] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="font-display font-bold text-base text-white mb-2">
            {acceptedMessage}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Aucun jeton n'a été débité.
          </p>
          <button
            type="button"
            onClick={onDismissNotice}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  // 2. Closed / Cancelled notice screen
  if (closedNotice && !invite) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
        <div className="w-full max-w-sm bg-[#0d1322] border border-amber-500/40 rounded-2xl p-5 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center mx-auto mb-3">
            <Info className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="font-display font-bold text-base text-white mb-3">
            {closedNotice}
          </h3>
          <button
            type="button"
            onClick={onDismissNotice}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (!invite) return null;

  const gamePhrase = invite.game === 'chess' ? 'aux Échecs' : 'à Tap Race';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0d1322] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl text-center">
        <div className="inline-block px-2.5 py-0.5 bg-cyan-950/80 border border-cyan-800/70 rounded-md text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-3">
          Nouvelle invitation de duel
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center mx-auto mb-3">
          {invite.game === 'chess' ? (
            <Swords className="w-7 h-7 text-cyan-400" />
          ) : (
            <Zap className="w-7 h-7 text-amber-400" />
          )}
        </div>

        <h3 className="font-display font-bold text-base text-white leading-snug mb-2">
          {invite.fromPseudo} te défie {gamePhrase}, mise :{' '}
          <span className="text-amber-300">
            {invite.stake.toLocaleString('fr-FR')} jetons
          </span>
        </h3>

        <p className="text-[11px] text-slate-400 mb-4">
          Aucun jeton n'est prélevé à cette étape.
        </p>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300 text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={isResponding}
            onClick={() => onDecline(invite)}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-40"
          >
            Refuser
          </button>
          <button
            type="button"
            disabled={isResponding}
            onClick={() => onAccept(invite)}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {isResponding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Envoi...</span>
              </>
            ) : (
              <span>Accepter</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
