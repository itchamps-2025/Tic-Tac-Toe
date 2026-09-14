const cells = document.querySelectorAll(".cell");
const gameStatus = document.getElementById("gameStatus");
const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const playerXCard = document.getElementById("playerXCard");
const playerOCard = document.getElementById("playerOCard");
const playerOLabel = document.getElementById("playerOLabel");
const gameModeText = document.getElementById("gameModeText");
const footerText = document.getElementById("footerText");
const newRoundButton = document.getElementById("newRound");
const resetScoreButton = document.getElementById("resetScore");
const twoPlayerModeButton = document.getElementById("twoPlayerMode");
const computerModeButton = document.getElementById("computerMode");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let scoreX = 0;
let scoreO = 0;
let playWithComputer = false;
let computerThinking = false;

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    const index = Number(cell.dataset.index);

    if (playWithComputer && currentPlayer === "O") {
      return;
    }

    makeMove(index);
  });
});

twoPlayerModeButton.addEventListener("click", () => {
  if (!playWithComputer) {
    return;
  }

  playWithComputer = false;
  updateModeUI();
  startNewRound();
});

computerModeButton.addEventListener("click", () => {
  if (playWithComputer) {
    return;
  }

  playWithComputer = true;
  updateModeUI();
  startNewRound();
});

function makeMove(index) {
  if (!gameActive || computerThinking || board[index] !== "") {
    return;
  }

  board[index] = currentPlayer;
  updateBoard();

  const winningLine = checkWinner(board);

  if (winningLine) {
    endGame(winningLine);
    return;
  }

  if (board.every((cell) => cell !== "")) {
    gameStatus.textContent = "It's a Draw!";
    gameActive = false;
    updateBoard();
    updateActivePlayer();
    return;
  }

  switchPlayer();

  if (playWithComputer && currentPlayer === "O" && gameActive) {
    computerThinking = true;
    gameStatus.textContent = "Computer is Thinking...";
    updateBoard();
    updateActivePlayer();

    setTimeout(() => {
      computerMove();
      computerThinking = false;
    }, 450);
  }
}

function computerMove() {
  if (!gameActive || currentPlayer !== "O") {
    return;
  }

  const bestMove = getBestMove();

  if (bestMove === -1) {
    return;
  }

  board[bestMove] = "O";
  updateBoard();

  const winningLine = checkWinner(board);

  if (winningLine) {
    endGame(winningLine);
    return;
  }

  if (board.every((cell) => cell !== "")) {
    gameStatus.textContent = "It's a Draw!";
    gameActive = false;
    updateBoard();
    updateActivePlayer();
    return;
  }

  switchPlayer();
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i] !== "") {
      continue;
    }

    board[i] = "O";
    const score = minimax(board, 0, false);
    board[i] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
}

function minimax(position, depth, isMaximizing) {
  const result = checkWinner(position);

  if (result) {
    const winner = position[result[0]];

    if (winner === "O") {
      return 10 - depth;
    }

    return depth - 10;
  }

  if (position.every((cell) => cell !== "")) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let i = 0; i < position.length; i++) {
      if (position[i] !== "") {
        continue;
      }

      position[i] = "O";
      const score = minimax(position, depth + 1, false);
      position[i] = "";

      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (let i = 0; i < position.length; i++) {
    if (position[i] !== "") {
      continue;
    }

    position[i] = "X";
    const score = minimax(position, depth + 1, true);
    position[i] = "";

    bestScore = Math.min(bestScore, score);
  }

  return bestScore;
}

function updateBoard() {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.classList.remove("x", "o");

    if (board[index] === "X") {
      cell.classList.add("x");
    }

    if (board[index] === "O") {
      cell.classList.add("o");
    }

    const computerTurn =
      playWithComputer &&
      currentPlayer === "O" &&
      computerThinking;

    cell.disabled =
      board[index] !== "" ||
      !gameActive ||
      computerTurn;
  });
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (playWithComputer && currentPlayer === "O") {
    gameStatus.textContent = "Computer's Turn";
  } else {
    gameStatus.textContent = `Player ${currentPlayer}'s Turn`;
  }

  updateActivePlayer();
  updateBoard();
}

function updateActivePlayer() {
  playerXCard.classList.remove("active");
  playerOCard.classList.remove("active");

  if (!gameActive) {
    return;
  }

  if (currentPlayer === "X") {
    playerXCard.classList.add("active");
  } else {
    playerOCard.classList.add("active");
  }
}

function checkWinner(position = board) {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;

    if (
      position[a] !== "" &&
      position[a] === position[b] &&
      position[a] === position[c]
    ) {
      return combination;
    }
  }

  return null;
}

function endGame(winningLine) {
  gameActive = false;
  computerThinking = false;

  const boardElement = document.getElementById("board");
  boardElement.classList.remove("win-animation", "lose-animation");
  gameStatus.classList.remove("win-state", "lose-state");

  winningLine.forEach((index) => {
    cells[index].classList.add("winner");
  });

  if (currentPlayer === "X") {
    scoreX++;
    scoreXElement.textContent = String(scoreX);
    gameStatus.textContent = "Player X Wins!";
    gameStatus.classList.add("win-state");
    boardElement.classList.add("win-animation");
  } else {
    scoreO++;
    scoreOElement.textContent = String(scoreO);

    if (playWithComputer) {
      gameStatus.textContent = "Computer Wins!";
    } else {
      gameStatus.textContent = "Player O Wins!";
    }

    gameStatus.classList.add("lose-state");
    boardElement.classList.add("lose-animation");
  }

  updateBoard();
  updateActivePlayer();
}

newRoundButton.addEventListener("click", startNewRound);

function startNewRound() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  computerThinking = false;

  const boardElement = document.getElementById("board");
  boardElement.classList.remove("win-animation", "lose-animation");
  gameStatus.classList.remove("win-state", "lose-state");

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "winner");
    cell.disabled = false;
  });

  gameStatus.textContent = "Player X's Turn";
  updateActivePlayer();
  updateBoard();
}

resetScoreButton.addEventListener("click", resetScore);

function resetScore() {
  scoreX = 0;
  scoreO = 0;

  scoreXElement.textContent = "0";
  scoreOElement.textContent = "0";
  startNewRound();
}

function updateModeUI() {
  twoPlayerModeButton.classList.toggle("active", !playWithComputer);
  computerModeButton.classList.toggle("active", playWithComputer);

  if (playWithComputer) {
    gameModeText.textContent = "Player X vs Computer";
    playerOLabel.textContent = "COMPUTER";
    footerText.textContent = "You are X. The computer plays O.";
  } else {
    gameModeText.textContent = "Classic 2 Player Game";
    playerOLabel.textContent = "PLAYER O";
    footerText.textContent = "Get three symbols in a row to win.";
  }
}

updateModeUI();
startNewRound();
