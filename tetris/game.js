/**
 * Cyber Neon Tetris
 * Pure HTML5 Canvas & Web Audio API
 */

// --- Audio Synthesizer using Web Audio API ---
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playMove() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playRotate() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playDrop() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playClear() {
    if (!this.enabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    
    // Play a nice minor 7th chord arpeggio
    const freqs = [523.25, 659.25, 783.99, 987.77]; // C5, E5, G5, B5
    freqs.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);
      
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.3);
    });
  }

  playGameOver() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.8);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }
}

const sfx = new SoundEffects();

// --- Tetromino Colors and Matrices ---
const NEON_COLORS = {
  I: '#00f0ff', // Cyan
  O: '#ffdd00', // Yellow
  T: '#b000ff', // Purple
  S: '#00ff66', // Green
  Z: '#ff0055', // Red
  J: '#0047ff', // Blue
  L: '#ff7a00', // Orange
};

const TETROMINOES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ]
};

// --- Particles System ---
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8 - 3;
    this.color = color;
    this.alpha = 1;
    this.life = 1.0;
    this.decay = 0.02 + Math.random() * 0.03;
    this.size = 2 + Math.random() * 4;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15; // Gravity
    this.alpha -= this.decay;
    this.life -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- Main Game Engine ---
class TetrisGame {
  constructor() {
    // Canvas elements
    this.boardCanvas = document.getElementById('game-board');
    this.ctx = this.boardCanvas.getContext('2d');
    
    this.holdCanvas = document.getElementById('hold-canvas');
    this.holdCtx = this.holdCanvas.getContext('2d');
    
    this.nextCanvas = document.getElementById('next-canvas');
    this.nextCtx = this.nextCanvas.getContext('2d');
    
    // Core parameters
    this.cols = 10;
    this.rows = 20;
    this.blockSize = 30; // standard box scale matching canvas dim
    
    // Audio button
    this.soundBtn = document.getElementById('sound-btn');
    this.soundBtn.addEventListener('click', () => {
      const active = sfx.toggle();
      this.soundBtn.textContent = `SOUND: ${active ? 'ON' : 'OFF'}`;
    });
    
    // Game Over stats
    this.highScore = parseInt(localStorage.getItem('tetris_high_score') || '0', 10);
    this.updateHighScoreDisplay();
    
    // Overlays & buttons
    this.startOverlay = document.getElementById('start-overlay');
    this.gameoverOverlay = document.getElementById('gameover-overlay');
    this.pauseBtn = document.getElementById('pause-btn');
    
    document.getElementById('start-btn').addEventListener('click', () => this.start());
    document.getElementById('restart-btn').addEventListener('click', () => this.start());
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    
    // Set sizing dynamically based on canvas
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.reset();
    this.initControls();
    
    // Animation frame handle
    this.animationFrameId = null;
    this.particles = [];
  }
  
  resizeCanvas() {
    // Handle scale factor depending on viewport
    const width = this.boardCanvas.clientWidth;
    const height = this.boardCanvas.clientHeight;
    this.boardCanvas.width = width;
    this.boardCanvas.height = height;
    this.blockSize = width / this.cols;
  }
  
  updateHighScoreDisplay() {
    document.getElementById('highscore-val').textContent = String(this.highScore).padStart(6, '0');
  }

  reset() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.isGameOver = false;
    this.isPaused = false;
    
    this.currentPiece = null;
    this.holdPiece = null;
    this.hasHeld = false;
    
    this.bag = [];
    this.nextPieceType = this.pullFromBag();
    
    this.lastTime = 0;
    this.dropCounter = 0;
    this.dropInterval = 1000; // ms
    
    this.particles = [];
    
