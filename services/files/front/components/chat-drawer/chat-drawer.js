import {HTMLComponent} from "/js/component.js";
import {getCookie} from "/js/login-manager.js";

export class ChatDrawer extends HTMLComponent {
    #opened;

    constructor() {
        super("chat-drawer", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.drawerHandle = this.shadowRoot.getElementById("drawer-handle");
        this.drawer = this.shadowRoot.getElementById("drawer");

        this.drawerHandle.addEventListener("click", () => {
            if (this.#opened) this.hide();
            else this.show();
        });
        this.shadowRoot.getElementById("overlay").addEventListener("click", () => {
            this.hide();
        });

        document.addEventListener("hide-drawer", () => {
            this.hide();
        });
    };

    onVisible = () => {
        this.style.visibility = getCookie("refreshToken") ? "visible" : "hidden";
        this.hide();
    };

    show() {
        this.#opened = true;
        this.drawer.classList.add("show");
        this.drawerHandle.innerText = ">";
    }

    hide() {
        this.#opened = false;
        this.drawer.classList.remove("show");
        this.drawerHandle.innerText = "<";
    }
}
