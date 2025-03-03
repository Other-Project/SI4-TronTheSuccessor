import {HTMLComponent} from "/js/component.js";

export class Popup extends HTMLComponent {
    constructor() {
        super("popup", ["html", "css"]);
    }

    onVisible = () => {
        if (location.hash.substring(1) === "home") this.shadowRoot.getElementById("popup-panel").style.background = "rgb(42, 39, 50)"
    }
}
