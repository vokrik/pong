import Pong from './Pong';
import {createActor} from "xstate";

class App {
    private pong: Pong;

    constructor(game: Pong) {
        this.pong = game;
    }

    public setup(): void {
        this.pong.setup()
        this.gameLoop();
    }

    private gameLoop(): void {
        // need to bind the current this reference to the callback
        requestAnimationFrame(this.gameLoop.bind(this));

        this.pong.render();
    }
}

window.onload = () => {
    let app = new App(new Pong());

    app.setup();
}