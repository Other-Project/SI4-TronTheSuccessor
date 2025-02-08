import {directionToAngle, Player} from "/js/player.js";
import {nextMove, setup} from "/js/tron-the-successor.js";

const actionToIndexDelta = {
    "KEEP_GOING": 0,
    "LIGHT_RIGHT": 1,
    "HEAVY_RIGHT": 2,
    "HEAVY_LEFT": -2,
    "LIGHT_LEFT": -1
};

export class FlowBird extends Player {
    constructor() {
        super("FlowBird");
    }

    init(number, playerStates, game) {
        super.init(number, playerStates);
        setup(this.#convertPlayerStates(playerStates)).then(() => this.#nextMove(playerStates));
        game.addEventListener("game-turn", async () => {
            let c = game.getPlayerStates();
            await this.#nextMove(c);
        });
    }

    async #nextMove(playerStates) {
        let action = await nextMove(this.#convertPlayerStates(playerStates));
        const directionKeys = Object.keys(directionToAngle);
        let index = directionKeys.indexOf(this.direction);
        index += actionToIndexDelta[action];
        if (index < 0)
            index = directionKeys.length + index;
        index %= directionKeys.length;
        this.nextDirection = directionKeys[index];
    }

    #convertPlayerStates(playerStates) {
        return {
            playerPosition: this.#convertPlayerState(playerStates[this.number - 1]),
            opponentPosition: this.#convertPlayerState(playerStates[playerStates.length - this.number])
        };
    }

    #convertPlayerState(playerState) {
        return {row: playerState.pos[1] + 1, column: playerState.pos[0] + 1};
    }
}
