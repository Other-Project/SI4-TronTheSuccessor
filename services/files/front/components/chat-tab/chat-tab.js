import {HTMLComponent} from "/js/component.js";

export class ChatTab extends HTMLComponent {
    constructor() {
        super("chat-tab", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.pages = this.shadowRoot.getElementById("pages");
    }

    onVisible = () => {
        this.navigateTo("chat-selection");
    };

    navigateTo(pageId) {
        for (let page of this.pages.children) {
            page.classList.toggle("active", page.id === pageId);
            if (page.id === pageId) this.dataset.tabTitle = page.dataset.tabTitle;
        }
    }
}