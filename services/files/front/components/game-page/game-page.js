import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";

export class GamePage extends HTMLComponent {
    level = 2;

    constructor() {
        super("help-page", ["html"]);
        document.addEventListener("keyup", async (event) => {
            if (event.code === "Space" && !this.inGame) this.startGame();
        });
        document.addEventListener("touchend", () => this.startGame());
        window.addEventListener("popstate", this.onVisible);

    }

    onVisible = () => {
        this.inGame = false;
        this.against = location.pathname.split("/")[this.level];
        if (!this.against) {
            changePage("/");
            return;
        }

        this.shadowRoot.innerHTML = "";
        const helpPage = document.createElement("app-help-page");
        helpPage.setAttribute("against", this.against);
        this.shadowRoot.appendChild(helpPage);
    }

    onHidden = () => this.inGame = false;

    startGame() {
        this.inGame = true;
        this.shadowRoot.innerHTML = "";
        const gameMaster = document.createElement("app-game-master");
        gameMaster.setAttribute("against", this.against);
        this.shadowRoot.appendChild(gameMaster);
    }
}
