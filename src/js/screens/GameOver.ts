import {Actor} from "xstate";
import {gamesState} from "../state";
import {FONT_SIZE_SUBTITLE_TO_HEIGHT_RATIO, FONT_SIZE_TITLE_TO_HEIGHT_RATIO, WIN_SCORE} from "../constants";
import {Screen} from "./Screen";
import Particle from "../gameObjects/Particle";
import CanvasAnalyzer from "../CanvasAnalyzer";

export default class GameOverScreen extends Screen {



    constructor(width: number, height: number,actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
     super("Game over screen", width, height, actor, ctx)
    }


    protected getTransitionParticles(): Array<Particle> {
        return  CanvasAnalyzer.convertCanvasToParticles(this.width, this.height, () => {
           this.idleRender()
        }, this.ctx)
    }

    protected idleRender(): void {
        const state = this.actor.getSnapshot()
        const isPlayerWin = state.context.score.player >= WIN_SCORE

        const titleSize = Math.ceil(this.height * FONT_SIZE_TITLE_TO_HEIGHT_RATIO)
        const subtitleSize = Math.ceil(this.height * FONT_SIZE_SUBTITLE_TO_HEIGHT_RATIO)

        this.ctx.fillStyle = "white"
        this.ctx.font = `${titleSize}px Silkscreen`
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(isPlayerWin ? "Congrats!!!" : "Oh no :(", this.width / 2, this.height / 2)

        this.ctx.font = `${subtitleSize}px Silkscreen`
        this.ctx.fillText(isPlayerWin? "You rock! The computer never had a chance." : "The computer has won this time.", this.width / 2, this.height / 2 + 150)
    }

    protected idleUpdate(): void {

    }
}



