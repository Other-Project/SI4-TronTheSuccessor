import {HTMLComponent} from "/js/component.js";
import {fetchApi, getUserInfo} from "/js/login-manager.js";

export class HelpPage extends HTMLComponent {
    against = "local";

    static get observedAttributes() {
        return ["against"];
    }

    constructor() {
        super("help-page", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.controls = this.shadowRoot.getElementById("controls");
        this.controls1 = this.controls.querySelector("[owner=\"1\"]");
        this.controls2 = this.controls.querySelector("[owner=\"2\"]");

        this.rankPopUp = this.shadowRoot.getElementById("rank-popup");
        this.displayAgain = this.shadowRoot.getElementById("display-again");
        this.close = this.shadowRoot.getElementById("close");

        this.rankPopUp.style.display = "none";
        if (localStorage.getItem("rank-popup")) this.displayAgain.checked = true;
        this.shadowRoot.addEventListener("hide-popup", () => this.#close());
        this.close.addEventListener("click", () => this.#close());

    };

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh().then();
    }

    async #refresh() {
        if (!this.controls) return;
        const username = getUserInfo()?.username;
        let selectedInventory;
        if (username) selectedInventory = await fetchApi(`/api/inventory/${username}`, undefined, false).then(res => res.json());
        else {
            const response = await fetchApi("/api/inventory", undefined, false).then(res => res.json());
            selectedInventory = Object.fromEntries(Object.entries(response).map(([key, value]) => [key, value[0]]));
        }

        this.controls1.setAttribute("color", JSON.stringify(selectedInventory.firstChoiceColors));
        this.controls1.setAttribute("spaceship", selectedInventory.spaceships.id);
        this.controls2.setAttribute("color", JSON.stringify(selectedInventory.secondChoiceColors));
        this.controls2.setAttribute("spaceship", selectedInventory.spaceships.id);
        this.controls2.style.display = this.against === "local" ? "block" : "none";
        if (this.against === "any-player" && !localStorage.getItem("rank-popup")) this.rankPopUp.style.display = "block";
    }

    #close() {
        this.rankPopUp.style.display = "none";
        if (this.displayAgain.checked) localStorage.setItem("rank-popup", "false");
    }
}
