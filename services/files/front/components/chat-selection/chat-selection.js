import {HTMLComponent} from "/js/component.js";
import {fetchApi} from "/js/login-manager.js";

export class ChatSelection extends HTMLComponent {
    constructor() {
        super("chat-selection", ["html", "css"]);
        this.connectedUsers = [];
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("global").addEventListener("click", () => this.openChatRoom("global", "Global"));
        this.friendListPanel = this.shadowRoot.getElementById("friend-list");
        this.shadowRoot.addEventListener("friendRequestHandled", this.#refresh);
        document.addEventListener("user-status", this.#updateFriendStatus);
    }

    onVisible = async () => {
        this.friendList = await this.#getFriendList();
        this.#updateFriendListPanel();
    };

    openChatRoom(roomId, roomName, pending, friend) {
        this.dispatchEvent(new CustomEvent("room-selected", {
            detail: {
                id: roomId,
                name: roomName,
                pending: pending,
                friend: friend
            }
        }));
    }

    #refresh = async (event) => {
        const friend = event?.detail?.friend;
        const method = event?.detail?.method;
        this.friendList = await this.#getFriendList();
        this.#updateFriendListPanel();
        this.openChatRoom(friend, friend, "undefined", method === "POST" ? "true" : "false");
    };

    #updateFriendListPanel() {
        this.friendListPanel.innerHTML = "";
        for (let friend of this.friendList) {
            const friendButton = document.createElement("app-chat-room-button");
            friendButton.id = `friend-${friend.id}`;
            friendButton.setAttribute("icon", friend.icon ?? "/assets/profile.svg");
            friendButton.setAttribute("name", friend.name);
            friendButton.setAttribute("preview", friend.preview);
            friendButton.setAttribute("connected", this.connectedUsers.includes(friend.name));
            friendButton.addEventListener("click", () => this.openChatRoom(friend.id, friend.name, friend.pending, friend.friend));
            this.friendListPanel.appendChild(friendButton);
        }
    }

    async #getFriendList() {
        let chatRooms = await fetchApi(
            `/api/chat`,
            {method: "GET"}
        ).then(response => response.json());
        return chatRooms.map(friend => ({
            id: friend.username,
            name: friend.username,
            preview: friend.last,
            icon: null,
            pending: friend.pending,
            friend: friend.friend
        }));
    }

    #updateFriendStatus = (event) => {
        const {connectedUsers} = event.detail;
        this.connectedUsers = connectedUsers;
        if (!this.friendList) return;

        for (const friend of this.friendList) {
            const friendButton = this.shadowRoot.getElementById(`friend-${friend.id}`);
            if (friendButton) friendButton.setAttribute("connected", this.connectedUsers.includes(friend.name));
        }
    };
}
