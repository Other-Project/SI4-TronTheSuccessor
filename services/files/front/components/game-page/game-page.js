import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";
import {fetchPostApi, getCookie} from "/js/login-manager.js";

export class GamePage extends HTMLComponent {
    level = 2;

    constructor() {
        super("help-page", ["html"]);
    }

    onVisible = () => {
        this.inGame = false;
        this.against = window.location.pathname.split("/")[this.level];
        if (!this.against) {
            changePage("/", true);
            return;
        }

        this.shadowRoot.innerHTML = "";
        const helpPage = document.createElement("app-help-page");
        helpPage.setAttribute("against", this.against);
        this.shadowRoot.appendChild(helpPage);

        document.addEventListener("keyup", this.#keyupHandler);
        document.addEventListener("touchend", this.#touchendHandler);
    };

    onHidden = async () => {
        this.inGame = false;
        if (this.against !== undefined && this.against !== "computer" && this.against !== "any-player" && this.against !== "local") {
            await fetchPostApi("/api/chat/game-invitation", {
                "gameInvitationToken": getCookie("gameInvitationToken"),
                status: "cancelled"
            }, {method: "PUT"});
        }
        document.removeEventListener("touchend", this.#touchendHandler);
        document.removeEventListener("keyup", this.#touchendHandler);
    };

    #keyupHandler = e => {
        if (e.code === "Space" && !this.inGame) this.startGame();
    };

    #touchendHandler = _ => {
        if (!this.inGame) this.startGame();
    };

    startGame() {
        this.inGame = true;
        this.shadowRoot.innerHTML = "";
        const gameMaster = document.createElement("app-game-master");
        gameMaster.setAttribute("against", this.against);
        this.shadowRoot.appendChild(gameMaster);
    }
}
