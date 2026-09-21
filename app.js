const gameCards = [
  { id: 'snake', title: 'Snake', description: 'Classic grow-and-avoid challenge.' },
  { id: 'pong', title: 'Pong', description: 'Arcade racket duel against the bot.' },
  { id: 'breakout', title: 'Breakout', description: 'Smash every brick on the board.' },
  { id: 'tictactoe', title: 'Tic-Tac-Toe', description: 'Matrix duel with a smart AI.' },
  { id: 'memory', title: 'Memory Match', description: 'Flip tiles and find every pair.' },
  { id: 'tetris', title: 'Tetris', description: 'Stack blocks before the screen fills.' }
];

const gameTitle = document.getElementById('gameTitle');
const gameDescription = document.getElementById('gameDescription');
const gameGrid = document.getElementById('gameGrid');
const gameView = document.getElementById('gameView');
const fullscreenBtn = document.getElementById('fullscreenBtn');

let activeCleanup = null;
let activeGameId = null;

function renderGameGrid() {
  gameGrid.innerHTML = '';

  gameCards.forEach((game) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'game-card';
    button.innerHTML = `<strong>${game.title}</strong><span>${game.description}</span>`;
    button.addEventListener('click', () => showGame(game.id));
    gameGrid.appendChild(button);
  });
}

function setGameCardState(id) {
  const cards = document.querySelectorAll('.game-card');
  cards.forEach((card, idx) => {
    const isActive = gameCards[idx].id === id;
    card.classList.toggle('active', isActive);
  });
}

function showGame(id) {
  if (activeCleanup) activeCleanup();
  gameView.innerHTML = '';
  activeGameId = id;
  setGameCardState(id);

  const game = gameCards.find((item) => item.id === id);
  gameTitle.textContent = game.title;
  gameDescription.textContent = game.description;

  if (id === 'snake') startSnakeGame();
  if (id === 'pong') startPongGame();
  if (id === 'breakout') startBreakoutGame();
  if (id === 'tictactoe') startTicTacToeGame();
  if (id === 'memory') startMemoryGame();
  if (id === 'tetris') startTetrisGame();
}

function cleanupGame() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}

fullscreenBtn.addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.warn('Fullscreen unavailable:', error);
  }
});

function createHud(label, value) {
  const panel = document.createElement('div');
  panel.className = 'status-group';
  panel.innerHTML = `<span class="status-badge">${label}: <span>${value}</span></span>`;
  return panel;
}

