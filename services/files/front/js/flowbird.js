import {directionToAngle, Player} from "/js/player.js";
import {nextMove, setup} from "/js/tron-the-successor.js";

const actionToIndexDelta = {
    "KEEP_GOING": 0,
    "LIGHT_RIGHT": 1,
    "HEAVY_RIGHT": 2,
    "HEAVY_LEFT": -2,
    "LIGHT_LEFT": -1
}

export class FlowBird extends Player {
    constructor() {
        super("FlowBird", 2);
    }

    setGame(game) {
        this.game = game;
        setup(this.#getPlayerState()).then(() => this.#nextMove());
        game.addEventListener("game-turn", async () => {
            await this.#nextMove();
        });
    }

    async #nextMove() {
        let action = await nextMove(this.#getPlayerState());
        const directionKeys = Object.keys(directionToAngle);
        console.log(action);
        let index = directionKeys.indexOf(this.direction)
        index += actionToIndexDelta[action];
        if (index < 0)
            index = directionKeys.length + index;
        index %= directionKeys.length;
        console.log(directionKeys[index]);
        this.nextDirection = directionKeys[index];
    }

    #getPlayerState() {
        return {
            playerPosition: {row: this.pos[1] + 1, column: this.pos[0] + 1},
            opponentPosition: {row: this.game.players[0].pos[1] + 1, column: this.game.players[0].pos[0] + 1}
        };
    }
}
