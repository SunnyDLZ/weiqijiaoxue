/**
 * 五子棋棋盘渲染器 - Canvas绘制
 * 复用围棋渲染器的核心逻辑，适配五子棋
 */
// 横坐标字母表（跳过 I），最长支持 19 路
const GOMOKU_COORD_LETTERS = 'ABCDEFGHJKLMNOPQRST';

class GomokuRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = options.size || 15;
    this.padding = options.padding || 16;
    this.showCoordinates = options.showCoordinates !== false;
    // 棋盘上方/下方需要为顶栏、信息条、控制按钮预留的高度，按模式可配置
    this.heightReserve = options.heightReserve || 220;

    this.onBoardClick = null;
    this.hoverPos = null;
    this.lastMove = null;
    this.winLine = null;
    this.highlights = null; // 教学用高亮位置数组 [{row, col}]
    this.cellSize = 0;
    this.boardOffsetX = 0;
    this.boardOffsetY = 0;

    this._boundHandlers = {};
    this._lastClickTime = 0;
    this.setupEvents();
  }

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
  }

  setupEvents() {
    const h = this._boundHandlers;
    h.click = (e) => this.handleClick(e);
    h.mousemove = (e) => this.handleMove(e);
    h.mouseleave = () => {
      this.hoverPos = null;
      if (this._lastBoard) this.render(this._lastBoard);
    };
    this.canvas.addEventListener('click', h.click);
    this.canvas.addEventListener('mousemove', h.mousemove);
    this.canvas.addEventListener('mouseleave', h.mouseleave);

    h.touchstart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleClick(touch);
    };
    h.touchmove = (e) => { e.preventDefault(); };
    h.touchend = (e) => {
      e.preventDefault();
      this.hoverPos = null;
      if (this._lastBoard) this.render(this._lastBoard);
    };
    this.canvas.addEventListener('touchstart', h.touchstart);
    this.canvas.addEventListener('touchmove', h.touchmove);
    this.canvas.addEventListener('touchend', h.touchend);
  }

  getBoardPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
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
    const now = Date.now();
    if (this._lastClickTime && now - this._lastClickTime < 300) return;
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

  /**
   * 按棋盘尺寸生成星位：天元 + 四角星位
   * 15路用(3,3)系，13路用(3,3)系，9路及以下用(2,2)系
   */
  generateStarPoints() {
    const s = this.size;
    const c = Math.floor(s / 2);
    const e = s >= 13 ? 3 : 2;
    const points = [[c, c], [e, e], [e, s - 1 - e], [s - 1 - e, e], [s - 1 - e, s - 1 - e]];
    // 仅保留落在棋盘内的点
    return points.filter(([r, cc]) => r >= 0 && cc >= 0 && r < s && cc < s);
  }

  resize() {
    const container = this.canvas.parentElement;
    const cw = container.clientWidth || 300;
    // 用窗口高度估算可用空间（容器高度会被初始canvas尺寸卡住，不可靠）
    // 预留高度按模式可配置（教学/闯关信息多 → 适当增大）
    const availableHeight = window.innerHeight - this.heightReserve;
    const maxSize = Math.min(cw, availableHeight);
    if (maxSize < 50) return;
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
    if (board !== undefined) this._lastBoard = board;
    const currentBoard = board !== undefined ? board : this._lastBoard;

    this.lastMove = options.lastMove !== undefined ? options.lastMove : this.lastMove;
    if (options.winLine !== undefined) { this.winLine = options.winLine; }
    this.currentPlayer = options.currentPlayer !== undefined ? options.currentPlayer : this.currentPlayer;

    this.resize();
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    // 背景
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, w, h);

    // 棋盘
    const boardLeft = this.boardOffsetX - this.cellSize * 0.5;
    const boardTop = this.boardOffsetY - this.cellSize * 0.5;
    const boardWidth = (this.size - 1) * this.cellSize + this.cellSize;
    const boardHeight = (this.size - 1) * this.cellSize + this.cellSize;
    ctx.fillStyle = '#DCB468';
    ctx.fillRect(boardLeft, boardTop, boardWidth, boardHeight);

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

    // 星位（天元和四角，按棋盘尺寸生成，避免硬编码 15 路）
    const starPoints = this.generateStarPoints();
    for (const [r, c] of starPoints) {
      const { x, y } = this.coordToPixel(r, c);
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(x, y, this.cellSize * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }

    // 坐标
    if (this.showCoordinates) {
      ctx.fillStyle = '#555';
      ctx.font = `${this.cellSize * 0.35}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < this.size; i++) {
        const x = this.boardOffsetX + i * this.cellSize;
        // 横坐标跳过字母 I（与传统围棋坐标一致）
        ctx.fillText(GOMOKU_COORD_LETTERS[i] || '?', x, this.boardOffsetY - this.cellSize * 0.7);
        ctx.fillText(String(this.size - i), this.boardOffsetX - this.cellSize * 0.7, this.boardOffsetY + i * this.cellSize);
      }
    }

    // 获胜连线高亮
    if (this.winLine && this.winLine.length > 0) {
      ctx.fillStyle = 'rgba(255, 50, 50, 0.35)';
      for (const stone of this.winLine) {
        const { x, y } = this.coordToPixel(stone.row, stone.col);
        ctx.beginPath();
        ctx.arc(x, y, this.cellSize * 0.48, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 教学高亮位置（黄色半透明圆）
    if (this.highlights && this.highlights.length > 0) {
      ctx.fillStyle = 'rgba(255, 200, 0, 0.45)';
      for (const pos of this.highlights) {
        const { x, y } = this.coordToPixel(pos.row, pos.col);
        ctx.beginPath();
        ctx.arc(x, y, this.cellSize * 0.48, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 棋子
    if (currentBoard) {
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (currentBoard[r][c] !== 0) {
            const { x, y } = this.coordToPixel(r, c);
            this.drawStone(ctx, x, y, this.cellSize * 0.44, currentBoard[r][c]);
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
      ctx.globalAlpha = 0.5;
      this.drawStone(ctx, x, y, this.cellSize * 0.44, this.currentPlayer || 1);
      ctx.globalAlpha = 1;
    }
  }

  drawStone(ctx, x, y, radius, color) {
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
}