function startSnakeGame() {
  const shell = document.createElement('div');
  shell.className = 'game-shell';

  const hud = document.createElement('div');
  hud.className = 'small-panel';

  const stats = document.createElement('div');
  stats.className = 'status-group';
  stats.innerHTML = '<span class="status-badge">Score: <span id="snake-score">0</span></span><span class="status-badge">Best: <span id="snake-best">0</span></span>';

  const restartBtn = document.createElement('button');
  restartBtn.type = 'button';
  restartBtn.className = 'action-btn';
  restartBtn.textContent = 'Restart';

  hud.appendChild(stats);
  hud.appendChild(restartBtn);

  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  const gridSize = 20;
  const tileCount = canvas.width / gridSize;
  let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let food = { x: 15, y: 10 };
  let score = 0;
  let best = Number(localStorage.getItem('snake-best') || 0);
  let loopId = null;
  let gameOver = false;

  function randomFood() {
    let x = Math.floor(Math.random() * tileCount);
    let y = Math.floor(Math.random() * tileCount);
    while (snake.some((seg) => seg.x === x && seg.y === y)) {
      x = Math.floor(Math.random() * tileCount);
      y = Math.floor(Math.random() * tileCount);
    }
    food = { x, y };
  }

  function updateScore() {
    document.getElementById('snake-score').textContent = String(score);
    document.getElementById('snake-best').textContent = String(best);
  }

  function update() {
    if (gameOver) return;
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
      gameOver = true;
      if (score > best) {
        best = score;
        localStorage.setItem('snake-best', String(best));
      }
      updateScore();
      return;
    }

    if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      gameOver = true;
      if (score > best) {
        best = score;
        localStorage.setItem('snake-best', String(best));
      }
      updateScore();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      randomFood();
      updateScore();
    } else {
      snake.pop();
    }
  }

  function draw() {
    ctx.fillStyle = '#050b16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < tileCount; i++) {
      for (let j = 0; j < tileCount; j++) {
        ctx.strokeStyle = 'rgba(126, 249, 255, 0.09)';
        ctx.strokeRect(i * gridSize, j * gridSize, gridSize, gridSize);
      }
    }

    ctx.fillStyle = '#ff5fd2';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#7ef9ff' : '#7cf7a3';
      ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.58)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 34px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 8);
      ctx.font = '22px Segoe UI';
      ctx.fillText('Press Restart', canvas.width / 2, canvas.height / 2 + 30);
    }
  }

  function tick() {
    update();
    draw();
  }

  function onKeyDown(event) {
    const map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }
    };

    if (!map[event.key]) return;
    const next = map[event.key];
    if (next.x === -direction.x && next.y === -direction.y) return;
    nextDirection = next;
  }

  restartBtn.addEventListener('click', () => {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    randomFood();
    updateScore();
  });

  activeCleanup = () => {
    window.removeEventListener('keydown', onKeyDown);
    clearInterval(loopId);
  };

  window.addEventListener('keydown', onKeyDown);
  randomFood();
  updateScore();
  draw();
  loopId = setInterval(tick, 120);

  shell.appendChild(hud);
  shell.appendChild(canvas);
  gameView.appendChild(shell);
}

function startPongGame() {
  const shell = document.createElement('div');
  shell.className = 'game-shell';

  const hud = document.createElement('div');
  hud.className = 'small-panel';
  hud.innerHTML = '<div class="status-group"><span class="status-badge">Player: <span id="pong-player">0</span></span><span class="status-badge">CPU: <span id="pong-cpu">0</span></span></div><button type="button" class="action-btn secondary" id="pong-reset">Reset</button>';

  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');

  const paddleHeight = 80;
  const paddleWidth = 12;
  const paddleSpeed = 5;

  let playerY = (canvas.height - paddleHeight) / 2;
  let cpuY = (canvas.height - paddleHeight) / 2;
  let ballX = canvas.width / 2;
  let ballY = canvas.height / 2;
  let ballVX = 4;
  let ballVY = 4;
  let playerScore = 0;
  let cpuScore = 0;
  let keyUp = false;
  let keyDown = false;
  let loopId = null;

  function updateScores() {
    document.getElementById('pong-player').textContent = String(playerScore);
    document.getElementById('pong-cpu').textContent = String(cpuScore);
  }

  function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVX = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 1.5);
    ballVY = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 1.2);
  }

  function update() {
    if (keyUp) playerY -= paddleSpeed;
    if (keyDown) playerY += paddleSpeed;
    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));

    const cpuTarget = ballY - (paddleHeight / 2);
    cpuY += (cpuTarget - cpuY) * 0.12;
    cpuY = Math.max(0, Math.min(canvas.height - paddleHeight, cpuY));

    ballX += ballVX;
    ballY += ballVY;

    if (ballY <= 0 || ballY >= canvas.height) {
      ballVY *= -1;
    }

    if (ballX <= 12 && ballY >= playerY && ballY <= playerY + paddleHeight) {
      ballX = 12;
      ballVX = Math.abs(ballVX) + 0.5;
      ballVY += (ballY - (playerY + paddleHeight / 2)) * 0.08;
      ballVX *= -1;
    }

    if (ballX + 8 >= canvas.width - 12 && ballY >= cpuY && ballY <= cpuY + paddleHeight) {
      ballX = canvas.width - 20;
      ballVX = -Math.abs(ballVX) - 0.5;
      ballVY += (ballY - (cpuY + paddleHeight / 2)) * 0.08;
    }

    if (ballX < 0) {
      cpuScore += 1;
      updateScores();
      resetBall();
    }

    if (ballX > canvas.width) {
      playerScore += 1;
      updateScores();
      resetBall();
    }
  }

  function draw() {
    ctx.fillStyle = '#050b16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.setLineDash([12, 10]);
    ctx.strokeStyle = 'rgba(126,249,255,0.45)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#7ef9ff';
    ctx.fillRect(0, playerY, paddleWidth, paddleHeight);
    ctx.fillStyle = '#ff5fd2';
    ctx.fillRect(canvas.width - paddleWidth, cpuY, paddleWidth, paddleHeight);

    ctx.fillStyle = '#ffd166';
    ctx.fillRect(ballX, ballY, 10, 10);
  }

  function tick() {
    update();
    draw();
  }

  function handleKey(event) {
    if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') keyUp = true;
    if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') keyDown = true;
  }

  function handleKeyUp(event) {
    if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') keyUp = false;
    if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') keyDown = false;
  }

  document.getElementById('pong-reset').addEventListener('click', () => {
    playerScore = 0;
    cpuScore = 0;
    updateScores();
    resetBall();
  });

  activeCleanup = () => {
    window.removeEventListener('keydown', handleKey);
    window.removeEventListener('keyup', handleKeyUp);
    clearInterval(loopId);
  };

  window.addEventListener('keydown', handleKey);
  window.addEventListener('keyup', handleKeyUp);
  updateScores();
  draw();
  loopId = setInterval(tick, 1000 / 60);

  shell.appendChild(hud);
  shell.appendChild(canvas);
  gameView.appendChild(shell);
}

