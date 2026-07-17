/**
 * 五子棋AI引擎
 * 支持3个难度级别：简单/中等/困难
 * 使用模式匹配 + 极小极大搜索
 */
class GomokuAI {
  constructor(engine, difficulty = 'medium') {
    this.engine = engine;
    this.difficulty = difficulty;
    this.thinking = false;
    this.searchNodeCount = 0;
    this.maxSearchNodes = 30000;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  async yieldThread() {
    return new Promise(resolve => setTimeout(resolve, 20));
  }

  async getBestMove() {
    if (this.engine.gameOver) return null;
    this.thinking = true;

    await this.yieldThread();

    const legalMoves = this.engine.getLegalMoves();
    if (legalMoves.length === 0) return null;

    let move;
    switch (this.difficulty) {
      case 'easy':
        move = this.getEasyMove(legalMoves);
        break;
      case 'medium':
        move = await this.getMediumMove(legalMoves);
        break;
      case 'hard':
        move = await this.getHardMove(legalMoves);
        break;
      default:
        move = this.getEasyMove(legalMoves);
    }

    this.thinking = false;
    return move;
  }

  /**
   * 简单难度：基本防守 + 随机进攻
   */
  getEasyMove(legalMoves) {
    const candidates = this.getNearbyMoves(legalMoves, 20);
    const aiColor = this.engine.currentPlayer;
    const opponent = aiColor === 1 ? 2 : 1;

    // 先检查对手是否有四连，如果有就堵
    for (const move of candidates) {
      const testEngine = this.engine.clone();
      testEngine.currentPlayer = opponent;
      testEngine.board[move.row][move.col] = opponent;
      if (testEngine.checkWin(move.row, move.col)) {
        return move;
      }
    }

    // 检查自己是否有四连
    for (const move of candidates) {
      const testEngine = this.engine.clone();
      testEngine.board[move.row][move.col] = aiColor;
      if (testEngine.checkWin(move.row, move.col)) {
        return move;
      }
    }

    // 防守对手活四/双活三等必胜威胁
    const blockMove = this.findThreatBlock(this.engine, opponent);
    if (blockMove) {
      return blockMove;
    }

    // 随机选择并评分（加入随机性保持简单）
    const scored = [];
    for (const move of candidates) {
      let score = Math.random() * 10;
      score += this.evaluatePosition(this.engine, move.row, move.col, aiColor) * 0.4;
      score += this.evaluatePosition(this.engine, move.row, move.col, opponent) * 0.2;
      scored.push({ move, score });
    }
    scored.sort((a, b) => b.score - a.score);
    // 简单难度从前3名中随机选一个，保持不确定性
    const topN = Math.min(3, scored.length);
    return scored[Math.floor(Math.random() * topN)].move;
  }

  /**
   * 中等难度：威胁感知 + 深度2极小极大
   */
  async getMediumMove(legalMoves) {
    const aiColor = this.engine.currentPlayer;
    const opponent = aiColor === 1 ? 2 : 1;
    const candidates = this.getThreatAwareCandidates(this.engine, 12, aiColor);
    if (candidates.length === 0) return legalMoves[0];

    // 立即检查能否获胜
    for (const move of candidates) {
      const testEngine = this.engine.clone();
      testEngine.board[move.row][move.col] = aiColor;
      if (testEngine.checkWin(move.row, move.col)) return move;
    }

    // 立即检查是否需要堵对手五连
    for (const move of candidates) {
      const testEngine = this.engine.clone();
      testEngine.board[move.row][move.col] = opponent;
      if (testEngine.checkWin(move.row, move.col)) return move;
    }

    // 计算己方和对手的最佳威胁
    let ourBest = { move: null, priority: 0 };
    let oppBest = { move: null, priority: 0 };
    for (const move of candidates) {
      const ourP = this.getThreatPriority(this.engine, move.row, move.col, aiColor);
      if (ourP > ourBest.priority) ourBest = { move, priority: ourP };
      const oppP = this.getThreatPriority(this.engine, move.row, move.col, opponent);
      if (oppP > oppBest.priority) oppBest = { move, priority: oppP };
    }

    // 优先级判断（与困难难度相同逻辑）
    if (ourBest.priority === 50000) return ourBest.move;           // 自己活四
    if (oppBest.priority === 50000) return oppBest.move;           // 堵对手活四
    if (ourBest.priority >= 150000) return ourBest.move;           // 自己双活三等
    if (oppBest.priority >= 150000) return oppBest.move;           // 堵对手双活三等
    if (ourBest.priority === 10000) return ourBest.move;           // 自己冲四

    // 堵对手冲四/活三（候选点有限时可能漏判，用更宽的扫描兜底）
    const blockMove = this.findThreatBlock(this.engine, opponent);
    if (blockMove) return blockMove;

    // 深度2 minimax搜索
    this.searchNodeCount = 0;
    this.maxSearchNodes = 15000;

    let bestScore = -Infinity;
    let bestMove = candidates[0];
    const scored = [];

    for (let i = 0; i < candidates.length; i++) {
      const move = candidates[i];
      const testEngine = this.engine.clone();
      testEngine.board[move.row][move.col] = aiColor;
      testEngine.lastMove = { row: move.row, col: move.col };

      const score = this.minimax(testEngine, 2, -Infinity, Infinity, false, aiColor);
      scored.push({ move, score });
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (i % 3 === 2) await this.yieldThread();
    }

    return bestMove;
  }

  /**
   * 困难难度：威胁感知 + 深度3极小极大 + Alpha-Beta剪枝
   * 优先级严格按"获胜步数"排序：谁更快获胜谁优先
   * 使用节点预算限制搜索量，避免阻塞主线程导致卡死
   */
  async getHardMove(legalMoves) {
    const aiColor = this.engine.currentPlayer;
    const opponent = aiColor === 1 ? 2 : 1;

    // 候选点：威胁感知排序（进攻+防守综合评分）
    const candidates = this.getThreatAwareCandidates(this.engine, 14, aiColor);
    if (candidates.length === 0) {
      const center = Math.floor(this.engine.size / 2);
      return { row: center, col: center };
    }

    // 1. 立即获胜（五连）
    for (const move of candidates) {
      const testEngine = this.engine.clone();
      testEngine.board[move.row][move.col] = aiColor;
      if (testEngine.checkWin(move.row, move.col)) return move;
    }

    // 2. 堵对手五连（对手下一步获胜）
    for (const move of candidates) {
      const testEngine = this.engine.clone();
      testEngine.board[move.row][move.col] = opponent;
      if (testEngine.checkWin(move.row, move.col)) return move;
    }

    // 计算己方和对手在每个候选点的最佳威胁
    let ourBest = { move: null, priority: 0 };
    let oppBest = { move: null, priority: 0 };
    for (const move of candidates) {
      const ourP = this.getThreatPriority(this.engine, move.row, move.col, aiColor);
      if (ourP > ourBest.priority) ourBest = { move, priority: ourP };
      const oppP = this.getThreatPriority(this.engine, move.row, move.col, opponent);
      if (oppP > oppBest.priority) oppBest = { move, priority: oppP };
    }

    // 3. 自己活四（1步成五，比对手活四更快，必胜）
    if (ourBest.priority === 50000) return ourBest.move;

    // 4. 堵对手活四（对手下一步成活四=必胜，优先于我方双活三）
    if (oppBest.priority === 50000) return oppBest.move;

    // 5. 自己双冲四/四三/双活三（必胜组合，2步获胜）
    if (ourBest.priority >= 150000) return ourBest.move;

    // 6. 堵对手双冲四/四三/双活三（对手2步获胜）
    if (oppBest.priority >= 150000) return oppBest.move;

    // 7. 自己冲四（强制对手防守，获得先手）
    if (ourBest.priority === 10000) return ourBest.move;

    // 7.5 堵对手冲四/活三（候选点有限时可能漏判，用更宽的扫描兜底）
    const blockMove = this.findThreatBlock(this.engine, opponent);
    if (blockMove) return blockMove;

    // 8. minimax搜索（深度3，威胁感知候选）
    this.searchNodeCount = 0;
    this.maxSearchNodes = 40000;

    let bestScore = -Infinity;
    let bestMove = candidates[0];

    for (let i = 0; i < candidates.length; i++) {
      const move = candidates[i];
      const testEngine = this.engine.clone();
      testEngine.board[move.row][move.col] = aiColor;
      testEngine.lastMove = { row: move.row, col: move.col };

      const score = this.minimax(testEngine, 3, -Infinity, Infinity, false, aiColor);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      // 频繁让出主线程
      if (i % 2 === 1 && i < candidates.length - 1) {
        await this.yieldThread();
      }
    }

    return bestMove;
  }

  /**
   * 威胁感知候选选择：按进攻+防守综合威胁评分排序
   * 比getNearbyMoves更智能，确保搜索聚焦于关键点
   */
  getThreatAwareCandidates(engine, maxCandidates, aiColor) {
    const opponent = aiColor === 1 ? 2 : 1;
    const legalMoves = engine.getLegalMoves();
    const scored = [];

    for (const move of legalMoves) {
      const { row, col } = move;

      // 快速过滤：只考虑靠近已有棋子的位置
      let nearScore = 0;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = row + dr, nc = col + dc;
          if (engine.isValidPosition(nr, nc) && engine.board[nr][nc] !== 0) {
            nearScore += 3 - Math.abs(dr) - Math.abs(dc);
          }
        }
      }
      if (nearScore === 0) continue;

      // 综合评分 = 邻近度 + 进攻威胁 + 防守威胁
      let score = nearScore;
      score += this.getThreatPriority(engine, row, col, aiColor) / 100;
      score += this.getThreatPriority(engine, row, col, opponent) / 100;

      scored.push({ move, score });
    }

