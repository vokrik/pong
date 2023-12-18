import CollisionEffect from "../effects/CollisionEffect";
import CanvasAnalyzer from "../CanvasAnalyzer";
import Particle from "../gameObjects/Particle";
import Ball, {BALL_RADIUS_PERCENT} from "../gameObjects/Ball";
import {Vector} from "vector2d";
import {Bounds, BOUNDS_TYPE, SIDE} from "../gameObjects/Bounds";
import {Actor} from "xstate";
import {gamesState} from "../state";

type Mouse = {
    x?: number,
    y?: number
}
const BALL_SPEED = 0.03

export default class GameOverScreen {

    private ctx: CanvasRenderingContext2D
    private width: number
    private height: number
    private actor

    constructor(width: number, height: number,actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
        this.width = width
        this.height = height
        this.ctx = ctx
        this.actor = actor
    }



    render() {

        const state = this.actor.getSnapshot()
        console.log(state)
        const isPlayerWin = state.matches({"Game over": "Player Won"})

        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.width, this.height)
        this.ctx.fillStyle = "white"
        this.ctx.font = `120px Silkscreen`
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        // this.ctx.clearRect(0, 0, this.width, this.height)
        this.ctx.fillText(isPlayerWin ? "Congrats!!!" : "Oh no!!!", this.width / 2, this.height / 2)

        this.ctx.font = `30px Silkscreen`
        this.ctx.fillText(isPlayerWin? "You rock! That AI never had a chance." : "The AI is truly taking over the world", this.width / 2, this.height / 2 + 150)
    }
}