function startBreakoutGame() {
  const shell = document.createElement('div');
  shell.className = 'game-shell';

  const hud = document.createElement('div');
  hud.className = 'small-panel';
  hud.innerHTML = '<div class="status-group"><span class="status-badge">Score: <span id="break-score">0</span></span><span class="status-badge">Lives: <span id="break-lives">3</span></span></div><button type="button" class="action-btn secondary" id="break-reset">Restart</button>';

  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  const paddle = { width: 110, height: 14, x: canvas.width / 2 - 55, y: canvas.height - 28 };
  let ball = { x: canvas.width / 2, y: canvas.height - 40, radius: 8, dx: 5, dy: -5 };
  let score = 0;
  let lives = 3;
  let bricks = [];
  let leftPressed = false;
  let rightPressed = false;
  let loopId = null;

  function buildBricks() {
    bricks = [];
    const rows = 5;
    const cols = 9;
    const width = 56;
    const height = 20;
    const padding = 8;
    const offsetTop = 50;
    const offsetLeft = 38;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        bricks.push({
          x: offsetLeft + col * (width + padding),
          y: offsetTop + row * (height + padding),
          width,
          height,
          alive: true
        });
      }
    }
  }

  function updateScores() {
    document.getElementById('break-score').textContent = String(score);
    document.getElementById('break-lives').textContent = String(lives);
  }

  function update() {
    if (leftPressed) paddle.x -= 8;
    if (rightPressed) paddle.x += 8;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) ball.dx *= -1;
    if (ball.y - ball.radius <= 0) ball.dy *= -1;

    if (ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height && ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
      const impact = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      ball.dx = impact * 6;
      ball.dy = -Math.abs(ball.dy);
    }

    for (const brick of bricks) {
      if (!brick.alive) continue;
      const hitX = ball.x > brick.x && ball.x < brick.x + brick.width;
      const hitY = ball.y > brick.y && ball.y < brick.y + brick.height;
      if (hitX && hitY) {
        brick.alive = false;
        ball.dy *= -1;
        score += 10;
        updateScores();
        break;
      }
    }

    if (ball.y - ball.radius > canvas.height) {
      lives -= 1;
      updateScores();
      if (lives <= 0) {
        alert('Game over!');
        restartGame();
        return;
      }
      ball = { x: canvas.width / 2, y: canvas.height - 40, radius: 8, dx: 5, dy: -5 };
    }

    if (bricks.every((brick) => !brick.alive)) {
      alert('You cleared the board!');
      restartGame();
      return;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#050b16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const brick of bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = '#7ef9ff';
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }

    ctx.fillStyle = '#ff5fd2';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function tick() {
    update();
    draw();
  }

  function restartGame() {
    score = 0;
    lives = 3;
    buildBricks();
    ball = { x: canvas.width / 2, y: canvas.height - 40, radius: 8, dx: 5, dy: -5 };
    paddle.x = canvas.width / 2 - 55;
    updateScores();
  }

  function handleKey(event) {
    if (event.key === 'ArrowLeft') leftPressed = true;
    if (event.key === 'ArrowRight') rightPressed = true;
  }

  function handleKeyUp(event) {
    if (event.key === 'ArrowLeft') leftPressed = false;
    if (event.key === 'ArrowRight') rightPressed = false;
  }

  document.getElementById('break-reset').addEventListener('click', restartGame);

  activeCleanup = () => {
    window.removeEventListener('keydown', handleKey);
    window.removeEventListener('keyup', handleKeyUp);
    clearInterval(loopId);
  };

  window.addEventListener('keydown', handleKey);
  window.addEventListener('keyup', handleKeyUp);
  buildBricks();
  updateScores();
  loopId = setInterval(tick, 1000 / 60);

  shell.appendChild(hud);
  shell.appendChild(canvas);
  gameView.appendChild(shell);
}

