import CollisionEffect from "./CollisionEffect";
import CanvasAnalyzer from "./CanvasAnalyzer";
import Particle from "./Particle";
import Ball, {BALL_RADIUS_PERCENT} from "./Ball";
import {Vector} from "vector2d";
import {Bounds, BOUNDS_TYPE, SIDE} from "./Bounds";

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

    constructor(width: number, height: number, ctx: CanvasRenderingContext2D) {
        this.width = width
        this.height = height
        this.ctx = ctx
        this.particles = CanvasAnalyzer.convertCanvasToParticles(this.width, this.height, 3, () => {
            this.ctx.fillStyle = "white"
            this.ctx.font = `120px Silkscreen`
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.clearRect(0, 0, width, height)
            this.ctx.fillText("Particle Pong", this.width / 2, this.height / 2)

            this.ctx.font = `30px Silkscreen`
            this.ctx.fillText("*Press Enter to start*", this.width / 2, this.height / 2 + 150)
        }, this.ctx)
        this.bounds = new Bounds({
            tl: {x: 0, y: 0},
            tr: {x: width, y: 0},
            bl: {x: 0, y: height},
            br: {x: width, y: height},
        }, BOUNDS_TYPE.INNER)

        this.ball = new Ball(Math.min(height * BALL_RADIUS_PERCENT, width * BALL_RADIUS_PERCENT), ctx)
        this.ball.start({x: this.width/2, y: this.height/2}, (new Vector(1, 0)).rotate(Math.PI/3))
    }

    private update() {
        this.ball.update(0.15)
        const ballTraveledCollisionLine = this.ball.getTraveledCollisionLine()

        const collisionWithBounds = this.bounds.getBoxCollision(ballTraveledCollisionLine)


        if (collisionWithBounds) {
            this.ball.bounce(collisionWithBounds.collisionPoint, this.bounds.getSideNormal(collisionWithBounds.side))
        }


        CollisionEffect.use(this.particles, {
            x: this.ball.position.x,
            y: this.ball.position.y,
            radius: this.ball.radius * 3
        })
        this.particles.forEach(particle => particle.update())
    }

    render() {
        this.update()
        this.particles.map(particle => particle.draw())
        this.ball.render()
    }
}



