import AutoBindMethods from './AutoBindMethods';

const KEYS = {
    MOUSE_LEFT: 1,
    MOUSE_RIGHT: 3,
    SPACE: 32,
    ENTER: 13,
    ESC: 27,
    C: 67,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    X: 88,
    Z: 90,
    Q: 81,
    E: 69,
    R: 82,
    F: 70,
    V: 86,
    G: 71,
    1: 49,
    2: 50,
    ARROW_LEFT: 37,
    ARROW_RIGHT: 39,
    ARROW_UP: 38,
    ARROW_DOWN: 40,
};

export default class Input extends AutoBindMethods {
    constructor(params) {
        super();
        this.params = params;
        this.vertical = 0;
        this.horizontal = 0;
        this.attack1 = false;
        this.attack2 = false;
        this.look = {
            vertical: 0,
            horizontal: 0,
            back: false,
            sensitivity: 1,
        };
        this.resetHorizontalLook = () => this.look.horizontal = 0;
        this.isThirdPerson = true;

        this.cursor = {
            x: 0,
            y: 0,
        };

        this.mouse = {
            x: 0,
            y: 0,
        };

        this.addEventListeners();
    }

    update() {
        this.look.horizontal = 0;
        this.look.vertical = 0;
    }

    addEventListeners() {
        document.addEventListener('mousedown', (e) => {
            if (e.which === KEYS.MOUSE_LEFT) { this.attack1 = true; }
            if (e.which === KEYS.MOUSE_RIGHT) { this.attack2 = true; }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.which === KEYS.MOUSE_LEFT) { this.attack1 = false; }
            if (e.which === KEYS.MOUSE_RIGHT) { this.attack2 = false; }
        });

        let timeout;
        document.addEventListener('mousemove', (e) => {
            this.look.horizontal += e.movementX || 0;
            this.look.vertical += e.movementY || 0;

            this.mouse.x = e.x;
            this.mouse.y = e.y;

            const cursorX = this.cursor.x + (e.movementX || 0);
            const cursorY = this.cursor.y + (e.movementY || 0);

            if (cursorX > 0 && cursorX < window.innerWidth) {
                this.cursor.x = cursorX;
            }

            if (cursorY > 0 && cursorY < window.innerHeight) {
                this.cursor.y = cursorY;
            }

            if (timeout !== undefined) {
                window.clearTimeout(timeout);
            }

            timeout = window.setTimeout(function () {
                document.dispatchEvent(new Event('onmousemoveend'));
            }, 100);
        });

        document.addEventListener('onmousemoveend', (e) => {
            // Horizontal look is cleaning by Player.update after rotation is applied
            // this.look.horizontal = 0;
            this.look.vertical = 0;
        });

        document.addEventListener('keydown', (e) => {
            switch (e.which) {
                case KEYS.ENTER: this.params.onAction && this.params.onAction(); break;
                case KEYS.ESC: this.params.onExit && this.params.onExit(); break;
                case KEYS.C: this.params.onSwitchCamera && this.params.onSwitchCamera(); break;
                case KEYS.W: case KEYS.ARROW_UP: this.vertical = 1; break;
                case KEYS.S: case KEYS.ARROW_DOWN: this.vertical = -1; break;
                case KEYS.A: case KEYS.ARROW_LEFT: this.horizontal = -1; break;
                case KEYS.D: case KEYS.ARROW_RIGHT: this.horizontal = 1; break;
                case KEYS.X: this.look.back = true; break;
                case KEYS.F: this.look.cinematic = true; break;
                case KEYS.E: this.isAction = true; break;
                case KEYS.G: this.isDrop = true; break;
                case KEYS.SPACE: this.jump = 1; break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.which) {
                case KEYS.W:
                case KEYS.ARROW_UP:
                    if (this.vertical === 1) { this.vertical = 0; }
                    break;
                case KEYS.S:
                case KEYS.ARROW_DOWN:
                    if (this.vertical === -1) { this.vertical = 0; }
                    break;
                case KEYS.A:
                case KEYS.ARROW_LEFT:
                    if (this.horizontal === -1) { this.horizontal = 0; }
                    break;
                case KEYS.D:
                case KEYS.ARROW_RIGHT:
                    if (this.horizontal === 1) { this.horizontal = 0; }
                    break;
                case KEYS.X:
                    this.look.back = false;
                    break;
                case KEYS.F:
                    this.look.cinematic = false;
                    break;
                case KEYS.E:
                    this.isAction = false;
                    break;
                case KEYS.G:
                    this.isDrop = false;
                    break;
                case KEYS.SPACE:
                    this.jump = 0;
                    break;
            }
        });

        window.addEventListener('wheel', e => this.params.onZoom && this.params.onZoom(e.deltaY / 100));

        return this;
    }
}
