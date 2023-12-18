import {Actor} from "xstate";
import {gamesState} from "../state";
import {FONT_SIZE_SUBTITLE_TO_HEIGHT_RATIO, FONT_SIZE_TITLE_TO_HEIGHT_RATIO} from "../constants";

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
        const isPlayerWin = state.matches({"Game over": "Player Won"})
        const titleSize = Math.ceil(this.height * FONT_SIZE_TITLE_TO_HEIGHT_RATIO)
        const subtitleSize = Math.ceil(this.height * FONT_SIZE_SUBTITLE_TO_HEIGHT_RATIO)

        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.width, this.height)
        this.ctx.fillStyle = "white"
        this.ctx.font = `${titleSize}px Silkscreen`
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(isPlayerWin ? "Congrats!!!" : "Oh no!!!", this.width / 2, this.height / 2)

        this.ctx.font = `${subtitleSize}px Silkscreen`
        this.ctx.fillText(isPlayerWin? "You rock! That computer never had a chance." : "The computer has won this time.", this.width / 2, this.height / 2 + 150)
    }
}



