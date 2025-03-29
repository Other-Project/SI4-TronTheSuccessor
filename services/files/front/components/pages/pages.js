import {HTMLComponent} from "/js/component.js";

/**
 * Component that manages the pages of the website.
 * It reads the URL and shows the corresponding page.
 */
export class Pages extends HTMLComponent {
    level = 1;

    static get observedAttributes() {
        return ["level"];
    }

    constructor() {
        super("pages", ["html"]);
        window.addEventListener("popstate", this.onVisible);
    }

    onSetupCompleted = () => {
        this.pageSlot = this.shadowRoot.getElementById("pages-slot");
        this.errorPage = this.shadowRoot.getElementById("404");
    };

    onVisible = () => {
        const elemId = location.pathname.split("/")[this.level] ?? "";
        if (elemId === this.currentPage) {
            this.#showElement(null); // "Refresh" the page
            setTimeout(() => this.#showElement(elemId), 10);
        } else this.#showElement(elemId);
    }

    /**
     * @param {string|null} elementId The id of the page to show.
     * @param {{string: string}} attr The attributes to set to the page.
     */
    #showElement(elementId, attr = undefined) {
        const elements = this.pageSlot.assignedElements();
        if (elementId !== null) {
            const idExists = elements.some(el => el.id === elementId);
            if (!idExists) elementId = "404";
        }
        this.currentPage = elementId;

        [...elements, this.errorPage].forEach(element => {
            if (element.id === elementId) {
                element.style.display = "block";
                if (attr) Object.entries(attr).forEach(([k, v]) => element.setAttribute(k, v));
            } else element.style.display = "none";
        });
    }
}

/**
 * Change the page without reloading the website.
 * @param {string} page URL of the page to show
 * @param {boolean} redirect If true, the history will be replaced instead of pushed
 * @param {boolean} forceRefresh If true, the page will be refreshed even if it is the current page
 */
export function changePage(page, redirect = false, forceRefresh = undefined) {
    const state = page;
    if (!forceRefresh && history.state === state) return;
    if (redirect) history.replaceState(state, "", page);
    else history.pushState(state, "", page);
    window.dispatchEvent(new PopStateEvent("popstate", {state: state}));
}
