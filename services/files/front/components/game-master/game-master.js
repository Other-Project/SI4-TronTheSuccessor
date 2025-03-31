import {emotes, Game} from "/js/game.js";
import {HumanPlayer} from "/js/human-player.js";
import {HTMLComponent} from "/js/component.js";
import {FlowBird} from "/js/flowbird.js";
import {directionToAngle, Player} from "/js/player.js";
import "/js/socket.io.js";
import {getAccessToken, getCookie, getUserInfo, renewAccessToken} from "/js/login-manager.js";
import {changePage} from "/components/pages/pages.js";

export class GameMaster extends HTMLComponent {
    gridSize = [16, 9];
    /** @type {"local"|"computer"|string} */ against = "local";
    paused = false;
    socket;

    static get observedAttributes() {
        return ["gridSize", "against"];
    }

    constructor() {
        super("game-master", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.container = this.shadowRoot.querySelector(".container");

        this.gameBoard = this.shadowRoot.getElementById("board");
        this.waitingWindow = this.shadowRoot.getElementById("waiting-panel");
        this.waitingWindow.style.display = "none";
        this.pauseWindow = this.shadowRoot.getElementById("pause-menu");
        this.pauseWindow.style.display = "none";
        this.matchIntro = this.shadowRoot.getElementById("match-intro");
        this.matchIntro.style.display = "none";

        this.pauseTitle = this.shadowRoot.getElementById("title");
        this.pauseTime = this.shadowRoot.getElementById("time");
        this.pauseDescription = this.shadowRoot.getElementById("description");

        this.resumeButton = this.shadowRoot.getElementById("resume");
        this.resumeButton.addEventListener("click", () => this.resume());
        this.shadowRoot.getElementById("restart").addEventListener("click", () => this.#launchGame());
        this.shadowRoot.getElementById("home").addEventListener("click", () => changePage("/"));

        this.playersName = [this.shadowRoot.getElementById("p1"), this.shadowRoot.getElementById("p2")];

        this.timerDisplay = this.shadowRoot.getElementById("timer");

        this.emoteDisplayContainer = this.shadowRoot.getElementById("emote-display");
        this.emoteSender = this.shadowRoot.getElementById("emote-sender");
        this.emoteImg = this.shadowRoot.getElementById("emote-img");

        this.shadowRoot.getElementById("emote-list").addEventListener("emote", e => this.#sendEmote(e.detail.emote));
    };

    onVisible = () => {
        this.#launchGame();
        document.addEventListener("keyup", this.#keyReleased);
        document.addEventListener("keypress", this.#keyPressed);
    }
    onHidden = () => {
        document.removeEventListener("keypress", this.#keyPressed);
        document.removeEventListener("keyup", this.#keyReleased);
        this.stopGame();
    }

    #launchGame() {
        this.container.style.visibility = "hidden";
        this.emoteDisplayContainer.innerHTML = "";
        this.container.classList.toggle("online-multiplayer", this.against !== "local" && this.against !== "computer");
        this.against === "local" ? this.newGame().then() : this.#gameWithServer().then();
    }

    async newGame() {
        this.pauseWindow.style.display = "none";
        this.container.style.visibility = "visible";
        this.stopGame();

        const username = getUserInfo()?.username;
        let selectedInventory;
        if (username) selectedInventory = await fetch(`/api/inventory/${username}`).then(res => res.json());
        else {
            const response = await fetch("/api/inventory").then(res => res.json());
            selectedInventory = Object.fromEntries(Object.entries(response).map(([key, value]) => [key, value[0]]));
        }

        const player = new HumanPlayer("Player 1", selectedInventory.firstChoiceColors, selectedInventory.spaceships.id);
        const opponent = this.against === "computer"
            ? new FlowBird(selectedInventory.secondChoiceColors, selectedInventory.spaceships.id)
            : new HumanPlayer("Player 2", selectedInventory.secondChoiceColors, selectedInventory.spaceships.id);
        this.game = new Game(this.gridSize[0], this.gridSize[1], player, opponent, 500);
        this.game.addEventListener("game-turn", (e) => {
            this.gameBoard.draw(this.game);
            if (e.detail.ended) this.endScreen(e.detail);
        });
        this.game.init();
        this.matchIntro.removeAttribute("opponent");
        this.matchIntro.style.display = "block";
        setTimeout(() => {
            this.matchIntro.style.display = "none";
            this.game.start();
            this.#startTimer();
        }, 3500);
        this.gameBoard.draw(this.game);
    }

    stopGame() {
        if (this.game) {
            this.game.players.forEach(player => player.removeEventListener("player-direction", this.#sendPlayerDirection));
            this.game.stop();
        }
        this.game = undefined;
        if (this.socket) this.socket.disconnect();
        this.socket = undefined;
        clearInterval(this.timer);
    }

    endScreen(details) {
        this.stopGame();

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
        clearInterval(this.timer);
    }

    #timeToString(time) {
        return `${String(Math.floor((time / 1000) / 60)).padStart(2, "0")}'${String(Math.floor((time / 1000) % 60)).padStart(2, "0")}"`;
    }

    resume() {
        this.pauseWindow.style.display = "none";
        this.#startTimer();
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
        this.socket.emit("game-join", {against: this.against});

        this.socket.on("game-info", (msg) => {
            const reverse = msg.yourNumber === 2;

            const msgPlayers = reverse ? msg.players.toReversed() : msg.players;
            const players = msgPlayers.map(player => new (player.number === msg.yourNumber ? HumanPlayer : Player)(player.name, player.color, player.avatar));
            this.game = new Game(this.gridSize[0], this.gridSize[1], players[0], players[1], 500);
            this.game.reversed = reverse;
            this.#startTimer();
            this.game.players.forEach((player, i) => {
                player.addEventListener("player-direction", this.#sendPlayerDirection);
                this.playersName[i].innerText = player.name;
                player.init(i + 1, this.game.playerStatesTransform(msg.playerStates, this.game.reversed));
            });
            this.#applyMessage(msg, this.game.reversed);

            this.waitingWindow.style.display = "none";
            this.container.style.visibility = "visible";
            this.matchIntro.setAttribute("opponent", players[1].name);
            this.matchIntro.style.display = "block";
            setTimeout(() => this.socket.emit("game-ready"), 3500);
        });

        this.socket.on("game-start", (msg) => {
            this.matchIntro.style.display = "none";
            this.game.startTime = msg.startTime;
        });

        this.socket.on("game-turn", (msg) => this.#applyMessage(msg, this.game.reversed));

        this.socket.on("game-end", (msg) => this.endScreen(msg));

        this.socket.on("emote", (msg) => {
            const emoteDisplay = document.createElement("app-game-emote-display");
            emoteDisplay.setAttribute("player", msg.player);
            emoteDisplay.setAttribute("emote", msg.emote);
            this.emoteDisplayContainer.appendChild(emoteDisplay);
        });
    }

    #applyMessage(msg, reverse = false) {
        if (!this.game) {
            console.warn("Game not initialized");
            this.socket.disconnect();
            return;
        }
        this.game.grid = reverse ? msg.grid.toReversed().map(r => r.toReversed()) : msg.grid;
        this.game.setPlayerStates(msg.playerStates, reverse);
        this.gameBoard.draw(this.game);
        if (msg.ended) this.endScreen(msg);
    }

    #sendEmote(emote) {
        if (!this.socket || this.against === "computer") return;
        this.socket.emit("emote", {emote: emote});
    }

    #startTimer() {
        this.timerDisplay.innerText = "00'00\"";
        this.timer = setInterval(() => {
            const elapsed = Math.max(this.game?.startTime ? Date.now() - this.game.startTime : 0, 0);
            const minutes = String(Math.floor((elapsed / 1000) / 60)).padStart(2, "0");
            const seconds = String(Math.floor((elapsed / 1000) % 60)).padStart(2, "0");
            this.timerDisplay.innerText = `${minutes}'${seconds}"`;
        }, 250);
    }

    #keyReleased = (e) => {
        if (e.code === "Escape" && this.against === "local") {
            e.preventDefault();
            if (this.game.isPaused()) this.resume();
            else this.pause();
        }
    }

    #keyPressed = (e) => {
        let emote = /^Digit(\d)$/.exec(e.code)?.[1];
        if (!emote) return;
        e.preventDefault();
        if (emote === "0") emote = "10";
        if (emotes[emote - 1]) this.#sendEmote(emotes[emote - 1]);
    };

    #sendPlayerDirection = (event) => {
        if (!this.socket || !this.game) return;
        const directions = Object.keys(directionToAngle);
        const direction = this.game.reversed ? directions[(directions.indexOf(event.detail.direction) + 3) % 6] : event.detail.direction;
        this.socket.emit("game-action", {direction});
    };
}
