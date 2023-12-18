import {Actor} from "xstate";
import {gamesState} from "../state";
import CanvasAnalyzer from "../CanvasAnalyzer";
import {FONT_SIZE_TITLE_TO_HEIGHT_RATIO} from "../constants";
import Particle from "./Particle";
import CollisionEffect from "../effects/CollisionEffect";

type CollisionPoint = {
    x: number,
    y: number
    radius: number
}
export default class Score {

    private width
    private height
    private ctx
    private actor
    private particles: Array<Particle> = []
    private collisionPoint?: CollisionPoint
    private score
    constructor(width: number, height: number, actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
        this.width = width
        this.height = height
        this.actor = actor
        this.ctx = ctx
        this.score = this.actor.getSnapshot().context.score

        this.convertScoreToParticles()
    }

    private convertScoreToParticles() {
        this.particles = CanvasAnalyzer.convertCanvasToParticles(this.width, this.height, () => {
            const scoreSize = Math.ceil(this.height * FONT_SIZE_TITLE_TO_HEIGHT_RATIO)

            this.ctx.fillStyle = "white"
            this.ctx.font = `${scoreSize}px Silkscreen`
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.clearRect(0, 0, this.width, this.height)
            this.ctx.fillText(`${this.score.player} : ${this.score.opponent}`, this.width / 2, this.height / 2)
            this.ctx.beginPath();
            this.ctx.strokeStyle = "white"
            this.ctx.setLineDash([5, 15]);
            this.ctx.lineWidth = 3;
            this.ctx.moveTo((this.width / 2) - 1, 0);
            this.ctx.lineTo(this.width / 2, this.height / 2 - 150);
            this.ctx.stroke();

            this.ctx.moveTo((this.width / 2) - 1, this.height / 2 + 150);
            this.ctx.lineTo(this.width / 2, this.height);
            this.ctx.stroke();
        }, this.ctx)
    }

    public setCollisionPoint (collisionPoint: CollisionPoint) {
        this.collisionPoint = collisionPoint
    }

    public update() {
        const state = this.actor.getSnapshot()

        if(this.score.player !== state.context.score.player || this.score.opponent !== state.context.score.opponent){
            this.score = state.context.score
            this.convertScoreToParticles()
        }

        CollisionEffect.use(this.particles, {
            x: this.collisionPoint.x,
            y: this.collisionPoint.y,
            radius: this.collisionPoint.radius
        })
        this.particles.forEach(particle => particle.update(state.context.elapsedTimeMs))
    }

    public render() {
        this.particles.map(particle => particle.draw())

    }

}