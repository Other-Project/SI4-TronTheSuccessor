let gameState = {};

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

    if (myCol < 16 && oppCol > myCol) {
        return "KEEP_GOING";
    } else if (myRow > oppRow) {
        return "HEAVY_LEFT";
    } else if (myRow < oppRow) {
        return "HEAVY_RIGHT";
    } else {
        return "LIGHT_LEFT";
    }
}
