const {directionToAngle, Player} = require("./player.js");
const vm = require('vm');
const importFresh = require("import-fresh");

const actionToIndexDelta = {
    "KEEP_GOING": 0,
    "LIGHT_RIGHT": 1,
    "HEAVY_RIGHT": 2,
    "HEAVY_LEFT": -2,
    "LIGHT_LEFT": -1
}

exports.FlowBird = class FlowBird extends Player {
    constructor() {
        super("FlowBird");
    }

    async init(number, playerStates, game) {
        super.init(number, playerStates);
        const {setup, nextMove} = await importFresh('./tron-the-successor.js')
        await setup(this.#convertPlayerStates(playerStates));
        await this.#nextMove(nextMove, playerStates);
        game.addEventListener("game-turn", async () => {
            let c = game.getPlayerStates();
            await this.#nextMove(nextMove, c);
        });
    }

    async #nextMove(nextMove, playerStates) {
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
