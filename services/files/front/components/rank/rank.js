import {HTMLComponent} from "/js/component.js";

export class Rank extends HTMLComponent {
    rank;

    static get observedAttributes() {
        return ["rank"];
    }

    constructor() {
        super("rank", ["css"]);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    onSetupCompleted = () => {
        this.rankDiv = document.createElement("div");
        this.rankDiv.classList.add(this.rank);
        this.shadowRoot.replaceChildren(this.rankDiv);
        this.#refresh();
    }

    #refresh() {
        if (!this.rankDiv) return;
        this.rankDiv.className = this.rank;
    }
}
