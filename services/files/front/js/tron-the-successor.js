const moves = ["KEEP_GOING", "LIGHT_RIGHT", "HEAVY_RIGHT", "NONE", "HEAVY_LEFT", "LIGHT_LEFT"];
let direction;
let gameBoard;
let allAdjacent;
let memo;

function isValid(x, y) {
    return y >= 0 && y < 9 && x >= 0 && x < (y % 2 === 0 ? 16 : 15);
}

function get(list, x, y) {
    return list[y] >> x & 1;
}

function set(list, x, y, v) {
    list[y] = (list[y] & ~(1 << x)) | (v << x);
}

function toString(list) {
    return Array.from(list)
        .map(y => y.toString(2)
            .padStart(16, "0")
            .split("")
            .reverse()
            .join(" ")
        ).map((y, i) => i % 2 === 0 ? y : " " + y.substring(0, 29))
        .join("\n");
}

async function setup(playersState) {
    gameBoard = new Uint16Array(9);
    memo = new Map();
    allAdjacent = getAllAdjacentForGrid();

    set(gameBoard, playersState.playerPosition.column - 1, playersState.playerPosition.row - 1, 1);
    set(gameBoard, playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1, 1);
    direction = playersState.playerPosition.column === 1 ? 3 : 0;
    return true;
}

function determineNextHex(playersState) {
    const playerPosition = [playersState.playerPosition.column - 1, playersState.playerPosition.row - 1];
    const opponentPosition = [playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1];
    const possibleMoves = getPossibleMovesArray(playerPosition, gameBoard);
    const opponentMoves = getPossibleMovesArray(opponentPosition, gameBoard);
    let bestMove = -1;
    let bestScore = -Infinity;

    possibleMoves.forEach(move => {
        const tempBoard = structuredClone(gameBoard);
        set(tempBoard, move[0], move[1], 1);
        opponentMoves.forEach(opponentMove => {
            set(tempBoard, opponentMove[0], opponentMove[1], 1);
            let node = {
                board: tempBoard,
                playerPosition: move,
                opponentPosition: opponentMove
            }
            const score = minimax(node, 10, true);
            console.log("move: ", move, "opponent_move: ", opponentMove, "score: ", score);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });
    });
    console.log("best_score: ", bestScore);

    return allAdjacent[playerPosition[1]][playerPosition[0]].indexOf(bestMove);
}

function minimax(node, depth, maximizingPlayer, alpha = -Infinity, beta = Infinity) {
    const key = JSON.stringify({node, depth, maximizingPlayer});
    if (memo.has(key)) return memo.get(key);

    if (depth === 0 || getPossibleMovesArray(node.playerPosition, node.board).length === 0 || getPossibleMovesArray(node.opponentPosition, node.board).length === 0) {
        const evaluation = evaluateBoard(node);
        memo.set(key, evaluation);
        return evaluation;
    }

    let value = maximizingPlayer ? -Infinity : Infinity;
    const possibleMoves = maximizingPlayer
        ? getPossibleMovesArray(node.playerPosition, node.board)
        : getPossibleMovesArray(node.opponentPosition, node.board);

    for (const move of possibleMoves) {
        const tempBoard = structuredClone(node.board);
        set(tempBoard, move[0], move[1], 1);
        const newNode = {
            board: tempBoard,
            playerPosition: maximizingPlayer ? move : node.playerPosition,
            opponentPosition: maximizingPlayer ? node.opponentPosition : move
        };
        const evaluate = minimax(newNode, depth - 1, !maximizingPlayer, alpha, beta);
        value = maximizingPlayer ? Math.max(value, evaluate) : Math.min(value, evaluate);
        if (maximizingPlayer) alpha = Math.max(alpha, value);
        else beta = Math.min(beta, value);
        if (beta <= alpha) break;
    }

    memo.set(key, value);
    return value;
}

function evaluateBoard(node) {
    const playerMoves = getPossibleMovesArray(node.playerPosition, node.board).length;
    const opponentMoves = getPossibleMovesArray(node.opponentPosition, node.board).length;
    return playerMoves - opponentMoves;
}

async function nextMove(playersState) {
    set(gameBoard, playersState.playerPosition.column - 1, playersState.playerPosition.row - 1, 1);
    set(gameBoard, playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1, 1);
    const coord = determineNextHex(playersState);
    const move = (coord - direction + 6) % 6;
    console.log("current_direction: ", direction, "next_hex: ", coord, "move_to_hex: ", moves[move]);
    if (coord < 0 || moves[move] === "NONE") {
        console.error("Wrong move (coord:", coord, ", move:", move, ")");
        console.error("adjacent_hexagons: ", allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1]);
        return moves[0];
    }
    direction = coord;
    return moves[move];
}

export {setup, nextMove}; // ES6
if (typeof exports !== "undefined") { // CommonJS
    exports.setup = setup;
    exports.nextMove = nextMove;
}

function getPossibleMovesArray(playerPosition, board) {
    let adjacentHex = allAdjacent[playerPosition[1]][playerPosition[0]];
    return adjacentHex.filter(([x, y]) => isValid(x, y) && !get(board, x, y));
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
    for (let y = 0; y < 9; y++)
        for (let x = 0; x < 16; x++)
            allAdjacent[y][x] = getAdjacent(x, y);
    return allAdjacent;
}