    this.updateHUD();
    this.draw();
  }

  updateHUD() {
    document.getElementById('score-val').textContent = String(this.score).padStart(6, '0');
    document.getElementById('level-val').textContent = String(this.level);
    document.getElementById('lines-val').textContent = String(this.lines);
  }

  start() {
    this.startOverlay.classList.add('hidden');
    this.gameoverOverlay.classList.add('hidden');
    this.reset();
    
    // Spawn initial piece
    this.spawnPiece();
    
    this.lastTime = performance.now();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.loop();
  }

  loop(timestamp = 0) {
    if (this.isGameOver || this.isPaused) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.dropCounter += deltaTime;
    if (this.dropCounter >= this.dropInterval) {
      this.drop();
    }
    
    this.updateParticles();
    this.draw();
    
    this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  updateParticles() {
    this.particles.forEach((p) => p.update());
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  spawnPiece() {
    this.currentPiece = {
      matrix: TETROMINOES[this.nextPieceType],
      type: this.nextPieceType,
      color: NEON_COLORS[this.nextPieceType],
      x: Math.floor((this.cols - TETROMINOES[this.nextPieceType][0].length) / 2),
      y: 0
    };
    
    this.nextPieceType = this.pullFromBag();
    this.hasHeld = false;
    
    // Check initial collision for GameOver
    if (this.checkCollision(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y)) {
      this.gameOver();
    }
    
    this.drawNext();
  }

  pullFromBag() {
    if (this.bag.length === 0) {
      this.bag = Object.keys(TETROMINOES);
      // Shuffle bag
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop();
  }

  hold() {
    if (this.hasHeld || this.isGameOver || this.isPaused) return;
    
    sfx.playRotate();
    const currentType = this.currentPiece.type;
    
    if (this.holdPiece === null) {
      this.holdPiece = currentType;
      this.spawnPiece();
    } else {
      const temp = this.holdPiece;
      this.holdPiece = currentType;
      this.currentPiece = {
        matrix: TETROMINOES[temp],
        type: temp,
        color: NEON_COLORS[temp],
        x: Math.floor((this.cols - TETROMINOES[temp][0].length) / 2),
        y: 0
      };
    }
    
    this.hasHeld = true;
    this.drawHold();
  }

  checkCollision(matrix, px, py) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const nextX = px + c;
          const nextY = py + r;
          
          if (nextX < 0 || nextX >= this.cols || nextY >= this.rows) {
            return true;
          }
          if (nextY >= 0 && this.grid[nextY][nextX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  move(dir) {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return;
    if (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x + dir, this.currentPiece.y)) {
      this.currentPiece.x += dir;
      sfx.playMove();
      this.draw();
    }
  }

  drop() {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return;
    this.dropCounter = 0;
    
    if (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
    } else {
      this.lockPiece();
    }
    this.draw();
  }

  softDrop() {
    this.drop();
    this.score += 1;
    this.updateHUD();
  }

  hardDrop() {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return;
    let drops = 0;
    while (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
      drops++;
    }
    sfx.playDrop();
    this.score += drops * 2;
    this.lockPiece();
    this.draw();
  }

  rotate() {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return;
    const matrix = this.currentPiece.matrix;
    const n = matrix.length;
    
    // Clone and rotate matrix clockwise
    const rotated = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        rotated[c][n - 1 - r] = matrix[r][c];
      }
    }
    
    // Simple Kick System
    const kicks = [0, -1, 1, -2, 2];
    for (let kick of kicks) {
      if (!this.checkCollision(rotated, this.currentPiece.x + kick, this.currentPiece.y)) {
        this.currentPiece.matrix = rotated;
        this.currentPiece.x += kick;
        sfx.playRotate();
        this.draw();
        return;
      }
    }
  }

  lockPiece() {
    const { matrix, x, y, color } = this.currentPiece;
    
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          // Lock visual layout
          if (y + r >= 0) {
            this.grid[y + r][x + c] = color;
          }
        }
      }
    }
    
    this.clearLines();
    this.spawnPiece();
  }

  clearLines() {
    let linesCleared = 0;
    
    for (let r = this.rows - 1; r >= 0; r--) {
      const isFull = this.grid[r].every(cell => cell !== null);
      if (isFull) {
        linesCleared++;
        
        // Spawn particle blast for each cleared block
        for (let c = 0; c < this.cols; c++) {
          const color = this.grid[r][c];
          const px = c * this.blockSize + this.blockSize / 2;
          const py = r * this.blockSize + this.blockSize / 2;
          for (let i = 0; i < 6; i++) {
            this.particles.push(new Particle(px, py, color));
          }
        }
        
        // Remove row
        this.grid.splice(r, 1);
        // Add empty row at top
        this.grid.unshift(Array(this.cols).fill(null));
        r++; // Adjust index since we modified grid
      }
    }
    
    if (linesCleared > 0) {
      sfx.playClear();
      this.lines += linesCleared;
      
      // Classic scoring system
      const baseScores = [0, 100, 300, 500, 800];
      this.score += baseScores[linesCleared] * this.level;
      
      // Increase level every 10 lines
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 90);
      
      this.updateHUD();
    }
  }

  gameOver() {
    this.isGameOver = true;
    sfx.playGameOver();
    
    document.getElementById('final-score').textContent = String(this.score).padStart(6, '0');
    this.gameoverOverlay.classList.remove('hidden');
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('tetris_high_score', this.highScore);
      this.updateHighScoreDisplay();
    }
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.pauseBtn.textContent = 'RESUME';
      this.pauseBtn.classList.add('btn-cyan');
    } else {
      this.pauseBtn.textContent = 'PAUSE';
      this.pauseBtn.classList.remove('btn-cyan');
      this.lastTime = performance.now();
      this.loop();
    }
  }

  // --- Rendering Functions ---
  draw() {
    this.ctx.clearRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);
    
    // Draw Grid Background lines subtly
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let c = 0; c <= this.cols; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * this.blockSize, 0);
      this.ctx.lineTo(c * this.blockSize, this.boardCanvas.height);
      this.ctx.stroke();
    }
    for (let r = 0; r <= this.rows; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * this.blockSize);
      this.ctx.lineTo(this.boardCanvas.width, r * this.blockSize);
      this.ctx.stroke();
    }
    
    // Draw locked Grid
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          this.drawBlock(this.ctx, c, r, this.grid[r][c]);
        }
      }
    }
    
    // Draw active falling Piece
    if (this.currentPiece) {
      const { matrix, x, y, color } = this.currentPiece;
      
      // Draw Ghost Piece first
      let ghostY = y;
      while (!this.checkCollision(matrix, x, ghostY + 1)) {
        ghostY++;
      }
      this.ctx.save();
      this.ctx.globalAlpha = 0.15;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            this.drawBlock(this.ctx, x + c, ghostY + r, color, true);
          }
        }
      }
      this.ctx.restore();
      
      // Draw actual piece
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            this.drawBlock(this.ctx, x + c, y + r, color);
          }
        }
      }
    }
    
    // Draw Particles
    this.particles.forEach((p) => p.draw(this.ctx));
  }

  drawBlock(ctx, x, y, color, isGhost = false) {
    const size = this.blockSize;
    const px = x * size;
    const py = y * size;
    
    ctx.save();
    
    if (isGhost) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 2, py + 2, size - 4, size - 4);
    } else {
      // Glow effect (neon cyberpunk style)
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      
      // Outer bright edge
      ctx.fillStyle = color;
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
      
      // Internal glass/dark core
      ctx.fillStyle = 'rgba(10, 11, 20, 0.75)';
      ctx.fillRect(px + 4, py + 4, size - 8, size - 8);
      
      // Little inner reflection dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(px + 5, py + 5, 3, 3);
    }
    
    ctx.restore();
  }

  drawPreview(ctx, canvas, pieceType) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!pieceType) return;
    
    const matrix = TETROMINOES[pieceType];
    const color = NEON_COLORS[pieceType];
    const size = 20; // smaller block size for panels
    
    const offset = (canvas.width - matrix[0].length * size) / 2;
    const offsetY = (canvas.height - matrix.length * size) / 2;
    
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.fillStyle = color;
          ctx.fillRect(offset + c * size + 1, offsetY + r * size + 1, size - 2, size - 2);
          
          ctx.fillStyle = 'rgba(10, 11, 20, 0.75)';
          ctx.fillRect(offset + c * size + 3, offsetY + r * size + 3, size - 6, size - 6);
          ctx.restore();
        }
      }
    }
  }

  drawNext() {
    this.drawPreview(this.nextCtx, this.nextCanvas, this.nextPieceType);
  }

  drawHold() {
    this.drawPreview(this.holdCtx, this.holdCanvas, this.holdPiece);
  }

  // --- Keyboard & Touch Listeners ---
  initControls() {
    // Keyboard listener
    window.addEventListener('keydown', (e) => {
      if (this.startOverlay.style.display !== 'none' && this.isGameOver === false && !this.currentPiece) {
        return; // wait for start button click
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          this.move(-1);
          break;
        case 'ArrowRight':
          this.move(1);
          break;
        case 'ArrowUp':
          this.rotate();
          break;
        case 'ArrowDown':
          this.softDrop();
          break;
        case ' ':
          e.preventDefault();
          this.hardDrop();
          break;
        case 'Shift':
        case 'c':
        case 'C':
          this.hold();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          this.togglePause();
          break;
      }
    });

    // Touch controls listeners (Mobile)
    const touchMap = {
      'touch-left': () => this.move(-1),
      'touch-right': () => this.move(1),
      'touch-rotate': () => this.rotate(),
      'touch-soft': () => this.softDrop(),
      'touch-hard': () => this.hardDrop(),
      'touch-hold': () => this.hold()
    };

    Object.entries(touchMap).forEach(([id, callback]) => {
      const btn = document.getElementById(id);
      if (btn) {
        // Prevent scrolling/zoom on double tap on mobile
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          callback();
        }, { passive: false });
      }
    });
  }
}

// Instantiate and start elements
window.addEventListener('DOMContentLoaded', () => {
  new TetrisGame();
});
