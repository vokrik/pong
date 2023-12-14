import {gamesState} from "./state"
import {Actor, createActor} from "xstate";
import Board from "./Board";


export default class Pong {
    private canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private height: number = window.innerHeight;
    private width: number = window.innerWidth;
    private board: Board
    private actor: Actor<typeof gamesState>

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext("2d");
        this.actor = createActor(gamesState).start();
        this.board = new Board(this.width, this.height, this.actor, this.ctx)
    }

    public setup(): void {
        this.registerKeyListeners()
    }

    private registerKeyListeners(): void {
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "ArrowDown":
                    this.actor.send({type: "Press Down"})
                    break
                case "ArrowUp":
                    this.actor.send({type: "Press Up"})
                    break
                case "Enter":
                    this.actor.send({type: "Press Enter"})
                    break
                default:
                    break
            }
        })

        document.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "ArrowDown":
                    this.actor.send({type: "Release Down"})
                    break
                case "ArrowUp":
                    this.actor.send({type: "Release Up"})
                    break
                default:
                    break
            }
        })
    }

    public render(): void {
        this.actor.send({type: "Tick"})
        const state = this.actor.getSnapshot()
        if (state.matches("Display menu")) {
        } else {
            this.board.render()
        }
    }
}