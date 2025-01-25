const moves = ["KEEP_GOING", "LIGHT_RIGHT", "HEAVY_RIGHT", "NONE", "HEAVY_LEFT", "LIGHT_LEFT"];
let direction = 0;
let gameBoard = Array.from(Array(9), (_, i) => Array(i % 2 === 0 ? 16 : 15).fill(0));
let allAdjacent = [];

export function setup(playersState) {
    direction = 0;
    gameBoard[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1] = 1;
    gameBoard[playersState.opponentPosition.row - 1][playersState.opponentPosition.column - 1] = 1;
    allAdjacent = getAllAdjacentForGrid();
    return Promise.resolve(true);
}

export function nextMove(playersState) {
    gameBoard[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1] = 1;
    gameBoard[playersState.opponentPosition.row - 1][playersState.opponentPosition.column - 1] = 1;
    const coord = determineNextMove(playersState);
    console.log(coord, direction);

    let move = 0;


    console.log(move);
    direction = coord;
    return Promise.resolve(moves[move]);
}

/**
 * @returns {number}
 */
function determineNextMove(playersState) {
    const possibleMoves = getPossibleMoves(playersState.playerPosition);
    console.log(possibleMoves);
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
        for (let y = 0; y < gameBoard.length; y++) {
            allAdjacent[y][x] = getAdjacent(x, y);
        }
    return allAdjacent;
}
