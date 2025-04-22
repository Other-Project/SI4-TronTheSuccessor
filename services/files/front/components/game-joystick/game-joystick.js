import {HTMLComponent} from "/js/component.js";

export class GameJoystick extends HTMLComponent {
    constructor() {
        super("game-joystick", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.container = this.shadowRoot.getElementById("joystick-container");
        this.base = this.shadowRoot.getElementById("joystick-base");
        this.knob = this.shadowRoot.getElementById("joystick-knob");
        this.center = {x: 0, y: 0};
        this.direction = null;
        this.base.addEventListener("touchstart", this.onTouchStart.bind(this));
        this.base.addEventListener("touchmove", this.onTouchMove.bind(this));
        this.base.addEventListener("touchend", this.onTouchEnd.bind(this));
    };

    onTouchStart = (e) => {
        e.preventDefault();
        const rect = this.base.getBoundingClientRect();
        this.center = {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
    }

    onTouchMove = (e) => {
        e.preventDefault();

        const touch = e.touches[0];
        const dx = touch.clientX - this.center.x;
        const dy = touch.clientY - this.center.y;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 60);
        const angle = Math.atan2(dy, dx);

        this.knob.style.left = `calc(40% + ${Math.cos(angle) * distance}px)`;
        this.knob.style.top = `calc(40% + ${Math.sin(angle) * distance}px)`;

        let direction = null;
        if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;

        if (dy < -30 && dx < -30) direction = "up-left";
        else if (dy < -30 && dx > 30) direction = "up-right";
        else if (dy > 30 && dx < -30) direction = "down-left";
        else if (dy > 30 && dx > 30) direction = "down-right";
        else if (dx < -30) direction = "left";
        else if (dx > 30) direction = "right";

        if (direction && direction !== this.direction) {
            this.direction = direction;
            this.dispatchEvent(new CustomEvent("joystick-direction", {
                detail: {direction},
                bubbles: true,
                composed: true
            }));
        }
    }

    onTouchEnd = () => {
        this.knob.style.left = `50%`;
        this.knob.style.top = `50%`;
    }
}
