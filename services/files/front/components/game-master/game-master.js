import {Game} from "/js/game.js";
import {HumanPlayer} from "/js/human-player.js";
import {HTMLComponent} from "/js/component.js";
import {FlowBird} from "/js/flowbird.js";
import {directionToAngle, Player} from "/js/player.js";
import "/js/socket.io.js";
import {getAccessToken, getCookie, renewAccessToken} from "/js/login-manager.js";

export class GameMaster extends HTMLComponent {
    gridSize = [16, 9];
    against = "local";
    paused = false;
    socket;

    // noinspection JSUnusedGlobalSymbols
    static get observedAttributes() {
        return ["gridSize", "against"];
    }

    constructor() {
        super("game-master", ["html", "css"]);

        document.addEventListener("keyup", (event) => {
            if (event.code === "Escape" && this.against === "local" && this.checkVisibility()) {
                if (this.game.isPaused()) this.resume();
                else this.pause();
            }
        });
    }

    onSetupCompleted = () => {
        this.gameBoard = this.shadowRoot.getElementById("board");
        this.waitingWindow = this.shadowRoot.getElementById("waiting-panel");
        this.waitingWindow.style.display = "none";
        this.pauseWindow = this.shadowRoot.getElementById("pause-menu");
        this.pauseWindow.style.display = "none";

        this.pauseTitle = this.shadowRoot.getElementById("title");
        this.pauseTime = this.shadowRoot.getElementById("time");
        this.pauseDescription = this.shadowRoot.getElementById("description");

        this.resumeButton = this.shadowRoot.getElementById("resume");
        this.resumeButton.addEventListener("click", () => this.resume());
        this.shadowRoot.getElementById("restart").addEventListener("click", () => this.#launchGame());
        this.shadowRoot.getElementById("home").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "home"}));
        });
    };

    onVisible = () => this.#launchGame();
    onHidden = () => this.stopGame();

    #launchGame() {
        this.against === "local" ? this.newGame() : this.#gameWithServer().then();
    }

    newGame() {
        this.pauseWindow.style.display = "none";
        this.stopGame();
        const opponent = this.against === "computer" ? new FlowBird() : new HumanPlayer("Player 2");
        this.game = new Game(this.gridSize[0], this.gridSize[1], new HumanPlayer("Player 1"), opponent, 500);
        this.game.addEventListener("game-turn", (e) => {
            if (e.detail.ended) this.endScreen(e.detail);
            this.gameBoard.draw(this.game);
        });
        this.game.init();
        this.game.start();
        this.gameBoard.draw(this.game);
    }

    stopGame() {
        if (this.game) this.game.stop();
        this.game = undefined;
    }

    endScreen(details) {
        this.pauseWindow.style.display = "block";
        this.resumeButton.style.display = "none";
        this.pauseTitle.innerText = details.draw ? "Draw" : details.winner + " won";
        this.pauseTime.innerText = this.#timeToString(details.elapsed);
        this.pauseDescription.innerText = "";
    }

    pause() {
        const details = this.game.stop();
        if (!details) return;
        this.pauseWindow.style.display = "block";
        this.resumeButton.style.display = this.against === "local" ? "block" : "none";
        this.pauseTitle.innerText = "Pause";
        this.pauseTime.innerText = this.#timeToString(details.elapsed);
        this.pauseDescription.innerText = "";
    }

    #timeToString(time) {
        return `${String(Math.floor((time / 1000) / 60)).padStart(2, "0")}'${String(Math.floor((time / 1000) % 60)).padStart(2, "0")}"`;
    }

    resume() {
        this.pauseWindow.style.display = "none";
        this.game.resume();
    }

    async #gameWithServer(retry = true) {
        if (!getCookie("refreshToken")) {
            alert("You need to be logged in to play against the server");
            location.reload();
            return;
        }
        this.pauseWindow.style.display = "none";
        this.stopGame();

        this.socket = io("/api/game", {
            extraHeaders: {authorization: "Bearer " + await getAccessToken()},
            path: "/ws"
        });
        this.socket.on("connect_error", async (err) => {
            if (retry && err.message === "Authentication needed") {
                await renewAccessToken();
                this.#gameWithServer(false).then();
            } else console.error(err.message);
        });

        this.gameBoard.clear();
        this.waitingWindow.style.display = "block";
        this.socket.emit("game-start", {against: this.against});

        let reverse = false;
        this.socket.on("game-start", (msg) => {
            reverse = msg.yourNumber === 2;

            const msgPlayers = reverse ? msg.players.toReversed() : msg.players;
            const players = msgPlayers.map(player => new (player.number === msg.yourNumber ? HumanPlayer : Player)(player.name, player.color, player.avatar));
            this.game = new Game(this.gridSize[0], this.gridSize[1], players[0], players[1], 500);
            this.game.players.forEach((player, i) => player.init(i + 1, this.#playerStatesTransform(msg.playerStates, reverse)));
            this.#applyMessage(msg, reverse);
            this.waitingWindow.style.display = "none";
        });

        this.socket.on("game-turn", (msg) => {
            this.#applyMessage(msg, reverse);
        });

        this.socket.on("game-end", (msg) => {
            this.endScreen(msg);
            this.socket.disconnect();
        });

        document.addEventListener("player-direction", (event) => {
            const directions = Object.keys(directionToAngle);
            const direction = reverse ? directions[(directions.indexOf(event.detail.direction) + 3) % 6] : event.detail.direction;
            this.socket.emit("game-action", {direction});
        });

        this.socket.on("error", async (msg) => {
            if (msg.status === 401) {
                await renewAccessToken();
                this.#gameWithServer();
            } else console.error(msg);
        });
    }

    #applyMessage(msg, reverse = false) {
        this.game.grid = reverse ? msg.grid.toReversed().map(r => r.toReversed()) : msg.grid;
        this.game.setPlayerStates(this.#playerStatesTransform(msg.playerStates, reverse));
        this.gameBoard.draw(this.game);
        if (msg.ended) this.endScreen(msg);
    }

    #playerStatesTransform(playerStates, reverse = false) {
        if (!reverse) return playerStates;
        const directions = Object.keys(directionToAngle);
        return playerStates.toReversed().map(state => ({
            pos: [(state.pos[1] % 2 ? 14 : 15) - state.pos[0], 8 - state.pos[1]],
            direction: directions[(directions.indexOf(state.direction) + 3) % 6],
            dead: state.dead
        }));
    }
}
