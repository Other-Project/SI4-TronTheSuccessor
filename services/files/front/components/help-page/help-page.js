import {HTMLComponent} from "/js/component.js";
import {getUserInfo} from "/js/login-manager.js";

export class HelpPage extends HTMLComponent {
    against = "local";

    static get observedAttributes() {
        return ["against"];
    }

    constructor() {
        super("help-page", ["html"]);
    }

    onSetupCompleted = () => {
        this.controls = this.shadowRoot.getElementById("controls");
        this.controls1 = this.controls.querySelector("[owner=\"1\"]");
        this.controls2 = this.controls.querySelector("[owner=\"2\"]");
    }

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh().then();
    }

    async #refresh() {
        if (!this.controls) return;
        const username = getUserInfo()?.username;
        let selectedInventory;
        if (username) selectedInventory = await fetch(`/api/inventory/${username}`).then(res => res.json());
        else {
            const response = await fetch("/api/inventory").then(res => res.json());
            selectedInventory = Object.fromEntries(Object.entries(response).map(([key, value]) => [key, value[0]]));
        }

        this.controls1.setAttribute("color", JSON.stringify(selectedInventory.firstChoiceColors));
        this.controls1.setAttribute("spaceship", selectedInventory.spaceships.id);
        this.controls2.setAttribute("color", JSON.stringify(selectedInventory.secondChoiceColors));
        this.controls2.setAttribute("spaceship", selectedInventory.spaceships.id);
        this.controls2.style.display = this.against === "local" ? "block" : "none";
    }
}
