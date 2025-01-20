import {GameBoard} from "../components/game-board/game-board.js";
import {GameChoice} from "../components/game-choice/game-choice.js";
import {HomePage} from "../components/home-page/home-page.js";
import {ProfilPage} from "../components/profil-page/profil-page.js";

customElements.define("app-game-board", GameBoard);
customElements.define("app-game-choice", GameChoice);
customElements.define("app-home-page", HomePage);
customElements.define("app-profil-page", ProfilPage);
