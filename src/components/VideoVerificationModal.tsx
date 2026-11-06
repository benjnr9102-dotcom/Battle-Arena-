import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertCircle, ShieldAlert, CheckCircle2, Flag, ArrowRight, RefreshCw, X } from 'lucide-react';
import { Opponent, GameType } from '../types';

interface VideoVerificationModalProps {
  isOpen: boolean;
  opponent: Opponent;
  gameType: GameType;
  stake: number;
  onCompleted: () => void;
  onCancelAndRefund: () => void;
}

export const VideoVerificationModal: React.FC<VideoVerificationModalProps> = ({
  isOpen,
  opponent,
  gameType,
  stake,
  onCompleted,
  onCancelAndRefund,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [cameraState, setCameraState] = useState<'requesting' | 'granted' | 'denied' | 'error'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('camera_glitch');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setSecondsLeft(30);
    setCameraState('requesting');
    setErrorMessage('');
    setReportSubmitted(false);

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('API MediaDevices non supportée par votre navigateur.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setCameraState('granted');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.warn('Autoplay error:', err);
          });
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Camera access denied or unavailable:', err);
        setCameraState('denied');
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage('Autorisation de la caméra refusée dans les paramètres de votre navigateur.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setErrorMessage('Aucun capteur caméra détecté sur cet appareil.');
        } else {
          setErrorMessage(err.message || 'Impossible d’activer le flux vidéo.');
        }
      }
    }

    initCamera();

    // 30 seconds countdown timer
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  // When timer reaches 0, complete automatically
  useEffect(() => {
    if (isOpen && secondsLeft === 0) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      onCompleted();
    }
  }, [isOpen, secondsLeft, onCompleted]);

  const handleFinishEarly = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onCompleted();
  };

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onCancelAndRefund();
  };

  if (!isOpen) return null;

  const progressPercent = Math.round(((30 - secondsLeft) / 30) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0d1322] border border-cyan-500/40 rounded-2xl p-4 shadow-2xl relative flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                VÉRIFICATION VIDÉO EN DIRECT
              </h3>
              <p className="text-[10px] text-slate-400">
                Protocole joueur · Match contre {opponent.name}
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-display font-bold text-sm">
            <span>{secondsLeft}s</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3 mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Camera Feed / Fallback Container */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center mb-3">
          {cameraState === 'granted' ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              {/* Overlay HUD graphics for e-sport vibe */}
              <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400">
                  <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    REC // FLUX ACTIF
                  </span>
                  <span className="bg-black/60 px-2 py-0.5 rounded">
                    MISE: {stake} JETONS
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
                  <span className="bg-black/60 px-2 py-0.5 rounded">
                    DISCIPLINE: {gameType.toUpperCase()}
                  </span>
                  <span className="bg-black/60 px-2 py-0.5 rounded">
                    30 FPS
                  </span>
                </div>
              </div>
            </>
          ) : cameraState === 'requesting' ? (
            <div className="text-center p-4">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-300">
                Demande d'autorisation de la caméra...
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Veuillez autoriser l'accès vidéo pour confirmer la présence.
              </p>
            </div>
          ) : (
            <div className="text-center p-4 flex flex-col items-center">
              <CameraOff className="w-9 h-9 text-amber-400 mb-2" />
              <p className="text-xs font-semibold text-amber-300 mb-1">
                Caméra non disponible ou refusée
              </p>
              <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed mb-2">
                {errorMessage || 'L\'accès caméra est requis pour le protocole standard.'}
              </p>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                Mode démonstration : Vous pouvez continuer le match
              </span>
            </div>
          )}
        </div>

        {/* Mandatory Transparency Note */}
        <div className="bg-[#131b2e] border border-slate-700/60 rounded-xl p-2.5 mb-3 text-[10px] text-slate-400 leading-normal">
          <p className="flex items-start gap-1.5 text-slate-300 font-semibold mb-0.5">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.2" />
            Note de transparence technique :
          </p>
          <p>
            Aperçu de vérification faciale en direct (Contrôle client local). La certification biométrique et l'arbitrage antifraude définitif sont déportés sur un backend sécurisé en environnement de production.
          </p>
        </div>

        {/* Buttons / Controls */}
        <div className="space-y-2">
          {/* Quick skip for fast testing or instant start */}
          <button
            onClick={handleFinishEarly}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <span>Passer à l'arène ({secondsLeft}s)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="py-2 px-3 rounded-xl text-[11px] font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <Flag className="w-3 h-3 text-amber-400" />
              <span>Signaler incident</span>
            </button>
            <button
              onClick={handleCancel}
              className="py-2 px-3 rounded-xl text-[11px] font-medium text-slate-300 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 flex items-center justify-center gap-1.5 transition"
            >
              <X className="w-3 h-3 text-red-400" />
              <span>Annuler défi</span>
            </button>
          </div>
        </div>

        {/* Report Problem Submodal */}
        {showReportModal && (
          <div className="absolute inset-0 bg-[#0d1322] rounded-2xl p-4 flex flex-col justify-between z-20 animate-in fade-in">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-400" />
                  Signaler un problème
                </h4>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reportSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center my-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white mb-1">Signalement enregistré</p>
                  <p className="text-[11px] text-slate-300">
                    Votre rapport d'incident technique a été consigné pour analyse d'arbitrage.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">
                    Quel incident rencontrez-vous durant la phase de vérification ?
                  </p>
                  <div className="space-y-2 text-xs">
                    {[
                      { id: 'camera_glitch', label: 'Problème de caméra ou d\'affichage' },
                      { id: 'opponent_unresponsive', label: 'Adversaire ne répond pas' },
                      { id: 'network_drop', label: 'Latence ou déconnexion réseau' },
                      { id: 'other', label: 'Autre incident matériel' },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer ${
                          reportReason === opt.id
                            ? 'bg-cyan-950/60 border-cyan-500 text-white'
                            : 'bg-[#131b2e] border-slate-700 text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="report"
                          checked={reportReason === opt.id}
                          onChange={() => setReportReason(opt.id)}
                          className="accent-cyan-400"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3">
              {reportSubmitted ? (
                <button
                  onClick={() => setShowReportModal(false)}
                  className="w-full py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
                >
                  Fermer
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setReportSubmitted(true)}
                    className="py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold font-display rounded-xl"
                  >
                    Envoyer rapport
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
