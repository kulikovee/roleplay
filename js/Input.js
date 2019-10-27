export default class Input {
    constructor() {
        this.vertical = 0;
        this.horizontal = 0;
        this.look = {
            vertical: 0,
            horizontal: 0
        };

        this.createInput();
    }

    createInput() {
        document.onmousedown = (e) => {
            this.mouseLeft = 1;
        };

        document.onmouseup = (e) => {
            this.mouseLeft = 0;
        };

        var timeout;
        document.onmousemove = (e) => {
            this.look.horizontal = e.movementX || 0;
            this.look.vertical = e.movementY || 0;

            if (timeout !== undefined) {
                window.clearTimeout(timeout);
            }

            timeout = window.setTimeout(function () {
                document.dispatchEvent(new Event("onmousemoveend"));
            }, 100);
        };

        document.addEventListener("onmousemoveend", (e) => {
            this.look.horizontal = 0;
            this.look.vertical = 0;
        });

        document.onkeydown = (e) => {
            switch (e.which) {
                case 87:
                case 38:
                    this.vertical = 1;
                    break;
                case 83:
                case 40:
                    this.vertical = -1;
                    break;
                case 32:
                    this.space = 1;
                    break;
                default:
                    break;
            }

            switch (e.which) {
                case 65:
                case 37:
                    this.horizontal = -1;
                    break;
                case 68:
                case 39:
                    this.horizontal = 1;
                default:
                    break;
            }
        };

        document.onkeyup = (e) => {
            switch (e.which) {
                case 87:
                case 38:
                    if (this.vertical == 1) {
                        this.vertical = 0;
                    }
                    break;
                case 83:
                case 40:
                    if (this.vertical == -1) {
                        this.vertical = 0;
                    }
                    break;
                case 32:
                    this.space = 0;
                    break;
                default:
                    break;
            }

            switch (e.which) {
                case 65:
                case 37:
                    if (this.horizontal == -1) {
                        this.horizontal = 0;
                    }
                    break;
                case 68:
                case 39:
                    if (this.horizontal == 1) {
                        this.horizontal = 0;
                    }
                default:
                    break;
            }
        };

        return this;
    }
}
