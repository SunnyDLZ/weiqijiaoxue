/**
 * 全关卡主题匹配验证脚本 v2
 * 输出每个关卡target落子的实际效果，人工对比主题
 */
const fs = require('fs');

// 加载Go引擎
const engineCode = fs.readFileSync('./weiqi-app/js/go-engine.js', 'utf8')
  .replace(/module\.exports\s*=\s*GoEngine\s*;?/, '');
const sandbox = {};
eval(engineCode.replace('class GoEngine', 'sandbox.GoEngine = class GoEngine'));
const GoEngine = sandbox.GoEngine;

// 加载关卡数据
const levelsCode = fs.readFileSync('./weiqi-app/js/data/levels.js', 'utf8');
const levelsSandbox = { LevelData: null };
eval(levelsCode.replace('const LevelData', 'levelsSandbox.LevelData'));
const levels = levelsSandbox.LevelData.levels;

function analyzeLevel(level) {
  const engine = new GoEngine(level.boardSize);
  for (const s of level.setup) {
    engine.board[s.row][s.col] = s.color;
  }

  const isObservation = level.type === 'observation';
  const info = { id: level.id, title: level.title, cat: level.category, obs: isObservation, targets: [] };

  for (const target of level.targetMoves) {
    if (isObservation) {
      const isEmpty = engine.board[target.row][target.col] === 0;
      info.targets.push(`(${target.row},${target.col})[obs空=${isEmpty}]`);
      if (!isEmpty) info.issue = '观察点非空';
    } else {
      const targetColor = target.color || level.playerColor;
      if (engine.board[target.row][target.col] !== 0) {
        info.targets.push(`(${target.row},${target.col})[已被占用!]`);
        info.issue = '目标点已被占用';
        continue;
      }
      const testEngine = engine.clone();
      testEngine.currentPlayer = targetColor;
      const result = testEngine.placeStone(target.row, target.col);
      if (!result.success) {
        info.targets.push(`(${target.row},${target.col})[落子失败]`);
        info.issue = '落子失败';
        continue;
      }
      const captured = result.captured.length;
      const opponent = targetColor === 1 ? 2 : 1;
      const checkedGroups = new Set();
      let atariCount = 0;
      let atariStones = 0;
      for (let r = 0; r < testEngine.size; r++) {
        for (let c = 0; c < testEngine.size; c++) {
          if (testEngine.board[r][c] === opponent) {
            const group = testEngine.getGroup(r, c);
            const groupKey = group.map(g => `${g.row},${g.col}`).sort().join('|');
            if (checkedGroups.has(groupKey)) continue;
            checkedGroups.add(groupKey);
            const libs = testEngine.countLiberties(group);
            if (libs === 1) { atariCount++; atariStones += group.length; }
          }
        }
      }
      const ownGroup = testEngine.getGroup(target.row, target.col);
      const ownLibs = testEngine.countLiberties(ownGroup);
      info.targets.push(`(${target.row},${target.col})[提子=${captured},打吃${atariCount}块${atariStones}子,自气=${ownLibs}]`);
    }
  }
  return info;
}

// 输出到文件避免控制台编码问题
let output = `========== 全60关主题匹配分析 ==========\n\n`;
output += `格式说明: (坐标)[提子数,打吃块数+子数,落子后自气]\n`;
output += `观察类: (坐标)[obs空=是否空点]\n\n`;

const problems = [];
for (const level of levels) {
  const info = analyzeLevel(level);
  const tag = info.obs ? '[观察]' : '[落子]';
  const issueTag = info.issue ? ` <<< ${info.issue}` : '';
  output += `#${info.id} ${tag} ${info.title} [${info.cat}]\n`;
  output += `   setup: ${level.setup.length}子, 黑${level.setup.filter(s=>s.color===1).length}/白${level.setup.filter(s=>s.color===2).length}\n`;
  output += `   target: ${info.targets.join(' | ')}${issueTag}\n`;
  if (info.issue) problems.push(info);
}

output += `\n========== 自动检测的问题 ==========\n`;
output += `共 ${problems.length} 关有明确问题:\n`;
for (const p of problems) {
  output += `  #${p.id} ${p.title}: ${p.issue}\n`;
}

fs.writeFileSync('./verify-output.txt', output, 'utf8');
console.log(`分析完成，结果写入 verify-output.txt`);
console.log(`自动检测问题: ${problems.length} 关`);