    if (scored.length === 0) {
      const center = Math.floor(engine.size / 2);
      const centerMove = legalMoves.find(m => m.row === center && m.col === center);
      return centerMove ? [centerMove] : [legalMoves[0]];
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxCandidates).map(s => s.move);
  }

  /**
   * 极小极大搜索 + Alpha-Beta剪枝
   * 受节点预算限制：超过maxSearchNodes时提前返回启发式评估，防止卡死
   */
  minimax(engine, depth, alpha, beta, isMaximizing, aiColor) {
    // 节点预算检查：超过上限立即返回当前局面评估，终止递归
    this.searchNodeCount++;
    if (this.searchNodeCount > this.maxSearchNodes) {
      return this.evaluateBoard(engine, aiColor);
    }

    // 检查终局
    if (engine.lastMove && engine.checkWin(engine.lastMove.row, engine.lastMove.col)) {
      const winner = engine.board[engine.lastMove.row][engine.lastMove.col];
      return winner === aiColor ? 100000 + depth : -100000 - depth;
    }

    if (depth === 0) {
      return this.evaluateBoard(engine, aiColor);
    }

    const currentPlayer = isMaximizing ? aiColor : (aiColor === 1 ? 2 : 1);
    // 递归层使用威胁感知候选（比getNearbyMoves更聪明，但限制数量保持性能）
    const candidates = this.getThreatAwareCandidates(engine, 8, aiColor);

    if (candidates.length === 0) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of candidates) {
        const testEngine = engine.clone();
        testEngine.currentPlayer = currentPlayer;
        testEngine.board[move.row][move.col] = currentPlayer;
        testEngine.lastMove = { row: move.row, col: move.col };

        const score = this.minimax(testEngine, depth - 1, alpha, beta, false, aiColor);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of candidates) {
        const testEngine = engine.clone();
        testEngine.currentPlayer = currentPlayer;
        testEngine.board[move.row][move.col] = currentPlayer;
        testEngine.lastMove = { row: move.row, col: move.col };

        const score = this.minimax(testEngine, depth - 1, alpha, beta, true, aiColor);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  /**
   * 获取靠近已有棋子的候选落子
   * @param {Array} legalMoves - 合法落子列表
   * @param {Number} maxCandidates - 最大候选数
   * @param {Object} engine - 棋盘引擎（默认为 this.engine，minimax搜索时需传入克隆引擎）
   */
  getNearbyMoves(legalMoves, maxCandidates, engine = this.engine) {
    const scored = [];
    const range = 2;

    for (const move of legalMoves) {
      let nearCount = 0;
      for (let dr = -range; dr <= range; dr++) {
        for (let dc = -range; dc <= range; dc++) {
          const nr = move.row + dr;
          const nc = move.col + dc;
          if (engine.isValidPosition(nr, nc) && engine.board[nr][nc] !== 0) {
            nearCount += (range + 1 - Math.max(Math.abs(dr), Math.abs(dc)));
          }
        }
      }
      if (nearCount > 0) {
        scored.push({ move, score: nearCount });
      }
    }

    // 如果棋盘为空，返回中心
    if (scored.length === 0) {
      const center = Math.floor(engine.size / 2);
      const centerMove = legalMoves.find(m => m.row === center && m.col === center);
      if (centerMove) return [centerMove];
      return [legalMoves[Math.floor(Math.random() * legalMoves.length)]];
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxCandidates).map(s => s.move);
  }

  /**
   * 检查在(row,col)放置color棋子后形成的威胁等级（含组合威胁）
   * 返回:
   *   0=无威胁
   *   100=活二, 500=眠三, 1000=眠四/活二组合
   *   5000=活三, 10000=冲四
   *   50000=活四
   *   100000=五连
   *   150000=双活三（必胜组合）
   *   200000=双冲四/四三组合（必胜组合）
   */
  getThreatPriority(engine, row, col, color) {
    const threats = this.getDirectionalThreats(engine, row, col, color);
    if (threats.length === 0) return 0;

    // 五连：直接获胜
    if (threats.includes(100000)) return 100000;
    // 活四：下一步必胜
    if (threats.includes(50000)) return 50000;

    // 统计各威胁数量
    const rushFours = threats.filter(t => t === 10000).length;   // 冲四
    const liveThrees = threats.filter(t => t === 5000).length;   // 活三

    // 双冲四或冲四+活三：双杀组合（必胜）
    if (rushFours >= 2 || (rushFours >= 1 && liveThrees >= 1)) {
      return 200000;
    }
    // 双活三：必胜组合（下一步无法同时堵两个活三）
    if (liveThrees >= 2) {
      return 150000;
    }

    // 单一最大威胁
    return Math.max(...threats);
  }

  /**
   * 获取在(row,col)放置color棋子后，4个方向上分别形成的威胁等级
   * 返回威胁等级数组（仅包含>0的方向）
   * 等级: 100=活二, 500=眠三, 1000=眠四, 5000=活三, 10000=冲四, 50000=活四, 100000=五连
   */
  getDirectionalThreats(engine, row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const threats = [];

    for (const [dr, dc] of directions) {
      // 构造以(row,col)为中心、长度9的窗口（中心索引4）
      // '1'=己方/假设落子, '0'=空, 'x'=对方或边界
      let line = '';
      for (let i = -4; i <= 4; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (!engine.isValidPosition(r, c)) line += 'x';
        else if (i === 0) line += '1';
        else if (engine.board[r][c] === color) line += '1';
        else if (engine.board[r][c] === 0) line += '0';
        else line += 'x';
      }
      const level = this.classifyLine(line);
      if (level > 0) threats.push(level);
    }

    return threats;
  }

  /**
   * 统计窗口中"成五点"数量：把某个空位填成1后，是否出现包含中心(索引4)的五连
   * 该判据同时覆盖连四与跳四（XX_XX、X_XXX 等），避免漏判跳冲四/跳活四
   */
  countWinPoints(line) {
    let cnt = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== '0') continue;
      const test = line.substring(0, i) + '1' + line.substring(i + 1);
      for (let s = 0; s <= 4; s++) {
        // 5格窗口必须覆盖中心索引4
        if (test.substr(s, 5) === '11111') { cnt++; break; }
      }
    }
    return cnt;
  }

  /**
   * 根据含中心('1'@idx4)的9格窗口线，分类威胁等级
   */
  classifyLine(line) {
    if (/11111/.test(line)) return 100000;            // 五连
    const wp = this.countWinPoints(line);
    if (wp >= 2) return 50000;                         // 活四/跳活四（多成五点=必胜）
    if (wp === 1) return 10000;                        // 冲四/跳冲四（单一成五点）
    if (/011100/.test(line) || /001110/.test(line)) return 5000;   // 连续活三
    // 跳活三（开两端的3子带1空隙）：XX_X、X_XX 等常见型
    if (/0110100/.test(line) || /0011010/.test(line) || /0101100/.test(line) || /0010110/.test(line)) return 5000;
    if (/x11100/.test(line) || /00111x/.test(line) || /01110x/.test(line) || /x01110/.test(line)) return 500; // 眠三
    if (/001100/.test(line)) return 100;               // 连续活二
    if (/x1100/.test(line) || /0011x/.test(line)) return 20; // 眠二
    return 0;
  }

  /**
   * 查找对手的最大威胁位置并返回阻挡点
   * 检测对手能形成活三/冲四/活四的落子点
   */
  findThreatBlock(engine, opponent) {
    const legalMoves = engine.getLegalMoves();
    const candidates = this.getNearbyMoves(legalMoves, 40, engine);
    let bestBlock = null;
    let bestPriority = 0;

    for (const move of candidates) {
      const priority = this.getThreatPriority(engine, move.row, move.col, opponent);
      if (priority > bestPriority) {
        bestPriority = priority;
        bestBlock = move;
      }
    }

    // 只在活三(5000)及以上威胁时返回防守点
    return bestPriority >= 5000 ? bestBlock : null;
  }

  /**
   * 评估单个位置的分数（不修改棋盘）
   */
  evaluatePosition(engine, row, col, playerColor) {
    let score = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (const [dr, dc] of directions) {
      let count = 1; // 假设在此处放置了playerColor
      let openEnds = 0;

      // 正方向
      let r = row + dr, c = col + dc;
      while (engine.isValidPosition(r, c) && engine.board[r][c] === playerColor) {
        count++;
        r += dr;
        c += dc;
      }
      if (engine.isValidPosition(r, c) && engine.board[r][c] === 0) openEnds++;

      // 反方向
      r = row - dr; c = col - dc;
      while (engine.isValidPosition(r, c) && engine.board[r][c] === playerColor) {
        count++;
        r -= dr;
        c -= dc;
      }
      if (engine.isValidPosition(r, c) && engine.board[r][c] === 0) openEnds++;

      // 评分（分值差距拉大，确保minimax能正确识别关键棋型）
      if (count >= 5) score += 100000;
      else if (count === 4) {
        score += openEnds === 2 ? 50000 : openEnds === 1 ? 5000 : 100;
      } else if (count === 3) {
        score += openEnds === 2 ? 5000 : openEnds === 1 ? 500 : 10;
      } else if (count === 2) {
        score += openEnds === 2 ? 500 : openEnds === 1 ? 50 : 5;
      } else if (count === 1) {
        score += openEnds === 2 ? 10 : openEnds === 1 ? 1 : 0;
      }
    }

    // 中心加分
    const center = (engine.size - 1) / 2;
    const dist = Math.abs(row - center) + Math.abs(col - center);
    score += (engine.size - dist) * 0.5;

    return score;
  }

  /**
   * 评估整个棋盘
   */
  evaluateBoard(engine, aiColor) {
    let score = 0;
    const opponent = aiColor === 1 ? 2 : 1;

    for (let r = 0; r < engine.size; r++) {
      for (let c = 0; c < engine.size; c++) {
        if (engine.board[r][c] === aiColor) {
          score += this.evaluateSingleStone(engine, r, c, aiColor);
        } else if (engine.board[r][c] === opponent) {
          score -= this.evaluateSingleStone(engine, r, c, opponent);
        }
      }
    }
    return score;
  }

  /**
   * 评估单个位置的分数（不修改棋盘）
   * 优化：每条连线只由"起点"（反方向是边界或异色）计分一次，避免重复累加
   */
  evaluateSingleStone(engine, row, col, playerColor) {
    let score = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (const [dr, dc] of directions) {
      // 只有当(row,col)是这条连线的起点时才计分
      // 起点定义：反方向是边界或不同颜色
      const prevR = row - dr, prevC = col - dc;
      const isStart = !engine.isValidPosition(prevR, prevC) || engine.board[prevR][prevC] !== playerColor;
      if (!isStart) continue;

      let count = 1;
      let openEnds = 0;

      // 正方向延伸
      let r = row + dr, c = col + dc;
      while (engine.isValidPosition(r, c) && engine.board[r][c] === playerColor) {
        count++;
        r += dr;
        c += dc;
      }
      if (engine.isValidPosition(r, c) && engine.board[r][c] === 0) openEnds++;

      // 反方向端点（已知是边界或异色，只有为空时才计openEnd）
      if (engine.isValidPosition(prevR, prevC) && engine.board[prevR][prevC] === 0) openEnds++;

      if (count >= 5) score += 100000;
      else if (count === 4) score += openEnds === 2 ? 50000 : openEnds === 1 ? 5000 : 100;
      else if (count === 3) score += openEnds === 2 ? 5000 : openEnds === 1 ? 500 : 10;
      else if (count === 2) score += openEnds === 2 ? 500 : openEnds === 1 ? 50 : 5;
      else if (count === 1) score += openEnds === 2 ? 10 : openEnds === 1 ? 1 : 0;
    }
    return score;
  }
}