import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";
import {fetchPostApi, getCookie} from "/js/login-manager.js";

export class GamePage extends HTMLComponent {
    level = 2;

    constructor() {
        super("help-page", ["html"]);
        document.addEventListener("keyup", async (event) => {
            if (event.code === "Space" && !this.inGame) this.startGame();
        });
        document.addEventListener("touchend", () => {
            if (!this.inGame) this.startGame();
        });
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
    };

    onHidden = async () => {
        this.inGame = false;
        if (this.against !== undefined && this.against !== "computer" && this.against !== "any-player" && this.against !== "local") {
            await fetchPostApi("/api/chat/game-invitation", {
                "gameInvitationToken": getCookie("gameInvitationToken"),
                status: "cancelled"
            }, {method: "PUT"});
        }
    };

    startGame() {
        this.inGame = true;
        this.shadowRoot.innerHTML = "";
        const gameMaster = document.createElement("app-game-master");
        gameMaster.setAttribute("against", this.against);
        this.shadowRoot.appendChild(gameMaster);
    }
}
