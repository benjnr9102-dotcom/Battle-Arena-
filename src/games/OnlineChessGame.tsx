import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square, Color } from 'chess.js';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import { ChallengeInvite } from '../types';
import { AlertOctagon, LogOut, Loader2, Check, Flag } from 'lucide-react';
import { ResignConfirmModal } from '../components/ResignConfirmModal';

interface OnlineChessGameProps {
  invite: ChallengeInvite;
  currentUserId: string;
  currentUserPseudo: string;
  onQuitToLobby: () => void;
}

// Crisp Vector Chess Pieces (same as local chess)
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

export const OnlineChessGame: React.FC<OnlineChessGameProps> = ({
  invite,
  currentUserId,
  currentUserPseudo,
  onQuitToLobby,
}) => {
  const [chess] = useState<Chess>(() => new Chess());
  const [isReady, setIsReady] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Préparation de la partie...');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isWritingMove, setIsWritingMove] = useState<boolean>(false);

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const [gameStatus, setGameStatus] = useState<string>('active');
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<string | null>(null);
  const [turn, setTurn] = useState<Color>('w');
  const [moveCount, setMoveCount] = useState<number>(0);

  const [showResignConfirm, setShowResignConfirm] = useState<boolean>(false);
  const [isResigning, setIsResigning] = useState<boolean>(false);

  const wroteActiveMatchRef = useRef<boolean>(false);
  const clearedActiveMatchRef = useRef<boolean>(false);
  const prevStatusRef = useRef<string>('active');

  const [whitePseudo, setWhitePseudo] = useState<string>(invite.fromPseudo.substring(0, 20));
  const [blackPseudo, setBlackPseudo] = useState<string>(invite.toPseudo.substring(0, 20));

  const isWhite = currentUserId === invite.fromUid;
  const playerColor: Color = isWhite ? 'w' : 'b';
  const opponentPseudo = isWhite ? blackPseudo : whitePseudo;

  const markActiveMatch = useCallback(() => {
    if (wroteActiveMatchRef.current || clearedActiveMatchRef.current) return;
    wroteActiveMatchRef.current = true;
    updateDoc(doc(db, 'users', currentUserId), {
      activeMatchId: invite.id,
    }).catch((err) => {
      console.error('Erreur sauvegarde partie en cours:', err);
      wroteActiveMatchRef.current = false;
    });
  }, [currentUserId, invite.id]);

  const clearActiveMatch = useCallback(() => {
    if (clearedActiveMatchRef.current) return;
    clearedActiveMatchRef.current = true;
    updateDoc(doc(db, 'users', currentUserId), {
      activeMatchId: deleteField(),
    }).catch((err) => {
      console.error('Erreur nettoyage partie en cours:', err);
      clearedActiveMatchRef.current = false;
    });
  }, [currentUserId]);

  const soundEnabled = true;
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
    } catch (e) {}
  }, [soundEnabled]);

  // 1. Creation / Initialization of matches/{id} document
  useEffect(() => {
    let isMounted = true;
    let blackFallbackTimer: ReturnType<typeof setTimeout> | null = null;
    const matchRef = doc(db, 'matches', invite.id);

    const applyMatchSnapshotData = (data: any) => {
      if (data.whitePseudo) setWhitePseudo(data.whitePseudo);
      if (data.blackPseudo) setBlackPseudo(data.blackPseudo);

      const remoteFen = data.fen;
      if (remoteFen && remoteFen !== chess.fen()) {
        try {
          chess.load(remoteFen);
        } catch (e) {
          console.error('Erreur chargement position:', e);
        }
      }

      if (data.turn) setTurn(data.turn as Color);
      if (typeof data.moveCount === 'number') setMoveCount(data.moveCount);
      if (data.status) {
        setGameStatus(data.status);
        prevStatusRef.current = data.status;
      }
      if (data.result !== undefined) setGameResult(data.result);
      setEndReason(data.endReason || null);

      if (data.lastMove) {
        const m = data.lastMove;
        if (typeof m === 'string' && m.length >= 4) {
          setLastMove({
            from: m.substring(0, 2) as Square,
            to: m.substring(2, 4) as Square,
          });
        }
      }

      if (data.status === 'active') {
        markActiveMatch();
      } else if (data.status === 'finished') {
        clearActiveMatch();
      }
    };

    async function initMatch() {
      try {
        const docSnap = await getDoc(matchRef);
        if (docSnap.exists()) {
          applyMatchSnapshotData(docSnap.data());
          if (isMounted) setIsReady(true);
          return;
        }

        if (isWhite) {
          // White creates immediately
          const initialData = {
            challengeId: invite.id,
            game: 'chess',
            whiteUid: invite.fromUid,
            blackUid: invite.toUid,
            whitePseudo: (invite.fromPseudo || 'Joueur Blanc').substring(0, 20),
            blackPseudo: (invite.toPseudo || 'Joueur Noir').substring(0, 20),
            stake: Number(invite.stake) || 1000,
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            turn: 'w',
            moveCount: 0,
            status: 'active',
            createdAt: serverTimestamp(),
          };
          await setDoc(matchRef, initialData);
          markActiveMatch();
          if (isMounted) setIsReady(true);
        } else {
          // Black: wait 5 seconds, if not created by white, create it
          setLoadingText('Préparation de la partie...');
          blackFallbackTimer = setTimeout(async () => {
            if (!isMounted) return;
            try {
              const checkSnap = await getDoc(matchRef);
              if (!checkSnap.exists()) {
                const initialData = {
                  challengeId: invite.id,
                  game: 'chess',
                  whiteUid: invite.fromUid,
                  blackUid: invite.toUid,
                  whitePseudo: (invite.fromPseudo || 'Joueur Blanc').substring(0, 20),
                  blackPseudo: (invite.toPseudo || 'Joueur Noir').substring(0, 20),
                  stake: Number(invite.stake) || 1000,
                  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                  turn: 'w',
                  moveCount: 0,
                  status: 'active',
                  createdAt: serverTimestamp(),
                };
                await setDoc(matchRef, initialData);
                markActiveMatch();
              } else {
                applyMatchSnapshotData(checkSnap.data());
              }
              if (isMounted) setIsReady(true);
            } catch (err) {
              // If created by white in the meantime, ignore and let snapshot pick it up
              if (isMounted) setIsReady(true);
            }
          }, 5000);
        }
      } catch (err) {
        console.error('Erreur initialisation partie en ligne:', err);
        if (isMounted) setIsReady(true);
      }
    }

    initMatch();

    return () => {
      isMounted = false;
      if (blackFallbackTimer) clearTimeout(blackFallbackTimer);
    };
  }, [
    invite.id,
    isWhite,
    invite.fromUid,
    invite.toUid,
    invite.fromPseudo,
    invite.toPseudo,
    invite.stake,
    chess,
    markActiveMatch,
    clearActiveMatch,
  ]);

  // 2. Real-time onSnapshot listener on matches/{id}
  useEffect(() => {
    if (!isReady) return;

    const matchRef = doc(db, 'matches', invite.id);
    const unsubscribe = onSnapshot(
      matchRef,
      (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();

        if (data.whitePseudo) setWhitePseudo(data.whitePseudo);
        if (data.blackPseudo) setBlackPseudo(data.blackPseudo);

        const remoteFen = data.fen;
        if (remoteFen && remoteFen !== chess.fen()) {
          try {
            chess.load(remoteFen);
          } catch (e) {
            console.error('Erreur chargement position:', e);
          }
        }

        if (data.turn) setTurn(data.turn as Color);
        if (typeof data.moveCount === 'number') setMoveCount(data.moveCount);
        if (data.status) {
          if (data.status === 'finished' && prevStatusRef.current !== 'finished') {
            playSound('gameover');
          }
          prevStatusRef.current = data.status;
          setGameStatus(data.status);
        }
        if (data.result !== undefined) setGameResult(data.result);
        setEndReason(data.endReason || null);

        if (data.lastMove) {
          const m = data.lastMove;
          if (typeof m === 'string' && m.length >= 4) {
            setLastMove({
              from: m.substring(0, 2) as Square,
              to: m.substring(2, 4) as Square,
            });
          }
        }

        if (data.status === 'active') {
          markActiveMatch();
        } else if (data.status === 'finished') {
          setShowResignConfirm(false);
          clearActiveMatch();
        }
      },
      (error) => {
        console.error('Erreur écoute partie en ligne:', error);
      }
    );

    return () => unsubscribe();
  }, [isReady, invite.id, chess, markActiveMatch, clearActiveMatch, playSound]);

  // 2b. Confirm Resignation handler (writes ONLY status, endReason, result)
  const handleConfirmResign = async () => {
    if (isResigning || gameStatus === 'finished') return;

    setIsResigning(true);
    setErrorMessage('');

    const winnerColor = isWhite ? 'black' : 'white';

    try {
      await updateDoc(doc(db, 'matches', invite.id), {
        status: 'finished',
        endReason: 'resign',
        result: winnerColor,
      });
      setShowResignConfirm(false);
      clearActiveMatch();
    } catch (resignErr) {
      console.error('Erreur écriture abandon:', resignErr);
      setShowResignConfirm(false);
      try {
        const snap = await getDoc(doc(db, 'matches', invite.id));
        if (snap.exists()) {
          const d = snap.data();
          if (d.fen) {
            try {
              chess.load(d.fen);
            } catch (e) {}
          }
          if (d.turn) setTurn(d.turn as Color);
          if (typeof d.moveCount === 'number') setMoveCount(d.moveCount);
          if (d.status) {
            prevStatusRef.current = d.status;
            setGameStatus(d.status);
          }
          if (d.result !== undefined) setGameResult(d.result);
          setEndReason(d.endReason || null);
          if (d.lastMove && typeof d.lastMove === 'string' && d.lastMove.length >= 4) {
            setLastMove({
              from: d.lastMove.substring(0, 2) as Square,
              to: d.lastMove.substring(2, 4) as Square,
            });
          }
          if (d.status === 'finished') {
            clearActiveMatch();
          }
        }
      } catch (e) {}
      setErrorMessage("Impossible d'abandonner : la partie est déjà terminée.");
    } finally {
      setIsResigning(false);
    }
  };

  // 3. Handle Square Click & Move execution
  const handleSquareClick = async (square: Square) => {
    if (isWritingMove || gameStatus === 'finished') return;
    if (turn !== playerColor) return; // not my turn

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      try {
        const moveObj = chess.move({
          from: selectedSquare,
          to: square,
          promotion: 'q', // auto promote to queen
        });

        if (moveObj) {
          // Valid move made locally
          const newFen = chess.fen();
          const newTurn = chess.turn();
          const newMoveCount = moveCount + 1;
          const lastMoveStr = `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}`;

          let nextStatus = 'active';
          let nextResult: string | null = null;

          if (chess.isCheckmate()) {
            nextStatus = 'finished';
            nextResult = playerColor === 'w' ? 'white' : 'black';
          } else if (chess.isDraw()) {
            nextStatus = 'finished';
            nextResult = 'draw';
          }

          setIsWritingMove(true);
          setErrorMessage('');

          try {
            const matchRef = doc(db, 'matches', invite.id);
            const updatePayload: any = {
              fen: newFen,
              turn: newTurn,
              moveCount: newMoveCount,
              lastMove: lastMoveStr,
              status: nextStatus,
            };
            if (nextResult !== null) {
              updatePayload.result = nextResult;
            }

            await updateDoc(matchRef, updatePayload);

            if (moveObj.captured) playSound('capture');
            else playSound('move');

            if (chess.inCheck()) playSound('check');
            if (nextStatus === 'finished') playSound('gameover');

            setSelectedSquare(null);
            setLegalMoves([]);
          } catch (writeErr) {
            console.error('Erreur écriture coup Firestore:', writeErr);
            // Re-read document to sync state and show friendly error
            try {
              const snap = await getDoc(doc(db, 'matches', invite.id));
              if (snap.exists()) {
                const d = snap.data();
                chess.load(d.fen);
                setTurn(d.turn);
                setMoveCount(d.moveCount);
              }
            } catch (e) {}
            setErrorMessage('Coup non enregistré, réessaie');
          } finally {
            setIsWritingMove(false);
          }
          return;
        }
      } catch (e) {
        // Not a legal move, check if selecting own piece
      }
    }

    const piece = chess.get(square);
    if (piece && piece.color === playerColor) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true }).map((m) => m.to as Square);
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const ranks = playerColor === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = playerColor === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-3 animate-pulse">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>
        <p className="font-display font-bold text-sm text-cyan-400">
          {loadingText}
        </p>
      </div>
    );
  }

  const inCheck = chess.inCheck();

  return (
    <div className="w-full max-w-md mx-auto p-3.5 flex flex-col pb-24">
      {/* Top Banner: Opponent Bar */}
      <div className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-3 mb-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-display font-bold text-white ring-2 ring-slate-600">
            {opponentPseudo.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base text-white">{opponentPseudo}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                {isWhite ? 'Noirs' : 'Blancs'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {turn !== playerColor && gameStatus !== 'finished' ? (
                <span className="text-cyan-400 font-semibold">Au tour de {opponentPseudo}</span>
              ) : (
                <span>En attente</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {gameStatus !== 'finished' && (
            <button
              type="button"
              onClick={() => setShowResignConfirm(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-200 bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 flex items-center gap-1 transition"
            >
              <Flag className="w-3.5 h-3.5 text-red-400" />
              <span>Abandonner</span>
            </button>
          )}

          <button
            type="button"
            onClick={onQuitToLobby}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Quitter</span>
          </button>
        </div>
      </div>

      {/* Error message banner if write failed */}
      {errorMessage && (
        <div className="mb-2 p-2.5 rounded-xl bg-red-950/70 border border-red-500/50 text-xs text-red-300 text-center font-medium">
          {errorMessage}
        </div>
      )}

      {/* Turn indicator banner */}
      <div className="mb-2.5 flex items-center justify-between px-1 text-xs">
        <span className="text-slate-400">
          Partie en ligne officielle
        </span>
        <span className={`font-display font-bold px-2 py-0.5 rounded-full ${
          turn === playerColor && gameStatus !== 'finished'
            ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40 animate-pulse'
            : 'bg-slate-900 text-slate-400 border border-slate-800'
        }`}>
          {gameStatus === 'finished' ? 'Partie terminée' : turn === playerColor ? 'À toi de jouer' : `Au tour de ${opponentPseudo}`}
        </span>
      </div>

      {/* The 8x8 Chessboard */}
      <div className="aspect-square w-full bg-[#0a0f1d] border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl p-1.5 mb-3 relative">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden border border-slate-800">
          {ranks.map((rank, rIdx) =>
            files.map((file, fIdx) => {
              const square = `${file}${rank}` as Square;
              const isDark = (rIdx + fIdx) % 2 === 1;
              const piece = chess.get(square);
              const isSelected = selectedSquare === square;
              const isLegal = legalMoves.includes(square);
              const isLastMove = lastMove?.from === square || lastMove?.to === square;
              const isKingInCheck = inCheck && piece && piece.type === 'k' && piece.color === turn;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isDark ? 'bg-[#1b253b]' : 'bg-[#2b3a58]'
                  } ${isLastMove ? 'ring-2 ring-inset ring-cyan-400/60' : ''} ${
                    isSelected ? 'bg-cyan-600/60 ring-2 ring-cyan-300' : ''
                  } ${isKingInCheck ? 'bg-red-600/70 ring-4 ring-red-400 animate-pulse' : ''}`}
                >
                  {isLegal && (
                    <div
                      className={`absolute z-10 pointer-events-none ${
                        piece
                          ? 'w-full h-full ring-4 ring-inset ring-emerald-400/70 bg-emerald-500/20 rounded-sm'
                          : 'w-3 h-3 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      }`}
                    />
                  )}

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

      {/* Bottom Banner: Player Bar */}
      <div className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-display font-bold text-white ring-2 ring-cyan-400/60">
            {currentUserPseudo.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base text-white">{currentUserPseudo} (Vous)</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-mono">
                {isWhite ? 'Blancs' : 'Noirs'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Mise : <strong className="text-white">{invite.stake} jetons</strong>
            </p>
          </div>
        </div>

        {turn === playerColor && gameStatus !== 'finished' && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
            <Check className="w-3.5 h-3.5" />
            <span>À toi</span>
          </span>
        )}
      </div>

      {/* Resign Confirmation Modal */}
      <ResignConfirmModal
        isOpen={showResignConfirm}
        isSubmitting={isResigning}
        onConfirmResign={handleConfirmResign}
        onContinuePlaying={() => {
          if (!isResigning) setShowResignConfirm(false);
        }}
      />

      {/* Game Over Modal Popup */}
      {gameStatus === 'finished' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#0d1322] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center mx-auto mb-3">
              <AlertOctagon className="w-7 h-7 text-cyan-400" />
            </div>

            <h3 className="font-display font-bold text-xl text-white mb-2">
              FIN DE LA PARTIE
            </h3>

            <p className="text-sm text-slate-200 mb-5 leading-relaxed">
              {endReason === 'resign'
                ? gameResult === (isWhite ? 'white' : 'black')
                  ? `${opponentPseudo} a abandonné, tu gagnes !`
                  : `Tu as abandonné, ${opponentPseudo} gagne`
                : gameResult === 'draw'
                ? 'Match nul !'
                : gameResult === 'white'
                ? `Échec et mat, ${whitePseudo} gagne !`
                : gameResult === 'black'
                ? `Échec et mat, ${blackPseudo} gagne !`
                : 'La partie est terminée.'}
            </p>

            <button
              type="button"
              onClick={() => {
                clearActiveMatch();
                onQuitToLobby();
              }}
              className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition"
            >
              Retour au lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
