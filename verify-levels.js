/**
 * 关卡验证脚本 - 检查每个关卡的棋盘设置与题目目标是否匹配
 * 运行: node verify-levels.js
 */
const fs = require('fs');
const path = require('path');

// 加载引擎
const GoEngine = require('./weiqi-app/js/go-engine.js');

// 加载关卡数据 (levels.js 没有 module.exports，需要手动 eval)
const levelsCode = fs.readFileSync('./weiqi-app/js/data/levels.js', 'utf8');
const LevelData = (() => {
  const sandbox = {};
  eval(levelsCode.replace('const LevelData', 'sandbox.LevelData'));
  return sandbox.LevelData;
})();

// 辅助：设置棋盘
function setupBoard(level) {
  const engine = new GoEngine(level.boardSize);
  engine.currentPlayer = level.playerColor;
  for (const s of level.setup) {
    engine.board[s.row][s.col] = s.color;
  }
  return engine;
}

// 辅助：找出某方所有棋串及其气数
function analyzeGroups(engine, color) {
  const visited = new Set();
  const groups = [];
  for (let r = 0; r < engine.size; r++) {
    for (let c = 0; c < engine.size; c++) {
      const key = r * engine.size + c;
      if (visited.has(key) || engine.board[r][c] !== color) continue;
      const group = engine.getGroup(r, c);
      for (const s of group) visited.add(s.row * engine.size + s.col);
      const libs = engine.getLiberties(group);
      groups.push({ stones: group, liberties: libs, libCount: libs.length });
    }
  }
  return groups;
}

// 辅助：统计棋盘空点
function emptyPoints(engine) {
  const pts = [];
  for (let r = 0; r < engine.size; r++)
    for (let c = 0; c < engine.size; c++)
      if (engine.board[r][c] === 0) pts.push({ row: r, col: c });
  return pts;
}

// 判断空区域是否被单色包围（眼）
function isEye(engine, row, col) {
  if (engine.board[row][col] !== 0) return null;
  const neighbors = engine.getAdjacent(row, col);
  const colors = new Set();
  for (const [nr, nc] of neighbors) colors.add(engine.board[nr][nc]);
  if (colors.size === 1 && !colors.has(0)) {
    return [...colors][0]; // 返回包围色
  }
  return null;
}

let problems = [];

for (const level of LevelData.levels) {
  const issues = [];
  const engine = setupBoard(level);
  const player = level.playerColor;
  const opponent = player === 1 ? 2 : 1;

  // 检查 setup 是否有重叠
  const setupSet = new Set();
  for (const s of level.setup) {
    const k = s.row + ',' + s.col;
    if (setupSet.has(k)) issues.push(`setup重叠: (${s.row},${s.col})`);
    setupSet.add(k);
  }

  // 检查 setup 后是否有棋串已经是 0 气（开局就死的棋）
  for (const color of [1, 2]) {
    const groups = analyzeGroups(engine, color);
    for (const g of groups) {
      if (g.libCount === 0) {
        issues.push(`开局有死棋: 色${color} 棋串${g.stones.map(s=>`(${s.row},${s.col})`).join('')} 0气`);
      }
    }
  }

  const isObservation = level.type === 'observation';

  for (const tm of level.targetMoves) {
    const { row, col } = tm;

    if (isObservation) {
      // 观察类：目标点应为空
      if (engine.board[row][col] !== 0) {
        issues.push(`观察目标(${row},${col})非空(色${engine.board[row][col]})`);
      } else {
        // 检查是否是眼或内部要点
        const eyeColor = isEye(engine, row, col);
        if (eyeColor) {
          // 是眼，合理
        }
      }
      continue;
    }

    // 落子类：检查合法性
    engine.currentPlayer = player;
    const testEngine = setupBoard(level);
    testEngine.currentPlayer = player;
    const result = testEngine.placeStone(row, col);

    if (!result.success) {
      issues.push(`目标(${row},${col})非法落子`);
      continue;
    }

    const captured = result.captured.length;

    // 分析落子后对手棋串是否有被打吃
    const oppGroups = analyzeGroups(testEngine, opponent);
    const atariGroups = oppGroups.filter(g => g.libCount === 1);
    // 分析落子后己方棋串气数
    const ownGroup = testEngine.getGroup(row, col);
    const ownLibs = testEngine.countLiberties(ownGroup);

    // 根据目标文本判断期望（仅用 goal，避免 description 误触发）
    const goal = level.goal || '';
    const isThrowIn = /破眼|破|点杀|点|扑|扑杀/.test(goal);

    const expectCapture = /吃|提/.test(goal);
    const expectAtari = /打吃|征子|双打/.test(goal); // 紧气不要求立即打吃
    const expectConnect = /连接/.test(goal) && !/虎口/.test(goal);

    if (expectCapture && captured === 0 && !isObservation) {
      if (atariGroups.length === 0) {
        issues.push(`目标(${row},${col})期望吃子但未提子且未打吃(提${captured}子,atari${atariGroups.length}组)`);
      }
    }

    // 自送检查：落子后己方只有1气且未提子（扑/破眼等送子战术除外）
    if (ownLibs === 1 && captured === 0 && !isThrowIn) {
      issues.push(`目标(${row},${col})落子后己方仅1气(自送),提子${captured}`);
    }

    // 征子/打吃期望：应有至少一组对手被打吃
    if (expectAtari && atariGroups.length === 0 && captured === 0) {
      issues.push(`目标(${row},${col})期望打吃但无对手棋串被打吃`);
    }

    // 连接期望：落子应连接原本分离的己方棋串
    if (expectConnect) {
      const beforeGroups = analyzeGroups(engine, player).length;
      const afterGroups = analyzeGroups(testEngine, player).length;
      if (afterGroups >= beforeGroups) {
        issues.push(`目标(${row},${col})期望连接但棋串数未减少(前${beforeGroups}后${afterGroups})`);
      }
    }
  }

  if (issues.length > 0) {
    problems.push({ id: level.id, title: level.title, type: level.type || 'place', issues });
  }
}

console.log(`\n=== 关卡验证报告 ===`);
console.log(`总关卡数: ${LevelData.levels.length}`);
console.log(`发现问题: ${problems.length} 个关卡\n`);

for (const p of problems) {
  console.log(`【第${p.id}关 ${p.title}】(${p.type})`);
  for (const iss of p.issues) {
    console.log(`  - ${iss}`);
  }
  console.log('');
}