function startTicTacToeGame() {
  const shell = document.createElement('div');
  shell.className = 'game-shell';

  const hud = document.createElement('div');
  hud.className = 'small-panel';
  hud.innerHTML = '<div class="status-group"><span class="status-badge">Status: <span id="ttt-status">Your move</span></span></div><button type="button" class="action-btn secondary" id="ttt-reset">Reset</button>';

  const board = document.createElement('div');
  board.className = 'board';

  const cells = Array.from({ length: 9 }, () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cell';
    return button;
  });

  let currentPlayer = 'X';
  let boardState = Array(9).fill('');
  let gameOver = false;

  const winLines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function checkWinner(state) {
    for (const [a, b, c] of winLines) {
      if (state[a] && state[a] === state[b] && state[a] === state[c]) {
        return state[a];
      }
    }
    return null;
  }

  function setStatus(text) {
    document.getElementById('ttt-status').textContent = text;
  }

  function makeBotMove() {
    const emptyIndexes = boardState
      .map((value, index) => (value === '' ? index : null))
      .filter((value) => value !== null);

    if (!emptyIndexes.length || gameOver) return;

    const bestMove = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    boardState[bestMove] = 'O';
    cells[bestMove].textContent = 'O';
    const winner = checkWinner(boardState);

    if (winner) {
      setStatus(winner === 'X' ? 'You win!' : 'Bot wins!');
      gameOver = true;
      return;
    }

    if (boardState.every((slot) => slot !== '')) {
      setStatus('Draw game');
      gameOver = true;
      return;
    }

    currentPlayer = 'X';
    setStatus('Your move');
  }

  function handleCellClick(index) {
    if (gameOver || boardState[index] || currentPlayer !== 'X') return;

    boardState[index] = 'X';
    cells[index].textContent = 'X';

    const winner = checkWinner(boardState);
    if (winner) {
      setStatus('You win!');
      gameOver = true;
      return;
    }

    if (boardState.every((slot) => slot !== '')) {
      setStatus('Draw game');
      gameOver = true;
      return;
    }

    currentPlayer = 'O';
    setStatus('Bot is thinking...');
    setTimeout(makeBotMove, 250);
  }

  function reset() {
    boardState = Array(9).fill('');
    gameOver = false;
    currentPlayer = 'X';
    cells.forEach((cell) => {
      cell.textContent = '';
    });
    setStatus('Your move');
  }

  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
    board.appendChild(cell);
  });

  document.getElementById('ttt-reset').addEventListener('click', reset);

  shell.appendChild(hud);
  shell.appendChild(board);
  gameView.appendChild(shell);
}

