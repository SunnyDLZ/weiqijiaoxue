/**
 * 围棋闯关关卡数据 - 60关渐进式挑战
 * 每个关卡包含：棋盘设定、目标、提示、胜利条件
 */
const LevelData = {
  levels: [
    // === 第1-10关：基础入门 - 提子练习 ===
    {
      id: 1, title: '第一口吃', category: '入门', difficulty: 1,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 4, col: 4, color: 2 },
        { row: 3, col: 4, color: 1 },
        { row: 5, col: 4, color: 1 },
        { row: 4, col: 3, color: 1 }
      ],
      goal: '吃掉白棋！白棋只剩一口气了',
      hint: '下在白棋最后一口气的位置',
      targetMoves: [{ row: 4, col: 5, color: 1 }],
      maxMoves: 1,
      description: '白棋只剩一口气，找到它并吃掉白棋'
    },
    {
      id: 2, title: '角上提子', category: '入门', difficulty: 1,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 0, color: 2 },
        { row: 0, col: 1, color: 1 }
      ],
      goal: '在角上吃掉白棋！',
      hint: '角上的白棋只剩一口气，堵住它',
      targetMoves: [{ row: 1, col: 0, color: 1 }],
      maxMoves: 1,
      description: '角上的白棋只剩一口气，堵住它！'
    },
    {
      id: 3, title: '边上提子', category: '入门', difficulty: 1,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 4, color: 2 },
        { row: 0, col: 3, color: 1 },
        { row: 0, col: 5, color: 1 }
      ],
      goal: '吃掉边上的白棋！',
      hint: '白棋在边上，只剩一口气',
      targetMoves: [{ row: 1, col: 4, color: 1 }],
      maxMoves: 1,
      description: '边上的白棋只剩一口气，堵住它！'
    },
    {
      id: 4, title: '提两子', category: '入门', difficulty: 1,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 4, col: 3, color: 2 }, { row: 4, col: 4, color: 2 },
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 },
        { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 },
        { row: 4, col: 2, color: 1 }
      ],
      goal: '同时吃掉两颗白子！',
      hint: '两颗白子连在一起，共享气',
      targetMoves: [{ row: 4, col: 5, color: 1 }],
      maxMoves: 1,
      description: '两颗连在一起的白子，可以一起吃掉'
    },
    {
      id: 5, title: '提三子', category: '入门', difficulty: 1,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 4, col: 2, color: 2 }, { row: 4, col: 3, color: 2 }, { row: 4, col: 4, color: 2 },
        { row: 3, col: 2, color: 1 }, { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 },
        { row: 5, col: 2, color: 1 }, { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 },
        { row: 4, col: 1, color: 1 }
      ],
      goal: '吃掉三颗白子！',
      hint: '堵住最后一口气',
      targetMoves: [{ row: 4, col: 5, color: 1 }],
      maxMoves: 1,
      description: '三颗白子连在一起，找到最后一口气'
    },
    // === 第6-10关：逃跑与连接 ===
    {
      id: 6, title: '赶紧逃跑', category: '入门', difficulty: 2,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 4, col: 4, color: 1 },
        { row: 3, col: 4, color: 2 },
        { row: 5, col: 4, color: 2 },
        { row: 4, col: 3, color: 2 }
      ],
      goal: '黑棋被打吃了！快逃跑！',
      hint: '向有气的地方长出去',
      targetMoves: [{ row: 4, col: 5, color: 1 }],
      maxMoves: 1,
      description: '黑棋只剩一口气，需要长出去逃跑'
    },
    {
      id: 7, title: '连接友军', category: '入门', difficulty: 2,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 4, col: 2, color: 1 },
        { row: 4, col: 4, color: 1 },
        { row: 3, col: 3, color: 2 },
        { row: 5, col: 3, color: 2 }
      ],
      goal: '连接两边的黑棋！',
      hint: '在(4,3)连接两边的黑子',
      targetMoves: [{ row: 4, col: 3, color: 1 }],
      maxMoves: 1,
      description: '两边的黑棋被白棋隔开，从中间连接它们'
    },
    {
      id: 8, title: '虎口防守', category: '入门', difficulty: 2,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 4, col: 3, color: 1 },
        { row: 4, col: 5, color: 1 }
      ],
      goal: '用虎口连接黑棋！',
      hint: '在(3,4)或(5,4)做虎口',
      targetMoves: [{ row: 3, col: 4, color: 1 }, { row: 5, col: 4, color: 1 }],
      maxMoves: 1,
      description: '用虎口的形状来保护连接，(4,4)成为虎口'
    },
    {
      id: 9, title: '双打吃', category: '入门', difficulty: 2,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 2 },
        { row: 3, col: 5, color: 2 },
        { row: 3, col: 2, color: 1 },
        { row: 4, col: 3, color: 1 },
        { row: 3, col: 6, color: 1 },
        { row: 4, col: 5, color: 1 }
      ],
      goal: '双打吃！同时打吃两边白棋',
      hint: '在中间落子，同时威胁两边',
      targetMoves: [{ row: 3, col: 4, color: 1 }],
      maxMoves: 1,
      description: '一步棋同时打吃两块白棋'
    },
    {
      id: 10, title: '征子入门', category: '入门', difficulty: 2,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 },
        { row: 3, col: 3, color: 1 },
        { row: 3, col: 4, color: 2 },
        { row: 4, col: 4, color: 1 }
      ],
      goal: '开始征子！打吃白棋',
      hint: '在(2,4)打吃白棋',
      targetMoves: [{ row: 2, col: 4, color: 1 }],
      maxMoves: 1,
      description: '找到征子的第一步——打吃白棋'
    },
    // === 第11-20关：基础技巧 ===
    {
      id: 11, title: '抱吃两子', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 4, col: 3, color: 2 }, { row: 4, col: 4, color: 2 },
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 },
        { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 },
        { row: 4, col: 5, color: 1 }
      ],
      goal: '抱吃两颗白子！',
      hint: '白棋只剩一口气，堵住它',
      targetMoves: [{ row: 4, col: 2, color: 1 }],
      maxMoves: 1,
      description: '从两边抱住白棋，使其无路可逃'
    },
    {
      id: 12, title: '枷吃练习', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 4, col: 4, color: 2 },
        { row: 3, col: 4, color: 1 },
        { row: 4, col: 3, color: 1 }
      ],
      goal: '用枷吃封锁白棋！',
      hint: '在(5,5)位置枷——黑子封锁白棋两个逃跑方向',
      targetMoves: [{ row: 5, col: 5, color: 1 }],
      maxMoves: 1,
      description: '枷吃——一子封锁对方两口气，白棋无论逃(5,4)还是(4,5)都会被打吃'
    },
    {
      id: 13, title: '做眼活棋', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 }, { row: 3, col: 5, color: 1 }, { row: 3, col: 6, color: 1 }, { row: 3, col: 7, color: 1 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 5, color: 1 }, { row: 4, col: 7, color: 1 },
        { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 }, { row: 5, col: 5, color: 1 }, { row: 5, col: 6, color: 1 }, { row: 5, col: 7, color: 1 }
      ],
      goal: '做眼活棋——黑棋已做出两只眼，点击眼位确认',
      hint: '黑棋围出两个分离的空点(4,4)和(4,6)，是活棋',
      targetMoves: [{ row: 4, col: 4 }, { row: 4, col: 6 }],
      maxMoves: 1,
      description: '两只分离的眼才是活棋，相邻的两个空点只是一只眼',
      type: 'observation'
    },
    {
      id: 14, title: '破眼杀棋', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 2 }
      ],
      goal: '破眼！不让白棋做活',
      hint: '抢占白棋做眼的位置',
      targetMoves: [{ row: 3, col: 4, color: 1 }],
      maxMoves: 1,
      description: '破坏白棋的第二个眼'
    },
    {
      id: 15, title: '扑杀', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 2 },
        { row: 6, col: 3, color: 2 }, { row: 6, col: 4, color: 2 }, { row: 6, col: 5, color: 2 }
      ],
      goal: '扑杀——观察白棋内部的弱点，点击中心点确认',
      hint: '白棋内部两个空点相连，只是一只眼，是死形',
      targetMoves: [{ row: 3, col: 4 }],
      maxMoves: 1,
      description: '白棋内部只有两个空点，无法做出两只眼',
      type: 'observation'
    },
    {
      id: 16, title: '角上做活', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 0, color: 1 }, { row: 0, col: 1, color: 1 }, { row: 0, col: 2, color: 1 }, { row: 0, col: 3, color: 1 },
        { row: 1, col: 0, color: 1 }, { row: 1, col: 2, color: 1 }, { row: 1, col: 3, color: 1 },
        { row: 2, col: 0, color: 1 }, { row: 2, col: 1, color: 1 }, { row: 2, col: 3, color: 1 },
        { row: 3, col: 0, color: 1 }, { row: 3, col: 1, color: 1 }, { row: 3, col: 2, color: 1 }, { row: 3, col: 3, color: 1 },
        { row: 0, col: 4, color: 2 }, { row: 1, col: 4, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 3, col: 4, color: 2 },
        { row: 4, col: 0, color: 2 }, { row: 4, col: 1, color: 2 }, { row: 4, col: 2, color: 2 }, { row: 4, col: 3, color: 2 }
      ],
      goal: '角上做活——黑棋已做出两只眼，点击眼位确认',
      hint: '角上的黑棋围出了两只眼(1,1)和(2,2)，是活棋',
      targetMoves: [{ row: 1, col: 1 }, { row: 2, col: 2 }],
      maxMoves: 1,
      description: '角上做活需要两只眼，观察黑棋的眼位',
      type: 'observation'
    },
    {
      id: 17, title: '边上做活', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 2, color: 1 }, { row: 0, col: 3, color: 1 }, { row: 0, col: 4, color: 1 }, { row: 0, col: 5, color: 1 }, { row: 0, col: 6, color: 1 },
        { row: 1, col: 2, color: 1 }, { row: 1, col: 4, color: 1 }, { row: 1, col: 6, color: 1 },
        { row: 2, col: 2, color: 1 }, { row: 2, col: 3, color: 1 }, { row: 2, col: 4, color: 1 }, { row: 2, col: 5, color: 1 }, { row: 2, col: 6, color: 1 },
        { row: 0, col: 1, color: 2 }, { row: 1, col: 1, color: 2 }, { row: 2, col: 1, color: 2 },
        { row: 0, col: 7, color: 2 }, { row: 1, col: 7, color: 2 }, { row: 2, col: 7, color: 2 },
        { row: 3, col: 2, color: 2 }, { row: 3, col: 3, color: 2 }, { row: 3, col: 4, color: 2 }, { row: 3, col: 5, color: 2 }, { row: 3, col: 6, color: 2 }
      ],
      goal: '边上做活——黑棋已做出两只眼，点击眼位确认',
      hint: '边上的黑棋围出了两只眼(1,3)和(1,5)，是活棋',
      targetMoves: [{ row: 1, col: 3 }, { row: 1, col: 5 }],
      maxMoves: 1,
      description: '边上做活需要利用边的特性，观察黑棋的眼位',
      type: 'observation'
    },
    {
      id: 18, title: '点杀', category: '技巧', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 2 }
      ],
      goal: '点杀白棋！找到白棋的弱点',
      hint: '白棋内部有弱点',
      targetMoves: [{ row: 3, col: 4, color: 1 }],
      maxMoves: 1,
      description: '点入白棋内部，破坏眼位'
    },
    {
      id: 19, title: '接不归', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 1 }, { row: 2, col: 4, color: 1 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 4, color: 2 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 4, color: 1 },
        { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 },
        { row: 4, col: 2, color: 1 }
      ],
      goal: '让白棋接不回去！',
      hint: '打吃白棋，在(3,5)紧气',
      targetMoves: [{ row: 3, col: 5, color: 1 }],
      maxMoves: 1,
      description: '制造接不归的形状——打吃白棋'
    },
    {
      id: 20, title: '金鸡独立', category: '技巧', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 1, col: 1, color: 2 }, { row: 1, col: 3, color: 2 },
        { row: 0, col: 1, color: 1 }, { row: 1, col: 0, color: 1 },
        { row: 0, col: 3, color: 1 }, { row: 1, col: 4, color: 1 }
      ],
      goal: '金鸡独立——同时打吃两边白棋！',
      hint: '在(1,2)落子，同时打吃两边的白棋',
      targetMoves: [{ row: 1, col: 2, color: 1 }],
      maxMoves: 1,
      description: '金鸡独立——制造双打吃，同时威胁两块白棋'
    },
    // === 第21-30关：中级技巧 ===
    {
      id: 21, title: '滚打包收', category: '技巧', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 4, color: 2 }, { row: 5, col: 4, color: 2 },
        { row: 3, col: 3, color: 1 }, { row: 3, col: 5, color: 1 },
        { row: 5, col: 3, color: 1 }, { row: 5, col: 5, color: 1 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 5, color: 1 }
      ],
      goal: '双打吃！同时打吃上下两块白棋',
      hint: '在(4,4)落子，同时打吃上下的白棋',
      targetMoves: [{ row: 4, col: 4, color: 1 }],
      maxMoves: 1,
      description: '滚打包收——用双打吃同时威胁两块白棋'
    },
    {
      id: 22, title: '大头鬼', category: '技巧', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 4, color: 2 },
        { row: 3, col: 5, color: 1 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 4, color: 1 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }
      ],
      goal: '制造大头鬼形状！',
      hint: '从上方打吃白棋(3,4)',
      targetMoves: [{ row: 3, col: 3, color: 1 }],
      maxMoves: 1,
      description: '大头鬼——经典的吃子手筋'
    },
    {
      id: 23, title: '乌龟不出头', category: '技巧', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 2 }, { row: 3, col: 4, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 2, col: 3, color: 1 }, { row: 2, col: 5, color: 1 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 5, color: 1 },
        { row: 3, col: 2, color: 1 }, { row: 3, col: 6, color: 1 }
      ],
      goal: '让白棋"乌龟不出头"！封锁打吃',
      hint: '在(4,4)封锁白棋，使其只剩(2,4)一口气',
      targetMoves: [{ row: 4, col: 4, color: 1 }],
      maxMoves: 1,
      description: '乌龟不出头——白3子被围，黑下(4,4)封锁打吃'
    },
    {
      id: 24, title: '黄莺扑蝶', category: '技巧', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 4, color: 2 },
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 4, color: 2 }
      ],
      goal: '用黄莺扑蝶吃掉白棋！',
      hint: '从下方攻击',
      targetMoves: [{ row: 5, col: 4, color: 1 }],
      maxMoves: 1,
      description: '黄莺扑蝶——优美的吃子手法'
    },
    {
      id: 25, title: '左右同形', category: '技巧', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 5, color: 2 }
      ],
      goal: '利用左右同形走中间！',
      hint: '左右对称时，走中间',
      targetMoves: [{ row: 4, col: 4, color: 1 }],
      maxMoves: 1,
      description: '左右同形走中间——围棋格言'
    },
    {
      id: 26, title: '二路扳粘', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 1, col: 3, color: 1 }, { row: 1, col: 4, color: 1 },
        { row: 2, col: 3, color: 1 },
        { row: 1, col: 2, color: 2 }, { row: 1, col: 5, color: 2 },
        { row: 2, col: 2, color: 2 }, { row: 2, col: 5, color: 2 }
      ],
      goal: '在二路扳粘，扩大领地！',
      hint: '在二路扳粘是常见的官子手段',
      targetMoves: [{ row: 2, col: 4, color: 1 }],
      maxMoves: 1,
      description: '二路扳粘——常见的收官技巧'
    },
    {
      id: 27, title: '一路扳', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 4, color: 2 }, { row: 1, col: 4, color: 2 },
        { row: 0, col: 3, color: 1 }, { row: 1, col: 3, color: 1 }
      ],
      goal: '在一路扳，获取官子便宜！',
      hint: '在(0,5)位置扳白棋(0,4)——一路(底线)的扳',
      targetMoves: [{ row: 0, col: 5, color: 1 }],
      maxMoves: 1,
      description: '一路扳——底线(row0)的扳粘，官子阶段的重要技巧'
    },
    {
      id: 28, title: '跨断', category: '技巧', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 5, color: 1 }
      ],
      goal: '跨断白棋的连接！',
      hint: '白棋(3,3)与(3,5)是一间跳，在(3,4)跨断',
      targetMoves: [{ row: 3, col: 4, color: 1 }],
      maxMoves: 1,
      description: '跨断——切断对方一间跳的连接'
    },
    {
      id: 29, title: '挤', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 5, color: 1 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 5, color: 2 },
        { row: 3, col: 4, color: 2 }, { row: 5, col: 4, color: 2 }
      ],
      goal: '挤——观察白棋内部的要点，点击中心点确认',
      hint: '白棋内部空间小，中心是要点',
      targetMoves: [{ row: 4, col: 4 }],
      maxMoves: 1,
      description: '挤——破坏对方眼位的好手段，观察要点位置',
      type: 'observation'
    },
    {
      id: 30, title: '夹', category: '技巧', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 4, col: 2, color: 1 }, { row: 4, col: 6, color: 1 }
      ],
      goal: '夹击白棋！',
      hint: '在(4,4)夹',
      targetMoves: [{ row: 4, col: 4, color: 1 }],
      maxMoves: 1,
      description: '夹——从两边攻击对方'
    },
    // === 第31-40关：死活题 ===
    {
      id: 31, title: '直三', category: '死活', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 5, color: 2 },
        { row: 6, col: 3, color: 2 }, { row: 6, col: 4, color: 2 }, { row: 6, col: 5, color: 2 }
      ],
      goal: '直三——3目空点排成直线，点击中心要点确认',
      hint: '直三的中心是要点，谁走到谁有利',
      targetMoves: [{ row: 4, col: 4 }],
      maxMoves: 1,
      description: '直三：白棋先补能活，黑棋点到则死',
      type: 'observation'
    },
    {
      id: 32, title: '曲三', category: '死活', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 }, { row: 2, col: 6, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 6, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 }, { row: 4, col: 6, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 2 }, { row: 5, col: 6, color: 2 }
      ],
      goal: '曲三——3目空点排成L形，点击拐角要点确认',
      hint: '曲三的要点在拐弯处',
      targetMoves: [{ row: 3, col: 4 }],
      maxMoves: 1,
      description: '曲三：要点在拐角，谁走到谁有利',
      type: 'observation'
    },
    {
      id: 33, title: '直四', category: '死活', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 5, color: 2 },
        { row: 6, col: 3, color: 2 }, { row: 6, col: 5, color: 2 },
        { row: 7, col: 3, color: 2 }, { row: 7, col: 4, color: 2 }, { row: 7, col: 5, color: 2 }
      ],
      goal: '直四——4目空点排成直线，点击内部任意位置确认',
      hint: '直四是活形，不需要补棋',
      targetMoves: [{ row: 4, col: 4 }, { row: 5, col: 4 }],
      maxMoves: 1,
      description: '直四是活棋，不需要补',
      type: 'observation'
    },
    {
      id: 34, title: '方四', category: '死活', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 2, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 2, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 2, color: 2 }, { row: 5, col: 5, color: 2 },
        { row: 6, col: 3, color: 2 }, { row: 6, col: 4, color: 2 }, { row: 6, col: 5, color: 2 },
        { row: 3, col: 6, color: 2 }, { row: 4, col: 6, color: 2 }
      ],
      goal: '方四——白棋内部有2×2的方四空点，点击任意空点确认',
      hint: '方四是死形，内部四个点无法做出两只眼',
      targetMoves: [{ row: 3, col: 3 }, { row: 3, col: 4 }, { row: 4, col: 3 }, { row: 4, col: 4 }],
      maxMoves: 1,
      description: '方四是死棋，无法做出两只眼',
      type: 'observation'
    },
    {
      id: 35, title: '梅花五', category: '死活', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 2 }, { row: 3, col: 4, color: 2 }, { row: 3, col: 5, color: 2 }, { row: 3, col: 6, color: 2 }, { row: 3, col: 7, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 4, color: 2 }, { row: 4, col: 6, color: 2 }, { row: 4, col: 7, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 7, color: 2 },
        { row: 6, col: 3, color: 2 }, { row: 6, col: 4, color: 2 }, { row: 6, col: 6, color: 2 }, { row: 6, col: 7, color: 2 },
        { row: 7, col: 3, color: 2 }, { row: 7, col: 4, color: 2 }, { row: 7, col: 5, color: 2 }, { row: 7, col: 6, color: 2 }, { row: 7, col: 7, color: 2 }
      ],
      goal: '梅花五——5目空点排成十字，点击中心要点确认',
      hint: '梅花五的要点在中心',
      targetMoves: [{ row: 5, col: 5 }],
      maxMoves: 1,
      description: '梅花五的杀棋要点在中心',
      type: 'observation'
    },
    {
      id: 36, title: '刀把五', category: '死活', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 2 }, { row: 3, col: 4, color: 2 }, { row: 3, col: 5, color: 2 }, { row: 3, col: 6, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 6, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 5, color: 2 }, { row: 5, col: 6, color: 2 },
        { row: 6, col: 3, color: 2 }, { row: 6, col: 6, color: 2 },
        { row: 7, col: 3, color: 2 }, { row: 7, col: 4, color: 2 }, { row: 7, col: 5, color: 2 }, { row: 7, col: 6, color: 2 }
      ],
      goal: '刀把五——5目空点排成刀把形，点击刀把要点确认',
      hint: '刀把五的要点在刀把与刀身连接处',
      targetMoves: [{ row: 5, col: 4 }],
      maxMoves: 1,
      description: '刀把五的杀棋要点在连接处',
      type: 'observation'
    },
    {
      id: 37, title: '葡萄六', category: '死活', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 2 }, { row: 3, col: 4, color: 2 }, { row: 3, col: 5, color: 2 }, { row: 3, col: 6, color: 2 }, { row: 3, col: 7, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 }, { row: 4, col: 7, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 7, color: 2 },
        { row: 6, col: 3, color: 2 }, { row: 6, col: 4, color: 2 }, { row: 6, col: 6, color: 2 }, { row: 6, col: 7, color: 2 },
        { row: 7, col: 3, color: 2 }, { row: 7, col: 4, color: 2 }, { row: 7, col: 5, color: 2 }, { row: 7, col: 6, color: 2 }, { row: 7, col: 7, color: 2 }
      ],
      goal: '葡萄六——6目空点排成葡萄形，点击中心要点确认',
      hint: '葡萄六的中心是要点',
      targetMoves: [{ row: 5, col: 5 }],
      maxMoves: 1,
      description: '葡萄六的杀棋要点在中心',
      type: 'observation'
    },
    {
      id: 38, title: '板六', category: '死活', difficulty: 3,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 2 }, { row: 3, col: 4, color: 2 }, { row: 3, col: 5, color: 2 }, { row: 3, col: 6, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 6, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 6, color: 2 },
        { row: 6, col: 3, color: 2 }, { row: 6, col: 6, color: 2 },
        { row: 7, col: 3, color: 2 }, { row: 7, col: 4, color: 2 }, { row: 7, col: 5, color: 2 }, { row: 7, col: 6, color: 2 }
      ],
      goal: '板六——6目空点排成2×3矩形，点击内部确认',
      hint: '板六是活形',
      targetMoves: [{ row: 5, col: 4 }, { row: 5, col: 5 }],
      maxMoves: 1,
      description: '板六是活棋',
      type: 'observation'
    },
    {
      id: 39, title: '角上板六', category: '死活', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 0, color: 2 }, { row: 0, col: 1, color: 2 }, { row: 0, col: 2, color: 2 }, { row: 0, col: 3, color: 2 },
        { row: 1, col: 0, color: 2 }, { row: 1, col: 3, color: 2 },
        { row: 2, col: 0, color: 2 }, { row: 2, col: 3, color: 2 },
        { row: 3, col: 0, color: 2 }, { row: 3, col: 3, color: 2 },
        { row: 4, col: 0, color: 2 }, { row: 4, col: 1, color: 2 }, { row: 4, col: 2, color: 2 }, { row: 4, col: 3, color: 2 }
      ],
      goal: '角上板六——角上6目空点2×3，点击内部确认',
      hint: '角上板六需注意外气，可能不活',
      targetMoves: [{ row: 2, col: 1 }, { row: 2, col: 2 }],
      maxMoves: 1,
      description: '角上板六需要注意外气',
      type: 'observation'
    },
    {
      id: 40, title: '大猪嘴', category: '死活', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 0, color: 2 }, { row: 0, col: 1, color: 2 }, { row: 0, col: 2, color: 2 }, { row: 0, col: 3, color: 2 },
        { row: 1, col: 0, color: 2 }, { row: 1, col: 3, color: 2 },
        { row: 2, col: 0, color: 2 }, { row: 2, col: 2, color: 2 }, { row: 2, col: 3, color: 2 },
        { row: 3, col: 0, color: 2 }, { row: 3, col: 3, color: 2 },
        { row: 4, col: 0, color: 2 }, { row: 4, col: 1, color: 2 }, { row: 4, col: 2, color: 2 }, { row: 4, col: 3, color: 2 }
      ],
      goal: '大猪嘴——角部猪嘴形，点击扳点要点确认',
      hint: '大猪嘴，扳点死',
      targetMoves: [{ row: 2, col: 1 }],
      maxMoves: 1,
      description: '大猪嘴扳点死——经典死活格言',
      type: 'observation'
    },
    // === 第41-50关：综合实战 ===
    {
      id: 41, title: '对杀（一）', category: '实战', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 },
        { row: 4, col: 3, color: 1 },
        { row: 3, col: 5, color: 2 }, { row: 3, col: 6, color: 2 },
        { row: 4, col: 5, color: 2 },
        { row: 4, col: 4, color: 2 }
      ],
      goal: '对杀！比谁的气更长',
      hint: '数一数双方的气',
      targetMoves: [{ row: 4, col: 6, color: 1 }],
      maxMoves: 1,
      description: '对杀——比较双方的气数'
    },
    {
      id: 42, title: '对杀（二）', category: '实战', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 }, { row: 3, col: 5, color: 1 },
        { row: 4, col: 3, color: 1 },
        { row: 3, col: 6, color: 2 }, { row: 3, col: 7, color: 2 },
        { row: 4, col: 6, color: 2 }, { row: 4, col: 7, color: 2 }
      ],
      goal: '对杀！黑棋有长气吗？',
      hint: '黑棋需要长气',
      targetMoves: [{ row: 4, col: 4, color: 1 }],
      maxMoves: 1,
      description: '对杀——长气技巧'
    },
    {
      id: 43, title: '有眼杀无眼', category: '实战', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 }, { row: 3, col: 5, color: 1 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 5, color: 1 },
        { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 }, { row: 5, col: 5, color: 1 },
        { row: 4, col: 6, color: 2 }, { row: 4, col: 7, color: 2 },
        { row: 5, col: 6, color: 2 }, { row: 5, col: 7, color: 2 }
      ],
      goal: '有眼杀无眼——黑棋有眼，点击眼位确认',
      hint: '黑棋有眼，对杀有利',
      targetMoves: [{ row: 4, col: 4 }],
      maxMoves: 1,
      description: '有眼杀无眼——对杀的基本原则，观察黑棋的眼位',
      type: 'observation'
    },
    {
      id: 44, title: '大眼杀小眼', category: '实战', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 2, color: 1 }, { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 },
        { row: 4, col: 2, color: 1 }, { row: 4, col: 4, color: 1 },
        { row: 5, col: 2, color: 1 }, { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 },
        { row: 4, col: 5, color: 2 }, { row: 4, col: 6, color: 2 },
        { row: 5, col: 5, color: 2 }, { row: 5, col: 6, color: 2 }
      ],
      goal: '大眼杀小眼——黑棋眼大，点击眼位确认',
      hint: '黑棋的眼更大，对杀有利',
      targetMoves: [{ row: 4, col: 3 }],
      maxMoves: 1,
      description: '大眼杀小眼——对杀的进阶原则，观察黑棋的眼位',
      type: 'observation'
    },
    {
      id: 45, title: '连环劫', category: '实战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 1, color: 2 }, { row: 0, col: 2, color: 2 }, { row: 0, col: 3, color: 2 },
        { row: 1, col: 0, color: 2 }, { row: 1, col: 4, color: 2 },
        { row: 3, col: 0, color: 2 }, { row: 3, col: 4, color: 2 },
        { row: 4, col: 1, color: 2 }, { row: 4, col: 2, color: 2 }, { row: 4, col: 3, color: 2 },
        { row: 1, col: 1, color: 1 }, { row: 1, col: 3, color: 1 },
        { row: 3, col: 1, color: 1 }, { row: 3, col: 3, color: 1 }
      ],
      goal: '连环劫——黑棋两块被白包围，中间两个劫点循环，点击劫点确认',
      hint: '黑棋上下两块各有1口气，(1,2)和(3,2)是两个劫点',
      targetMoves: [{ row: 1, col: 2 }, { row: 3, col: 2 }],
      maxMoves: 1,
      description: '连环劫——两个劫争循环，双方互提无法解劫',
      type: 'observation'
    },
    {
      id: 46, title: '长生劫', category: '实战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 2 },
        { row: 3, col: 4, color: 1 }
      ],
      goal: '长生劫——观察白棋围出的循环形，黑子(3,4)与空点(4,4)形成长生势，点击(4,4)确认',
      hint: '白棋围出中心两空点，黑子在(3,4)，(4,4)是循环要点',
      targetMoves: [{ row: 4, col: 4 }],
      maxMoves: 1,
      description: '长生劫——特殊的循环形态，类似劫但无法解劫',
      type: 'observation'
    },
    {
      id: 47, title: '三劫循环', category: '实战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 4, color: 1 }
      ],
      goal: '观察三劫循环的基本形态——点击棋盘任意位置确认',
      hint: '三劫循环通常是和棋',
      targetMoves: [{ row: 2, col: 3 }],
      maxMoves: 1,
      description: '三劫循环——罕见的和棋形态',
      type: 'observation'
    },
    {
      id: 48, title: '官子大作战', category: '实战', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 2, color: 1 }, { row: 2, col: 3, color: 1 }, { row: 2, col: 4, color: 1 },
        { row: 3, col: 2, color: 1 }, { row: 3, col: 4, color: 1 },
        { row: 4, col: 2, color: 1 }, { row: 4, col: 3, color: 1 }, { row: 4, col: 4, color: 1 },
        { row: 2, col: 5, color: 2 }, { row: 2, col: 6, color: 2 }, { row: 2, col: 7, color: 2 },
        { row: 3, col: 5, color: 2 }, { row: 3, col: 7, color: 2 },
        { row: 4, col: 5, color: 2 }, { row: 4, col: 6, color: 2 }, { row: 4, col: 7, color: 2 }
      ],
      goal: '官子大作战——观察双方边界，点击黑棋内部确认',
      hint: '黑白双方各有一块地，边界已确定',
      targetMoves: [{ row: 3, col: 3 }],
      maxMoves: 1,
      description: '收官——观察双方的地盘和边界',
      type: 'observation'
    },
    {
      id: 49, title: '先手官子', category: '实战', difficulty: 4,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 3, color: 1 }, { row: 0, col: 4, color: 1 },
        { row: 1, col: 3, color: 1 }, { row: 1, col: 4, color: 1 },
        { row: 0, col: 2, color: 2 }, { row: 0, col: 5, color: 2 },
        { row: 1, col: 2, color: 2 }, { row: 1, col: 5, color: 2 }
      ],
      goal: '走先手官子！',
      hint: '先手官子走了还能抢到下一个',
      targetMoves: [{ row: 2, col: 3, color: 1 }],
      maxMoves: 1,
      description: '先手官子——走完还能抢别处'
    },
    {
      id: 50, title: '逆收官子', category: '实战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 0, col: 3, color: 2 }, { row: 0, col: 4, color: 2 },
        { row: 1, col: 3, color: 2 }, { row: 1, col: 4, color: 2 },
        { row: 0, col: 2, color: 1 }, { row: 0, col: 5, color: 1 },
        { row: 1, col: 2, color: 1 }, { row: 1, col: 5, color: 1 }
      ],
      goal: '走逆收官子！',
      hint: '逆收官子可以抢对方的先手',
      targetMoves: [{ row: 2, col: 3, color: 1 }],
      maxMoves: 1,
      description: '逆收官子——阻止对方先手收官'
    },
    // === 第51-60关：高难度挑战 ===
    {
      id: 51, title: '珍珑棋局（一）', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 4, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 3, col: 2, color: 1 }, { row: 4, col: 2, color: 1 }, { row: 5, col: 3, color: 1 }
      ],
      goal: '珍珑棋局！观察白棋的弱点，点击中心确认',
      hint: '仔细观察白棋的内部',
      targetMoves: [{ row: 3, col: 4 }],
      maxMoves: 1,
      description: '珍珑棋局——经典死活题，观察要点',
      type: 'observation'
    },
    {
      id: 52, title: '珍珑棋局（二）', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 4, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 },
        { row: 3, col: 2, color: 1 }, { row: 4, col: 2, color: 1 },
        { row: 4, col: 5, color: 1 }
      ],
      goal: '找到白棋的致命弱点！点击中心确认',
      hint: '白棋内部有弱点',
      targetMoves: [{ row: 3, col: 4 }],
      maxMoves: 1,
      description: '找到白棋唯一的弱点，观察要点',
      type: 'observation'
    },
    {
      id: 53, title: '妙手连发', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 4, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 2, col: 4, color: 1 }, { row: 2, col: 5, color: 1 },
        { row: 3, col: 3, color: 1 }, { row: 4, col: 4, color: 1 }, { row: 4, col: 5, color: 1 },
        { row: 1, col: 4, color: 2 }, { row: 1, col: 5, color: 2 }
      ],
      goal: '妙手连发！找到提子的妙手',
      hint: '白棋(3,4)(3,5)只剩一口气，在(3,6)提子',
      targetMoves: [{ row: 3, col: 6, color: 1 }],
      maxMoves: 1,
      description: '妙手——出人意料的提子好棋'
    },
    {
      id: 54, title: '鬼手', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 5, col: 5, color: 2 }, { row: 5, col: 6, color: 2 },
        { row: 4, col: 5, color: 1 }, { row: 4, col: 6, color: 1 },
        { row: 5, col: 4, color: 1 }, { row: 6, col: 5, color: 1 }, { row: 6, col: 6, color: 1 },
        { row: 3, col: 5, color: 2 }
      ],
      goal: '鬼手！看似不可能的提子',
      hint: '白棋(5,5)(5,6)只剩一口气，在(5,7)提子',
      targetMoves: [{ row: 5, col: 7, color: 1 }],
      maxMoves: 1,
      description: '鬼手——精妙的提子手段，出其不意'
    },
    {
      id: 55, title: '脱骨', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 }, { row: 3, col: 5, color: 1 }, { row: 3, col: 6, color: 1 }, { row: 3, col: 7, color: 1 },
        { row: 4, col: 3, color: 1 }, { row: 4, col: 5, color: 1 }, { row: 4, col: 7, color: 1 },
        { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 }, { row: 5, col: 5, color: 1 }, { row: 5, col: 6, color: 1 }, { row: 5, col: 7, color: 1 },
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 }, { row: 2, col: 6, color: 2 }, { row: 2, col: 7, color: 2 },
        { row: 6, col: 3, color: 2 }, { row: 6, col: 4, color: 2 }, { row: 6, col: 5, color: 2 }, { row: 6, col: 6, color: 2 }, { row: 6, col: 7, color: 2 },
        { row: 4, col: 2, color: 2 }, { row: 4, col: 8, color: 2 }
      ],
      goal: '脱骨——舍子取胜！观察黑棋做出两眼活棋，点击眼位确认',
      hint: '黑棋做出了两只眼(4,4)和(4,6)，是活棋',
      targetMoves: [{ row: 4, col: 4 }, { row: 4, col: 6 }],
      maxMoves: 1,
      description: '脱骨——舍子取势的高级战术，观察棋形',
      type: 'observation'
    },
    {
      id: 56, title: '全局判断', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 2, color: 1 }, { row: 2, col: 3, color: 1 },
        { row: 3, col: 2, color: 1 },
        { row: 6, col: 6, color: 2 }, { row: 6, col: 7, color: 2 },
        { row: 7, col: 6, color: 2 },
        { row: 4, col: 4, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 4, color: 2 }
      ],
      goal: '做出全局最佳选择！',
      hint: '考虑全局的利益',
      targetMoves: [{ row: 4, col: 3, color: 1 }],
      maxMoves: 1,
      description: '全局判断——选择价值最大的地方'
    },
    {
      id: 57, title: '弃子战术', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 1 }, { row: 3, col: 4, color: 1 },
        { row: 4, col: 3, color: 1 },
        { row: 3, col: 5, color: 2 }, { row: 3, col: 6, color: 2 },
        { row: 4, col: 5, color: 2 }, { row: 4, col: 6, color: 2 },
        { row: 5, col: 5, color: 2 }, { row: 5, col: 6, color: 2 }
      ],
      goal: '弃子取势！',
      hint: '放弃小的，获得大的',
      targetMoves: [{ row: 5, col: 4, color: 1 }],
      maxMoves: 1,
      description: '弃子战术——有舍才有得'
    },
    {
      id: 58, title: '缠绕攻击', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 2, col: 3, color: 1 }, { row: 4, col: 3, color: 1 },
        { row: 2, col: 5, color: 1 }, { row: 4, col: 5, color: 1 }
      ],
      goal: '缠绕攻击！同时打吃两块白棋',
      hint: '在(3,4)落子，同时打吃左右两块白棋',
      targetMoves: [{ row: 3, col: 4, color: 1 }],
      maxMoves: 1,
      description: '缠绕攻击——一子双打吃，让对手顾此失彼'
    },
    {
      id: 59, title: '借力打力', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 3, col: 4, color: 2 }, { row: 5, col: 5, color: 2 }, { row: 2, col: 3, color: 2 },
        { row: 2, col: 4, color: 1 }, { row: 3, col: 3, color: 1 }, { row: 4, col: 4, color: 1 }
      ],
      goal: '借力打力！利用黑子的包围提掉白棋',
      hint: '白棋(3,4)只剩一口气，在(3,5)提子',
      targetMoves: [{ row: 3, col: 5, color: 1 }],
      maxMoves: 1,
      description: '借力打力——借助已有黑子的包围，提掉白棋'
    },
    {
      id: 60, title: '终极挑战', category: '挑战', difficulty: 5,
      boardSize: 9, playerColor: 1,
      setup: [
        { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
        { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
        { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
        { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 2 },
        { row: 4, col: 2, color: 1 }, { row: 4, col: 6, color: 1 },
        { row: 3, col: 2, color: 1 }, { row: 3, col: 6, color: 1 },
        { row: 5, col: 2, color: 1 }, { row: 5, col: 6, color: 1 }
      ],
      goal: '终极挑战！观察白棋形状，点击中心确认',
      hint: '白棋内部空间小，是死形',
      targetMoves: [{ row: 4, col: 4 }],
      maxMoves: 1,
      description: '终极挑战——综合观察死活技巧，白棋是死形',
      type: 'observation'
    }
  ],

  getLevel(id) {
    return this.levels.find(l => l.id === id);
  },

  getLevelsByCategory() {
    const cats = {};
    for (const level of this.levels) {
      if (!cats[level.category]) cats[level.category] = [];
      cats[level.category].push(level);
    }
    return cats;
  },

  getTotalLevels() {
    return this.levels.length;
  }
};