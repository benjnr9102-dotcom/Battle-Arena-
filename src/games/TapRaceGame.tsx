import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, AlertTriangle, ShieldCheck, Trophy, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Opponent } from '../types';

interface TapRaceGameProps {
  opponent: Opponent;
  stake: number;
  onFinishGame: (result: 'victory' | 'defeat' | 'draw', scoreDetail?: string, notes?: string) => void;
  onQuit: () => void;
}

export const TapRaceGame: React.FC<TapRaceGameProps> = ({
  opponent,
  stake,
  onFinishGame,
  onQuit,
}) => {
  const [gameState, setGameState] = useState<'ready' | 'running' | 'finished'>('ready');
  const [countdownStart, setCountdownStart] = useState<number>(3); // 3-2-1 GO!
  const [timeLeftMs, setTimeLeftMs] = useState<number>(15000); // 15 seconds
  const [playerTaps, setPlayerTaps] = useState<number>(0);
  const [opponentTaps, setOpponentTaps] = useState<number>(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState<boolean>(false);
  const [currentCps, setCurrentCps] = useState<number>(0); // clicks per second
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [rippleEffect, setRippleEffect] = useState<boolean>(false);

  // Timestamps of recent taps to measure real-time CPS
  const recentTapTimestamps = useRef<number[]>([]);
  const tapAudioCtx = useRef<AudioContext | null>(null);

  // Sound synthesis
  const playTapBeep = useCallback((pitch: number = 440) => {
    if (!soundEnabled) return;
    try {
      if (!tapAudioCtx.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) tapAudioCtx.current = new AudioCtx();
      }
      if (tapAudioCtx.current) {
        const ctx = tapAudioCtx.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(pitch, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // Audio fallback
    }
  }, [soundEnabled]);

  // 3-2-1 Startup countdown
  useEffect(() => {
    if (gameState !== 'ready') return;

    if (countdownStart > 0) {
      const timer = setTimeout(() => {
        setCountdownStart((c) => c - 1);
        playTapBeep(520);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Start match!
      setGameState('running');
      playTapBeep(880);
    }
  }, [gameState, countdownStart, playTapBeep]);

  // Main 15.00s Timer loop
  useEffect(() => {
    if (gameState !== 'running') return;

    const startTime = performance.now();
    const duration = 15000;

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeftMs(remaining);

      // Clean up old timestamps (older than 1000ms) for CPS
      const now = Date.now();
      recentTapTimestamps.current = recentTapTimestamps.current.filter((t) => now - t <= 1000);
      const cps = recentTapTimestamps.current.length;
      setCurrentCps(cps);

      if (cps > 20) {
        setSuspiciousActivity(true);
      }

      if (remaining <= 0) {
        clearInterval(interval);
        setGameState('finished');
      }
    }, 40);

    return () => clearInterval(interval);
  }, [gameState]);

  // Opponent tap simulation
  useEffect(() => {
    if (gameState !== 'running') return;

    // Baseline target taps per second from opponent profile
    const targetSpeed = opponent.tapRaceAvgSpeed; // e.g. 10.4 taps/s
    const avgIntervalMs = 1000 / targetSpeed;

    let timeoutId: NodeJS.Timeout;

    const simulateNextTap = () => {
      // Add slight human jitter +/- 25%
      const jitter = (Math.random() - 0.5) * (avgIntervalMs * 0.5);
      const nextDelay = Math.max(30, avgIntervalMs + jitter);

      timeoutId = setTimeout(() => {
        setOpponentTaps((prev) => prev + 1);
        simulateNextTap();
      }, nextDelay);
    };

    simulateNextTap();

    return () => clearTimeout(timeoutId);
  }, [gameState, opponent]);

  // Handle Match Finish when timer expires
  useEffect(() => {
    if (gameState !== 'finished') return;

    const pTaps = playerTaps;
    const oTaps = opponentTaps;
    let result: 'victory' | 'defeat' | 'draw' = 'draw';

    if (pTaps > oTaps) {
      result = 'victory';
    } else if (pTaps < oTaps) {
      result = 'defeat';
    } else {
      result = 'draw';
    }

    const scoreDetail = `${pTaps} taps (vous) vs ${oTaps} taps (${opponent.name})`;
    const notes = suspiciousActivity
      ? `Performance de pointe impressionnante : ${(pTaps / 15).toFixed(1)} taps/s.`
      : `Vitesse moyenne : ${(pTaps / 15).toFixed(1)} taps/s.`;

    // Small delay to let user see final count
    const timeout = setTimeout(() => {
      onFinishGame(result, scoreDetail, notes);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [gameState, playerTaps, opponentTaps, opponent, suspiciousActivity, onFinishGame]);

  // Player Tap Action
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (gameState !== 'running') return;

    const now = Date.now();
    recentTapTimestamps.current.push(now);

    setPlayerTaps((prev) => prev + 1);
    setRippleEffect(true);
    setTimeout(() => setRippleEffect(false), 120);

    // Haptic vibration on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch (err) {}
    }

    // Dynamic pitch based on streak
    playTapBeep(350 + Math.min(400, playerTaps * 2));
  };

  const seconds = (timeLeftMs / 1000).toFixed(2);
  const maxPossible = Math.max(playerTaps, opponentTaps, 140);
  const playerPercent = Math.min(100, Math.round((playerTaps / maxPossible) * 100));
  const opponentPercent = Math.min(100, Math.round((opponentTaps / maxPossible) * 100));

  return (
    <div className="w-full max-w-md mx-auto p-3.5 flex flex-col items-center justify-between min-h-[82vh] select-none pb-20">
      {/* Top Header: Timers and Anticheat status */}
      <div className="w-full space-y-2.5">
        <div className="flex items-center justify-between bg-[#131b2e] border border-slate-700/80 rounded-xl px-3.5 py-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-xs uppercase text-white tracking-wider">
                TAP RACE
              </span>
              <span className="text-[10px] text-slate-400 block">
                Duel 15 secondes
              </span>
            </div>
          </div>

          {/* Time Remaining Display */}
          <div className="text-right">
            <div className="font-mono font-black text-xl text-cyan-400 tracking-tight">
              {seconds}s
            </div>
            <div className="text-[9px] uppercase font-bold text-slate-400">
              Temps restant
            </div>
          </div>
        </div>

        {/* Live Race Duel Bars */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-3 space-y-3">
          {/* Player Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-display font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping"></span>
                VOUS ({currentCps} taps/s)
              </span>
              <span className="font-mono font-black text-white text-sm">
                {playerTaps}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-300 h-full rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(0,229,255,0.6)]"
                style={{ width: `${playerPercent}%` }}
              />
            </div>
          </div>

          {/* Opponent Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-display font-bold text-slate-300 flex items-center gap-1.5">
                <img
                  src={opponent.avatar}
                  alt={opponent.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                {opponent.name}
              </span>
              <span className="font-mono font-black text-slate-300 text-sm">
                {opponentTaps}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-slate-600 to-amber-500 h-full rounded-full transition-all duration-75"
                style={{ width: `${opponentPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Speed Banner */}
        {suspiciousActivity ? (
          <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/50 flex items-center gap-2 text-[11px] text-cyan-300">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Vitesse record : plus de 20 tapotements par seconde !</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Duel de vitesse en direct
            </span>
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className="text-slate-400 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Center Tap Area */}
      <div className="my-auto py-4 flex flex-col items-center justify-center relative w-full">
        {gameState === 'ready' ? (
          <div className="text-center p-6 bg-[#131b2e] border border-cyan-500/30 rounded-3xl shadow-2xl max-w-xs animate-in zoom-in-95">
            <span className="text-xs uppercase font-bold text-cyan-400 font-display tracking-wider">
              PRÉPAREZ VOS DOIGTS
            </span>
            <div className="text-7xl font-display font-black text-white my-3 animate-bounce">
              {countdownStart > 0 ? countdownStart : 'GO!'}
            </div>
            <p className="text-xs text-slate-300">
              Tapez le plus vite possible pendant 15 secondes chrono !
            </p>
          </div>
        ) : gameState === 'running' ? (
          <div className="relative flex flex-col items-center">
            {/* Massive Tactile Button */}
            <button
              onMouseDown={handleTap}
              onTouchStart={handleTap}
              className={`w-64 h-64 rounded-full bg-gradient-to-tr from-blue-700 via-cyan-500 to-cyan-300 p-2 shadow-[0_0_40px_rgba(0,229,255,0.4)] border-4 border-cyan-300 flex flex-col items-center justify-center text-center transition-transform active:scale-92 cursor-pointer ${
                rippleEffect ? 'scale-95 shadow-[0_0_60px_rgba(0,229,255,0.7)]' : ''
              }`}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0e172a] to-[#090d16] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <Zap className="w-10 h-10 text-cyan-400 mb-1 drop-shadow" />
                <span className="font-display font-black text-5xl text-white tracking-wider">
                  {playerTaps}
                </span>
                <span className="text-[12px] font-bold font-display uppercase tracking-widest text-cyan-300 mt-1">
                  TAP !
                </span>

                {/* Animated pulse rings */}
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 pointer-events-none animate-ping" />
              </div>
            </button>

            <span className="text-xs text-slate-400 mt-3 font-medium">
              Tapez n'importe où sur le bouton central
            </span>
          </div>
        ) : (
          <div className="text-center p-6 bg-[#131b2e] border border-cyan-500/40 rounded-3xl shadow-2xl max-w-xs">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
            <h4 className="font-display font-bold text-xl text-white mb-1">
              CHRONO ÉCOULÉ !
            </h4>
            <p className="text-xs text-slate-300 mb-2">
              Calcul et homologation du duel en cours...
            </p>
            <div className="text-sm font-mono font-bold text-cyan-400">
              {playerTaps} vs {opponentTaps}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quit / Surrender Button */}
      <div className="w-full">
        <button
          onClick={onQuit}
          className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition"
        >
          Abandonner le duel
        </button>
      </div>
    </div>
  );
};
