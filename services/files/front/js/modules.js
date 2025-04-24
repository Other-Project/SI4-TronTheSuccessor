// General components
import {Button} from "/components/button/button.js";
import {Avatar} from "/components/avatar/avatar.js";
import {Rank} from "/components/rank/rank.js";
import {TabNavigation} from "/components/tab-navigation/tab-navigation.js";
import {Pages} from "/components/pages/pages.js";
import {Popup} from "/components/popup/popup.js";
import {Input} from "/components/input/input.js";
import {Notification} from "/components/notification/notification.js";
import {Badge} from "/components/badge/badge.js";
import {LoadingSpinner} from "/components/loading-spinner/loading-spinner.js";

// Home components
import {HomePage} from "/components/home-page/home-page.js";
import {ProfileDisplay} from "/components/profile-display/profile-display.js";
import {GameChoice} from "/components/game-choice/game-choice.js";

// Game help components
import {HelpPage} from "/components/help-page/help-page.js";
import {Control} from "/components/control/control.js";

// Game components
import {GamePage} from "/components/game-page/game-page.js";
import {GameBoard} from "/components/game-board/game-board.js";
import {GameMaster} from "/components/game-master/game-master.js";
import {GameEmotes} from "/components/game-emotes/game-emotes.js";
import {GameEmoteDisplay} from "/components/game-emote-display/game-emote-display.js";
import {GameMatchIntro} from "/components/game-match-intro/game-match-intro.js";
import {GameJoystick} from "/components/game-joystick/game-joystick.js";

// Profile components
import {ProfilePage} from "/components/profile/profile-page/profile-page.js";
import {ProfileUserInfo} from "/components/profile/profile-userinfo/profile-userinfo.js";
import {ProfileStats} from "/components/profile/profile-stats/profile-stats.js";
import {ProfileHistory} from "/components/profile-history/profile-history.js";
import {ProfileLeaderboard} from "/components/profile-leaderboard/profile-leaderboard.js";
import {RankRepartition} from "/components/rank-repartition/rank-repartition.js";
import {RankListing} from "/components/rank-listing/rank-listing.js";
import {RankExplanation} from "/components/rank-explanation/rank-explanation.js";

// Login components
import {LoginContainer} from "/components/login-container/login-container.js";
import {SignUpPopup} from "/components/sign-up-popup/sign-up-popup.js";
import {SignInPopup} from "/components/sign-in-popup/sign-in-popup.js";
import {ResetPassword} from "/components/reset-password-popup/reset-password-popup.js";

// Chat components
import {ChatDrawer} from "/components/chat-drawer/chat-drawer.js";
import {ChatTab} from "/components/chat-tab/chat-tab.js";
import {ChatSelection} from "/components/chat-selection/chat-selection.js";
import {ChatRoomButton} from "/components/chat-room-button/chat-room-button.js";
import {ChatRoom} from "/components/chat-room/chat-room.js";
import {ChatRoomMessage} from "/components/chat-room-message/chat-room-message.js";
import {GameInvitation} from "/components/game-invitation/game-invitation.js";

// History components
import {GameResult} from "/components/game-result/game-result.js";
import {Replay} from "/components/replay/replay.js";

// Settings components
import {SettingsPage} from "/components/settings/settings-page/settings-page.js";
import {SettingsCarousel} from "/components/settings/settings-carousel/settings-carousel.js";


// General components
customElements.define("app-button", Button);
customElements.define("app-avatar", Avatar);
customElements.define("app-rank", Rank);
customElements.define("app-tab-navigation", TabNavigation);
customElements.define("app-pages", Pages);
customElements.define("app-popup", Popup);
customElements.define("app-input", Input);
customElements.define("app-notification", Notification);
customElements.define("app-badge", Badge);
customElements.define("app-loading-spinner", LoadingSpinner);

// Home components
customElements.define("app-home-page", HomePage);
customElements.define("app-profile-display", ProfileDisplay);
customElements.define("app-game-choice", GameChoice);

// Game help components
customElements.define("app-help-page", HelpPage);
customElements.define("app-control", Control);

// Game components
customElements.define("app-game-page", GamePage);
customElements.define("app-game-board", GameBoard);
customElements.define("app-game-master", GameMaster);
customElements.define("app-game-emotes", GameEmotes);
customElements.define("app-game-emote-display", GameEmoteDisplay);
customElements.define("app-game-match-intro", GameMatchIntro);
customElements.define("app-game-joystick", GameJoystick);

// Profile components
customElements.define("app-profile-page", ProfilePage);
customElements.define("app-profile-userinfo", ProfileUserInfo);
customElements.define("app-profile-stats", ProfileStats);
customElements.define("app-profile-history", ProfileHistory);
customElements.define("app-profile-leaderboard", ProfileLeaderboard);
customElements.define("app-rank-repartition", RankRepartition);
customElements.define("app-rank-listing", RankListing);
customElements.define("app-rank-explanation", RankExplanation);

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
customElements.define("app-game-invitation", GameInvitation);

// History components
customElements.define("app-game-result", GameResult);
customElements.define("app-replay", Replay);

// Settings components
customElements.define("app-settings-page", SettingsPage);
customElements.define("app-settings-carousel", SettingsCarousel);
