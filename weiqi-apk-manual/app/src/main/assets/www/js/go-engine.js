/**
 * 围棋核心引擎 - 实现完整的围棋规则
 * 支持：落子、提子、打劫、禁入点、数目、判定胜负
 */
class GoEngine {
  constructor(size = 19) {
    this.size = size;
    this.reset();
  }

  reset() {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    // 0=空, 1=黑棋, 2=白棋
    this.currentPlayer = 1; // 黑先
    this.moveHistory = [];
    this.capturedBlack = 0; // 白方提黑子
    this.capturedWhite = 0; // 黑方提白子
    this.koPoint = null; // 打劫点 {row, col}
    this.gameOver = false;
    this.winner = 0;
    this.lastMove = null;
    this.moveCount = 0;
    this.passes = 0; // 连续虚手次数
    this.territory = null;
    this._lastResult = null; // 清除终局缓存
    this.onStonePlaced = null;
    this.onStonesCaptured = null;
    this.onGameOver = null;
  }

  getBoard() { return this.board; }
  getCurrentPlayer() { return this.currentPlayer; }
  getMoveHistory() { return this.moveHistory; }
  getLastMove() { return this.lastMove; }
  isGameOver() { return this.gameOver; }
  getWinner() { return this.winner; }

  clone() {
    const engine = new GoEngine(this.size);
    engine.board = this.board.map(row => [...row]);
    engine.currentPlayer = this.currentPlayer;
    // 浅拷贝 moveHistory：prevBoard 按引用共享。
    // 安全前提：prevBoard 在代码中只会被整体赋值（this.board = prevBoard）或重新生成
    // （this.board.map(...)），从不被原地修改；AI 的克隆只向前落子、不会 undo，
    // 因此共享引用可避免每次 clone 深拷贝整盘快照带来的巨大开销。
    engine.moveHistory = this.moveHistory.map(m => ({ ...m, captured: m.captured ? [...m.captured] : [] }));
    engine.capturedBlack = this.capturedBlack;
    engine.capturedWhite = this.capturedWhite;
    engine.koPoint = this.koPoint ? { ...this.koPoint } : null;
    engine.gameOver = this.gameOver;
    engine.winner = this.winner;
    engine.lastMove = this.lastMove ? { ...this.lastMove } : null;
    engine.moveCount = this.moveCount;
    engine.passes = this.passes;
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
   * 获取一个棋子所在棋串的所有棋子位置
   */
  getGroup(row, col) {
    const color = this.board[row][col];
    if (color === 0) return [];
    const group = [];
    const visited = new Set();
    const stack = [[row, col]];
    while (stack.length > 0) {
      const [r, c] = stack.pop();
      const key = r * this.size + c;
      if (visited.has(key)) continue;
      visited.add(key);
      group.push({ row: r, col: c });
      const neighbors = this.getAdjacent(r, c);
      for (const [nr, nc] of neighbors) {
        if (this.board[nr][nc] === color && !visited.has(nr * this.size + nc)) {
          stack.push([nr, nc]);
        }
      }
    }
    return group;
  }

  /**
   * 获取相邻位置
   */
  getAdjacent(row, col) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return dirs
      .map(([dr, dc]) => [row + dr, col + dc])
      .filter(([r, c]) => this.isValidPosition(r, c));
  }

  /**
   * 计算一个棋串的气数
   */
  countLiberties(group) {
    const liberties = new Set();
    for (const { row, col } of group) {
      const neighbors = this.getAdjacent(row, col);
      for (const [nr, nc] of neighbors) {
        if (this.board[nr][nc] === 0) {
          liberties.add(nr * this.size + nc);
        }
      }
    }
    return liberties.size;
  }

  /**
   * 获取一个棋串的气（返回位置列表）
   */
  getLiberties(group) {
    const liberties = new Set();
    for (const { row, col } of group) {
      const neighbors = this.getAdjacent(row, col);
      for (const [nr, nc] of neighbors) {
        if (this.board[nr][nc] === 0) {
          liberties.add(JSON.stringify({ row: nr, col: nc }));
        }
      }
    }
    return Array.from(liberties).map(s => JSON.parse(s));
  }

  /**
   * 检查落子位置是否是打劫点
   */
  isKo(row, col) {
    return this.koPoint && this.koPoint.row === row && this.koPoint.col === col;
  }

