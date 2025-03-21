import {GameBoard} from "/components/game-board/game-board.js";
import {GameChoice} from "/components/game-choice/game-choice.js";
import {HomePage} from "/components/home-page/home-page.js";
import {ProfilePage} from "/components/profile-page/app-profile-page/profile-page.js";
import {Pages} from "/components/pages/pages.js";
import {Button} from "/components/button/button.js";
import {ProfilePageButton} from "/components/profile-page/profile-page-button/profile-page-button.js";
import {HelpPage} from "/components/help-page/help-page.js";
import {Control} from "/components/control/control.js";
import {GameMaster} from "/components/game-master/game-master.js";
import {Popup} from "/components/popup/popup.js";
import {SignUpPopup} from "/components/sign-up-popup/sign-up-popup.js";
import {SignInPopup} from "/components/sign-in-popup/sign-in-popup.js";
import {Input} from "/components/input/input.js";
import {ResetPassword} from "/components/reset-password-popup/reset-password-popup.js";
import {ProfileDisplay} from "/components/profile-display/profile-display.js";
import {LoginContainer} from "/components/login-container/login-container.js";
import {ChatDrawer} from "/components/chat-drawer/chat-drawer.js";
import {TabNavigation} from "/components/tab-navigation/tab-navigation.js";
import {ChatTab} from "/components/chat-tab/chat-tab.js";
import {ChatSelection} from "/components/chat-selection/chat-selection.js";
import {ChatRoomButton} from "/components/chat-room-button/chat-room-button.js";
import {ChatRoom} from "/components/chat-room/chat-room.js";
import {ChatRoomMessage} from "/components/chat-room-message/chat-room-message.js";
import {GameEmotes} from "/components/game-emotes/game-emotes.js";

// General components
customElements.define("app-button", Button);
customElements.define("app-tab-navigation", TabNavigation);
customElements.define("app-pages", Pages);
customElements.define("app-popup", Popup);
customElements.define("app-input", Input);

// Home components
customElements.define("app-home-page", HomePage);
customElements.define("app-profile-display", ProfileDisplay);

// Game help components
customElements.define("app-help-page", HelpPage);
customElements.define("app-control", Control);

// Game components
customElements.define("app-game-board", GameBoard);
customElements.define("app-game-choice", GameChoice);
customElements.define("app-game-master", GameMaster);
customElements.define("app-game-emotes", GameEmotes);

// Profile components
customElements.define("app-profile-page", ProfilePage);
customElements.define("app-profile-page-button", ProfilePageButton);

// Login components
customElements.define("app-login-container", LoginContainer);
customElements.define("app-sign-up-popup", SignUpPopup);
customElements.define("app-sign-in-popup", SignInPopup);
customElements.define("app-reset-password-popup", ResetPassword);

// Chat components
customElements.define("app-chat-drawer", ChatDrawer);
customElements.define("app-chat-tab", ChatTab);
customElements.define("app-chat-selection", ChatSelection);
customElements.define("app-chat-room-button", ChatRoomButton);
customElements.define("app-chat-room", ChatRoom);
customElements.define("app-chat-room-message", ChatRoomMessage);
