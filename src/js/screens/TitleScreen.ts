import CollisionEffect from "../effects/CollisionEffect";
import CanvasAnalyzer from "../CanvasAnalyzer";
import Particle from "../gameObjects/Particle";
import Ball from "../gameObjects/Ball";
import {Vector} from "vector2d";
import {Bounds, BOUNDS_TYPE} from "../gameObjects/Bounds";
import {Actor} from "xstate";
import {gamesState} from "../state";
import {
    TITLE_SCREEN_BALL_SPEED,
    FONT_SIZE_SUBTITLE_TO_HEIGHT_RATIO,
    FONT_SIZE_TITLE_TO_HEIGHT_RATIO
} from "../constants";

type Mouse = {
    x?: number,
    y?: number
}

export default class TitleScreen {

    private ctx: CanvasRenderingContext2D
    private width: number
    private height: number
    private particles: Array<Particle>
    private ball
    private bounds
    private actor
    private mouse: Mouse
    constructor(width: number, height: number,actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
        this.width = width
        this.height = height
        this.ctx = ctx
        this.actor = actor
        this.particles = CanvasAnalyzer.convertCanvasToParticles(this.width, this.height, () => {
            const titleSize = Math.ceil(this.height * FONT_SIZE_TITLE_TO_HEIGHT_RATIO)
            const subtitleSize = Math.ceil(this.height * FONT_SIZE_SUBTITLE_TO_HEIGHT_RATIO)
            this.ctx.fillStyle = "white"
            this.ctx.font = `${titleSize}px Silkscreen`
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.clearRect(0, 0, width, height)
            this.ctx.fillText("Particle Pong", this.width / 2, this.height / 2)

            this.ctx.font = `${subtitleSize}px Silkscreen`
            this.ctx.fillText("*Press Enter to start*", this.width / 2, this.height / 2 + titleSize * 1.5)
        }, this.ctx)
        this.mouse = {
            x: undefined,
            y: undefined
        }

        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x
            this.mouse.y =e.y
        })
        this.bounds = new Bounds({
            tl: {x: 0, y: 0},
            tr: {x: width, y: 0},
            bl: {x: 0, y: height},
            br: {x: width, y: height},
        }, BOUNDS_TYPE.INNER)

        this.ball = new Ball(this.width, this.height,TITLE_SCREEN_BALL_SPEED, ctx)
        this.ball.start({x: this.width/2, y: this.height/2}, (new Vector(1, 0)).rotate(Math.PI/3))
    }

    private update() {
        const state = this.actor.getSnapshot()
        this.ball.update(state.context.elapsedTimeMs)
        const ballTraveledCollisionLine = this.ball.getTraveledCollisionLine()

        const collisionWithBounds = this.bounds.getBoxCollision(ballTraveledCollisionLine)


        if (collisionWithBounds) {
            this.ball.bounce(collisionWithBounds.collisionPoint, this.bounds.getSideNormal(collisionWithBounds.side))
        }


        CollisionEffect.use(this.particles, {
            x: this.ball.position.x,
            y: this.ball.position.y,
            radius: this.ball.radius
        })
        CollisionEffect.use(this.particles, {
            x: this.mouse.x,
            y: this.mouse.y,
            radius: this.ball.radius
        })
        this.particles.forEach(particle => particle.update(state.context.elapsedTimeMs))
    }

    render() {
        this.update()
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.width, this.height)
        this.particles.map(particle => particle.draw())
        this.ball.render()
    }
}



