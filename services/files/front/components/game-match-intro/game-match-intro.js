import {HTMLComponent} from "/js/component.js";

export class GameMatchIntro extends HTMLComponent {
    opponent;

    static get observedAttributes() {
        return ["opponent"];
    }

    constructor() {
        super("game-match-intro", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.opponentName = this.shadowRoot.getElementById("opponent-name");
        this.countdown = this.shadowRoot.getElementById('countdown');
    }

    onVisible = () => {
        if (!this.countdown) return;
        this.opponentName.textContent = this.opponent;

        let countdown = 3;
        const updateCountdown = () => {
            this.countdown.textContent = countdown > 0 ? countdown : 'FIGHT!';
            this.countdown.classList.toggle('show', countdown > 0);
            this.countdown.classList.toggle('fight', countdown === 0);
            if (countdown > 0) countdown--;
            else clearInterval(intervalId);
        };
        updateCountdown();
        const intervalId = setInterval(() => updateCountdown(), 1000);
    }
}
