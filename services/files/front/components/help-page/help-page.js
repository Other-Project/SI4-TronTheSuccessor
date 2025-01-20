import {HTMLComponent} from "/js/component.js";

export class HelpPage extends HTMLComponent {
    constructor() {
        super("/components/help-page", "help-page.html");
        document.addEventListener("keyup", (event) => {
            if (event.code === "Space" && this.checkVisibility()) document.dispatchEvent(new CustomEvent("menu-selection", {detail: "game"}));
        });
    }
}
