import {Game} from "/js/game.js";
import {HumanPlayer} from "/js/human-player.js";
import {HTMLComponent} from "/js/component.js";
import {FlowBird} from "/js/flowbird.js";
import {Player} from "/js/player.js";
import "/js/socket.io.js";
import {getCookie, renewAccessToken} from "/js/login-manager.js";

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
        this.popupWindow = this.shadowRoot.getElementById("popup-container");

        this.popupTitle = this.shadowRoot.getElementById("title");
        this.popupTime = this.shadowRoot.getElementById("time");
        this.popupDescription = this.shadowRoot.getElementById("description");

        this.resumeButton = this.shadowRoot.getElementById("resume");
        this.resumeButton.addEventListener("click", () => this.resume());
        this.popupWindow.style.display = "none";
        this.shadowRoot.getElementById("restart").addEventListener("click", () => this.#launchGame());
        this.shadowRoot.getElementById("home").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "home"}));
        });
    };

    // noinspection JSUnusedGlobalSymbols
    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
    }

    onVisible = () => this.#launchGame();
    onHidden = () => this.stopGame();

    #launchGame() {
        this.against === "local" ? this.newGame() : this.#gameWithServer();
    }

    newGame() {
        this.popupWindow.style.display = "none";
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
        this.popupWindow.style.display = "block";
        this.resumeButton.style.display = "none";
        this.popupTitle.innerText = details.draw ? "Draw" : details.winner + " won";
        this.popupTime.innerText = this.#timeToString(details.elapsed);
        this.popupDescription.innerText = "";
    }

    pause() {
        const details = this.game.stop();
        if (!details) return;
        this.popupWindow.style.display = "block";
        this.resumeButton.style.display = this.against === "local" ? "block" : "none";
        this.popupTitle.innerText = "Pause";
        this.popupTime.innerText = this.#timeToString(details.elapsed);
        this.popupDescription.innerText = "";
    }

    #timeToString(time) {
        return `${String(Math.floor((time / 1000) / 60)).padStart(2, "0")}'${String(Math.floor((time / 1000) % 60)).padStart(2, "0")}"`;
    }

    resume() {
        this.popupWindow.style.display = "none";
        this.game.resume();
    }

    #gameWithServer() {
        if (!getCookie("refreshToken")) {
            alert("You need to be logged in to play against the server");
            location.reload();
            return;
        }
        this.popupWindow.style.display = "none";
        this.stopGame();

        let wsUrl = new URL('/', window.location.href);
        wsUrl.protocol = wsUrl.protocol.replace('http', 'ws');
        this.socket = io(wsUrl.href, {
            extraHeaders: {
                authorization: getCookie("accessToken")
            },
            path: "/api/game"
        });
        this.gameBoard.draw(new Game(this.gridSize[0], this.gridSize[1], null, null, 500));

        this.socket.emit("game-start", {
            playerName: "Player 1",
            against: this.against
        });

        this.socket.on("game-start", (msg) => {
            const players = msg.players.map(player => new (player.number === msg.yourNumber ? HumanPlayer : Player)(player.name, player.color, player.avatar));
            this.game = new Game(this.gridSize[0], this.gridSize[1], players[0], players[1], 500);
            this.game.players.forEach((player, i) => player.init(msg.players[i].number, msg.playerStates));
            this.game.grid = msg.grid;
            this.gameBoard.draw(this.game);
        });

        this.socket.on("game-turn", (msg) => {
            this.game.setPlayerStates(msg.playerStates);
            this.game.grid = msg.grid;
            this.gameBoard.draw(this.game);
            if (msg.ended) this.endScreen(msg);
        });

        this.socket.on("game-end", (msg) => {
            this.endScreen(msg);
            this.socket.disconnect();
        });

        document.addEventListener("player-direction", (event) => {
            this.socket.emit("game-action", {direction: event.detail.direction, number: event.detail.number});
        });

        this.socket.on("error", async (msg) => {
            if (msg.status === 401) {
                await renewAccessToken();
                this.#gameWithServer();
            } else console.error(msg);
        });
    }
}
