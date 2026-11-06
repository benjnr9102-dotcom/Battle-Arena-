import React from 'react';
import { X, Download, Smartphone, CheckCircle2, ShieldCheck, Zap, Globe } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0d1322] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Installation Progressive Web App (PWA)
            </h3>
            <p className="text-xs text-cyan-400">
              Android & iOS · Expérience 100% native
            </p>
          </div>
        </div>

        {/* Status banner */}
        <div className="bg-[#131b2e] border border-slate-700/60 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Service Worker & Manifest configurés</span>
          </div>
          <p className="text-[11px] text-slate-300">
            L'application est conçue selon les spécifications PWA officielles W3C : mise en cache hors-ligne, affichage plein écran (standalone) et zéro latence.
          </p>
        </div>

        {/* Benefits list */}
        <div className="space-y-2.5 mb-5 text-xs text-slate-200">
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Plein écran sans barre d’adresse :</strong> Réactivité maximale pour le Tap Race et les Échecs.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Fonctionnement hors-ligne :</strong> Lancement instantané depuis l’écran d’accueil même sans réseau.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Légèreté & sécurité :</strong> Moins de 2 Mo, aucune permission intrusive cachée.
            </span>
          </div>
        </div>

        {/* Action based on platform */}
        {isInstalled ? (
          <div className="text-center p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            ✓ BATTLE ARENA est déjà installée sur cet appareil en mode Standalone !
          </div>
        ) : isInstallable ? (
          <button
            onClick={async () => {
              const res = await install();
              if (res) onClose();
            }}
            className="w-full py-3 px-4 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Download className="w-4 h-4" />
            Installer sur l'écran d'accueil Android
          </button>
        ) : isIOS ? (
          <div className="bg-[#172036] border border-cyan-500/30 rounded-xl p-3.5 text-xs text-slate-200">
            <p className="font-semibold text-cyan-300 mb-1.5">Procédure pour iPhone / iPad (Safari) :</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Touchez le bouton <strong>Partager</strong> (icône avec flèche en bas du navigateur)</li>
              <li>Faites défiler puis touchez <strong>Sur l’écran d’accueil</strong></li>
              <li>Touchez <strong>Ajouter</strong> en haut à droite</li>
            </ol>
          </div>
        ) : (
          <div className="bg-[#172036] border border-cyan-500/30 rounded-xl p-3.5 text-xs text-slate-200">
            <p className="font-semibold text-cyan-300 mb-1.5">Installation manuelle Android (Chrome) :</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Appuyez sur le menu ⋮ (trois points en haut à droite)</li>
              <li>Sélectionnez <strong>Installer l'application</strong> ou <strong>Ajouter à l'écran d'accueil</strong></li>
              <li>Confirmez pour retrouver l'icône BATTLE ARENA sur votre écran</li>
            </ol>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-transparent hover:bg-slate-800/40 transition"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
