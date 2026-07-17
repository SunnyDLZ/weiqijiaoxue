/**
 * 围棋AI引擎 - 支持3个难度级别
 * 一般(Normal): 随机+基本回避
 * 困难(Hard): 启发式评估
 * 噩梦(Nightmare): 蒙特卡洛树搜索
 */
class AIPlayer {
  constructor(engine, difficulty = 'normal') {
    this.engine = engine;
    this.difficulty = difficulty; // 'normal' | 'hard' | 'nightmare'
    this.simulations = { normal: 10, hard: 60, nightmare: 200 };
    this.thinking = false;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  /**
   * 获取AI的最佳落子 - 异步执行避免阻塞UI
   */
  async getBestMove() {
    if (this.engine.gameOver) return null;
    this.thinking = true;

    let move;
    const legalMoves = this.engine.getLegalMoves();
    if (legalMoves.length === 0) {
      this.thinking = false;
      return null; // 虚手
    }

    // 先让出主线程，确保UI响应
    await this.yieldThread();

    switch (this.difficulty) {
      case 'normal':
        move = await this.getNormalMoveAsync(legalMoves);
        break;
      case 'hard':
        move = await this.getHardMoveAsync(legalMoves);
        break;
      case 'nightmare':
        move = await this.getNightmareMove(legalMoves);
        break;
      default:
        move = await this.getNormalMoveAsync(legalMoves);
    }

    this.thinking = false;
    return move;
  }

  /**
   * 让出主线程，确保UI保持响应
   */
  async yieldThread() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * 一般难度（异步版）：避免送死，优先提子
   * 分批处理，每批后让出主线程
   */
  async getNormalMoveAsync(legalMoves) {
    const aiColor = this.engine.currentPlayer;

    // 防守优先：检查己方是否有被打吃的棋串
    const defenseMove = this.findAtariDefense(aiColor);
    if (defenseMove) {
      return defenseMove;
    }

    const scored = [];
    const batchSize = Math.min(40, Math.ceil(legalMoves.length / 3));
    const opponent = aiColor === 1 ? 2 : 1;

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      let score = Math.random() * 10;
      const testEngine = this.engine.clone();
      const result = testEngine.placeStone(move.row, move.col);

      if (result.success) {
        if (result.captured.length > 0) {
          score += result.captured.length * 30; // 提子加分
        }

        // 检查落子后自己的棋串是否被打吃（自送）
        const ownGroup = testEngine.getGroup(move.row, move.col);
        const ownLibs = testEngine.countLiberties(ownGroup);
        if (ownLibs === 1 && result.captured.length === 0) {
          score -= 50; // 自送惩罚
        }

        // 检查是否会被提 - 只抽样检查对手部分落子
        const oppMoves = testEngine.getLegalMoves();
        const sampleSize = Math.min(oppMoves.length, 8);
        let danger = 0;
        for (let j = 0; j < sampleSize; j++) {
          const oppMove = oppMoves[Math.floor(Math.random() * oppMoves.length)];
          const testEngine2 = testEngine.clone();
          testEngine2.currentPlayer = opponent;
          const r2 = testEngine2.placeStone(oppMove.row, oppMove.col);
          if (r2.success && r2.captured.length > 0) {
            danger += r2.captured.length;
          }
        }
        score -= danger * 20;
      } else {
        score = -100;
      }

      scored.push({ move, score });

      // 每处理一批就让出主线程
      if ((i + 1) % batchSize === 0 && i < legalMoves.length - 1) {
        await this.yieldThread();
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored[0].move;
  }

  /**
   * 查找己方被打吃的棋串，并返回救援落子
   * 返回 {row, col} 或 null
   */
  findAtariDefense(aiColor) {
    const visited = new Set();
    const defenseMoves = [];

    for (let r = 0; r < this.engine.size; r++) {
      for (let c = 0; c < this.engine.size; c++) {
        const key = r * this.engine.size + c;
        if (visited.has(key) || this.engine.board[r][c] !== aiColor) continue;

        const group = this.engine.getGroup(r, c);
        for (const stone of group) {
          visited.add(stone.row * this.engine.size + stone.col);
        }

        const liberties = this.engine.getLiberties(group);
        // 棋串只有1口气（被打吃），尝试救援
        if (liberties.length === 1) {
          const libPoint = liberties[0];
          // 尝试在气点延伸或提子
          const testEngine = this.engine.clone();
          testEngine.currentPlayer = aiColor;
          const result = testEngine.placeStone(libPoint.row, libPoint.col);
          if (result.success) {
            const newGroup = testEngine.getGroup(libPoint.row, libPoint.col);
            const newLibs = testEngine.countLiberties(newGroup);
            // 延伸后气数增加，或提子了 → 有效救援
            if (newLibs > 1 || result.captured.length > 0) {
              defenseMoves.push({
                row: libPoint.row,
                col: libPoint.col,
                priority: group.length * 10 + newLibs * 3 + result.captured.length * 5
              });
            }
          }
        }
      }
    }

    if (defenseMoves.length === 0) return null;
    defenseMoves.sort((a, b) => b.priority - a.priority);
    return { row: defenseMoves[0].row, col: defenseMoves[0].col };
  }

  /**
   * 困难难度（异步版）：启发式评估
   */
  async getHardMoveAsync(legalMoves) {
    const aiColor = this.engine.currentPlayer;

    // 防守优先：检查己方是否有被打吃的棋串
    const defenseMove = this.findAtariDefense(aiColor);
    if (defenseMove) {
      return defenseMove;
    }

    const scored = [];
    const opponent = aiColor === 1 ? 2 : 1;
    const batchSize = Math.min(30, Math.ceil(legalMoves.length / 3));

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      const testEngine = this.engine.clone();
      const result = testEngine.placeStone(move.row, move.col);

      if (!result.success) {
        scored.push({ move, score: -1000 });
        continue;
      }

      let score = this.evaluateBoard(testEngine, aiColor);

      // 提子奖励
      if (result.captured.length > 0) {
        score += result.captured.length * 50;
      }

      // 自送惩罚：落子后自己的棋串只有1口气
      const ownGroup = testEngine.getGroup(move.row, move.col);
      const ownLibs = testEngine.countLiberties(ownGroup);
      if (ownLibs === 1 && result.captured.length === 0) {
        score -= 80;
      }

      // 靠近中心加分
      const center = (this.engine.size - 1) / 2;
      const distFromCenter = Math.abs(move.row - center) + Math.abs(move.col - center);
      score += (this.engine.size - distFromCenter) * 0.5;

      // 检查对方最佳应对 - 抽样
      const oppMoves = testEngine.getLegalMoves();
      if (oppMoves.length > 0) {
        let bestOppScore = -Infinity;
        const sampleCount = Math.min(oppMoves.length, 8);
        for (let j = 0; j < sampleCount; j++) {
          const oppMove = oppMoves[Math.floor(Math.random() * oppMoves.length)];
          const testEngine2 = testEngine.clone();
          testEngine2.currentPlayer = opponent;
          const r2 = testEngine2.placeStone(oppMove.row, oppMove.col);
          if (r2.success) {
            const oppScore = this.evaluateBoard(testEngine2, opponent);
            if (oppScore > bestOppScore) bestOppScore = oppScore;
          }
        }
        score -= bestOppScore * 0.5;
      }

      scored.push({ move, score });

      // 每处理一批就让出主线程
      if ((i + 1) % batchSize === 0 && i < legalMoves.length - 1) {
        await this.yieldThread();
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored[0].move;
  }

  /**
   * 噩梦难度：蒙特卡洛树搜索（异步版）
   * 限制模拟次数和候选数，避免阻塞UI线程
   */
  async getNightmareMove(legalMoves) {
    const numSims = this.simulations.nightmare;
    const aiColor = this.engine.currentPlayer;

    // 防守优先：检查己方是否有被打吃的棋串
    const defenseMove = this.findAtariDefense(aiColor);
    if (defenseMove) {
      return defenseMove;
    }

    const moveStats = [];

    // 限制候选移动数量（16个，平衡搜索广度与速度）
    const candidates = this.getCandidateMoves(legalMoves, 16);

    for (let ci = 0; ci < candidates.length; ci++) {
      const move = candidates[ci];
      let wins = 0;
      const batchSize = Math.floor(numSims / candidates.length);

      for (let i = 0; i < batchSize; i++) {
        const simEngine = this.engine.clone();
        const result = simEngine.placeStone(move.row, move.col);
        if (!result.success) continue;

        const winner = this.randomPlayout(simEngine);
        if (winner === aiColor) wins++;
        else if (winner === 0) wins += 0.5;

        // 每8次模拟让出主线程，保持UI响应
        if (i % 8 === 7) {
          await this.yieldThread();
        }
      }

      moveStats.push({
        move,
        wins,
        total: batchSize,
        winRate: wins / batchSize
      });

      // 每个候选着法之间让出主线程
      await this.yieldThread();
    }

    moveStats.sort((a, b) => b.winRate - a.winRate);
    return moveStats[0]?.move || candidates[0];
  }

  /**
   * 获取候选移动（筛选有潜力的落子点）
   */
  getCandidateMoves(legalMoves, maxCandidates) {
    const scored = [];
    const aiColor = this.engine.currentPlayer;

    for (const move of legalMoves) {
      let score = 0;
      const { row, col } = move;

      // 优先考虑靠近已有棋子的位置
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = row + dr, nc = col + dc;
          if (this.engine.isValidPosition(nr, nc) && this.engine.board[nr][nc] !== 0) {
            score += 3 - Math.abs(dr) - Math.abs(dc);
          }
        }
      }

      // 提子优先
      const testEngine = this.engine.clone();
      const result = testEngine.placeStone(row, col);
      if (result.success && result.captured.length > 0) {
        score += result.captured.length * 15;
      }

      scored.push({ move, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxCandidates).map(s => s.move);
  }

  /**
   * 随机模拟到终局（优化版，限制步数与候选数）
   * 优化点：maxMoves限定50；engine 已由调用方提供独立克隆，直接在其上模拟，无需再次 clone
   */
  randomPlayout(engine) {
    let moveCount = 0;
    const maxMoves = Math.min(engine.size * engine.size, 50);

    while (moveCount < maxMoves && !engine.gameOver) {
      const legalMoves = engine.getLegalMoves();
      if (legalMoves.length === 0) {
        engine.pass();
        if (engine.passes >= 2) break;
        moveCount++;
        continue;
      }

      // 带偏好的随机：优先提子和占地
      const move = this.selectPlayoutMove(engine, legalMoves);
      const result = engine.placeStone(move.row, move.col);
      if (result.success) {
        moveCount++;
      } else {
        // 如果落子失败，随机选一个
        const fallback = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        engine.placeStone(fallback.row, fallback.col);
        moveCount++;
      }
    }

    if (engine.passes < 2) {
      engine.pass();
      engine.pass();
    }

    const territory = engine.calculateTerritory();
    if (territory.black > territory.white + 7.5) return 1;
    if (territory.white + 7.5 > territory.black) return 2;
    return 0;
  }

  /**
   * 模拟落子选择（带启发式，避免频繁clone）
   * 优化点：用 wouldCapture 只读棋盘判断是否提子，不再对候选点 clone 整个引擎
   */
  selectPlayoutMove(engine, legalMoves) {
    if (Math.random() < 0.3) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // 70%概率抽样最多8个候选点，寻找提子机会（只读判断，零 clone）
    const aiColor = engine.currentPlayer;
    const sampleSize = Math.min(legalMoves.length, 8);
    for (let i = 0; i < sampleSize; i++) {
      const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      if (this.wouldCapture(engine, move.row, move.col, aiColor)) {
        return move;
      }
    }

    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  /**
   * 判断在(row,col)落子是否会提子（只读棋盘，不修改、不clone）
   */
  wouldCapture(engine, row, col, color) {
    const opponent = color === 1 ? 2 : 1;
    const neighbors = engine.getAdjacent(row, col);
    for (const [nr, nc] of neighbors) {
      if (engine.board[nr][nc] === opponent) {
        const group = engine.getGroup(nr, nc);
        const libs = engine.getLiberties(group);
        // 敌方棋串仅剩(row,col)这一口气 → 落子即可提
        if (libs.length === 1 && libs[0].row === row && libs[0].col === col) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 棋盘评估函数
   */
  evaluateBoard(engine, playerColor) {
    let score = 0;
    const opponent = playerColor === 1 ? 2 : 1;
    const visited = new Set();

    for (let r = 0; r < engine.size; r++) {
      for (let c = 0; c < engine.size; c++) {
        const key = r * engine.size + c;
        if (engine.board[r][c] === 0 || visited.has(key)) continue;

        const group = engine.getGroup(r, c);
        // 标记整个棋串为已访问，避免重复计算
        for (const stone of group) {
          visited.add(stone.row * engine.size + stone.col);
        }

        const liberties = engine.countLiberties(group);

        if (engine.board[r][c] === playerColor) {
          score += liberties * 2;
          // 靠近中心加分
          const center = (engine.size - 1) / 2;
          score += (engine.size - Math.abs(r - center) - Math.abs(c - center)) * 0.1;
        } else {
          score -= liberties * 2;
        }
      }
    }

    // 提子加分
    if (playerColor === 1) {
      score += engine.capturedWhite * 10;
      score -= engine.capturedBlack * 10;
    } else {
      score += engine.capturedBlack * 10;
      score -= engine.capturedWhite * 10;
    }

    // 领地估计
    const territory = this.estimateTerritory(engine);
    score += territory[playerColor] * 0.5;
    score -= territory[opponent] * 0.5;

    return score;
  }

  /**
   * 快速领地估计
   */
  estimateTerritory(engine) {
    const influence = { 1: 0, 2: 0 };
    const influenceMap = Array.from({ length: engine.size }, () =>
      Array.from({ length: engine.size }, () => ({ 1: 0, 2: 0 }))
    );

    // 从每个棋子向外扩散影响力
    for (let r = 0; r < engine.size; r++) {
      for (let c = 0; c < engine.size; c++) {
        if (engine.board[r][c] !== 0) {
          const color = engine.board[r][c];
          for (let dr = -3; dr <= 3; dr++) {
            for (let dc = -3; dc <= 3; dc++) {
              const nr = r + dr, nc = c + dc;
              if (engine.isValidPosition(nr, nc)) {
                const dist = Math.abs(dr) + Math.abs(dc);
                if (dist <= 3) {
                  influenceMap[nr][nc][color] += (4 - dist) / 4;
                }
              }
            }
          }
        }
      }
    }

    for (let r = 0; r < engine.size; r++) {
      for (let c = 0; c < engine.size; c++) {
        if (engine.board[r][c] === 0) {
          if (influenceMap[r][c][1] > influenceMap[r][c][2] * 1.5) {
            influence[1]++;
          } else if (influenceMap[r][c][2] > influenceMap[r][c][1] * 1.5) {
            influence[2]++;
          }
        } else {
          influence[engine.board[r][c]]++;
        }
      }
    }

    return influence;
  }
}