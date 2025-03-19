import {HTMLComponent} from "/js/component.js";

export class Pages extends HTMLComponent {
    constructor() {
        super("pages", ["html"]);
        document.addEventListener("menu-selection", (event) => {
            if (event.detail && typeof event.detail === "object") this.#showElement(event.detail.name, event.detail.attr);
            else this.#showElement(event.detail);
        });

        window.addEventListener("hashchange", () => {
            this.#showElement(this.#readHash() ?? "home");
        });
    }

    onVisible = () => {
        this.#showElement(this.#readHash() ?? "home");
    };

    #readHash() {
        const hash = location.hash.substring(1);
        return hash === "" ? null : hash;
    }

    /**
     * @param {string} elementId
     * @param {{string: string}} attr
     */
    #showElement(elementId, attr = undefined) {
        const elements = this.shadowRoot.querySelectorAll("#pages > *");
        const idExists = Array.from(elements.values()).some(el => el.id);
        if (!idExists) return;

        elements.forEach(element => {
            if (element.id === elementId) {
                element.style.display = "block";
                if (attr) Object.entries(attr).forEach(([k, v]) => element.setAttribute(k, v));
            } else element.style.display = "none";
        });

        if (history.state !== elementId)
            history.pushState(elementId, "", `#${elementId}`);
    }
}
