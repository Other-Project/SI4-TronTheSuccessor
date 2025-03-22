import {HTMLComponent} from "/js/component.js";

export class ChatTab extends HTMLComponent {
    constructor() {
        super("chat-tab");
    }

    onSetupCompleted = () => {
        const selectionPage = document.createElement("app-chat-selection");
        this.dataset.tabTitle = "Chat selection";
        selectionPage.addEventListener("room-selected", (event) => this.openChatRoom(event.detail));
        this.shadowRoot.replaceChildren(selectionPage);
    }

    openChatRoom(room) {
        const chatPage = document.createElement("app-chat-room");
        this.dataset.tabTitle = room.name;
        chatPage.setAttribute("room", room.id);
        chatPage.setAttribute("pending", room.pending);
        chatPage.setAttribute("friend", room.friend);
        this.shadowRoot.replaceChildren(chatPage);
    }
}
