import {HTMLComponent} from "/js/component.js";
import {getCookie} from "/js/login-manager.js";
import {changePage} from "/components/pages/pages.js";

export class ChatDrawer extends HTMLComponent {
    #opened;

    constructor() {
        super("chat-drawer", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.drawerHandle = this.shadowRoot.getElementById("drawer-handle");
        this.drawer = this.shadowRoot.getElementById("drawer");
        this.invitationPopups = this.shadowRoot.querySelectorAll("app-popup");

        this.drawerHandle.addEventListener("click", () => {
            if (this.#opened) this.hide();
            else this.show();
        });
        this.shadowRoot.getElementById("overlay").addEventListener("click", () => {
            this.hide();
        });

        this.addEventListener("hide-popup", () => {
            this.invitationPopups.forEach((popup) => popup.classList.remove("show"));
        });

        this.addEventListener("show-invitation", (event) => {
            this.invitationPopups.forEach((popup) => {
                if (popup.classList.toggle("show", event.detail.popupId === popup.id)) {
                    const popupName = popup.id.split("-")[0];
                    this.shadowRoot.getElementById(`${popupName}-avatar`).src = event.detail.avatar;
                    this.shadowRoot.getElementById(`${popupName}-name`).textContent = this.name = event.detail.name;
                    this.shadowRoot.getElementById(`${popupName}-content`).textContent = event.detail.content;
                }
            });
        });

        this.shadowRoot.querySelectorAll(".launch-game").forEach(button => {
                button.addEventListener("click", () => {
                    this.invitationPopups.forEach((popup) => popup.classList.remove("show"));
                    changePage("/game/" + btoa(this.name));
                });
            }
        );

        this.shadowRoot.getElementById("dont-send-invitation").addEventListener("click", () => {
            this.invitationPopups.forEach((popup) => popup.classList.remove("show"));
        });

        this.shadowRoot.getElementById("refuse-invitation").addEventListener("click", () => {
            this.invitationPopups.forEach((popup) => popup.classList.remove("show"));
            document.cookie = "game-invitation=; path=/; max-age=0;";
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
