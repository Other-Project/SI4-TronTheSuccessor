import {directionToAngle, Player} from "/js/player.js";
import {nextMove} from "/js/tron-the-successor.js";

const actionToAngleDelta = {
    "KEEP_GOING": 0,
    "LIGHT_RIGHT": 45,
    "HEAVY_RIGHT": 90,
    "HEAVY_LEFT": -90,
    "LIGHT_LEFT": -45
}

export class FlowBird extends Player {
    constructor() {
        super("FlowBird", 2);
    }

    setGame(game) {
        game.addEventListener("game-turn", async () => {
            let playersState = {
                playerPosition: {row: this.pos[1] + 1, column: this.pos[0] + 1},
                opponentPosition: {row: game.players[0].pos[1] + 1, column: game.players[0].pos[0] + 1}
            }
            let action = await nextMove(playersState);
            let angle = directionToAngle[this.direction];
            angle += actionToAngleDelta[action];
            if (angle < 0)
                angle = 360 - angle;
            angle %= 360;
            this.nextDirection = Object.entries(directionToAngle).find(([_, a]) => a === angle)[0];
        });
    }
}
