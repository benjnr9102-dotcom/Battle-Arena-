import React from 'react';
import {
  Swords,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { ChallengeInvite } from '../types';

interface OutgoingInviteModalProps {
  invite: ChallengeInvite | null;
  timedOut: boolean;
  remainingSeconds: number;
  isCancelling: boolean;
  errorMessage: string;
  onCancelInvite: () => void;
  onClose: () => void;
}

export const OutgoingInviteModal: React.FC<OutgoingInviteModalProps> = ({
  invite,
  timedOut,
  remainingSeconds,
  isCancelling,
  errorMessage,
  onCancelInvite,
  onClose,
}) => {
  if (!invite) return null;

  const gameLabel = invite.game === 'chess' ? 'Échecs' : 'Tap Race';
  const isPending = invite.status === 'pending';
  const isAccepted = invite.status === 'accepted';
  const isDeclined = invite.status === 'declined';
  const isCancelled = invite.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0d1322] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl text-center">
        {/* Icon */}
        <div className="flex justify-center mb-3">
          {isPending && (
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center relative">
              {invite.game === 'chess' ? (
                <Swords className="w-7 h-7 text-cyan-400 animate-pulse" />
              ) : (
                <Zap className="w-7 h-7 text-amber-400 animate-pulse" />
              )}
            </div>
          )}

          {isAccepted && (
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          )}

          {isDeclined && (
            <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          )}

          {isCancelled && (
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          )}
        </div>

        {/* Status Message */}
        {isPending && (
          <>
            <h3 className="font-display font-bold text-base text-white mb-1.5">
              Invitation envoyée à {invite.toPseudo}, en attente de réponse...
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              {gameLabel} · Mise : <strong className="text-amber-300">{invite.stake.toLocaleString('fr-FR')} jetons</strong>
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131b2e] border border-slate-700/80 text-[11px] text-cyan-300 font-semibold mb-4">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Temps restant : {remainingSeconds} s</span>
            </div>
          </>
        )}

        {isAccepted && (
          <>
            <h3 className="font-display font-bold text-lg text-emerald-400 mb-1.5">
              {invite.toPseudo} a accepté
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed mb-4">
              Défi accepté ! Le duel en ligne arrive bientôt.
            </p>
            <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-400 mb-4">
              {gameLabel} · {invite.stake.toLocaleString('fr-FR')} jetons · Aucun jeton débité pour l'instant
            </div>
          </>
        )}

        {isDeclined && (
          <>
            <h3 className="font-display font-bold text-lg text-red-400 mb-1.5">
              {invite.toPseudo} a refusé
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tu peux inviter un autre joueur depuis le lobby.
            </p>
          </>
        )}

        {isCancelled && (
          <>
            <h3 className="font-display font-bold text-lg text-amber-300 mb-1.5">
              {timedOut ? 'Pas de réponse' : 'Invitation annulée'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {timedOut
                ? `${invite.toPseudo} n'a pas répondu dans le délai imparti.`
                : 'Ton invitation a bien été annulée.'}
            </p>
          </>
        )}

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300 text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        {isPending ? (
          <button
            type="button"
            disabled={isCancelling}
            onClick={onCancelInvite}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-red-900/60 text-slate-200 hover:text-white border border-slate-700 hover:border-red-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Annulation...</span>
              </>
            ) : (
              <span>Annuler</span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition"
          >
            {isAccepted ? 'OK' : 'Fermer'}
          </button>
        )}
      </div>
    </div>
  );
};
