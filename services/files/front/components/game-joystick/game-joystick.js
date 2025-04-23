import {HTMLComponent} from "/js/component.js";
import nipplejs from "https://cdn.jsdelivr.net/npm/nipplejs@0.10.2/+esm";
import {directionToAngle} from "/js/player.js";

export class GameJoystick extends HTMLComponent {
    direction = "none";

    constructor() {
        super("game-joystick", ["css"]);
    }

    onSetupCompleted = () => {
        const joystickContainer = document.createElement("div");
        const joystickZone = document.createElement("div");
        joystickContainer.id = "joystick-zone";
        joystickContainer.appendChild(joystickZone);
        this.shadowRoot.appendChild(joystickContainer);

        const size = 150;
        const joystick = nipplejs.create({
            zone: joystickZone,
            mode: "static",
            position: {left: "50%", top: "50%"},
            color: "#000000",
            size: size
        });

        joystick.on("move", (evt, data) => {
            let direction;
            if (data.force < 0.2) return;
            const angle = Math.round(data.angle.degree / 45) * 45;
            direction = Object.entries(directionToAngle).find(([_, value]) => value === angle);
            if (direction) {
                this.direction = direction[0];
                this.dispatchEvent(new CustomEvent("joystick-direction", {detail: this.direction}));
            }
        });
    };
}
