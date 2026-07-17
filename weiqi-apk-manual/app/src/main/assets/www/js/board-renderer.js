/**
 * 围棋棋盘渲染器 - Canvas绘制
 * 支持：棋盘绘制、棋子绘制、动画、触摸交互
 */
// 横坐标字母表（跳过 I，符合围棋传统），最长支持 19 路
const COORD_LETTERS = 'ABCDEFGHJKLMNOPQRST';

class BoardRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = options.size || 19;
    this.padding = options.padding || 18;
    this.showCoordinates = options.showCoordinates !== false;
    this.showStarPoints = options.showStarPoints !== false;
    this.animationDuration = options.animationDuration || 200;
    // 棋盘上方/下方需要为顶栏、信息条、控制按钮预留的高度，按模式可配置
    this.heightReserve = options.heightReserve || 220;

    // 回调
    this.onBoardClick = null;
    this.onHoverChange = null;

    // 状态
    this.hoverPos = null;
    this.lastMove = null;
    this.highlightedStones = [];
    this.territoryMap = null;
    this.hintMove = null;
    this.cellSize = 0;
    this.boardOffsetX = 0;
    this.boardOffsetY = 0;

    // 星位
    this.starPoints = this.generateStarPoints();

    // 事件引用（用于销毁）
    this._boundHandlers = {};

    // 触摸事件
    this.setupEvents();
  }

  /**
   * 销毁渲染器，清除所有事件监听器
   */
  destroy() {
    const c = this.canvas;
    const h = this._boundHandlers;
    if (h.click) c.removeEventListener('click', h.click);
    if (h.mousemove) c.removeEventListener('mousemove', h.mousemove);
    if (h.mouseleave) c.removeEventListener('mouseleave', h.mouseleave);
    if (h.touchstart) c.removeEventListener('touchstart', h.touchstart);
    if (h.touchmove) c.removeEventListener('touchmove', h.touchmove);
    if (h.touchend) c.removeEventListener('touchend', h.touchend);
    this._boundHandlers = {};
    this.onBoardClick = null;
    this.onHoverChange = null;
  }

  generateStarPoints() {
    const points = [];
    if (this.size === 19) {
      const stars = [3, 9, 15];
      for (const r of stars) for (const c of stars) points.push({ row: r, col: c });
    } else if (this.size === 13) {
      const stars = [3, 6, 9];
      for (const r of stars) for (const c of stars) points.push({ row: r, col: c });
    } else if (this.size === 9) {
      const stars = [2, 4, 6];
      for (const r of stars) for (const c of stars) points.push({ row: r, col: c });
    }
    return points;
  }

  setupEvents() {
    // 鼠标事件
    const h = this._boundHandlers;
    h.click = (e) => this.handleClick(e);
    h.mousemove = (e) => this.handleMove(e);
    h.mouseleave = () => {
      this.hoverPos = null;
      if (this._lastBoard) {
        this.render(this._lastBoard);
      }
    };
    this.canvas.addEventListener('click', h.click);
    this.canvas.addEventListener('mousemove', h.mousemove);
    this.canvas.addEventListener('mouseleave', h.mouseleave);

    // 触摸事件
    h.touchstart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleClick(touch);
    };
    h.touchmove = (e) => {
      e.preventDefault();
    };
    h.touchend = (e) => {
      e.preventDefault();
      this.hoverPos = null;
      if (this._lastBoard) {
        this.render(this._lastBoard);
      }
    };
    this.canvas.addEventListener('touchstart', h.touchstart);
    this.canvas.addEventListener('touchmove', h.touchmove);
    this.canvas.addEventListener('touchend', h.touchend);
  }

  getBoardPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    // 使用 CSS 像素坐标，因为 canvas 已通过 setTransform 处理了 DPR 缩放
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const col = Math.round((x - this.boardOffsetX) / this.cellSize);
    const row = Math.round((y - this.boardOffsetY) / this.cellSize);
    if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
      return { row, col };
    }
    return null;
  }

  handleClick(e) {
    // 防止 touchstart 和 click 重复触发
    const now = Date.now();
    if (this._lastClickTime && now - this._lastClickTime < 300) {
      return;
    }
    this._lastClickTime = now;

    const pos = this.getBoardPos(e.clientX, e.clientY);
    if (pos && this.onBoardClick) {
      this.onBoardClick(pos);
    }
  }

  handleMove(e) {
    const pos = this.getBoardPos(e.clientX, e.clientY);
    if (pos) {
      if (!this.hoverPos || this.hoverPos.row !== pos.row || this.hoverPos.col !== pos.col) {
        this.hoverPos = pos;
        if (this._lastBoard) this.render(this._lastBoard);
        if (this.onHoverChange) this.onHoverChange(pos);
      }
    } else if (this.hoverPos) {
      this.hoverPos = null;
      if (this._lastBoard) this.render(this._lastBoard);
    }
  }

  coordToPixel(row, col) {
    return {
      x: this.boardOffsetX + col * this.cellSize,
      y: this.boardOffsetY + row * this.cellSize
    };
  }

  resize() {
    const container = this.canvas.parentElement;
    const cw = container.clientWidth || 300;
    // 用窗口高度估算可用空间（容器高度会被初始canvas尺寸卡住，不可靠）
    // 预留高度按模式可配置（教学/闯关信息多 → 适当增大）
    const availableHeight = window.innerHeight - this.heightReserve;
    const maxSize = Math.min(cw, availableHeight);
    if (maxSize < 50) return; // 布局未完成，跳过
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = maxSize + 'px';
    this.canvas.style.height = maxSize + 'px';
    this.canvas.width = maxSize * dpr;
    this.canvas.height = maxSize * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const boardSize = maxSize - this.padding * 2;
    this.cellSize = boardSize / (this.size - 1);
    this.boardOffsetX = this.padding;
    this.boardOffsetY = this.padding;
  }

  render(board, options = {}) {
    // 保存最后一次传入的棋盘，避免内部调用 render() 时丢失棋盘
    if (board !== undefined) this._lastBoard = board;
    const currentBoard = board !== undefined ? board : this._lastBoard;

    this.lastMove = options.lastMove !== undefined ? options.lastMove : this.lastMove;
    this.highlightedStones = options.highlightedStones || this.highlightedStones;
    this.territoryMap = options.territoryMap !== undefined ? options.territoryMap : this.territoryMap;
    if (options.hintMove !== undefined) this.hintMove = options.hintMove;
    this.currentPlayer = options.currentPlayer !== undefined ? options.currentPlayer : this.currentPlayer;

    this.resize();
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    // 背景
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, w, h);

    // 棋盘阴影
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    const boardLeft = this.boardOffsetX - this.cellSize * 0.5;
    const boardTop = this.boardOffsetY - this.cellSize * 0.5;
    const boardWidth = (this.size - 1) * this.cellSize + this.cellSize;
    const boardHeight = (this.size - 1) * this.cellSize + this.cellSize;
    ctx.fillStyle = '#DCB468';
    ctx.fillRect(boardLeft, boardTop, boardWidth, boardHeight);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 网格线
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < this.size; i++) {
      const pos = this.boardOffsetX + i * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, this.boardOffsetY);
      ctx.lineTo(pos, this.boardOffsetY + (this.size - 1) * this.cellSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.boardOffsetX, pos);
      ctx.lineTo(this.boardOffsetX + (this.size - 1) * this.cellSize, pos);
      ctx.stroke();
    }

    // 星位
    if (this.showStarPoints) {
      for (const sp of this.starPoints) {
        const { x, y } = this.coordToPixel(sp.row, sp.col);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x, y, this.cellSize * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 坐标
    if (this.showCoordinates) {
      ctx.fillStyle = '#555';
      ctx.font = `${this.cellSize * 0.35}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < this.size; i++) {
        const x = this.boardOffsetX + i * this.cellSize;
        // 横坐标跳过字母 I（围棋传统，避免与数字 1 混淆）
        ctx.fillText(COORD_LETTERS[i] || '?', x, this.boardOffsetY - this.cellSize * 0.7);
        ctx.fillText(String(this.size - i), this.boardOffsetX - this.cellSize * 0.7, this.boardOffsetY + i * this.cellSize);
      }
    }

    // 领地标记
    if (this.territoryMap) {
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.territoryMap[r][c] !== 0 && currentBoard && currentBoard[r][c] === 0) {
            const { x, y } = this.coordToPixel(r, c);
            ctx.fillStyle = this.territoryMap[r][c] === 1 ? 'rgba(0,0,0,0.15)' : 'rgba(200,200,200,0.2)';
            ctx.fillRect(x - this.cellSize * 0.35, y - this.cellSize * 0.35, this.cellSize * 0.7, this.cellSize * 0.7);
          }
        }
      }
    }

    // 高亮标记
    for (const stone of this.highlightedStones) {
      const { x, y } = this.coordToPixel(stone.row, stone.col);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, this.cellSize * 0.48, 0, Math.PI * 2);
      ctx.fill();
    }

    // 提示标记
    if (this.hintMove && currentBoard &&
        this.hintMove.row >= 0 && this.hintMove.row < this.size &&
        this.hintMove.col >= 0 && this.hintMove.col < this.size &&
        currentBoard[this.hintMove.row][this.hintMove.col] === 0) {
      const { x, y } = this.coordToPixel(this.hintMove.row, this.hintMove.col);
      ctx.fillStyle = 'rgba(0, 200, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, this.cellSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 棋子
    if (currentBoard) {
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (currentBoard[r][c] !== 0) {
            const { x, y } = this.coordToPixel(r, c);
            const radius = this.cellSize * 0.44;
            this.drawStone(ctx, x, y, radius, currentBoard[r][c]);
          }
        }
      }
    }

    // 最后落子标记
    if (this.lastMove && currentBoard &&
        this.lastMove.row >= 0 && this.lastMove.row < this.size &&
        this.lastMove.col >= 0 && this.lastMove.col < this.size &&
        currentBoard[this.lastMove.row][this.lastMove.col] !== 0) {
      const { x, y } = this.coordToPixel(this.lastMove.row, this.lastMove.col);
      const markColor = currentBoard[this.lastMove.row][this.lastMove.col] === 1 ? '#fff' : '#000';
      ctx.fillStyle = markColor;
      ctx.beginPath();
      ctx.arc(x, y, this.cellSize * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 悬停预览
    if (this.hoverPos && currentBoard && currentBoard[this.hoverPos.row][this.hoverPos.col] === 0) {
      const { x, y } = this.coordToPixel(this.hoverPos.row, this.hoverPos.col);
      const radius = this.cellSize * 0.44;
      ctx.globalAlpha = 0.5;
      this.drawStone(ctx, x, y, radius, this.currentPlayer || 1);
      ctx.globalAlpha = 1;
    }
  }

  drawStone(ctx, x, y, radius, color) {
    // 阴影
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
    if (color === 1) {
      gradient.addColorStop(0, '#555');
      gradient.addColorStop(0.6, '#222');
      gradient.addColorStop(1, '#000');
    } else {
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(0.6, '#eee');
      gradient.addColorStop(1, '#ccc');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  setHintMove(move) {
    this.hintMove = move;
  }

  clearHint() {
    this.hintMove = null;
  }

  setHighlightedStones(stones) {
    this.highlightedStones = stones;
  }

  clearHighlights() {
    this.highlightedStones = [];
  }
}