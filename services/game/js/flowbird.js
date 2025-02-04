const {directionToAngle, Player} = require("./player.js");
const {nextMove, setup} = require("./tron-the-successor.js");

const actionToIndexDelta = {
    "KEEP_GOING": 0,
    "LIGHT_RIGHT": 1,
    "HEAVY_RIGHT": 2,
    "HEAVY_LEFT": -2,
    "LIGHT_LEFT": -1
}

exports.FlowBird = class FlowBird extends Player {
    constructor() {
        super("FlowBird", 2);
    }

    setGame(game) {
        this.game = game;
        setup(this.#getPlayerState()).then(() => this.#nextMove());
        game.addEventListener("game-turn", async () => {
            if (!this.game.isGameEnded())
                await this.#nextMove();
        });
    }

    async #nextMove() {
        let action = await nextMove(this.#getPlayerState());
        const directionKeys = Object.keys(directionToAngle);
        let index = directionKeys.indexOf(this.direction)
        index += actionToIndexDelta[action];
        if (index < 0)
            index = directionKeys.length + index;
        index %= directionKeys.length;
        this.nextDirection = directionKeys[index];
    }

    #getPlayerState() {
        return {
            playerPosition: {row: this.pos[1] + 1, column: this.pos[0] + 1},
            opponentPosition: {row: this.game.players[0].pos[1] + 1, column: this.game.players[0].pos[0] + 1}
        };
    }
}
