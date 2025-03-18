import {HTMLComponent} from "/js/component.js";
import {fetchApi} from "../../js/login-manager.js";

export class ChatSelection extends HTMLComponent {
    constructor() {
        super("chat-selection", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("global").addEventListener("click", () => this.openChatRoom("global", "Global"));
        this.friendListPanel = this.shadowRoot.getElementById("friend-list");
    }

    onVisible = async () => {
        this.friendList = await this.#getFriendList();
        this.#updateFriendListPanel();
    };

    openChatRoom(roomId, roomName) {
        this.dispatchEvent(new CustomEvent("room-selected", {detail: {id: roomId, name: roomName}}));
    }

    #updateFriendListPanel() {
        this.friendListPanel.innerHTML = "";
        for (let friend of this.friendList) {
            const friendButton = document.createElement("app-chat-room-button");
            friendButton.setAttribute("icon", friend.icon ?? "/assets/profil.svg");
            friendButton.setAttribute("name", friend.name);
            friendButton.setAttribute("preview", friend.preview);
            friendButton.addEventListener("click", () => this.openChatRoom(friend.id, friend.name));
            this.friendListPanel.appendChild(friendButton);
        }
    }

    async #getFriendList() {
        let friends = await fetchApi(
            "/api/user/friends",
            {method: "GET"}
        ).then(response => response.json());
        return friends.map(friend => ({
            id: friend,
            name: friend,
            preview: "Hello there!",
            icon: null
        }));
    }
}
