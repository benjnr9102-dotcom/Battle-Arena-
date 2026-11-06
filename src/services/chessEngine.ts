import { Chess, Move, Square } from 'chess.js';

// Piece value mapping for heuristic AI evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

// Center squares bonus (d4, d5, e4, e5, c4, c5, f4, f5)
const CENTER_SQUARES = new Set(['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'f4', 'f5']);

export class ChessEngineHelper {
  // Evaluates position from black's (AI) perspective
  static evaluateBoard(chess: Chess): number {
    let score = 0;
    const board = chess.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const val = PIECE_VALUES[piece.type] || 0;
          const square = `${String.fromCharCode(97 + c)}${8 - r}`;
          const centerBonus = CENTER_SQUARES.has(square) ? 3 : 0;

          if (piece.color === 'b') {
            score += val + centerBonus;
          } else {
            score -= val + centerBonus;
          }
        }
      }
    }

    if (chess.isCheckmate()) {
      // If white is in checkmate, Black won!
      return chess.turn() === 'w' ? 10000 : -10000;
    }

    if (chess.isDraw()) {
      return 0;
    }

    return score;
  }

  // Get AI move based on difficulty / ELO
  // koffi: 1720 (strong), marie: 1540 (tactical), boss: 1890 (aggressive)
  static getBestMove(chess: Chess, eloRating: number = 1600): Move | null {
    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    // Check for direct checkmate
    for (const move of legalMoves) {
      chess.move(move);
      const isMate = chess.isCheckmate();
      chess.undo();
      if (isMate) return move;
    }

    // Sort moves by heuristic evaluation
    const scoredMoves = legalMoves.map((move) => {
      chess.move(move);
      let score = this.evaluateBoard(chess);

      // Random factor depending on ELO (lower ELO has slight randomness)
      const randomness = (2000 - Math.min(2000, Math.max(1000, eloRating))) / 50;
      score += (Math.random() - 0.5) * randomness;

      // Bonus for captures
      if (move.captured) {
        score += (PIECE_VALUES[move.captured] || 5) * 1.5;
      }
      // Bonus for checks
      if (chess.inCheck()) {
        score += 8;
      }

      chess.undo();
      return { move, score };
    });

    // Sort descending (AI is Black, aiming for higher score)
    scoredMoves.sort((a, b) => b.score - a.score);

    // Pick top move or occasionally second best for human-like realism
    const pickIndex = Math.random() < 0.85 ? 0 : Math.min(1, scoredMoves.length - 1);
    return scoredMoves[pickIndex].move;
  }
}
