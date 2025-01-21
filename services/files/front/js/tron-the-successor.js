const moves = ["KEEP_GOING", "LIGHT_RIGHT", "HEAVY_RIGHT", "HEAVY_LEFT", "LIGHT_LEFT"];
let direction = "KEEP_GOING";
let gameBoard = Array.from(Array(9), (_, i) => Array(i % 2 === 0 ? 16 : 15).fill(0));


export function setup(playersState) {
    direction = "KEEP_GOING";
    gameBoard[playersState.playerPosition.row][playersState.playerPosition.column] = 1;
    gameBoard[playersState.opponentPosition.row][playersState.opponentPosition.column] = 1;
    console.log(gameBoard);
    return Promise.resolve(true);
}

export function nextMove(playersState) {
    gameBoard[playersState.playerPosition.row][playersState.playerPosition.column] = 1;
    gameBoard[playersState.opponentPosition.row][playersState.opponentPosition.column] = 1;
    console.log(gameBoard);
    const move = determineNextMove(playersState);
    direction = move;
    return Promise.resolve(move);
}

function determineNextMove(playersState) {
    const {playerPosition, opponentPosition} = playersState;

    const {row: myRow, column: myCol} = playerPosition;
    const {row: oppRow, column: oppCol} = opponentPosition;

    return moves[Math.floor(Math.random() * moves.length)];
}

function getPossibleDirection() {
    return null;
}
