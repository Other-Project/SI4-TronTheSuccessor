import {GameBoard} from "../components/game-board/game-board.js";
import {GameChoice} from "../components/game-choice.js";
import {HomePage} from "../components/home-page.js";

customElements.define("app-game-board", GameBoard);
customElements.define("app-game-choice", GameChoice);
customElements.define("app-home-page", HomePage);