function startMemoryGame() {
  const shell = document.createElement('div');
  shell.className = 'game-shell';

  const hud = document.createElement('div');
  hud.className = 'small-panel';
  hud.innerHTML = '<div class="status-group"><span class="status-badge">Moves: <span id="memory-moves">0</span></span><span class="status-badge">Matches: <span id="memory-matches">0/8</span></span></div><button type="button" class="action-btn secondary" id="memory-reset">Reset</button>';

  const grid = document.createElement('div');
  grid.className = 'memory-grid';

  const emojis = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍊', '🍍', '🍏'];
  let cards = [];
  let firstPick = null;
  let secondPick = null;
  let lockBoard = false;
  let moves = 0;
  let matched = 0;

  function shuffle(array) {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  }

  function updateHud() {
    document.getElementById('memory-moves').textContent = String(moves);
    document.getElementById('memory-matches').textContent = `${matched}/8`;
  }

  function revealCard(card) {
    card.classList.add('revealed');
    card.textContent = card.dataset.value;
  }

  function hideCard(card) {
    card.classList.remove('revealed');
    card.textContent = '';
  }

  function resetBoard() {
    cards = shuffle([...emojis, ...emojis]).map((emoji) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'memory-card';
      button.dataset.value = emoji;
      button.textContent = '';
      button.addEventListener('click', () => handleCardClick(button));
      return button;
    });

    grid.innerHTML = '';
    cards.forEach((card) => grid.appendChild(card));
    firstPick = null;
    secondPick = null;
    lockBoard = false;
    moves = 0;
    matched = 0;
    updateHud();
  }

  function handleCardClick(card) {
    if (lockBoard || card.classList.contains('matched') || card.classList.contains('revealed')) return;

    revealCard(card);

    if (!firstPick) {
      firstPick = card;
      return;
    }

    secondPick = card;
    moves += 1;
    updateHud();

    if (firstPick.dataset.value === secondPick.dataset.value) {
      firstPick.classList.add('matched');
      secondPick.classList.add('matched');
      matched += 1;
      updateHud();
      firstPick = null;
      secondPick = null;
      if (matched === 8) {
        setTimeout(() => alert('You matched all cards!'), 200);
      }
      return;
    }

    lockBoard = true;
    setTimeout(() => {
      hideCard(firstPick);
      hideCard(secondPick);
      firstPick = null;
      secondPick = null;
      lockBoard = false;
    }, 700);
  }

  document.getElementById('memory-reset').addEventListener('click', resetBoard);

  shell.appendChild(hud);
  shell.appendChild(grid);
  gameView.appendChild(shell);
  resetBoard();
}

