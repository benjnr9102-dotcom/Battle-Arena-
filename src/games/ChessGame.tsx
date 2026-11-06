import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { Flag, Handshake, AlertOctagon, RotateCcw, Clock, Shield, Volume2, VolumeX } from 'lucide-react';
import { Opponent } from '../types';
import { ChessEngineHelper } from '../services/chessEngine';

interface ChessGameProps {
  opponent: Opponent;
  stake: number;
  onFinishGame: (result: 'victory' | 'defeat' | 'draw', scoreDetail?: string, notes?: string) => void;
  onQuit: () => void;
}

// Crisp Vector Chess Pieces
const CHESS_PIECE_SVGS: Record<string, (color: string) => React.ReactNode> = {
  p: (color) => (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow">
      <path
        d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
        fill={color === 'w' ? '#FFFFFF' : '#1e293b'}
        stroke={color === 'w' ? '#0f172a' : '#94a3b8'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  r: (color) => (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow">
      <g
        fill={color === 'w' ? '#FFFFFF' : '#1e293b'}
        stroke={color === 'w' ? '#0f172a' : '#94a3b8'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 9,39 L 36,39 L 36,36 L 9,36 z" />
        <path d="M 12,36 L 12,32 L 33,32 L 33,36 z" />
        <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
        <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
        <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" />
        <path d="M 14,29.5 L 12,32 L 33,32 L 31,29.5" />
      </g>
    </svg>
  ),
  n: (color) => (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow">
      <path
        d="m 22,10 c -4.5,0.5 -8.5,3.5 -8.5,8 0,1.5 0.5,3 1.5,4 -2,0.5 -3.5,2 -3.5,4 0,1.5 0.8,3 2,3.8 -0.5,0.7 -0.5,1.7 0,2.5 1,1.5 3,2 5,2 1,1 2.5,1.5 4,1.5 0.5,0 1,-0.2 1.5,-0.5 0.5,0.3 1,0.5 1.5,0.5 1.5,0 3,-0.5 4,-1.5 2,0 4,-0.5 5,-2 0.5,-0.8 0.5,-1.8 0,-2.5 1.2,-0.8 2,-2.3 2,-3.8 0,-2 -1.5,-3.5 -3.5,-4 1,-1 1.5,-2.5 1.5,-4 0,-4.5 -4,-7.5 -8.5,-8 z"
        fill={color === 'w' ? '#FFFFFF' : '#1e293b'}
        stroke={color === 'w' ? '#0f172a' : '#94a3b8'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="16" r="1.5" fill={color === 'w' ? '#0f172a' : '#38bdf8'} />
    </svg>
  ),
  b: (color) => (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow">
      <g
        fill={color === 'w' ? '#FFFFFF' : '#1e293b'}
        stroke={color === 'w' ? '#0f172a' : '#94a3b8'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
        <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,28.5 28.5,26 C 27,23.5 25.5,21.5 25.5,17.5 C 25.5,13.5 24.5,10.5 22.5,8 C 20.5,10.5 19.5,13.5 19.5,17.5 C 19.5,21.5 18,23.5 16.5,26 C 15,28.5 14.5,30.5 15,32 z" />
        <circle cx="22.5" cy="6" r="2" />
        <path d="M 17.5,26 L 27.5,26" />
        <path d="M 22.5,21 L 22.5,31" />
      </g>
    </svg>
  ),
  q: (color) => (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow">
      <g
        fill={color === 'w' ? '#FFFFFF' : '#1e293b'}
        stroke={color === 'w' ? '#0f172a' : '#94a3b8'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="14" cy="9" r="2.5" />
        <circle cx="22.5" cy="8" r="2.5" />
        <circle cx="31" cy="9" r="2.5" />
        <circle cx="39" cy="12" r="2.5" />
        <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 22.5,12 L 14,25 L 7,14 L 9,26 z" />
        <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 19,35 26,35 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
        <path d="M 11.5,30 C 15,29 30,29 33.5,30" />
        <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" />
      </g>
    </svg>
  ),
  k: (color) => (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow">
      <g
        fill={color === 'w' ? '#FFFFFF' : '#1e293b'}
        stroke={color === 'w' ? '#0f172a' : '#94a3b8'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 22.5,11.5 L 22.5,6" />
        <path d="M 20,8 L 25,8" />
        <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 z" />
        <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 34.5,35 34,32 32,30.5 C 30,29 27.5,27.5 25,26.5 C 23.5,26 21.5,26 20,26.5 C 17.5,27.5 15,29 13,30.5 C 11,32 10.5,35 11.5,37 z" />
      </g>
    </svg>
  ),
};

export const ChessGame: React.FC<ChessGameProps> = ({
  opponent,
  stake,
  onFinishGame,
  onQuit,
}) => {
  const [chess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Clocks: 5 minutes (300 seconds) each
  const [playerClock, setPlayerClock] = useState<number>(300);
  const [opponentClock, setOpponentClock] = useState<number>(300);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [capturedByPlayer, setCapturedByPlayer] = useState<string[]>([]);
  const [capturedByOpponent, setCapturedByOpponent] = useState<string[]>([]);

  // Synthesize game sounds via Web Audio
  const playSound = useCallback((type: 'move' | 'capture' | 'check' | 'gameover') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'move') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'capture') {
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'check') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'gameover') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Turn timer
  useEffect(() => {
    if (chess.isGameOver()) return;

    const interval = setInterval(() => {
      if (chess.turn() === 'w') {
        setPlayerClock((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onFinishGame('defeat', 'Temps écoulé', 'Défaite au temps limite');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setOpponentClock((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onFinishGame('victory', 'Victoire au temps', 'Adversaire a épuisé son temps');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chess, onFinishGame]);

  // AI Opponent move handler
  const triggerAiMove = useCallback(() => {
    if (chess.isGameOver() || chess.turn() !== 'b') return;

    setIsAiThinking(true);
    // Human-like response latency between 600ms and 1500ms
    const delay = Math.floor(Math.random() * 800) + 700;

    setTimeout(() => {
      const bestMove = ChessEngineHelper.getBestMove(chess, opponent.chessElo);
      if (bestMove) {
        if (bestMove.captured) {
          setCapturedByOpponent((prev) => [...prev, bestMove.captured as string]);
          playSound('capture');
        } else {
          playSound('move');
        }

        chess.move(bestMove);
        setFen(chess.fen());
        setLastMove({ from: bestMove.from, to: bestMove.to });

        if (chess.inCheck()) {
          playSound('check');
        }

        // Check game endings
        if (chess.isCheckmate()) {
          playSound('gameover');
          onFinishGame('defeat', 'Échec et Mat', `Victoire de ${opponent.name} par échec et mat.`);
        } else if (chess.isDraw()) {
          playSound('gameover');
          onFinishGame('draw', 'Match Nul', 'Partie déclarée nulle (pat ou répétition).');
        }
      }
      setIsAiThinking(false);
    }, delay);
  }, [chess, opponent, onFinishGame, playSound]);

  // Player clicks square
  const handleSquareClick = (square: Square) => {
    if (chess.turn() !== 'w' || isAiThinking || chess.isGameOver()) return;

    // If already selected, attempt to move or deselect
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Check if clicked square is in legal moves
      try {
        const move = chess.move({
          from: selectedSquare,
          to: square,
          promotion: 'q', // auto promote to queen for fast mobile play
        });

        if (move) {
          // Success move!
          if (move.captured) {
            setCapturedByPlayer((prev) => [...prev, move.captured as string]);
            playSound('capture');
          } else {
            playSound('move');
          }

          setFen(chess.fen());
          setLastMove({ from: move.from, to: move.to });
          setSelectedSquare(null);
          setLegalMoves([]);

          if (chess.inCheck()) {
            playSound('check');
          }

          if (chess.isCheckmate()) {
            playSound('gameover');
            onFinishGame('victory', 'Échec et Mat', `Victoire contre ${opponent.name} par échec et mat !`);
            return;
          } else if (chess.isDraw()) {
            playSound('gameover');
            onFinishGame('draw', 'Match Nul', 'Partie déclarée nulle (pat ou matériel insuffisant).');
            return;
          }

          // Trigger AI turn
          triggerAiMove();
          return;
        }
      } catch (e) {
        // Not a legal move, check if clicked on another of own pieces
      }
    }

    // Select piece if it belongs to white (player)
    const piece = chess.get(square);
    if (piece && piece.color === 'w') {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true }).map((m) => m.to as Square);
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResign = () => {
    if (confirm('Êtes-vous sûr d’abandonner cette partie d’échecs ? Votre mise sera perdue.')) {
      onFinishGame('defeat', 'Abandon', 'Partie concédée par le joueur.');
    }
  };

  const handleOfferDraw = () => {
    // If board is fairly balanced, AI might accept
    const evalScore = ChessEngineHelper.evaluateBoard(chess);
    if (Math.abs(evalScore) < 5) {
      alert(`${opponent.name} accepte votre proposition de match nul !`);
      onFinishGame('draw', 'Accord mutuel', 'Nulle convenue d’un commun accord.');
    } else {
      alert(`${opponent.name} refuse le match nul : "La position est encore trop tranchée !"`);
    }
  };

  // Render 8x8 Board
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const inCheck = chess.inCheck();
  const turn = chess.turn();

  return (
    <div className="w-full max-w-md mx-auto p-3 flex flex-col pb-20">
      {/* Top Banner: Opponent Bar */}
      <div className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-2.5 mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={opponent.avatar}
              alt={opponent.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-600"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-[#131b2e]"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-white">{opponent.name}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                {opponent.chessElo} ELO
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Noirs</span>
              {isAiThinking && (
                <span className="text-cyan-400 animate-pulse font-medium">· Réfléchit...</span>
              )}
            </div>
          </div>
        </div>

        {/* Opponent Timer */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-sm ${
            turn === 'b'
              ? 'bg-amber-950/50 border-amber-500/60 text-amber-400'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{formatClock(opponentClock)}</span>
        </div>
      </div>

      {/* Captured by Player / White */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400 min-h-[24px]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {capturedByPlayer.map((p, idx) => (
            <span key={idx} className="w-4 h-4 inline-block opacity-80">
              {CHESS_PIECE_SVGS[p]?.('b')}
            </span>
          ))}
        </div>
        {inCheck && turn === 'w' && (
          <span className="text-red-400 font-bold text-xs animate-pulse flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            ÉCHEC !
          </span>
        )}
      </div>

      {/* The 8x8 Chessboard */}
      <div className="aspect-square w-full bg-[#0a0f1d] border-2 border-slate-700/80 rounded-xl overflow-hidden shadow-2xl p-1 mb-2.5 relative">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-lg overflow-hidden border border-slate-800">
          {ranks.map((rank, rIdx) =>
            files.map((file, fIdx) => {
              const square = `${file}${rank}` as Square;
              const isDark = (rIdx + fIdx) % 2 === 1;
              const piece = chess.get(square);
              const isSelected = selectedSquare === square;
              const isLegal = legalMoves.includes(square);
              const isLastMove = lastMove?.from === square || lastMove?.to === square;

              // Check if king is in check
              const isKingInCheck =
                inCheck &&
                piece &&
                piece.type === 'k' &&
                piece.color === turn;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isDark ? 'bg-[#1b253b]' : 'bg-[#2b3a58]'
                  } ${isLastMove ? 'ring-2 ring-inset ring-cyan-400/50' : ''} ${
                    isSelected ? 'bg-cyan-600/60 ring-2 ring-cyan-300' : ''
                  } ${isKingInCheck ? 'bg-red-600/70 ring-4 ring-red-400 animate-pulse' : ''}`}
                >
                  {/* Rank / File coordinate labels on outer edge */}
                  {fIdx === 0 && (
                    <span className="absolute top-0.5 left-0.5 text-[8px] font-mono font-bold text-slate-400/50 pointer-events-none">
                      {rank}
                    </span>
                  )}
                  {rIdx === 7 && (
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold text-slate-400/50 pointer-events-none">
                      {file}
                    </span>
                  )}

                  {/* Legal move indicator dot / ring */}
                  {isLegal && (
                    <div
                      className={`absolute z-10 pointer-events-none ${
                        piece
                          ? 'w-full h-full ring-4 ring-inset ring-emerald-400/70 bg-emerald-500/20 rounded-sm'
                          : 'w-3 h-3 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      }`}
                    />
                  )}

                  {/* Render Chess Piece */}
                  {piece && (
                    <div className="w-[82%] h-[82%] relative z-0 pointer-events-none transition-transform hover:scale-105">
                      {CHESS_PIECE_SVGS[piece.type]?.(piece.color)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Captured by Opponent / Black */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400 min-h-[24px]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {capturedByOpponent.map((p, idx) => (
            <span key={idx} className="w-4 h-4 inline-block opacity-80">
              {CHESS_PIECE_SVGS[p]?.('w')}
            </span>
          ))}
        </div>
        {inCheck && turn === 'b' && (
          <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            Adversaire en échec !
          </span>
        )}
      </div>

      {/* Bottom Banner: Player Bar */}
      <div className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-2.5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-display font-bold text-white ring-2 ring-cyan-400/60">
            VOUS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-white">Votre Tour</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded font-mono">
                Blancs
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mise engagée : <strong className="text-white">{stake}</strong> jetons
            </p>
          </div>
        </div>

        {/* Player Timer */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-sm ${
            turn === 'w'
              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-400 ring-2 ring-cyan-400/20'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{formatClock(playerClock)}</span>
        </div>
      </div>

      {/* Action Controls: Sound, Draw, Resign */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setSoundEnabled((v) => !v)}
          className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-1.5 transition"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          <span>{soundEnabled ? 'Sons On' : 'Muet'}</span>
        </button>

        <button
          onClick={handleOfferDraw}
          className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-1.5 transition"
        >
          <Handshake className="w-3.5 h-3.5 text-amber-400" />
          <span>Proposer nulle</span>
        </button>

        <button
          onClick={handleResign}
          className="py-2 px-3 rounded-xl text-xs font-semibold text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 flex items-center justify-center gap-1.5 transition"
        >
          <Flag className="w-3.5 h-3.5 text-red-400" />
          <span>Abandonner</span>
        </button>
      </div>
    </div>
  );
};