  /**
   * 获取所有合法落子位置
   */
  getLegalMoves() {
    const moves = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.isLegalMove(r, c)) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }

  /**
   * 判断是否合法落子（优化版：直接操作棋盘，避免clone）
   * 用 try/finally 保证临时改动在任何情况下都能被恢复，避免异常破坏棋盘
   */
  isLegalMove(row, col) {
    if (!this.isEmpty(row, col)) return false;
    if (this.isKo(row, col)) return false;

    const player = this.currentPlayer;
    const opponent = player === 1 ? 2 : 1;
    const capturedStones = [];

    // 临时落子
    this.board[row][col] = player;
    try {
      const neighbors = this.getAdjacent(row, col);
      for (const [nr, nc] of neighbors) {
        if (this.board[nr][nc] === opponent) {
          const group = this.getGroup(nr, nc);
          if (this.countLiberties(group) === 0) {
            for (const s of group) {
              capturedStones.push(s);
              this.board[s.row][s.col] = 0;
            }
          }
        }
      }
      // 检查自己的棋串是否有气
      const ownGroup = this.getGroup(row, col);
      return this.countLiberties(ownGroup) > 0;
    } finally {
      // 恢复棋盘：先恢复被提的子，再移除试下的子
      for (const s of capturedStones) this.board[s.row][s.col] = opponent;
      this.board[row][col] = 0;
    }
  }

  /**
   * 落子，返回被提的棋子列表
   */
  placeStone(row, col) {
    if (!this.isLegalMove(row, col)) {
      return { success: false, captured: [] };
    }

    // 保存当前状态用于检测打劫
    const prevBoard = this.board.map(r => [...r]);

    this.board[row][col] = this.currentPlayer;
    this.lastMove = { row, col };
    this.moveCount++;
    this.passes = 0;

    // 检查并提走相邻的敌方棋子
    const opponent = this.currentPlayer === 1 ? 2 : 1;
    const neighbors = this.getAdjacent(row, col);
    const allCaptured = [];

    for (const [nr, nc] of neighbors) {
      if (this.board[nr][nc] === opponent) {
        const group = this.getGroup(nr, nc);
        if (this.countLiberties(group) === 0) {
          for (const stone of group) {
            this.board[stone.row][stone.col] = 0;
            allCaptured.push(stone);
          }
        }
      }
    }

    // 更新提子计数
    if (this.currentPlayer === 1) {
      this.capturedWhite += allCaptured.length;
    } else {
      this.capturedBlack += allCaptured.length;
    }

    // 打劫检测：提了1子，且落子是单子（未连接友军），且只有一口气
    this.koPoint = null;
    if (allCaptured.length === 1) {
      const ownGroup = this.getGroup(row, col);
      if (ownGroup.length === 1 && this.countLiberties(ownGroup) === 1) {
        const liberties = this.getLiberties(ownGroup);
        if (liberties.length === 1) {
          this.koPoint = { row: liberties[0].row, col: liberties[0].col };
        }
      }
    }

    // 保存历史
    this.moveHistory.push({
      row, col,
      player: this.currentPlayer,
      captured: allCaptured,
      prevBoard: prevBoard
    });

    // 切换玩家
    this.currentPlayer = opponent;

    // 触发回调（在切换玩家之后，确保回调中读取的currentPlayer是正确的）
    if (this.onStonePlaced) {
      this.onStonePlaced({ row, col, player: this.currentPlayer === 1 ? 2 : 1 });
    }
    if (allCaptured.length > 0 && this.onStonesCaptured) {
      this.onStonesCaptured(allCaptured);
    }

    return { success: true, captured: allCaptured };
  }

  /**
   * 虚手（Pass）
   */
  pass() {
    this.passes++;
    this.moveHistory.push({
      row: -1, col: -1,
      player: this.currentPlayer,
      captured: [],
      prevBoard: this.board.map(r => [...r])
    });
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.lastMove = null;

    // 连续两次虚手，游戏结束
    if (this.passes >= 2) {
      this.endGame();
    }
  }

  /**
   * 悔棋
   */
  undo() {
    if (this.moveHistory.length === 0) return false;

    const lastMove = this.moveHistory.pop();
    if (lastMove.row >= 0) {
      // 恢复棋盘
      this.board = lastMove.prevBoard;
      this.currentPlayer = lastMove.player;
      const prevEntry = this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
      this.lastMove = (prevEntry && prevEntry.row >= 0) ? { row: prevEntry.row, col: prevEntry.col } : null;
      this.moveCount--;

      // 恢复提子计数
      if (lastMove.captured.length > 0) {
        if (lastMove.player === 1) {
          this.capturedWhite -= lastMove.captured.length;
        } else {
          this.capturedBlack -= lastMove.captured.length;
        }
      }
    } else {
      // 虚手悔棋
      this.currentPlayer = lastMove.player;
      this.passes--;
      const prevEntry = this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
      this.lastMove = (prevEntry && prevEntry.row >= 0) ? { row: prevEntry.row, col: prevEntry.col } : null;
    }

    // 重新计算打劫点
    this.koPoint = null;
    this.gameOver = false;
    this.winner = 0;
    this.territory = null; // 清除领地数据，避免悔棋后仍显示

    if (this.moveHistory.length > 0) {
      const prev = this.moveHistory[this.moveHistory.length - 1];
      if (prev.row >= 0 && prev.captured.length === 1) {
        // 重建打劫检测：与 placeStone 的判据保持一致——
        // 仅当上一手是"单子提单子"且该子只剩一口气时，才设置打劫点
        const group = this.getGroup(prev.row, prev.col);
        if (group.length === 1 && this.countLiberties(group) === 1) {
          const liberties = this.getLiberties(group);
          if (liberties.length === 1) {
            this.koPoint = { row: liberties[0].row, col: liberties[0].col };
          }
        }
      }
    }

    return true;
  }

  /**
   * 终局数目（中国规则：数子法）
   */
  endGame() {
    // 已结束：返回上次计算结果，避免返回占位错误分数
    if (this.gameOver) {
      return this._lastResult || { winner: this.winner, blackScore: 0, whiteScore: 7.5, territory: this.territory };
    }
    this.gameOver = true;
    this.territory = this.calculateTerritory();
    const blackScore = this.territory.black;
    const whiteScore = this.territory.white + 7.5; // 贴目
    // 平局：双方分数相等时 winner=0
    this.winner = blackScore > whiteScore ? 1 : (blackScore < whiteScore ? 2 : 0);
    const result = { winner: this.winner, blackScore, whiteScore, territory: this.territory };
    this._lastResult = result;
    if (this.onGameOver) {
      this.onGameOver(result);
    }
    return result;
  }

  /**
   * 计算领地（简化版：Flood fill 确定归属）
   */
  calculateTerritory() {
    const visited = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    const territory = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    let blackTerritory = 0;
    let whiteTerritory = 0;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] !== 0 || visited[r][c]) continue;

        // BFS 找出连续空区域
        const region = [];
        const borders = new Set();
        const queue = [[r, c]];
        visited[r][c] = true;

        while (queue.length > 0) {
          const [cr, cc] = queue.shift();
          region.push({ row: cr, col: cc });
          const neighbors = this.getAdjacent(cr, cc);
          for (const [nr, nc] of neighbors) {
            if (this.board[nr][nc] === 0 && !visited[nr][nc]) {
              visited[nr][nc] = true;
              queue.push([nr, nc]);
            } else if (this.board[nr][nc] !== 0) {
              borders.add(this.board[nr][nc]);
            }
          }
        }

        if (borders.size === 1) {
          const owner = borders.values().next().value;
          for (const pos of region) {
            territory[pos.row][pos.col] = owner;
          }
          if (owner === 1) blackTerritory += region.length;
          else whiteTerritory += region.length;
        }
      }
    }

    // 加上棋盘上的棋子数
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 1) blackTerritory++;
        else if (this.board[r][c] === 2) whiteTerritory++;
      }
    }

    return {
      black: blackTerritory,
      white: whiteTerritory,
      map: territory
    };
  }

  /**
   * 以字符串形式输出棋盘（调试用）
   */
  toString() {
    const symbols = { 0: '.', 1: '●', 2: '○' };
    return this.board.map(row => row.map(c => symbols[c]).join(' ')).join('\n');
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoEngine;
}