function startTetrisGame() {
  const shell = document.createElement('div');
  shell.className = 'game-shell';

  const hud = document.createElement('div');
  hud.className = 'small-panel';
  hud.innerHTML = '<div class="status-group"><span class="status-badge">Score: <span id="tetris-score">0</span></span><span class="status-badge">Lines: <span id="tetris-lines">0</span></span></div><button type="button" class="action-btn secondary" id="tetris-reset">Restart</button>';

  const wrap = document.createElement('div');
  wrap.className = 'tetris-wrap';

  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  const block = 20;
  const cols = canvas.width / block;
  const rows = canvas.height / block;

  const colors = ['#7ef9ff', '#ff5fd2', '#7cf7a3', '#ffd166', '#a78bfa', '#f87171'];
  let board = Array.from({ length: rows }, () => Array(cols).fill(null));
  let score = 0;
  let lines = 0;
  let currentPiece = null;
  let loopId = null;

  const shapes = {
    I: [[1,1,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]],
    O: [[1,1],[1,1]],
    S: [[0,1,1],[1,1,0]],
    T: [[0,1,0],[1,1,1]],
    Z: [[1,1,0],[0,1,1]]
  };

  function randomPiece() {
    const keys = Object.keys(shapes);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const matrix = shapes[key].map((row) => [...row]);
    currentPiece = {
      type: key,
      color: colors[Math.floor(Math.random() * colors.length)],
      matrix,
      x: Math.floor(cols / 2) - Math.ceil(matrix[0].length / 2),
      y: 0
    };
  }

  function collides(piece, offsetX = 0, offsetY = 0, testMatrix = piece.matrix) {
    for (let y = 0; y < testMatrix.length; y++) {
      for (let x = 0; x < testMatrix[y].length; x++) {
        if (!testMatrix[y][x]) continue;
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;

        if (newX < 0 || newX >= cols || newY >= rows) return true;
        if (newY >= 0 && board[newY][newX]) return true;
      }
    }
    return false;
  }

  function mergePiece() {
    currentPiece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) return;
        const placedX = currentPiece.x + x;
        const placedY = currentPiece.y + y;
        if (placedY >= 0) board[placedY][placedX] = currentPiece.color;
      });
    });
  }

  function clearLines() {
    let cleared = 0;
    for (let y = rows - 1; y >= 0; y--) {
      if (board[y].every(Boolean)) {
        board.splice(y, 1);
        board.unshift(Array(cols).fill(null));
        cleared += 1;
        y += 1;
      }
    }
    if (cleared > 0) {
      score += cleared * 100;
      lines += cleared;
      updateHud();
    }
  }

  function updateHud() {
    document.getElementById('tetris-score').textContent = String(score);
    document.getElementById('tetris-lines').textContent = String(lines);
  }

  function rotateMatrix(matrix) {
    return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
  }

  function rotatePiece() {
    if (!currentPiece) return;
    const rotated = rotateMatrix(currentPiece.matrix);
    if (!collides(currentPiece, 0, 0, rotated)) {
      currentPiece.matrix = rotated;
    }
  }

  function tick() {
    if (!currentPiece) {
      randomPiece();
    }

    if (!collides(currentPiece, 0, 1)) {
      currentPiece.y += 1;
    } else {
      mergePiece();
      clearLines();
      randomPiece();
      if (collides(currentPiece, 0, 0)) {
        alert('Game over!');
        restartGame();
      }
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = '#050b16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (board[y][x]) {
          ctx.fillStyle = board[y][x];
          ctx.fillRect(x * block, y * block, block, block);
        }
      }
    }

    if (currentPiece) {
      currentPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (!value) return;
          ctx.fillStyle = currentPiece.color;
          ctx.fillRect((currentPiece.x + x) * block, (currentPiece.y + y) * block, block, block);
        });
      });
    }
  }

  function restartGame() {
    board = Array.from({ length: rows }, () => Array(cols).fill(null));
    score = 0;
    lines = 0;
    updateHud();
    randomPiece();
    draw();
  }

  function handleKey(event) {
    if (!currentPiece) return;
    if (event.key === 'ArrowLeft' && !collides(currentPiece, -1, 0)) currentPiece.x -= 1;
    if (event.key === 'ArrowRight' && !collides(currentPiece, 1, 0)) currentPiece.x += 1;
    if (event.key === 'ArrowDown' && !collides(currentPiece, 0, 1)) currentPiece.y += 1;
    if (event.key === 'ArrowUp') rotatePiece();
    draw();
  }

  document.getElementById('tetris-reset').addEventListener('click', restartGame);

  activeCleanup = () => {
    window.removeEventListener('keydown', handleKey);
    clearInterval(loopId);
  };

  window.addEventListener('keydown', handleKey);
  randomPiece();
  updateHud();
  loopId = setInterval(tick, 500);

  wrap.appendChild(canvas);
  shell.appendChild(hud);
  shell.appendChild(wrap);
  gameView.appendChild(shell);
}

renderGameGrid();
showGame('snake');
