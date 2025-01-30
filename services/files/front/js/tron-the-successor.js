const moves = ["KEEP_GOING", "LIGHT_RIGHT", "HEAVY_RIGHT", "NONE", "HEAVY_LEFT", "LIGHT_LEFT"];
const number_of_games = 4000;
let direction = 0;
let gameBoard = Array.from(Array(9), (_, i) => Array(i % 2 === 0 ? 16 : 15).fill(0));
let allAdjacent = [];
const memo = new Map();

async function setup(playersState) {
    direction = 0;
    gameBoard[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1] = 1;
    gameBoard[playersState.opponentPosition.row - 1][playersState.opponentPosition.column - 1] = 1;
    allAdjacent = getAllAdjacentForGrid();
    return true;
}

async function nextMove(playersState) {
    gameBoard[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1] = 1;
    gameBoard[playersState.opponentPosition.row - 1][playersState.opponentPosition.column - 1] = 1;
    const coord = determineNextBestMoveCalc(playersState);
    const move = (coord - direction + 6) % 6;
    console.log("current_direction: ", direction, "next_hex: ", coord, "move_to_hex: ", moves[move]);
    if (moves[move] === "NONE") {
        console.error("Wrong move");
        console.error("adjacent_hexagons: ", allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1]);
        return moves[0];
    }
    direction = coord;
    return moves[move];
}

function determineNextBestMove(playersState) {
    const possibleMoves = getPossibleMovesArray([playersState.playerPosition.column - 1, playersState.playerPosition.row - 1], gameBoard);
    const winRates = possibleMoves.map(move => simulateGames(playersState, move));
    const bestMoveIndex = winRates.indexOf(Math.max(...winRates));
    console.log("win_rates: ", winRates);
    return allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1]
        .indexOf(possibleMoves[bestMoveIndex]);
}

function determineNextBestMoveCalc(playersState) {
    const possibleMoves = getPossibleMovesArray([playersState.playerPosition.column - 1, playersState.playerPosition.row - 1], gameBoard);
    const opponentMove = [playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1];
    const winningMoves = possibleMoves.map(move => calculateGame(move, opponentMove));
    console.log("winning_moves: ", winningMoves);
    const bestMoveIndex = winningMoves.indexOf(Math.max(...winningMoves));
    return allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1]
        .indexOf(possibleMoves[bestMoveIndex]);
}

function calculateGame(playerMove, opponentMove) {
    let tempBoard = structuredClone(gameBoard);
    return exploreMove(playerMove, opponentMove, tempBoard);
}

function exploreMove(playerMove, opponentMove, tempBoard) {
    const key = JSON.stringify({playerMove, opponentMove, tempBoard});
    if (memo.has(key)) return memo.get(key);

    const possibleMoves = getPossibleMovesArray(playerMove, tempBoard);
    const opponentPossibleMoves = getPossibleMovesArray(opponentMove, tempBoard);

    if (possibleMoves.length === 0 && opponentPossibleMoves.length === 0) {
        memo.set(key, 0);
        return 0; // Draw
    }
    if (possibleMoves.length === 0) {
        memo.set(key, -1);
        return -1; // AI Loses
    }
    if (opponentPossibleMoves.length === 0) {
        memo.set(key, 1);
        return 1; // AI Wins
    }

    let result = -Infinity;
    for (const nextMove of possibleMoves) {
        for (const nextOpponentMove of opponentPossibleMoves) {
            tempBoard[nextMove[1]][nextMove[0]] = 1;
            tempBoard[nextOpponentMove[1]][nextOpponentMove[0]] = 1;

            const score = -exploreMove(nextOpponentMove, nextMove, tempBoard);

            tempBoard[nextMove[1]][nextMove[0]] = 0;
            tempBoard[nextOpponentMove[1]][nextOpponentMove[0]] = 0;

            result = Math.max(result, score);
        }
    }

    memo.set(key, result);
    return result;
}

function simulateGames(playersState, move) {
    const key = JSON.stringify({playersState, move});
    if (memo.has(key)) return memo.get(key);
    let wins = 0;
    for (let i = 0; i < number_of_games; i++) {
        if (simulateGame(playersState, move)) wins++;
    }
    const winRate = wins / number_of_games;
    memo.set(key, winRate);
    return winRate;
}

function simulateGame(playersState, move) {
    let tempBoard = structuredClone(gameBoard);
    let tempMove = move;
    let opponentMove = getPossibleMovesArray(
        [playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1], tempBoard)[0];
    for (let i = 0; i < 144; i++) {
        const possibleMoves = getPossibleMovesArray(tempMove, tempBoard);
        if (possibleMoves.length === 0) return false;
        tempMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        const opponentMoves = getPossibleMovesArray(opponentMove, tempBoard);
        if (opponentMoves.length === 0) return true;
        opponentMove = opponentMoves[Math.floor(Math.random() * opponentMoves.length)];

        tempBoard[tempMove[1]][tempMove[0]] = 1;
        tempBoard[opponentMove[1]][opponentMove[0]] = 1;
    }
    return false;
}

export {setup, nextMove}; // ES6
if (typeof exports !== 'undefined') { // CommonJS
    exports.setup = setup;
    exports.nextMove = nextMove;
}

function getPossibleMovesArray(playerPosition, board) {
    let adjacentHex = allAdjacent[playerPosition[1]][playerPosition[0]];
    return adjacentHex.filter(([x, y]) => board[y]?.length > x && x >= 0 && !board[y][x]);
}

function getAdjacent(x, y) {
    let adjacent = [];
    if (y % 2 === 0) {
        adjacent.push([x - 1, y]); // left
        adjacent.push([x - 1, y - 1]); // up_left
        adjacent.push([x, y - 1]); // up_right
        adjacent.push([x + 1, y]); // right
        adjacent.push([x, y + 1]); // down_right
        adjacent.push([x - 1, y + 1]); // down_left
    } else {
        adjacent.push([x - 1, y]); // left
        adjacent.push([x, y - 1]); // up_left
        adjacent.push([x + 1, y - 1]); // up_right
        adjacent.push([x + 1, y]); // right
        adjacent.push([x + 1, y + 1]); // down_right
        adjacent.push([x, y + 1]); // down_left
    }
    return adjacent;
}

function getAllAdjacentForGrid() {
    allAdjacent = Array.from(Array(9), (_, i) => Array(i % 2 === 0 ? 16 : 15).fill([]));
    for (let y = 0; y < gameBoard.length; y++)
        for (let x = 0; x < gameBoard[y].length; x++)
            allAdjacent[y][x] = getAdjacent(x, y);
    return allAdjacent;
}
