const moves = ["KEEP_GOING", "LIGHT_RIGHT", "HEAVY_RIGHT", "NONE", "HEAVY_LEFT", "LIGHT_LEFT"];
const number_of_games = 5000;
const memo = new Map();
let direction = 0;
let gameBoard = Array.from(Array(9), (_, i) => Array(i % 2 === 0 ? 16 : 15).fill(0));
let allAdjacent = [];


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
    const coord = determineNextBestMove(playersState);
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
    const possibleMoves = getPossibleMoves(playersState.playerPosition);
    const winRates = possibleMoves.map(move => simulateGames(playersState, move));
    const bestMoveIndex = winRates.indexOf(Math.max(...winRates));
    console.log("win_rates: ", winRates);
    return allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1]
        .indexOf(possibleMoves[bestMoveIndex]);
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
    let tempPosition = [playersState.playerPosition.row - 1, playersState.playerPosition.column - 1];
    let opponentPosition = [playersState.opponentPosition.row - 1, playersState.opponentPosition.column - 1];
    let tempDirection = move;
    let opponentDirection = getPossibleMoves(playersState.opponentPosition)[0];

    for (let i = 0; i < 144; i++) {
        tempPosition = tempDirection;
        if (!tempBoard[tempPosition[1]] || tempBoard[tempPosition[1]][tempPosition[0]] !== 0) return false;
        tempBoard[tempPosition[1]][tempPosition[0]] = 1;

        opponentPosition = opponentDirection;
        if (!tempBoard[opponentPosition[1]] || tempBoard[opponentPosition[1]][opponentPosition[0]] !== 0) return true;
        tempBoard[opponentPosition[1]][opponentPosition[0]] = 2;
        const possibleMoves = getPossibleMoves({
            row: tempPosition[1] + 1,
            column: tempPosition[0] + 1
        });
        tempDirection = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        const opponentMoves = getPossibleMoves({
            row: opponentPosition[1] + 1,
            column: opponentPosition[0] + 1
        });
        opponentDirection = opponentMoves[Math.floor(Math.random() * opponentMoves.length)];
    }
    return false;
}

export {setup, nextMove}; // ES6
if (typeof exports !== 'undefined') { // CommonJS
    exports.setup = setup;
    exports.nextMove = nextMove;
}

/**
 * @returns {number}
 */
function determineNextMove(playersState) {
    const possibleMoves = getPossibleMoves(playersState.playerPosition);
    return allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1]
        .indexOf(possibleMoves[Math.floor(Math.random() * possibleMoves.length)]);
}

function getPossibleMoves(playerPosition) {
    let adjacentHex = allAdjacent[playerPosition.row - 1][playerPosition.column - 1];
    return adjacentHex.filter(([x, y]) => gameBoard[y]?.length > x && !gameBoard[y][x]);
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
    for (let x = 0; x < gameBoard[0].length; x++)
        for (let y = 0; y < gameBoard.length; y++)
            allAdjacent[y][x] = getAdjacent(x, y);
    return allAdjacent;
}
