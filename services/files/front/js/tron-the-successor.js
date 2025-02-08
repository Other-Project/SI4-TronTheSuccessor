const moves = ["KEEP_GOING", "LIGHT_RIGHT", "HEAVY_RIGHT", "NONE", "HEAVY_LEFT", "LIGHT_LEFT"];
let direction;
let gameBoard;
let allAdjacent;
let memo;
let gameBoardSplit;

// Utils

function isValid(x, y) {
    return y >= 0 && y < 9 && x >= 0 && x < (y % 2 === 0 ? 16 : 15);
}

function get(list, x, y) {
    return list[y] >> x & 1;
}

function set(list, x, y, v) {
    list[y] = (list[y] & ~(1 << x)) | (v << x);
}

function toPrettyString(list) {
    return Array.from(list)
        .map(y => y.toString(2)
            .padStart(16, "0")
            .split("")
            .reverse()
            .join(" ")
        ).map((y, i) => i % 2 === 0 ? y : " " + y.substring(0, 29))
        .join("\n");
}

// Exports

async function setup(playersState) {
    gameBoard = new Uint16Array(9);
    memo = new Map();
    gameBoardSplit = false;
    allAdjacent = getAllAdjacentForGrid();

    set(gameBoard, playersState.playerPosition.column - 1, playersState.playerPosition.row - 1, 1);
    set(gameBoard, playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1, 1);
    direction = playersState.playerPosition.column === 1 ? 3 : 0;
    return true;
}

function determineNextHex(playersState) {
    const playerPosition = [playersState.playerPosition.column - 1, playersState.playerPosition.row - 1];
    const opponentPosition = [playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1];
    const playerMoves = getPossibleMovesArray(playerPosition, gameBoard);

    let bestMove = -1;
    let bestScore = -Infinity;

    playerMoves.forEach(playerMove => {
        const newBoard = gameBoard.slice();
        set(newBoard, playerMove[0], playerMove[1], 1);

        const playerDistances = calculateDistances(playerMove, newBoard);
        const opponentDistances = calculateDistances(opponentPosition, newBoard);
        const {playerReachable, opponentReachable} = determineReachableTiles(playerDistances, opponentDistances);

        let score;
        if (isBoardSplitted(playersState)) {
            console.log("Board is splitted, using flood fill to count reachable tiles");
            score = floodFillCount(playerMove, newBoard); // Use flood fill to count reachable tiles
        } else {
            score = playerReachable - opponentReachable;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMove = playerMove;
        }
    });
    console.log("score: ", bestScore);
    return allAdjacent[playerPosition[1]][playerPosition[0]].indexOf(bestMove);
}

function floodFillCount(startPosition, board) {
    const visited = new Set();
    const stack = [startPosition];
    let count = 0;
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;
        if (!visited.has(key) && isValid(x, y) && !get(board, x, y)) {
            visited.add(key);
            count++;
            for (const [nx, ny] of getAdjacent(x, y)) {
                stack.push([nx, ny]);
            }
        }
    }
    return count;
}

function isBoardSplit(playersState) {
    if (gameBoardSplit) return true;
    // TODO: Implement a way to check if the board is split
    return false;
}

function determineReachableTiles(playerDistances, opponentDistances) {
    let playerReachable = 0;
    let opponentReachable = 0;
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 16; x++) {
            if (playerDistances[y][x] < opponentDistances[y][x]) {
                playerReachable++;
            } else if (opponentDistances[y][x] < playerDistances[y][x]) {
                opponentReachable++;
            }
        }
    }
    return {playerReachable, opponentReachable};
}

function calculateDistances(startPosition, board) {
    const distances = Array.from({length: 9}, () => Array(16).fill(Infinity));
    const queue = [[startPosition[0], startPosition[1], 0]]; // [x, y, distance]
    distances[startPosition[1]][startPosition[0]] = 0;

    while (queue.length > 0) {
        const [x, y, dist] = queue.shift();
        for (const [nx, ny] of getAdjacent(x, y)) {
            if (isValid(nx, ny) && !get(board, nx, ny) && dist + 1 < distances[ny][nx]) {
                distances[ny][nx] = dist + 1;
                queue.push([nx, ny, dist + 1]);
            }
        }
    }

    return distances;
}

async function nextMove(playersState) {
    set(gameBoard, playersState.playerPosition.column - 1, playersState.playerPosition.row - 1, 1);
    set(gameBoard, playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1, 1);
    let coord = determineNextHex(playersState);
    if (coord < 0) {
        console.warn("Decision making didn't return a move, falling back to any non-killing move");
        // Do any non-killing move
        const nonKillingMove = getPossibleMovesArray([playersState.playerPosition.column - 1, playersState.playerPosition.row - 1], gameBoard)[0];
        if (!nonKillingMove) coord = -1; // The player is doomed, we just fall back to KEEP_GOING
        else coord = allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1].indexOf(nonKillingMove);
    }

    const move = (coord - direction + 6) % 6;
    console.log("current_direction: ", direction, "next_hex: ", coord, "move_to_hex: ", moves[move]);
    if (coord < 0 || moves[move] === "NONE") {
        console.warn("Wrong move (coord:", coord, ", move:", move, ")");
        console.warn("adjacent_hexagons: ", allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1]);
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
