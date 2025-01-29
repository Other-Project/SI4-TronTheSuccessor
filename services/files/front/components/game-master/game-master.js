import {Game} from "/js/game.js";
import {HumanPlayer, player1_keys} from "/js/human-player.js";
import {HTMLComponent} from "/js/component.js";
import {FlowBird} from "/js/flowbird.js";
import "/js/socket.io.js"

export class GameMaster extends HTMLComponent {
    gridSize = [16, 9];
    against = "local";
    paused = false;
    socket;
    #keypressed;

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

    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
    }

    onVisible = () => this.#launchGame();
    onHidden = () => this.stopGame();

    #launchGame() {
        (this.against === "computer" ? this.#gameWithServer() : this.newGame())
    }

    newGame() {
        this.popupWindow.style.display = "none";
        this.stopGame();
        const opponent = this.against === "computer" ? new FlowBird() : new HumanPlayer("Player 2", 2);
        this.game = new Game(this.gridSize[0], this.gridSize[1], new HumanPlayer("Player 1", 1), opponent, 500);
        if (opponent.setGame) opponent.setGame(this.game);
        this.game.addEventListener("game-turn", (e) => {
            if (e.detail.ended) this.endScreen(e.detail);
            this.gameBoard.draw(this.game);
        });
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
        this.popupWindow.style.display = "none";
        this.socket = io('http://localhost:8003');
        this.socket.emit("game-start");

        this.game = new Game(this.gridSize[0], this.gridSize[1], new HumanPlayer("Player 1", 1), new FlowBird(), 500);

        this.socket.on('game-turn', (msg) => {
            this.game.players[0].pos = msg.player1Pos;
            this.game.players[0].direction = msg.player1Direction;
            this.game.players[0].dead = msg.player1Dead;
            this.game.players[1].pos = msg.player2Pos;
            this.game.players[1].direction = msg.player2Direction;
            this.game.players[1].dead = msg.player2Dead;
            this.game.grid = msg.grid;
            this.gameBoard.draw(this.game);
        });

        this.socket.on('game-end', (msg) => {
            this.endScreen(msg);
        });

        this.#keypressed = new Set();
        document.addEventListener("keydown", e => {
            this.#keypressed.add(e.key.toUpperCase());
            let direction = Object.entries(player1_keys)
                .find(([_, keyComp]) => keyComp.every(k => Array.from(this.#keypressed).some(value => value.includes(k.toUpperCase()))));
            if (direction) this.socket.emit("game-action", {direction: direction[0]});
        });
        document.addEventListener("keyup", e => {
            this.#keypressed.delete(e.key.toUpperCase());
        });
    }
}
