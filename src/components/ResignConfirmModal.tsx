import React from 'react';
import { Flag, Loader2, AlertCircle } from 'lucide-react';

interface ResignConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage?: string;
  onConfirmResign: () => void;
  onContinuePlaying: () => void;
}

export const ResignConfirmModal: React.FC<ResignConfirmModalProps> = ({
  isOpen,
  isSubmitting,
  errorMessage = '',
  onConfirmResign,
  onContinuePlaying,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0d1322] border border-red-500/40 rounded-2xl p-5 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/40 flex items-center justify-center mx-auto mb-3">
          <Flag className="w-6 h-6 text-red-400" />
        </div>

        <h3 className="font-display font-bold text-base text-white mb-2">
          Abandonner la partie ? Ton adversaire gagnera.
        </h3>

        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300 text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onContinuePlaying}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-40"
          >
            Continuer à jouer
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirmResign}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/20 transition disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Envoi...</span>
              </>
            ) : (
              <span>Abandonner</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
