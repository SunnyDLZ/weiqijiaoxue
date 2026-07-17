/**
 * 围棋教学App - 主控制器
 * 管理所有界面、游戏模式、教学和闯关功能
 */
class WeiqiApp {
  constructor() {
    this.engine = null;
    this.renderer = null;
    this.ai = null;
    this.currentMode = 'menu'; // menu|teaching|lesson|challenge|level|pvp|ai|gomoku
    this.currentCategory = null;
    this.currentLesson = null;
    this.currentLevel = null;
    this.aiDifficulty = 'normal';
    this.isAiThinking = false;
    this.hintUsed = false;
    this.unlockedLevels = 1;
    this.completedLevels = [];
    this.completedLessons = [];
    // 五子棋
    this.gomokuEngine = null;
    this.gomokuRenderer = null;
    this.gomokuAI = null;
    this.gomokuMode = null;
    this.gomokuDifficulty = 'medium';
    this.gomokuPlayerColor = 1;
    this.isGomokuAiThinking = false;

    this.init();
  }

  init() {
    this.loadProgress();
    this.setupUI();
    this.showScreen('menu');
    sound.init(); // 初始化音效

    // 点击任意位置初始化音频上下文
    document.addEventListener('click', () => sound.ensureContext(), { once: true });
    document.addEventListener('touchstart', () => sound.ensureContext(), { once: true });

    // 窗口resize时重绘棋盘
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (this.renderer && this.engine) {
          this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
        }
        if (this.gomokuRenderer && this.gomokuEngine) {
          this.gomokuRenderer.render(this.gomokuEngine.board, { currentPlayer: this.gomokuEngine.currentPlayer });
        }
      }, 200);
    });
  }

  loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem('weiqi_progress') || '{}');
      this.unlockedLevels = saved.unlockedLevels || 1;
      this.completedLevels = saved.completedLevels || [];
      this.completedLessons = saved.completedLessons || [];
    } catch (e) {
      this.unlockedLevels = 1;
      this.completedLevels = [];
      this.completedLessons = [];
    }
  }

  saveProgress() {
    try {
      localStorage.setItem('weiqi_progress', JSON.stringify({
        unlockedLevels: this.unlockedLevels,
        completedLevels: this.completedLevels,
        completedLessons: this.completedLessons
      }));
    } catch (e) { /* ignore */ }
  }

  setupUI() {
    // 底部导航
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigateTo(btn.dataset.screen);
      });
    });

    // 返回按钮
    document.getElementById('btnBack').addEventListener('click', () => {
      sound.playClick();
      this.goBack();
    });
  }

  /**
   * 统一导航入口：切换模式前清理已有游戏资源，再进入目标屏幕。
   * 底部导航与主菜单卡片均通过此方法跳转，避免相互耦合。
   */
  navigateTo(screen) {
    sound.playClick();
    // 切换模式前清理已有游戏资源
    this.cleanupAllGames();
    if (screen === 'menu') this.showMenu();
    else if (screen === 'teaching') this.showTeaching();
    else if (screen === 'challenge') this.showChallenge();
    else if (screen === 'battle') this.showBattleOptions();
    else if (screen === 'gomoku') this.showGomokuOptions();
  }

  // ==================== 导航 ====================
  goBack() {
    switch (this.currentMode) {
      case 'lesson':
        // 返回到当前分类的知识点列表，而非顶层分类列表
        if (this.currentCategory) {
          this.showCategory(this.currentCategory.id);
        } else {
          this.showTeaching();
        }
        break;
      case 'level': this.showChallenge(); break;
      case 'pvp':
        if (this.renderer) this.renderer.destroy();
        this.renderer = null;
        this.engine = null;
        this.ai = null;
        this.showBattleOptions();
        break;
      case 'ai':
        if (this.engine) {
          // 在AI对局中，返回AI选项页
          if (this.renderer) this.renderer.destroy();
          this.renderer = null;
          this.engine = null;
          this.ai = null;
          this.showAIOptions();
        } else {
          // 在AI选项页，返回对战选择页
          this.showBattleOptions();
        }
        break;
      case 'battle':
        this.showMenu();
        break;
      case 'gomoku-pvp':
      case 'gomoku-ai':
        if (this.gomokuRenderer) this.gomokuRenderer.destroy();
        this.gomokuRenderer = null;
        this.gomokuEngine = null;
        this.gomokuAI = null;
        this.showMenu();
        break;
      case 'gomoku-lesson':
        // 清理教学棋盘渲染器
        if (this.gomokuRenderer) { this.gomokuRenderer.destroy(); this.gomokuRenderer = null; }
        this.gomokuEngine = null;
        // 返回到五子棋教学分类列表
        if (this.currentGomokuCategory) {
          this.showGomokuTeachingCategory(this.currentGomokuCategory.id);
        } else {
          this.showGomokuTeaching();
        }
        break;
      case 'gomoku-teaching':
        this.showGomokuOptions();
        break;
      default:
        this.showMenu();
    }
  }

  showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + screen);
    if (el) el.classList.add('active');
    // 仅在主菜单显示底部导航，选择其他菜单后隐藏
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.style.display = screen === 'menu' ? 'flex' : 'none';
  }

  /**
   * 清理所有游戏资源（renderer、engine、AI）
   * 在切换模式时调用，避免事件残留和内存泄漏
   */
  cleanupAllGames() {
    if (this.renderer) { this.renderer.destroy(); this.renderer = null; }
    if (this.gomokuRenderer) { this.gomokuRenderer.destroy(); this.gomokuRenderer = null; }
    this.engine = null;
    this.ai = null;
    this.gomokuEngine = null;
    this.gomokuAI = null;
    this.isAiThinking = false;
    this.isGomokuAiThinking = false;
  }

  showMenu() {
    this.currentMode = 'menu';
    this.showScreen('menu');
    document.getElementById('btnBack').style.display = 'none';
    this.renderMenuStats();
  }

  renderMenuStats() {
    document.getElementById('stat-levels').textContent = this.completedLevels.length + '/' + LevelData.getTotalLevels();
    document.getElementById('stat-lessons').textContent = this.completedLessons.length + '/' +
      TeachingData.categories.reduce((sum, cat) => sum + cat.lessons.length, 0);
  }

  // ==================== 教学模块 ====================
  showTeaching() {
    this.currentMode = 'teaching';
    this.showScreen('teaching');
    document.getElementById('btnBack').style.display = 'block';
    this.renderTeachingCategories();
  }

  renderTeachingCategories() {
    const container = document.getElementById('teaching-list');
    container.innerHTML = TeachingData.categories.map(cat => {
      const completed = cat.lessons.filter(l => this.completedLessons.includes(l.id)).length;
      return `
        <div class="category-card" data-cat="${cat.id}">
          <div class="category-icon">${cat.icon}</div>
          <div class="category-info">
            <div class="category-title">${cat.title}</div>
            <div class="category-desc">${cat.description}</div>
            <div class="category-progress">${completed}/${cat.lessons.length} 课完成</div>
          </div>
          <div class="category-arrow">▶</div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playClick();
        this.showCategory(card.dataset.cat);
      });
    });
  }

  showCategory(catId) {
    const cat = TeachingData.categories.find(c => c.id === catId);
    if (!cat) return;
    this.currentCategory = cat;
    this.currentMode = 'teaching';
    this.showScreen('teaching');
    document.getElementById('btnBack').style.display = 'block';

    const container = document.getElementById('teaching-list');
    container.innerHTML = `
      <div class="category-header">
        <button class="btn-back-cat">← 返回</button>
        <h2>${cat.icon} ${cat.title}</h2>
      </div>
      ${cat.lessons.map(lesson => {
        const done = this.completedLessons.includes(lesson.id);
        return `
          <div class="lesson-card ${done ? 'completed' : ''}" data-lesson="${lesson.id}">
            <div class="lesson-status">${done ? '✅' : '📚'}</div>
            <div class="lesson-info">
              <div class="lesson-title">${lesson.title}</div>
              <div class="lesson-subtitle">${lesson.subtitle}</div>
            </div>
          </div>
        `;
      }).join('')}
    `;

    container.querySelector('.btn-back-cat').addEventListener('click', () => {
      sound.playClick();
      this.showTeaching();
    });

    container.querySelectorAll('.lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playClick();
        this.showLesson(card.dataset.lesson);
      });
    });
  }

  showLesson(lessonId) {
    const lesson = this.findLesson(lessonId);
    if (!lesson) return;
    this.currentLesson = lesson;
    this.currentMode = 'lesson';
    this.showScreen('lesson');
    document.getElementById('btnBack').style.display = 'block';

    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-content').innerHTML = `
      <p>${lesson.content}</p>
      ${lesson.tips ? `<div class="tips-box">💡 ${lesson.tips.map(t => `<div class="tip-item">${t}</div>`).join('')}</div>` : ''}
    `;
    document.getElementById('lesson-goal').textContent = '🎯 ' + lesson.goal;

    // 添加"下一课"导航按钮
    this.addLessonNavigation(lesson);

    // 初始化教学棋盘
    this.initTeachingBoard(lesson);
  }

  /**
   * 添加知识点间的导航按钮（下一课）
   */
  addLessonNavigation(lesson) {
    // 移除旧的导航
    const oldNav = document.getElementById('lesson-nav');
    if (oldNav) oldNav.remove();

    if (!this.currentCategory) return;

    const lessons = this.currentCategory.lessons;
    const idx = lessons.findIndex(l => l.id === lesson.id);
    const nextLesson = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;
    const prevLesson = idx > 0 ? lessons[idx - 1] : null;

    const goalEl = document.getElementById('lesson-goal');
    let navHtml = '<div id="lesson-nav" style="margin-top:20px; margin-bottom:20px; display:flex; justify-content:space-between; gap:10px;">';
    if (prevLesson) {
      navHtml += `<button class="btn btn-secondary" id="btnPrevLesson" style="flex:1; padding:14px 20px; font-size:15px; min-height:48px;">◀ 上一课</button>`;
    } else {
      navHtml += '<div style="flex:1;"></div>';
    }
    if (nextLesson) {
      navHtml += `<button class="btn btn-primary" id="btnNextLesson" style="flex:1; padding:14px 20px; font-size:15px; min-height:48px;">下一课：${nextLesson.title} ▶</button>`;
    } else {
      navHtml += `<button class="btn btn-secondary" id="btnBackToCategory" style="flex:1; padding:14px 20px; font-size:15px; min-height:48px;">📋 返回列表</button>`;
    }
    navHtml += '</div>';

    goalEl.insertAdjacentHTML('afterend', navHtml);

    if (nextLesson) {
      document.getElementById('btnNextLesson').addEventListener('click', () => {
        sound.playClick();
        this.showLesson(nextLesson.id);
      });
    } else {
      document.getElementById('btnBackToCategory').addEventListener('click', () => {
        sound.playClick();
        this.showCategory(this.currentCategory.id);
      });
    }
    if (prevLesson) {
      document.getElementById('btnPrevLesson').addEventListener('click', () => {
        sound.playClick();
        this.showLesson(prevLesson.id);
      });
    }
  }

  findLesson(id) {
    for (const cat of TeachingData.categories) {
      const lesson = cat.lessons.find(l => l.id === id);
      if (lesson) return lesson;
    }
    return null;
  }

  initTeachingBoard(lesson) {
    const canvas = document.getElementById('lesson-canvas');
    const boardSize = lesson.boardSize || 9;

    if (this.renderer) this.renderer.destroy();
    this.engine = new GoEngine(boardSize);
    this.renderer = new BoardRenderer(canvas, { size: boardSize, padding: 25, heightReserve: 300 });

    // 设置棋盘
    if (lesson.setup) {
      for (const stone of lesson.setup) {
        this.engine.board[stone.row][stone.col] = stone.color;
      }
    }

    // 设置高亮
    if (lesson.highlights) {
      this.renderer.setHighlightedStones(lesson.highlights);
    }

    // 交互式教学
    if (lesson.interactive) {
      const inter = lesson.interactive;
      if (inter.type === 'place') {
        document.getElementById('lesson-instruction').textContent = inter.description;
        this.engine.currentPlayer = inter.color || 1;

        this.renderer.onBoardClick = (pos) => {
          if (pos.row === inter.row && pos.col === inter.col) {
            const result = this.engine.placeStone(pos.row, pos.col);
            if (result.success) {
              sound.playStonePlace();
              if (result.captured.length > 0) sound.playCapture(result.captured.length);
              this.renderer.lastMove = { row: pos.row, col: pos.col };
              this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
              document.getElementById('lesson-instruction').textContent = '✅ 正确！做得很好！';
              this.renderer.onBoardClick = null;

              // 标记完成
              if (!this.completedLessons.includes(lesson.id)) {
                this.completedLessons.push(lesson.id);
                this.saveProgress();
              }
              sound.playVictory();
            }
          } else {
            sound.playError();
          }
        };
      } else if (inter.type === 'observe') {
        document.getElementById('lesson-instruction').textContent = inter.description;
        // 观察模式，自动标记完成
        setTimeout(() => {
          if (!this.completedLessons.includes(lesson.id)) {
            this.completedLessons.push(lesson.id);
            this.saveProgress();
          }
        }, 2000);
      }
    } else {
      document.getElementById('lesson-instruction').textContent = '观察棋盘，理解概念';
      // 自动标记完成
      if (!this.completedLessons.includes(lesson.id)) {
        this.completedLessons.push(lesson.id);
        this.saveProgress();
      }
    }

    this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
  }

  // ==================== 闯关模块 ====================
  showChallenge() {
    this.currentMode = 'challenge';
    this.showScreen('challenge');
    document.getElementById('btnBack').style.display = 'block';
    this.renderChallengeLevels();
  }

  renderChallengeLevels() {
    const container = document.getElementById('challenge-list');
    const cats = LevelData.getLevelsByCategory();

    let html = '';
    for (const [catName, levels] of Object.entries(cats)) {
      html += `<div class="challenge-category"><h3>${catName}</h3><div class="level-grid">`;
      html += levels.map(l => {
        const locked = l.id > this.unlockedLevels;
        const done = this.completedLevels.includes(l.id);
        const stars = '⭐'.repeat(Math.min(l.difficulty, 5));
        return `
          <div class="level-card ${locked ? 'locked' : ''} ${done ? 'completed' : ''}" data-level="${l.id}">
            <div class="level-num">${locked ? '🔒' : done ? '✅' : l.id}</div>
            <div class="level-name">${l.title}</div>
            <div class="level-diff">${stars}</div>
          </div>
        `;
      }).join('');
      html += '</div></div>';
    }

    container.innerHTML = html;

    container.querySelectorAll('.level-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => {
        sound.playClick();
        this.startLevel(parseInt(card.dataset.level));
      });
    });
  }

  startLevel(levelId) {
    const level = LevelData.getLevel(levelId);
    if (!level) return;
    this.currentLevel = level;
    this.currentMode = 'level';
    this.hintUsed = false;
    this.showScreen('level');
    document.getElementById('btnBack').style.display = 'block';

    document.getElementById('level-title').textContent = `第${level.id}关：${level.title}`;
    document.getElementById('level-desc').textContent = level.description;
    document.getElementById('level-goal').textContent = '🎯 ' + level.goal;

    const canvas = document.getElementById('level-canvas');
    const boardSize = level.boardSize || 9;

    if (this.renderer) this.renderer.destroy();
    this.engine = new GoEngine(boardSize);
    this.renderer = new BoardRenderer(canvas, { size: boardSize, padding: 25, heightReserve: 300 });

    // 设置初始棋盘
    for (const stone of level.setup) {
      this.engine.board[stone.row][stone.col] = stone.color;
    }

    this.engine.currentPlayer = level.playerColor || 1;

    // 观察型关卡：直接点击对应位置即可
    if (level.type === 'observation') {
      this.renderer.onBoardClick = (pos) => {
        const matched = level.targetMoves.some(tm =>
          tm.row === pos.row && tm.col === pos.col
        );
        if (matched) {
          sound.playClick();
          this.renderer.setHighlightedStones([pos]);
          this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
          this.levelCompleted();
        } else {
          sound.playError();
        }
      };
    } else {
      this.renderer.onBoardClick = (pos) => {
        if (this.engine.gameOver) return;
        const result = this.engine.placeStone(pos.row, pos.col);
        if (result.success) {
          sound.playStonePlace();
          if (result.captured.length > 0) sound.playCapture(result.captured.length);
          this.renderer.lastMove = { row: pos.row, col: pos.col };
          this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });

          // 检查是否完成目标
          this.checkLevelComplete();
        } else {
          sound.playError();
        }
      };
    }

    // 提示按钮
    document.getElementById('btnHint').onclick = () => {
      sound.playHint();
      this.hintUsed = true;
      if (level.targetMoves && level.targetMoves.length > 0) {
        this.renderer.setHintMove(level.targetMoves[0]);
        this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
      }
    };

    // 重置按钮
    document.getElementById('btnResetLevel').onclick = () => {
      sound.playClick();
      this.startLevel(levelId);
    };

    this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
  }

  checkLevelComplete() {
    const level = this.currentLevel;
    if (!level || !level.targetMoves) return;

    const lastMove = this.engine.lastMove;
    if (!lastMove) return;

    const matched = level.targetMoves.some(tm =>
      tm.row === lastMove.row && tm.col === lastMove.col
    );

    if (matched) {
      this.levelCompleted();
    }
  }

  levelCompleted() {
    const level = this.currentLevel;
    sound.playLevelComplete();
    if (!this.completedLevels.includes(level.id)) {
      this.completedLevels.push(level.id);
      if (level.id >= this.unlockedLevels) {
        this.unlockedLevels = level.id + 1;
      }
      this.saveProgress();
    }

    setTimeout(() => {
      document.getElementById('level-complete-dialog').classList.add('show');
      document.getElementById('level-complete-dialog').querySelector('.stars-display').textContent =
        this.hintUsed ? '⭐' : '⭐⭐';
      document.getElementById('level-complete-dialog').querySelector('.hint-used').textContent =
        this.hintUsed ? '（使用了提示）' : '（完美通关！）';
    }, 500);
  }

  // ==================== 对战模式选择 ====================
  showBattleOptions() {
    this.currentMode = 'battle';
    this.showScreen('battle');
    document.getElementById('btnBack').style.display = 'block';
    const container = document.getElementById('battle-options');
    container.innerHTML = `
      <div class="menu-header">
        <h1>⚔️ 对战</h1>
        <p class="subtitle">双人对战 · AI对战</p>
      </div>
      <div class="category-card" id="battle-pvp-btn">
        <div class="category-icon">👥</div>
        <div class="category-info">
          <div class="category-title">双人对战</div>
          <div class="category-desc">悔棋 · 手动终局</div>
        </div>
        <div class="category-arrow">▶</div>
      </div>
      <div class="category-card" id="battle-ai-btn">
        <div class="category-icon">🤖</div>
        <div class="category-info">
          <div class="category-title">AI对战</div>
          <div class="category-desc">3种难度 · 悔棋 · 终局</div>
        </div>
        <div class="category-arrow">▶</div>
      </div>
    `;
    document.getElementById('battle-pvp-btn').addEventListener('click', () => {
      sound.playClick();
      this.startPvP();
    });
    document.getElementById('battle-ai-btn').addEventListener('click', () => {
      sound.playClick();
      this.showAIOptions();
    });
  }

  // ==================== 双人对战 ====================
  startPvP() {
    this.currentMode = 'pvp';
    this.showScreen('pvp');
    document.getElementById('btnBack').style.display = 'block';
    this.initPvPBoard();
  }

  initPvPBoard() {
    const canvas = document.getElementById('pvp-canvas');
    if (this.renderer) this.renderer.destroy();
    this.engine = new GoEngine(19);
    this.renderer = new BoardRenderer(canvas, { size: 19, padding: 20 });

    this.engine.onStonePlaced = () => {
      sound.playStonePlace();
      this.updatePvPInfo();
    };
    this.engine.onStonesCaptured = (captured) => {
      sound.playCapture(captured.length);
    };
    this.engine.onGameOver = (result) => {
      this.showGameOver('pvp', result);
    };

    this.renderer.onBoardClick = (pos) => {
      if (this.engine.gameOver) return;
      const result = this.engine.placeStone(pos.row, pos.col);
      if (result.success) {
        this.renderer.lastMove = { row: pos.row, col: pos.col };
      } else {
        sound.playError();
      }
      this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
    };

    this.updatePvPInfo();
    this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });

    document.getElementById('btnUndoPvP').onclick = () => {
      sound.playClick();
      if (this.engine.undo()) {
        this.renderer.lastMove = this.engine.lastMove;
        this.renderer.territoryMap = null;
        this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
        this.updatePvPInfo();
      }
    };

    document.getElementById('btnEndPvP').onclick = () => {
      sound.playClick();
      if (confirm('确定要终局数目吗？')) {
        this.engine.endGame();
        this.renderer.territoryMap = this.engine.territory?.map;
        this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
      }
    };
  }

  updatePvPInfo() {
    document.getElementById('pvp-current').textContent = this.engine.currentPlayer === 1 ? '⚫ 黑方落子' : '⚪ 白方落子';
    document.getElementById('pvp-captures').textContent = `提子: ⚫${this.engine.capturedWhite} ⚪${this.engine.capturedBlack}`;
  }

  // ==================== AI对战 ====================
  showAIOptions() {
    this.currentMode = 'ai';
    this.showScreen('ai');
    document.getElementById('btnBack').style.display = 'block';
    this.showAIDifficultySelect();
  }

  showAIDifficultySelect() {
    const container = document.getElementById('ai-options');
    container.innerHTML = `
      <h3>选择AI难度</h3>
      <div class="ai-diff-options">
        <div class="ai-diff-card" data-diff="normal">
          <div class="ai-diff-icon">🙂</div>
          <div class="ai-diff-name">一般</div>
          <div class="ai-diff-desc">适合初学者练习</div>
        </div>
        <div class="ai-diff-card" data-diff="hard">
          <div class="ai-diff-icon">😤</div>
          <div class="ai-diff-name">困难</div>
          <div class="ai-diff-desc">有一定挑战性</div>
        </div>
        <div class="ai-diff-card" data-diff="nightmare">
          <div class="ai-diff-icon">👹</div>
          <div class="ai-diff-name">噩梦</div>
          <div class="ai-diff-desc">非常强大，慎选</div>
        </div>
      </div>
      <div class="ai-color-select">
        <p>选择你的颜色：</p>
      </div>
      <div class="ai-start-row">
        <button class="btn btn-primary ai-color-btn" data-color="1">⚫ 执黑先手</button>
        <button class="btn btn-secondary ai-color-btn" data-color="2">⚪ 执白后手</button>
        <button class="btn btn-accent" id="btnStartAI">开始对局</button>
      </div>
      <div class="ai-board-size">
        <p>棋盘大小：</p>
        <div class="ai-size-row">
          <button class="btn btn-sm ai-size-btn active" data-size="19">19×19</button>
          <button class="btn btn-sm ai-size-btn" data-size="13">13×13</button>
          <button class="btn btn-sm ai-size-btn" data-size="9">9×9</button>
        </div>
      </div>
    `;

    let selectedDiff = 'normal';
    let selectedColor = 1;
    let selectedSize = 19;

    container.querySelectorAll('.ai-diff-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playClick();
        container.querySelectorAll('.ai-diff-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedDiff = card.dataset.diff;
      });
    });

    container.querySelectorAll('.ai-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        selectedColor = parseInt(btn.dataset.color);
        // 高亮选中的颜色按钮
        container.querySelectorAll('.ai-color-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      });
    });

    container.querySelectorAll('.ai-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        container.querySelectorAll('.ai-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSize = parseInt(btn.dataset.size);
      });
    });

    // 开始对局按钮
    document.getElementById('btnStartAI').addEventListener('click', () => {
      sound.playClick();
      this.startAIGame(selectedDiff, selectedColor, selectedSize);
    });

    // 默认选中一般
    container.querySelector('.ai-diff-card[data-diff="normal"]').classList.add('selected');
  }

  async startAIGame(difficulty, playerColor, boardSize) {
    this.aiDifficulty = difficulty;
    this.currentMode = 'ai';
    this.showScreen('ai-game');
    document.getElementById('btnBack').style.display = 'block';

    const canvas = document.getElementById('ai-game-canvas');
    if (this.renderer) this.renderer.destroy();
    this.engine = new GoEngine(boardSize);
    this.renderer = new BoardRenderer(canvas, { size: boardSize, padding: 20 });
    this.ai = new AIPlayer(this.engine, difficulty);

    const aiColor = playerColor === 1 ? 2 : 1;
    this.playerColor = playerColor;

    this.engine.onStonePlaced = () => {
      sound.playStonePlace();
      this.updateAIGameInfo();
    };
    this.engine.onStonesCaptured = (captured) => {
      sound.playCapture(captured.length);
    };
    this.engine.onGameOver = (result) => {
      this.showGameOver('ai', result);
    };

    this.renderer.onBoardClick = async (pos) => {
      if (this.engine.gameOver || this.isAiThinking) return;
      if (this.engine.currentPlayer !== playerColor) return;

      const result = this.engine.placeStone(pos.row, pos.col);
      if (result.success) {
        this.renderer.lastMove = { row: pos.row, col: pos.col };
        this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });

        // AI回合
        if (!this.engine.gameOver && this.engine.currentPlayer === aiColor) {
          await this.aiMove();
        }
      } else {
        sound.playError();
      }
    };

    this.updateAIGameInfo();
    this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });

    // 悔棋按钮
    document.getElementById('btnUndoAI').onclick = () => {
      sound.playClick();
      if (this.isAiThinking) return;
      // 悔两步（AI+玩家）
      if (this.engine.moveHistory.length >= 2) {
        this.engine.undo();
        this.engine.undo();
        this.renderer.lastMove = this.engine.lastMove;
        this.renderer.territoryMap = null;
        this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
        this.updateAIGameInfo();
        // 悔棋后若轮到AI，继续让其落子，避免玩家执白时悔棋导致游戏卡死
        if (!this.engine.gameOver && this.engine.currentPlayer === aiColor) {
          this.aiMove();
        }
      }
    };

    // 终局按钮
    document.getElementById('btnEndAI').onclick = () => {
      sound.playClick();
      if (confirm('确定要终局数目吗？')) {
        this.engine.endGame();
        this.renderer.territoryMap = this.engine.territory?.map;
        this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
      }
    };

    // AI先手
    if (this.engine.currentPlayer === aiColor) {
      await this.aiMove();
    }
  }

  async aiMove() {
    this.isAiThinking = true;
    document.getElementById('ai-thinking').style.display = 'block';
    document.getElementById('ai-diff-label').textContent =
      '难度：' + ({ normal: '一般', hard: '困难', nightmare: '噩梦' })[this.aiDifficulty];

    try {
      const move = await this.ai.getBestMove();

      if (move) {
        const result = this.engine.placeStone(move.row, move.col);
        if (result.success) {
          this.renderer.lastMove = { row: move.row, col: move.col };
        }
      } else {
        this.engine.pass();
      }

      this.renderer.render(this.engine.board, { currentPlayer: this.engine.currentPlayer });
      this.updateAIGameInfo();
    } catch (e) {
      console.error('AI move error:', e);
      // 确保即使AI出错也能继续游戏
    } finally {
      document.getElementById('ai-thinking').style.display = 'none';
      this.isAiThinking = false;
    }
  }

  updateAIGameInfo() {
    const playerName = this.playerColor === 1 ? '⚫ 你（黑）' : '⚪ 你（白）';
    const aiName = this.playerColor === 1 ? '⚪ AI（白）' : '⚫ AI（黑）';
    document.getElementById('ai-current').textContent =
      this.engine.currentPlayer === this.playerColor ? playerName + ' 落子' : aiName + ' 思考中...';
    document.getElementById('ai-captures').textContent =
      `提子: ⚫${this.engine.capturedWhite} ⚪${this.engine.capturedBlack}`;
  }

  // ==================== 五子棋 ====================
  showGomokuOptions() {
    this.currentMode = 'gomoku';
    this.showScreen('gomoku');
    document.getElementById('btnBack').style.display = 'block';
    this.renderGomokuOptions();
  }

  renderGomokuOptions() {
    const container = document.getElementById('gomoku-options');
    container.innerHTML = `
      <h3>五子棋</h3>
      <div style="margin: 20px 0;">
        <div class="category-card" id="gomoku-teaching-btn">
          <div class="category-icon">📚</div>
          <div class="category-info">
            <div class="category-title">教学做局技巧</div>
            <div class="category-desc">棋型认知 · 组合杀招 · VCF入门</div>
          </div>
          <div class="category-arrow">▶</div>
        </div>
        <div class="category-card" id="gomoku-pvp-btn">
          <div class="category-icon">👥</div>
          <div class="category-info">
            <div class="category-title">双人对战</div>
            <div class="category-desc">两人在同一设备上对弈</div>
          </div>
          <div class="category-arrow">▶</div>
        </div>
        <div class="category-card" id="gomoku-ai-btn">
          <div class="category-icon">🤖</div>
          <div class="category-info">
            <div class="category-title">AI对战</div>
            <div class="category-desc">与电脑AI对弈</div>
          </div>
          <div class="category-arrow">▶</div>
        </div>
      </div>
      <div id="gomoku-ai-diff-select" style="display:none; margin-top: 16px;">
        <h4 style="margin-bottom:10px;">选择AI难度</h4>
        <div class="ai-diff-options">
          <div class="ai-diff-card" data-diff="easy">
            <div class="ai-diff-icon">🙂</div>
            <div class="ai-diff-name">简单</div>
            <div class="ai-diff-desc">适合初学者</div>
          </div>
          <div class="ai-diff-card" data-diff="medium">
            <div class="ai-diff-icon">😤</div>
            <div class="ai-diff-name">中等</div>
            <div class="ai-diff-desc">有一定挑战性</div>
          </div>
          <div class="ai-diff-card" data-diff="hard">
            <div class="ai-diff-icon">👹</div>
            <div class="ai-diff-name">困难</div>
            <div class="ai-diff-desc">非常强大</div>
          </div>
        </div>
        <div class="ai-color-select" style="margin-top:14px;">
          <p>选择你的颜色：</p>
        </div>
        <div class="ai-start-row">
          <button class="btn btn-primary gomoku-color-btn" data-color="1">⚫ 执黑先手</button>
          <button class="btn btn-secondary gomoku-color-btn" data-color="2">⚪ 执白后手</button>
          <button class="btn btn-accent" id="btnStartGomokuAI">开始对局</button>
        </div>
      </div>
    `;

    let selectedDiff = 'medium';
    let selectedColor = 1;

    document.getElementById('gomoku-pvp-btn').addEventListener('click', () => {
      sound.playClick();
      this.startGomokuPvP();
    });

    document.getElementById('gomoku-teaching-btn').addEventListener('click', () => {
      sound.playClick();
      this.showGomokuTeaching();
    });

    document.getElementById('gomoku-ai-btn').addEventListener('click', () => {
      sound.playClick();
      document.getElementById('gomoku-ai-diff-select').style.display = 'block';
      // 默认选中中等
      const mediumCard = container.querySelector('.ai-diff-card[data-diff="medium"]');
      if (mediumCard) mediumCard.classList.add('selected');
    });

    container.querySelectorAll('.ai-diff-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playClick();
        container.querySelectorAll('.ai-diff-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedDiff = card.dataset.diff;
      });
    });

    container.querySelectorAll('.gomoku-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        selectedColor = parseInt(btn.dataset.color);
        container.querySelectorAll('.gomoku-color-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      });
    });

    document.getElementById('btnStartGomokuAI').addEventListener('click', () => {
      sound.playClick();
      this.startGomokuAI(selectedDiff, selectedColor);
    });
  }

  // ==================== 五子棋教学 ====================
  showGomokuTeaching() {
    this.currentMode = 'gomoku-teaching';
    this.showScreen('gomoku-teaching');
    document.getElementById('btnBack').style.display = 'block';
    this.renderGomokuTeachingCategories();
  }

  renderGomokuTeachingCategories() {
    const container = document.getElementById('gomoku-teaching-list');
    container.innerHTML = `
      <div class="menu-header">
        <h1>📚 五子棋做局技巧</h1>
        <p class="subtitle">从基本棋型到组合杀招，掌握制胜关键</p>
      </div>
      ${GomokuTeachingData.categories.map(cat => {
        return `
          <div class="category-card" data-gtcat="${cat.id}">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-info">
              <div class="category-title">${cat.title}</div>
              <div class="category-desc">${cat.description}</div>
              <div class="category-progress">${cat.lessons.length} 课</div>
            </div>
            <div class="category-arrow">▶</div>
          </div>
        `;
      }).join('')}
    `;

    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playClick();
        this.showGomokuTeachingCategory(card.dataset.gtcat);
      });
    });
  }

  showGomokuTeachingCategory(catId) {
    const cat = GomokuTeachingData.categories.find(c => c.id === catId);
    if (!cat) return;
    this.currentGomokuCategory = cat;
    this.currentMode = 'gomoku-teaching';
    this.showScreen('gomoku-teaching');
    document.getElementById('btnBack').style.display = 'block';

    const container = document.getElementById('gomoku-teaching-list');
    container.innerHTML = `
      <div class="category-header">
        <button class="btn-back-cat">← 返回</button>
        <h2>${cat.icon} ${cat.title}</h2>
      </div>
      ${cat.lessons.map(lesson => {
        return `
          <div class="lesson-card" data-gtlesson="${lesson.id}">
            <div class="lesson-status">📖</div>
            <div class="lesson-info">
              <div class="lesson-title">${lesson.title}</div>
              <div class="lesson-subtitle">${lesson.subtitle}</div>
            </div>
          </div>
        `;
      }).join('')}
    `;

    container.querySelector('.btn-back-cat').addEventListener('click', () => {
      sound.playClick();
      this.showGomokuTeaching();
    });

    container.querySelectorAll('.lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playClick();
        this.showGomokuLesson(card.dataset.gtlesson);
      });
    });
  }

  showGomokuLesson(lessonId) {
    const lesson = this.findGomokuLesson(lessonId);
    if (!lesson) return;
    this.currentMode = 'gomoku-lesson';
    this.showScreen('gomoku-lesson');
    document.getElementById('btnBack').style.display = 'block';

    document.getElementById('gomoku-lesson-title').textContent = lesson.title;
    document.getElementById('gomoku-lesson-content').innerHTML = `
      <p style="white-space:pre-line;">${lesson.content}</p>
      ${lesson.tips ? `<div class="tips-box">💡 ${lesson.tips.map(t => `<div class="tip-item">${t}</div>`).join('')}</div>` : ''}
    `;
    document.getElementById('gomoku-lesson-goal').textContent = '🎯 ' + lesson.goal;

    // 添加导航按钮
    this.addGomokuLessonNavigation(lesson);

    // 初始化教学棋盘
    this.initGomokuTeachingBoard(lesson);
  }

  addGomokuLessonNavigation(lesson) {
    const oldNav = document.getElementById('gomoku-lesson-nav');
    if (oldNav) oldNav.remove();

    if (!this.currentGomokuCategory) return;

    const lessons = this.currentGomokuCategory.lessons;
    const idx = lessons.findIndex(l => l.id === lesson.id);
    const nextLesson = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;
    const prevLesson = idx > 0 ? lessons[idx - 1] : null;

    const goalEl = document.getElementById('gomoku-lesson-goal');
    let navHtml = '<div id="gomoku-lesson-nav" style="margin-top:20px; margin-bottom:20px; display:flex; justify-content:space-between; gap:10px;">';
    if (prevLesson) {
      navHtml += `<button class="btn btn-secondary" id="btnGtPrev" style="flex:1; padding:14px 20px; font-size:15px; min-height:48px;">◀ 上一课</button>`;
    } else {
      navHtml += '<div style="flex:1;"></div>';
    }
    if (nextLesson) {
      navHtml += `<button class="btn btn-primary" id="btnGtNext" style="flex:1; padding:14px 20px; font-size:15px; min-height:48px;">下一课：${nextLesson.title} ▶</button>`;
    } else {
      navHtml += `<button class="btn btn-secondary" id="btnGtBack" style="flex:1; padding:14px 20px; font-size:15px; min-height:48px;">📋 返回列表</button>`;
    }
    navHtml += '</div>';

    goalEl.insertAdjacentHTML('afterend', navHtml);

    if (nextLesson) {
      document.getElementById('btnGtNext').addEventListener('click', () => {
        sound.playClick();
        this.showGomokuLesson(nextLesson.id);
      });
    } else {
      document.getElementById('btnGtBack').addEventListener('click', () => {
        sound.playClick();
        this.showGomokuTeachingCategory(this.currentGomokuCategory.id);
      });
    }
    if (prevLesson) {
      document.getElementById('btnGtPrev').addEventListener('click', () => {
        sound.playClick();
        this.showGomokuLesson(prevLesson.id);
      });
    }
  }

  findGomokuLesson(id) {
    for (const cat of GomokuTeachingData.categories) {
      const lesson = cat.lessons.find(l => l.id === id);
      if (lesson) return lesson;
    }
    return null;
  }

  initGomokuTeachingBoard(lesson) {
    const canvas = document.getElementById('gomoku-lesson-canvas');
    const boardSize = lesson.boardSize || 15;

    if (this.gomokuRenderer) this.gomokuRenderer.destroy();
    this.gomokuEngine = new GomokuEngine(boardSize);
    this.gomokuRenderer = new GomokuRenderer(canvas, { size: boardSize, padding: 18 });

    // 设置棋盘
    if (lesson.setup) {
      for (const stone of lesson.setup) {
        this.gomokuEngine.board[stone.row][stone.col] = stone.color;
      }
    }

    // 设置高亮
    if (lesson.highlights) {
      this.gomokuRenderer.highlights = lesson.highlights;
    }

    this.gomokuRenderer.render(this.gomokuEngine.board, { currentPlayer: 1 });
  }

  startGomokuPvP() {
    this.currentMode = 'gomoku-pvp';
    this.showScreen('gomoku-pvp');
    document.getElementById('btnBack').style.display = 'block';
    this.initGomokuPvP();
  }

  initGomokuPvP() {
    const canvas = document.getElementById('gomoku-pvp-canvas');
    if (this.gomokuRenderer) this.gomokuRenderer.destroy();
    this.gomokuEngine = new GomokuEngine(15);
    this.gomokuRenderer = new GomokuRenderer(canvas, { size: 15, padding: 22 });

    this.gomokuEngine.onStonePlaced = () => {
      sound.playStonePlace();
      this.updateGomokuPvPInfo();
    };
    this.gomokuEngine.onGameOver = (result) => {
      this.showGomokuGameOver('pvp', result);
    };

    this.gomokuRenderer.onBoardClick = (pos) => {
      if (this.gomokuEngine.gameOver) return;
      const result = this.gomokuEngine.placeStone(pos.row, pos.col);
      if (result.success) {
        this.gomokuRenderer.lastMove = { row: pos.row, col: pos.col };
        this.gomokuRenderer.winLine = this.gomokuEngine.winLine;
      } else {
        sound.playError();
      }
      this.gomokuRenderer.render(this.gomokuEngine.board, { currentPlayer: this.gomokuEngine.currentPlayer });
    };

    this.updateGomokuPvPInfo();
    this.gomokuRenderer.render(this.gomokuEngine.board, { currentPlayer: this.gomokuEngine.currentPlayer });

    document.getElementById('btnUndoGomokuPvP').onclick = () => {
      sound.playClick();
      if (this.gomokuEngine.undo()) {
        this.gomokuRenderer.lastMove = this.gomokuEngine.lastMove;
        this.gomokuRenderer.winLine = null;
        this.gomokuRenderer.render(this.gomokuEngine.board, { currentPlayer: this.gomokuEngine.currentPlayer });
        this.updateGomokuPvPInfo();
      }
    };

    document.getElementById('btnRestartGomokuPvP').onclick = () => {
      sound.playClick();
      this.initGomokuPvP();
    };
  }

  updateGomokuPvPInfo() {
    document.getElementById('gomoku-pvp-current').textContent =
      this.gomokuEngine.currentPlayer === 1 ? '⚫ 黑方落子' : '⚪ 白方落子';
  }

  async startGomokuAI(difficulty, playerColor) {
    this.gomokuDifficulty = difficulty;
    this.gomokuPlayerColor = playerColor;
    this.currentMode = 'gomoku-ai';
    this.showScreen('gomoku-ai');
    document.getElementById('btnBack').style.display = 'block';

    const canvas = document.getElementById('gomoku-ai-canvas');
    if (this.gomokuRenderer) this.gomokuRenderer.destroy();
    this.gomokuEngine = new GomokuEngine(15);
    this.gomokuRenderer = new GomokuRenderer(canvas, { size: 15, padding: 22 });
    this.gomokuAI = new GomokuAI(this.gomokuEngine, difficulty);

    const aiColor = playerColor === 1 ? 2 : 1;

    this.gomokuEngine.onStonePlaced = () => {
      sound.playStonePlace();
      this.updateGomokuAIInfo();
    };
    this.gomokuEngine.onGameOver = (result) => {
      this.showGomokuGameOver('ai', result);
    };

    this.gomokuRenderer.onBoardClick = async (pos) => {
      if (this.gomokuEngine.gameOver || this.isGomokuAiThinking) return;
      if (this.gomokuEngine.currentPlayer !== playerColor) return;

      const result = this.gomokuEngine.placeStone(pos.row, pos.col);
      if (result.success) {
        this.gomokuRenderer.lastMove = { row: pos.row, col: pos.col };
        this.gomokuRenderer.winLine = this.gomokuEngine.winLine;
        this.gomokuRenderer.render(this.gomokuEngine.board, { currentPlayer: this.gomokuEngine.currentPlayer });

        if (!this.gomokuEngine.gameOver && this.gomokuEngine.currentPlayer === aiColor) {
          await this.gomokuAIMove();
        }
      } else {
        sound.playError();
      }
    };

    this.updateGomokuAIInfo();
    this.gomokuRenderer.render(this.gomokuEngine.board, { currentPlayer: this.gomokuEngine.currentPlayer });

    document.getElementById('btnUndoGomokuAI').onclick = () => {
      sound.playClick();
      if (this.isGomokuAiThinking) return;
      if (this.gomokuEngine.moveHistory.length >= 2) {
        this.gomokuEngine.undo();
        this.gomokuEngine.undo();
        this.gomokuRenderer.lastMove = this.gomokuEngine.lastMove;
        this.gomokuRenderer.winLine = null;
        this.gomokuRenderer.render(this.gomokuEngine.board, { currentPlayer: this.gomokuEngine.currentPlayer });
        this.updateGomokuAIInfo();
        // 悔棋后若轮到AI，继续让其落子，避免玩家执白时悔棋导致游戏卡死
        if (!this.gomokuEngine.gameOver && this.gomokuEngine.currentPlayer === aiColor) {
          this.gomokuAIMove();
        }
      }
    };

    document.getElementById('btnRestartGomokuAI').onclick = () => {
      sound.playClick();
      this.startGomokuAI(difficulty, playerColor);
    };

    if (this.gomokuEngine.currentPlayer === aiColor) {
      await this.gomokuAIMove();
    }
  }

  async gomokuAIMove() {
    this.isGomokuAiThinking = true;
    document.getElementById('gomoku-ai-thinking').style.display = 'block';
    document.getElementById('gomoku-ai-diff-label').textContent =
      '难度：' + ({ easy: '简单', medium: '中等', hard: '困难' })[this.gomokuDifficulty];

    try {
      const move = await this.gomokuAI.getBestMove();
      if (move) {
        const result = this.gomokuEngine.placeStone(move.row, move.col);
        if (result.success) {
          this.gomokuRenderer.lastMove = { row: move.row, col: move.col };
          this.gomokuRenderer.winLine = this.gomokuEngine.winLine;
        }
      }
      this.gomokuRenderer.render(this.gomokuEngine.board, { currentPlayer: this.gomokuEngine.currentPlayer });
      this.updateGomokuAIInfo();
    } catch (e) {
      console.error('Gomoku AI error:', e);
    } finally {
      document.getElementById('gomoku-ai-thinking').style.display = 'none';
      this.isGomokuAiThinking = false;
    }
  }

  updateGomokuAIInfo() {
    const playerName = this.gomokuPlayerColor === 1 ? '⚫ 你（黑）' : '⚪ 你（白）';
    const aiName = this.gomokuPlayerColor === 1 ? '⚪ AI（白）' : '⚫ AI（黑）';
    document.getElementById('gomoku-ai-current').textContent =
      this.gomokuEngine.currentPlayer === this.gomokuPlayerColor ? playerName + ' 落子' : aiName + ' 思考中...';
  }

  showGomokuGameOver(mode, result) {
    const el = document.getElementById('game-over-dialog');
    const msg = document.getElementById('game-over-message');
    const detail = document.getElementById('game-over-detail');

    if (result.winner === 0) {
      msg.textContent = '🤝 平局！';
      sound.playClick();
    } else if (mode === 'ai') {
      const aiWon = (this.gomokuPlayerColor === 1 && result.winner === 2) ||
        (this.gomokuPlayerColor === 2 && result.winner === 1);
      if (aiWon) {
        msg.textContent = '😢 AI获胜！';
        sound.playDefeat();
      } else {
        msg.textContent = '🎉 你赢了！';
        sound.playVictory();
      }
    } else {
      msg.textContent = result.winner === 1 ? '⚫ 黑方获胜！' : '⚪ 白方获胜！';
      sound.playVictory();
    }

    detail.textContent = result.winner === 0 ? '棋盘已满，双方平局' : '五子连珠，恭喜获胜！';
    el.classList.add('show');
  }

  // ==================== 游戏结果 ====================
  showGameOver(mode, result) {
    const el = document.getElementById('game-over-dialog');
    const msg = document.getElementById('game-over-message');
    const detail = document.getElementById('game-over-detail');

    if (result.winner === 0) {
      // 平局
      msg.textContent = '🤝 平局！';
      sound.playClick();
      detail.textContent = `黑方：${result.blackScore}子 | 白方：${result.whiteScore.toFixed(1)}子（贴7.5目）`;
    } else if (mode === 'ai') {
      const aiWon = (this.playerColor === 1 && result.winner === 2) ||
        (this.playerColor === 2 && result.winner === 1);
      if (aiWon) {
        msg.textContent = '😢 AI获胜！';
        sound.playDefeat();
      } else {
        msg.textContent = '🎉 你赢了！';
        sound.playVictory();
      }
      detail.textContent = `黑方：${result.blackScore}子 | 白方：${result.whiteScore.toFixed(1)}子（贴7.5目）`;
    } else {
      msg.textContent = result.winner === 1 ? '⚫ 黑方获胜！' : '⚪ 白方获胜！';
      sound.playVictory();
      detail.textContent = `黑方：${result.blackScore}子 | 白方：${result.whiteScore.toFixed(1)}子（贴7.5目）`;
    }

    el.classList.add('show');
  }
}

// ==================== 全局初始化 ====================
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new WeiqiApp();

  // 关闭弹窗
  document.getElementById('closeLevelComplete').addEventListener('click', () => {
    document.getElementById('level-complete-dialog').classList.remove('show');
    app.showChallenge();
  });

  document.getElementById('nextLevel').addEventListener('click', () => {
    document.getElementById('level-complete-dialog').classList.remove('show');
    const nextId = app.currentLevel.id + 1;
    if (nextId <= LevelData.getTotalLevels()) {
      app.startLevel(nextId);
    } else {
      app.showChallenge();
    }
  });

  document.getElementById('closeGameOver').addEventListener('click', () => {
    document.getElementById('game-over-dialog').classList.remove('show');
    app.showMenu();
  });

  // 查看终局棋盘：关闭弹窗，显示浮动返回按钮
  document.getElementById('reviewBoard').addEventListener('click', () => {
    document.getElementById('game-over-dialog').classList.remove('show');
    document.getElementById('reviewBackBtn').style.display = 'block';
  });

  // 浮动返回按钮：回主页并隐藏
  document.getElementById('reviewBackBtn').addEventListener('click', () => {
    document.getElementById('reviewBackBtn').style.display = 'none';
    app.showMenu();
  });

  // 错误处理
  window.addEventListener('error', (e) => {
    console.error('App error:', e.error);
  });
});