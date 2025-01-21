let gameState = {};
const moves = ["KEEP_GOING", "LIGHT_RIGHT", "HEAVY_RIGHT", "HEAVY_LEFT", "LIGHT_LEFT"];

export function setup(playersState) {
    gameState = {
        turn: 0,
        lastMove: null,
    };
    return Promise.resolve(true);
}

export function nextMove(playersState) {
    gameState.turn++;
    const move = determineNextMove(playersState);
    gameState.lastMove = move;
    return Promise.resolve(move);
}

function determineNextMove(playersState) {
    const {playerPosition, opponentPosition} = playersState;

    const {row: myRow, column: myCol} = playerPosition;
    const {row: oppRow, column: oppCol} = opponentPosition;

    return moves[Math.floor(Math.random() * moves.length)];
}
