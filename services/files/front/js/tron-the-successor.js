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
    let bestMove = -1;
    let bestScore = -Infinity;

    const orderedMoves = orderMoves(possibleMoves, opponentPosition, gameBoard, true);

    for (const move of orderedMoves) {
        set(gameBoard, move[0], move[1], 1);
        const opponentMoves = getPossibleMovesArray(opponentPosition, gameBoard);
        const orderedOpponentMoves = orderMoves(opponentMoves, move, gameBoard, false);
        for (const opponentMove of orderedOpponentMoves) {
            set(gameBoard, opponentMove[0], opponentMove[1], 1);
            const boardCopy = new Uint16Array(gameBoard);
            const node = {
                board: boardCopy,
                playerPosition: move,
                opponentPosition: opponentMove
            };
            const score = minimax(node, 15, true, -Infinity, Infinity);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            set(gameBoard, opponentMove[0], opponentMove[1], 0);
        }
        set(gameBoard, move[0], move[1], 0);
    }
    console.log("score: ", bestScore);
    return allAdjacent[playerPosition[1]][playerPosition[0]].indexOf(bestMove);
}

function orderMoves(moves, position, board, isMaximizing) {
    return moves.sort((a, b) => {
        const scoreA = quickEvaluate(a, position);
        const scoreB = quickEvaluate(b, position);
        return isMaximizing ? scoreB - scoreA : scoreA - scoreB;
    });
}

function quickEvaluate(move, position) {
    const centerScore = -(Math.abs(move[0] - 8) + Math.abs(move[1] - 4));
    const distToOpponent = Math.abs(move[0] - position[0]) + Math.abs(move[1] - position[1]);
    return centerScore - distToOpponent;
}

function minimax(node, depth, maximizingPlayer, alpha, beta) {
    const key = `${node.playerPosition.join(',')}|${node.opponentPosition.join(',')}|${depth}|${maximizingPlayer}`;
    if (memo.has(key)) return memo.get(key);

    const playerMoves = getPossibleMovesArray(node.playerPosition, node.board);
    const opponentMoves = getPossibleMovesArray(node.opponentPosition, node.board);

    if (depth === 0 || playerMoves.length === 0 || opponentMoves.length === 0) {
        const evaluation = evaluateBoard(node);
        memo.set(key, evaluation);
        return evaluation;
    }

    let value = maximizingPlayer ? -Infinity : Infinity;
    const moves = maximizingPlayer ? playerMoves : opponentMoves;
    const position = maximizingPlayer ? node.opponentPosition : node.playerPosition;

    const orderedMoves = orderMoves(moves, position, node.board, maximizingPlayer);

    for (const move of orderedMoves) {
        set(node.board, move[0], move[1], 1);
        const nextMoves = maximizingPlayer ? opponentMoves : playerMoves;

        for (const nextMove of nextMoves) {
            set(node.board, nextMove[0], nextMove[1], 1);
            const childNode = {
                board: node.board,
                playerPosition: maximizingPlayer ? move : nextMove,
                opponentPosition: maximizingPlayer ? nextMove : move
            };

            const score = minimax(childNode, depth - 1, !maximizingPlayer, alpha, beta);
            value = maximizingPlayer ? Math.max(value, score) : Math.min(value, score);

            set(node.board, nextMove[0], nextMove[1], 0);

            if (maximizingPlayer) alpha = Math.max(alpha, value);
            else beta = Math.min(beta, value);
            if (beta <= alpha) {
                set(node.board, move[0], move[1], 0);
                memo.set(key, value);
                return value;
            }
        }
        set(node.board, move[0], move[1], 0);
    }
    memo.set(key, value);
    return value;
}

function getArea(playerPosition, board) {
    const visited = new Uint8Array(144);
    let area = 0;
    const stack = [playerPosition];

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const index = y * 16 + x;
        if (!isValid(x, y) || visited[index] || get(board, x, y)) continue;
        visited[index] = 1;
        area++;
        for (const [nx, ny] of allAdjacent[y][x])
            stack.push([nx, ny]);
    }
    return area;
}

function evaluateBoard(node) {
    const playerArea = getArea(node.playerPosition, node.board);
    const opponentArea = getArea(node.opponentPosition, node.board);
    return playerArea - opponentArea;
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

//export {setup, nextMove}; // ES6
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
