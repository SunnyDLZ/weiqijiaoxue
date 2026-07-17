/**
 * 五子棋核心引擎
 * 15x15标准棋盘，五连获胜
 */
class GomokuEngine {
  constructor(size = 15) {
    this.size = size;
    this.reset();
  }

  reset() {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.currentPlayer = 1; // 黑先
    this.moveHistory = [];
    this.gameOver = false;
    this.winner = 0;
    this.lastMove = null;
    this.moveCount = 0;
    this.winLine = null; // 获胜的5子连线
    this.onStonePlaced = null;
    this.onGameOver = null;
  }

  getBoard() { return this.board; }
  getCurrentPlayer() { return this.currentPlayer; }
  getMoveHistory() { return this.moveHistory; }
  getLastMove() { return this.lastMove; }
  isGameOver() { return this.gameOver; }
  getWinner() { return this.winner; }

  clone() {
    const engine = new GomokuEngine(this.size);
    engine.board = this.board.map(row => [...row]);
    engine.currentPlayer = this.currentPlayer;
    engine.moveHistory = [...this.moveHistory];
    engine.gameOver = this.gameOver;
    engine.winner = this.winner;
    engine.lastMove = this.lastMove ? { ...this.lastMove } : null;
    engine.moveCount = this.moveCount;
    engine.winLine = this.winLine ? [...this.winLine] : null;
    return engine;
  }

  isValidPosition(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  isEmpty(row, col) {
    return this.isValidPosition(row, col) && this.board[row][col] === 0;
  }

  getStone(row, col) {
    if (!this.isValidPosition(row, col)) return null;
    return this.board[row][col];
  }

  /**
   * 获取所有合法落子位置
   */
  getLegalMoves() {
    const moves = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 0) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }

  /**
   * 检查五连
   */
  checkWin(row, col) {
    const player = this.board[row][col];
    if (player === 0) return false;

    const directions = [
      [0, 1],   // 水平
      [1, 0],   // 垂直
      [1, 1],   // 对角线
      [1, -1]   // 反对角线
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      const line = [{ row, col }];

      // 正方向
      for (let i = 1; i < 5; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (this.isValidPosition(r, c) && this.board[r][c] === player) {
          count++;
          line.push({ row: r, col: c });
        } else break;
      }

      // 反方向
      for (let i = 1; i < 5; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (this.isValidPosition(r, c) && this.board[r][c] === player) {
          count++;
          line.push({ row: r, col: c });
        } else break;
      }

      if (count >= 5) {
        this.winLine = line;
        return true;
      }
    }
    return false;
  }

  /**
   * 落子
   */
  placeStone(row, col) {
    if (!this.isEmpty(row, col)) {
      return { success: false };
    }
    if (this.gameOver) {
      return { success: false };
    }

    this.board[row][col] = this.currentPlayer;
    this.lastMove = { row, col };
    this.moveCount++;

    this.moveHistory.push({
      row, col,
      player: this.currentPlayer
    });

    // 检查胜利
    if (this.checkWin(row, col)) {
      this.gameOver = true;
      this.winner = this.currentPlayer;
      if (this.onGameOver) {
        this.onGameOver({ winner: this.currentPlayer, winLine: this.winLine });
      }
    } else if (this.moveCount >= this.size * this.size) {
      // 平局
      this.gameOver = true;
      this.winner = 0;
      if (this.onGameOver) {
        this.onGameOver({ winner: 0, winLine: null });
      }
    }

    const placedPlayer = this.currentPlayer;
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

    if (this.onStonePlaced) {
      this.onStonePlaced({ row, col, player: placedPlayer });
    }
    return { success: true };
  }

  /**
   * 悔棋
   */
  undo() {
    if (this.moveHistory.length === 0) return false;
    const lastMove = this.moveHistory.pop();
    this.board[lastMove.row][lastMove.col] = 0;
    this.currentPlayer = lastMove.player;
    this.lastMove = this.moveHistory.length > 0
      ? { row: this.moveHistory[this.moveHistory.length - 1].row, col: this.moveHistory[this.moveHistory.length - 1].col }
      : null;
    this.moveCount--;
    this.gameOver = false;
    this.winner = 0;
    this.winLine = null;
    return true;
  }
}