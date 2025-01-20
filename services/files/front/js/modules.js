import {GameBoard} from "../components/game-board/game-board.js";
import {GameChoice} from "../components/game-choice/app-game-choice/game-choice.js";
import {HomePage} from "../components/home-page/home-page.js";
import {ProfilPage} from "../components/profil-page/app-profil-page/profil-page.js";
import {Pages} from "../components/pages/pages.js";
import {GameChoiceButton} from "../components/game-choice/game-choice-button/game-choice-button.js";
import {ProfilPageButton} from "../components/profil-page/profil-page-button/profil-page-button.js";

customElements.define("app-game-board", GameBoard);
customElements.define("app-game-choice", GameChoice);
customElements.define("app-home-page", HomePage);
customElements.define("app-profil-page", ProfilPage);
customElements.define("app-pages", Pages);
customElements.define("app-game-choice-button", GameChoiceButton);
customElements.define("app-profil-page-button", ProfilPageButton);
