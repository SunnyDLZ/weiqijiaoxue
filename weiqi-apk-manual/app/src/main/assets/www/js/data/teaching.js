/**
 * 围棋教学内容数据
 * 包含：基本概念、基本术语、技巧教学三大模块
 */
const TeachingData = {
  categories: [
    {
      id: 'basics',
      title: '基础概念',
      icon: '📖',
      description: '围棋入门基础知识',
      lessons: [
        {
          id: 'b1',
          title: '认识围棋',
          subtitle: '围棋的起源与基本规则',
          content: '围棋起源于中国，已有4000多年历史。围棋使用黑白两色棋子在方形棋盘上对弈。棋盘上有纵横各19条线段，形成361个交叉点。对局双方各执一色棋子，黑先白后，交替下子，每次只能下一子。棋子下在棋盘上的交叉点上，棋子下定后，不得再向其他位置移动。',
          boardSize: 19,
          setup: [],
          highlights: [],
          goal: '了解围棋的基本规则',
          tips: ['围棋是世界上最为复杂的棋类游戏之一', '围棋的英文名"Go"源自日语']
        },
        {
          id: 'b2',
          title: '棋盘与棋子',
          subtitle: '理解棋盘结构和棋子',
          content: '标准围棋棋盘是19×19的网格，共有361个交叉点。棋盘上有9个星位（黑点），用于标记关键位置和让子。棋盘分为四个角、四条边和中央。棋子分为黑白两色，黑棋181颗，白棋180颗。棋子放在交叉点上，不是放在格子里。',
          boardSize: 19,
          setup: [],
          highlights: [
            { row: 3, col: 3 }, { row: 3, col: 9 }, { row: 3, col: 15 },
            { row: 9, col: 3 }, { row: 9, col: 9 }, { row: 9, col: 15 },
            { row: 15, col: 3 }, { row: 15, col: 9 }, { row: 15, col: 15 }
          ],
          goal: '认识棋盘上的星位位置',
          tips: ['棋盘上的9个黑点叫"星位"', '中央的星位叫"天元"']
        },
        {
          id: 'b3',
          title: '气（一）',
          subtitle: '棋子的生命线',
          content: '"气"是围棋中最重要的概念之一。一个棋子的"气"是指与它相邻的空的交叉点。一个棋子至少需要一口气才能存活在棋盘上。棋子在棋盘上，与它直线紧邻的空点是这个棋子的"气"。',
          boardSize: 9,
          setup: [
            { row: 4, col: 4, color: 1 }
          ],
          highlights: [
            { row: 3, col: 4 }, { row: 5, col: 4 },
            { row: 4, col: 3 }, { row: 4, col: 5 }
          ],
          goal: '观察黑棋周围的4口气（黄色高亮位置）',
          tips: ['角上的棋子只有2口气', '边上的棋子有3口气', '中间的棋子有4口气']
        },
        {
          id: 'b4',
          title: '气（二）',
          subtitle: '同色棋子共享气',
          content: '当多个同色棋子连在一起时，它们共享气。这些连在一起的棋子被称为"棋串"或"一块棋"。棋串中所有棋子的气，就是整块棋的公共气。',
          boardSize: 9,
          setup: [
            { row: 4, col: 3, color: 1 },
            { row: 4, col: 4, color: 1 },
            { row: 4, col: 5, color: 1 }
          ],
          highlights: [
            { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
            { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 },
            { row: 4, col: 2 }, { row: 4, col: 6 }
          ],
          goal: '观察三颗黑子连在一起，共有8口气',
          tips: ['连在一起的棋子更强，因为气更多', '棋子的连接是围棋的基本策略']
        },
        {
          id: 'b5',
          title: '提子',
          subtitle: '吃掉对方的棋子',
          content: '当一个棋串的最后一口气被对方堵住时，该棋串的所有棋子都会被"提"（吃掉），从棋盘上拿掉。提子是围棋中唯一的"消灭"对方棋子的方式。被提掉的棋子放在棋盒盖里，终局时用于计算胜负。',
          boardSize: 9,
          setup: [
            { row: 4, col: 4, color: 1 },
            { row: 3, col: 4, color: 2 },
            { row: 5, col: 4, color: 2 },
            { row: 4, col: 3, color: 2 }
          ],
          interactive: {
            type: 'place',
            row: 4,
            col: 5,
            color: 2,
            description: '请在(4,5)位置落白子，吃掉黑棋'
          },
          goal: '白棋在(4,5)落子，堵住黑棋最后一口气，吃掉黑棋',
          tips: ['提子后，被提的位置变成空点', '提子是围棋中获取实地的重要手段']
        },
        {
          id: 'b6',
          title: '眼',
          subtitle: '棋块的生存关键',
          content: '"眼"是由同色棋子围住的空点。如果一块棋有两只"真眼"，对方就无法吃掉这块棋，这块棋就是"活棋"。只有一个眼或没有眼的棋是"死棋"，最终会被吃掉。',
          boardSize: 9,
          setup: [
            { row: 2, col: 2, color: 1 }, { row: 2, col: 3, color: 1 }, { row: 2, col: 4, color: 1 },
            { row: 3, col: 2, color: 1 }, { row: 3, col: 4, color: 1 },
            { row: 4, col: 2, color: 1 }, { row: 4, col: 3, color: 1 }, { row: 4, col: 4, color: 1 }
          ],
          highlights: [
            { row: 3, col: 3 }
          ],
          goal: '观察黑棋围出的一个眼（黄色高亮位置）',
          tips: ['一个眼还不足以确保活棋', '需要两只真眼才能保证活棋', '角上的眼更容易做']
        },
        {
          id: 'b7',
          title: '活棋与死棋',
          subtitle: '判断棋的生死',
          content: '活棋：拥有两只或以上真眼的棋块，对方无法吃掉。死棋：无法做出两只眼的棋块，最终会被对方吃掉。在对局中，判断棋块的生死是最重要的技能之一。',
          boardSize: 9,
          setup: [
            { row: 2, col: 2, color: 1 }, { row: 2, col: 3, color: 1 }, { row: 2, col: 4, color: 1 }, { row: 2, col: 5, color: 1 },
            { row: 3, col: 2, color: 1 }, { row: 3, col: 5, color: 1 },
            { row: 4, col: 2, color: 1 }, { row: 4, col: 5, color: 1 },
            { row: 5, col: 2, color: 1 }, { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 }, { row: 5, col: 5, color: 1 }
          ],
          highlights: [
            { row: 3, col: 3 }, { row: 3, col: 4 }
          ],
          goal: '观察黑棋围出的两个眼（黄色高亮），这是一块活棋',
          tips: ['两只真眼 = 活棋', '眼必须是"真眼"——周围都是自己的棋子']
        },
        {
          id: 'b8',
          title: '打劫',
          subtitle: '围棋的特殊规则',
          content: '"打劫"是围棋中一个特殊的规则。当双方可以互相提对方一子，形成循环时，"打劫"规则规定：一方提子后，另一方不能立即回提，必须在别处走一步棋（找劫材）后，才能回来提劫。这防止了棋局无限循环。',
          boardSize: 9,
          setup: [
            { row: 3, col: 3, color: 1 }, { row: 3, col: 5, color: 1 },
            { row: 4, col: 3, color: 1 }, { row: 4, col: 5, color: 1 },
            { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 1 },
            { row: 6, col: 3, color: 1 }, { row: 6, col: 5, color: 1 },
            { row: 7, col: 3, color: 1 }, { row: 7, col: 5, color: 1 }
          ],
          highlights: [
            { row: 4, col: 4 }
          ],
          goal: '观察打劫的形状：黑棋可以提(4,4)的白子，但白棋不能立即回提',
          tips: ['打劫不能立即回提', '需要找"劫材"——在别处威胁对方']
        },
        {
          id: 'b9',
          title: '禁入点',
          subtitle: '不能下的位置',
          content: '"禁入点"是指不能落子的位置。如果在一个位置落子后，自己的棋子没有气，且不能提掉对方的棋子，那么这个位置就是禁入点。简单来说，就是不能"自杀"。',
          boardSize: 9,
          setup: [
            { row: 3, col: 3, color: 2 }, { row: 3, col: 4, color: 2 }, { row: 3, col: 5, color: 2 },
            { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
            { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 2 }
          ],
          highlights: [
            { row: 4, col: 4 }
          ],
          goal: '观察(4,4)位置——黑棋不能在此落子，因为这是禁入点',
          tips: ['禁入点 = 落子后没气且不能提子', '但如果能提子，即使没气也可以落子']
        }
      ]
    },
    {
      id: 'terms',
      title: '基本术语',
      icon: '📝',
      description: '围棋常用术语教学',
      lessons: [
        {
          id: 't1',
          title: '叫吃（打吃）',
          subtitle: 'Atari - 威胁提子',
          content: '"叫吃"（也叫"打吃"）是指下一手棋使对方的一块棋只剩一口气，下一手就可以提掉它。这是围棋中最基本的攻击手段。对方只剩一口气时，我们说这块棋"被打吃"了。',
          boardSize: 9,
          setup: [
            { row: 4, col: 4, color: 1 },
            { row: 3, col: 4, color: 2 },
            { row: 5, col: 4, color: 2 },
            { row: 4, col: 3, color: 2 }
          ],
          interactive: {
            type: 'observe',
            description: '黑棋只有一口气了！白棋再下一子就可以提掉黑棋'
          },
          goal: '观察黑棋被打吃的状态',
          tips: ['对方叫吃时，要及时"长"（逃跑）', '叫吃是进攻的基本手段']
        },
        {
          id: 't2',
          title: '长（逃跑）',
          subtitle: 'Nobi - 延伸逃跑',
          content: '"长"是指沿着直线方向延伸自己的棋子，增加棋串的气。当自己的棋子被打吃时，"长"是最基本的应对方法。',
          boardSize: 9,
          setup: [
            { row: 4, col: 4, color: 1 },
            { row: 3, col: 4, color: 2 },
            { row: 5, col: 4, color: 2 },
            { row: 4, col: 3, color: 2 }
          ],
          interactive: {
            type: 'place',
            row: 4,
            col: 5,
            color: 1,
            description: '黑棋被打吃了！请下在(4,5)位置长出去逃跑'
          },
          goal: '黑棋在(4,5)长，增加气数逃跑',
          tips: ['长是逃跑的最基本手段', '被打吃时要先判断能不能跑掉']
        },
        {
          id: 't3',
          title: '扳',
          subtitle: 'Hane - 从侧面进攻',
          content: '"扳"是指当双方棋子接触时，在对方棋子的斜对角位置落子，阻断对方的发展方向。扳是一种具有攻击性的下法。',
          boardSize: 9,
          setup: [
            { row: 4, col: 3, color: 1 },
            { row: 4, col: 4, color: 2 },
            { row: 4, col: 5, color: 1 }
          ],
          interactive: {
            type: 'place',
            row: 3,
            col: 4,
            color: 1,
            description: '请在(3,4)位置扳，阻断白棋向上的路'
          },
          goal: '黑棋在(3,4)扳，攻击白棋',
          tips: ['扳是贴身战斗的手段', '扳后要注意自己的断点']
        },
        {
          id: 't4',
          title: '断',
          subtitle: 'Cut - 切断对方',
          content: '"断"是指将对方的棋子分断开来，使其不能连在一起。切断对方是围棋中重要的进攻手段，因为被分断的棋子需要分别做活，增加了对方的负担。',
          boardSize: 9,
          setup: [
            { row: 4, col: 3, color: 2 },
            { row: 4, col: 5, color: 2 }
          ],
          interactive: {
            type: 'place',
            row: 4,
            col: 4,
            color: 1,
            description: '请在(4,4)位置断，将两颗白棋分断'
          },
          goal: '黑棋在(4,4)断，将白棋一分为二',
          tips: ['断是进攻的开始', '自己的棋也要注意不被对方断']
        },
        {
          id: 't5',
          title: '接（粘）',
          subtitle: 'Connect - 连接己方',
          content: '"接"（也叫"粘"）是指将自己可能被分断的棋子连接起来。连接是防守的基本手段，确保自己的棋子安全。',
          boardSize: 9,
          setup: [
            { row: 4, col: 3, color: 1 },
            { row: 4, col: 5, color: 1 },
            { row: 3, col: 4, color: 2 }
          ],
          interactive: {
            type: 'place',
            row: 4,
            col: 4,
            color: 1,
            description: '白棋在上方断点！请黑棋在(4,4)接上'
          },
          goal: '黑棋在(4,4)接，将被分断的两边连起来',
          tips: ['有断点要及时接上', '连接=安全，分断=危险']
        },
        {
          id: 't6',
          title: '虎口',
          subtitle: 'Tiger Mouth - 巧妙防守',
          content: '"虎口"是指三个同色棋子形成一个"品"字形，中间的空点就像一个老虎的嘴巴。对方如果下在虎口里，只剩一口气，会被立刻提掉。虎口是一种高效的防守形状。',
          boardSize: 9,
          setup: [
            { row: 3, col: 3, color: 1 },
            { row: 3, col: 5, color: 1 },
            { row: 5, col: 4, color: 1 }
          ],
          highlights: [
            { row: 4, col: 4 }
          ],
          goal: '观察(4,4)位置——这是一个虎口，白棋不敢下',
          tips: ['虎口是高效的防守形状', '虎口可以同时保护多个断点']
        },
        {
          id: 't7',
          title: '飞',
          subtitle: 'Diagonal Jump',
          content: '"飞"是指沿对角线方向走子，形状像象棋中的"马"步。飞是一种轻快的下法，用于快速展开或逃跑。根据距离不同，有小飞（隔一路）、大飞（隔两路）之分。',
          boardSize: 9,
          setup: [
            { row: 4, col: 4, color: 1 },
            { row: 3, col: 6, color: 1 }
          ],
          highlights: [
            { row: 3, col: 5 }, { row: 4, col: 5 }
          ],
          goal: '观察黑棋两子之间的小飞关系',
          tips: ['小飞 = 日字形的对角', '飞是布局阶段常用的走法']
        },
        {
          id: 't8',
          title: '跳',
          subtitle: 'One-point Jump',
          content: '"跳"是指沿直线方向隔一路走子。跳是一种快速的展开手段，比"长"走得更快，但联系不如"长"紧密。',
          boardSize: 9,
          setup: [
            { row: 4, col: 3, color: 1 },
            { row: 4, col: 5, color: 1 }
          ],
          highlights: [
            { row: 4, col: 4 }
          ],
          goal: '观察黑棋两子之间的跳（中间隔了一路）',
          tips: ['跳比长更快', '跳可能被对方挖断，需注意']
        }
      ]
    },
    {
      id: 'techniques',
      title: '技巧教学',
      icon: '🎯',
      description: '围棋进阶技巧',
      lessons: [
        {
          id: 'tech1',
          title: '征子（扭羊头）',
          subtitle: 'Ladder - 连续叫吃',
          content: '"征子"（也叫"扭羊头"）是一种连续叫吃对方棋子的技巧。通过不断从两侧打吃，迫使对方棋子沿一条斜线逃跑，最终将其逼到棋盘边缘吃掉。征子能否成功，取决于逃跑路线上有没有对方的接应棋子。',
          boardSize: 9,
          setup: [
            { row: 2, col: 3, color: 2 },
            { row: 3, col: 3, color: 1 },
            { row: 3, col: 4, color: 2 },
            { row: 4, col: 4, color: 1 }
          ],
          interactive: {
            type: 'place',
            row: 4,
            col: 3,
            color: 1,
            description: '请在(4,3)打吃白棋，开始征子'
          },
          goal: '黑棋在(4,3)打吃，开始征子，最终将白棋逼到棋盘边吃掉',
          tips: ['征子前要看清逃跑路线上有没有对方援军', '征子不利时不要强行征']
        },
        {
          id: 'tech2',
          title: '枷吃',
          subtitle: 'Net - 封堵逃跑',
          content: '"枷吃"是一种巧妙地将对方棋子封锁住的技巧。当对方棋子有两口气时，通过在其逃跑路线上设置障碍，使其无法逃脱。枷吃是一种"虚"的包围，不直接打吃，而是封锁。',
          boardSize: 9,
          setup: [
            { row: 3, col: 3, color: 2 },
            { row: 3, col: 4, color: 1 },
            { row: 4, col: 3, color: 1 }
          ],
          interactive: {
            type: 'place',
            row: 4,
            col: 4,
            color: 1,
            description: '请在(4,4)枷吃白棋，封住它的逃跑路线'
          },
          goal: '黑棋在(4,4)枷，白棋无法逃脱',
          tips: ['枷吃不需要直接打吃', '枷吃的关键是预判对方逃跑路线']
        },
        {
          id: 'tech3',
          title: '倒扑',
          subtitle: 'Snapback - 舍子擒敌',
          content: '"倒扑"是一种先送一子给对方吃，然后反过来吃掉对方更多棋子的技巧。先故意在对方虎口里下子，对方提掉后，留下的位置成为新的攻击点。',
          boardSize: 9,
          setup: [
            { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
            { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
            { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 2 }
          ],
          interactive: {
            type: 'place',
            row: 4,
            col: 4,
            color: 1,
            description: '黑棋在(4,4)送吃一子（先下在这里），白棋提掉后，黑棋再下在(4,4)可吃回更多'
          },
          goal: '黑棋在(4,4)倒扑，舍一子吃全部白棋',
          tips: ['倒扑需要精确计算', '先送后吃，是高级技巧']
        },
        {
          id: 'tech4',
          title: '双打吃',
          subtitle: 'Double Atari',
          content: '"双打吃"是指一手棋同时打吃对方的两块棋，使对方无法同时救回两边。这是非常有效的攻击手段，通常能确保吃掉其中一块。',
          boardSize: 9,
          setup: [
            { row: 3, col: 3, color: 2 },
            { row: 3, col: 5, color: 2 },
            { row: 4, col: 3, color: 1 },
            { row: 4, col: 5, color: 1 },
            { row: 5, col: 3, color: 2 },
            { row: 5, col: 5, color: 2 }
          ],
          interactive: {
            type: 'place',
            row: 4,
            col: 4,
            color: 1,
            description: '请在(4,4)落子，同时打吃两边白棋'
          },
          goal: '黑棋在(4,4)双打吃，白棋顾此失彼',
          tips: ['双打吃让对手无法两全', '寻找双打吃的机会是重要的攻击技巧']
        },
        {
          id: 'tech5',
          title: '扑',
          subtitle: 'Throw-in - 弃子破眼',
          content: '"扑"是指故意将棋子送到对方虎口里让对方吃掉，目的是破坏对方的眼位或缩小对方的气。扑是一种常见的破眼手段。',
          boardSize: 9,
          setup: [
            { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
            { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
            { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
            { row: 5, col: 3, color: 2 }, { row: 5, col: 5, color: 2 },
            { row: 6, col: 3, color: 2 }, { row: 6, col: 4, color: 2 }, { row: 6, col: 5, color: 2 }
          ],
          highlights: [
            { row: 3, col: 4 }
          ],
          interactive: {
            type: 'place',
            row: 3,
            col: 4,
            color: 1,
            description: '黑棋在(3,4)扑，破坏白棋的眼位'
          },
          goal: '黑棋在(3,4)扑，破坏白棋的眼位',
          tips: ['扑是破眼的关键手段', '扑后对方提子，但眼位已被破坏']
        },
        {
          id: 'tech6',
          title: '做眼',
          subtitle: 'Making Eyes',
          content: '"做眼"是确保自己棋块存活的关键技巧。通过合理的走法，确保自己的棋块拥有两只真眼。做眼时要考虑眼的大小和真假。',
          boardSize: 9,
          setup: [
            { row: 2, col: 3, color: 1 }, { row: 2, col: 4, color: 1 }, { row: 2, col: 5, color: 1 },
            { row: 3, col: 3, color: 1 }, { row: 3, col: 5, color: 1 },
            { row: 4, col: 3, color: 1 }, { row: 4, col: 5, color: 1 },
            { row: 5, col: 3, color: 1 }, { row: 5, col: 4, color: 1 }, { row: 5, col: 5, color: 1 }
          ],
          highlights: [
            { row: 3, col: 4 }, { row: 4, col: 4 }
          ],
          interactive: {
            type: 'observe',
            description: '黑棋已经围出两个眼（黄色高亮），这是活棋！眼是空点，不能填'
          },
          goal: '观察黑棋围出的两只眼（黄色高亮），这是活棋',
          tips: ['做眼先做大眼', '大眼比小眼更安全', '眼是空点，不能往里填子']
        },
        {
          id: 'tech7',
          title: '破眼',
          subtitle: 'Destroying Eyes',
          content: '"破眼"是指破坏对方眼位的技巧。通过占据对方做眼的关键位置，使其无法形成两只眼，从而杀死对方。破眼是杀棋的关键。',
          boardSize: 9,
          setup: [
            { row: 2, col: 3, color: 2 }, { row: 2, col: 4, color: 2 }, { row: 2, col: 5, color: 2 },
            { row: 3, col: 3, color: 2 }, { row: 3, col: 5, color: 2 },
            { row: 4, col: 3, color: 2 }, { row: 4, col: 5, color: 2 },
            { row: 5, col: 3, color: 2 }, { row: 5, col: 4, color: 2 }, { row: 5, col: 5, color: 2 }
          ],
          interactive: {
            type: 'place',
            row: 3,
            col: 4,
            color: 1,
            description: '黑棋在(3,4)破眼，阻止白棋做活'
          },
          goal: '黑棋在(3,4)破眼，白棋只剩一个眼，无法做活',
          tips: ['破眼要抢占关键位置', '对方做眼的位置就是你要破眼的位置']
        },
        {
          id: 'tech8',
          title: '收官',
          subtitle: 'Endgame - 收束技巧',
          content: '"收官"是指棋局进入最后阶段，双方确定边界、争夺剩余空点的过程。收官的好坏直接影响胜负。常见的收官技巧包括：先手官子、后手官子、逆收官子等。',
          boardSize: 9,
          setup: [
            { row: 2, col: 2, color: 1 }, { row: 2, col: 3, color: 1 },
            { row: 3, col: 2, color: 1 },
            { row: 6, col: 6, color: 2 }, { row: 6, col: 7, color: 2 },
            { row: 7, col: 6, color: 2 }
          ],
          interactive: {
            type: 'observe',
            description: '观察棋盘上双方边界还未完全确定，需要收官'
          },
          goal: '了解收官的概念，在边界上争夺每一目',
          tips: ['先手官子优先走', '收官要精确计算每一目', '逆收官子可以抢对方的先手']
        }
      ]
    }
  ]
};