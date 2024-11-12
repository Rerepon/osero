document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const jankenDiv = document.getElementById('janken');
    const gooImg = document.getElementById('goo');
    const chokiImg = document.getElementById('choki');
    const paImg = document.getElementById('pa');
    const startGameButton = document.getElementById('start-game');
    const resetGameButton = document.getElementById('reset-game');
    const resultDisplay = document.getElementById('result');
    const colorSelect = document.getElementById('color-select');
    const boardSize = 8;
    let board, currentPlayer, playerColor, computerColor, gameEnded;

    colorSelect.addEventListener('change', () => {
        const selectedColor = colorSelect.value;
        if (selectedColor) {
            gooImg.style.pointerEvents = 'auto';
            chokiImg.style.pointerEvents = 'auto';
            paImg.style.pointerEvents = 'auto';
            startGameButton.style.display = 'block';
        } else {
            gooImg.style.pointerEvents = 'none';
            chokiImg.style.pointerEvents = 'none';
            paImg.style.pointerEvents = 'none';
            startGameButton.style.display = 'none';
        }
    });

    gooImg.addEventListener('click', () => startGame(0));
    chokiImg.addEventListener('click', () => startGame(1));
    paImg.addEventListener('click', () => startGame(2));

    function initGame() {
        board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
        currentPlayer = null; // じゃんけんで決めるため初期化
        gameEnded = false;

        // 初期配置
        board[3][3] = 'white';
        board[3][4] = 'black';
        board[4][3] = 'black';
        board[4][4] = 'white';

        renderBoard();
        resultDisplay.textContent = '';
        jankenDiv.style.display = 'block';
        startGameButton.style.display = 'none';

        // 色が選択されるまでじゃんけんを無効にする
        gooImg.style.pointerEvents = 'none';
        chokiImg.style.pointerEvents = 'none';
        paImg.style.pointerEvents = 'none';
    }

    function renderBoard() {
        gameBoard.innerHTML = '';
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if (board[row][col] === 'white') {
                    cell.classList.add('white');
                } else if (board[row][col] === 'black') {
                    cell.classList.add('black');
                }
                cell.addEventListener('click', () => placePiece(row, col));
                gameBoard.appendChild(cell);
            }
        }
    }

    function startGame(playerChoice) {
        playerColor = colorSelect.value;
        computerColor = playerColor === 'black' ? 'white' : 'black';
        currentPlayer = 'black'; // 黒が先攻と仮定
        resultDisplay.textContent = '';

        let player2Choice = Math.floor(Math.random() * 3);
        let result = determineWinner(playerChoice, player2Choice);
        
        if (result === 1) {
            currentPlayer = playerColor;
            resultDisplay.textContent = `あなたの勝ち！${playerColor === 'black' ? '黒' : '白'}が先攻です。`;
        } else if (result === -1) {
            currentPlayer = computerColor;
            resultDisplay.textContent = `あなたの負け...${computerColor === 'black' ? '黒' : '白'}が先攻です。`;
            setTimeout(computerMove, 500); // コンピューターが先攻の場合、すぐに動く
        } else {
            resultDisplay.textContent = "引き分け！もう一度試してください。";
            return;
        }

        jankenDiv.style.display = 'none';
        startGameButton.style.display = 'none'; // ゲーム開始ボタンを消す
        renderBoard();
    }

    function determineWinner(player1, player2) {
        if (player1 === player2) return 0; // 引き分け
        if ((player1 === 0 && player2 === 1) || (player1 === 1 && player2 === 2) || (player1 === 2 && player2 === 0)) return 1; // プレイヤー1の勝ち
        return -1; // プレイヤー2の勝ち
    }

    function placePiece(row, col) {
        if (gameEnded || !isValidMove(row, col, currentPlayer)) return;

        board[row][col] = currentPlayer;
        flipPieces(row, col, currentPlayer);
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';

        renderBoard();
        checkWinner();

        if (!gameEnded && !hasValidMove(currentPlayer)) {
            currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
            if (!hasValidMove(currentPlayer)) {
                checkWinner(true); // 両プレイヤーが駒を置けない場合
            }
        }

        if (currentPlayer === computerColor && !gameEnded) {
            setTimeout(computerMove, 500);
        }
    }

    function isValidMove(row, col, player) {
        if (board[row][col] !== null) return false;

        let opponent = player === 'black' ? 'white' : 'black';
        let directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0], 
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        for (let [dx, dy] of directions) {
            let x = row + dx;
            let y = col + dy;
            let hasOpponentPiece = false;

            while (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
                if (board[x][y] === opponent) {
                    hasOpponentPiece = true;
                } else if (board[x][y] === player && hasOpponentPiece) {
                    return true;
                } else {
                    break;
                }
                x += dx;
                y += dy;
            }
        }
        return false;
    }

    function hasValidMove(player) {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (isValidMove(row, col, player)) {
                    return true;
                }
            }
        }
        return false;
    }

    function flipPieces(row, col, player) {
        let opponent = player === 'black' ? 'white' : 'black';
        let directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0], 
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        for (let [dx, dy] of directions) {
            let x = row + dx;
            let y = col + dy;
            let piecesToFlip = [];

            while (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
                if (board[x][y] === opponent) {
                    piecesToFlip.push([x, y]);
                } else if (board[x][y] === player) {
                    for (let [fx, fy] of piecesToFlip) {
                        board[fx][fy] = player;
                    }
                    break;
                } else {
                    break;
                }
                x += dx;
                y += dy;
            }
        }
    }

    function computerMove() {
        let validMoves = [];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (isValidMove(row, col, computerColor)) {
                    validMoves.push([row, col]);
                }
            }
        }
        if (validMoves.length > 0) {
            let [row, col] = validMoves[Math.floor(Math.random() * validMoves.length)];
            placePiece(row, col);
        }
    }

    function checkWinner(forceEnd = false) {
        let blackCount = 0;
        let whiteCount = 0;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 'black') blackCount++;
                if (board[row][col] === 'white') whiteCount++;
            }
        }

        if (forceEnd || blackCount + whiteCount === boardSize * boardSize || blackCount === 0 || whiteCount === 0) {
            gameEnded = true;
            if (blackCount > whiteCount) {
                resultDisplay.textContent = 'おめでとうございます！黒の勝ちです！';
            } else if (whiteCount > blackCount) {
                resultDisplay.textContent = 'おめでとうございます！白の勝ちです！';
            } else {
                resultDisplay.textContent = '引き分けです。';
            }
        }
    }

    // イベントリスナーの設定
    resetGameButton.addEventListener('click', initGame);

    initGame();
});
