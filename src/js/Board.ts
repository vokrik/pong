import Paddle from "./Paddle";
import {Actor, SnapshotFrom} from "xstate";
import {gamesState} from "./state";
import Ball from "./Ball";
import {Vector} from "vector2d";
import {Point} from "./Point";
import CollisionEffect from "./CollisionEffect";
import CanvasAnalyzer from "./CanvasAnalyzer";
import Particle from "./Particle";
import {Bounds, BOUNDS_TYPE, SIDE} from "./Bounds";

const PADDLE_WIDTH_PERCENT = 0.01
const PADDLE_HEIGHT_PERCENT = 0.3
const PADDLE_DISTANCE_FROM_SIDE_PERCENT = 0.1
const BALL_RADIUS_PERCENT = 0.015


export default class Board {

    private score = {
        player: 0,
        opponent: 0
    }
    private ctx: CanvasRenderingContext2D
    private scoreParticles: Array<Particle>
    private player: Paddle
    private opponent: Paddle
    private ball: Ball
    private width: number
    private height: number
    private boardBounds
    private actor: Actor<typeof gamesState>


    constructor(width: number, height: number, actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.width = width
        this.height = height
        this.actor = actor
        this.boardBounds = new Bounds({
            tl: {x: 0, y: 0},
            tr: {x: width, y: 0},
            bl: {x: 0, y: height},
            br: {x: width, y: height},
        }, BOUNDS_TYPE.INNER)


        const paddleWidth = this.width * PADDLE_WIDTH_PERCENT
        const paddleHeight = this.height * PADDLE_HEIGHT_PERCENT
        const xPadding = this.width * PADDLE_DISTANCE_FROM_SIDE_PERCENT
        const yPosition = height / 2 - paddleHeight / 2

        this.player = new Paddle({
            x: xPadding,
            y: yPosition
        }, new Vector(1, 0), paddleWidth, paddleHeight, this.ctx)

        this.opponent = new Paddle({
                x: width - xPadding - paddleWidth,
                y: yPosition
            },
            new Vector(-1, 0), paddleWidth, paddleHeight,
            this.ctx
        )

        this.ball = new Ball(Math.min(height * BALL_RADIUS_PERCENT, width * BALL_RADIUS_PERCENT), this.ctx)
        this.ball.start({
            x: width / 2,
            y: height / 2
        }, new Vector(-10, 0))
        this.convertScoreToParticles()

    }

    private convertScoreToParticles() {
        this.scoreParticles = CanvasAnalyzer.convertCanvasToParticles(this.width, this.height, 4, () => {
            this.ctx.fillStyle = "white"
            this.ctx.font = `120px Helvetica`
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.clearRect(0, 0, this.width, this.height)
            this.ctx.fillText(`${this.score.player} : ${this.score.opponent}`, this.width / 2, this.height / 2)
        }, this.ctx)
    }

    private movePlayer(state: SnapshotFrom<typeof gamesState>) {
        if (state.matches({"Play game": {Player: "Moving up"}})) {
            this.player.moveUp(state.context.elapsedTimeMs)
        }

        if (state.matches({"Play game": {Player: "Moving down"}})) {
            this.player.moveDown(state.context.elapsedTimeMs)
        }
    }


    protected resolveCollisions() {
        const playerBounds = this.player.getBounds()
        const opponentBounds = this.opponent.getBounds()


        const playersCollisionWithBounds = this.boardBounds.getBoxCollision({pointA: playerBounds.box.tr, pointB:playerBounds.box.bl})
        if (playersCollisionWithBounds) {

            playersCollisionWithBounds.side === SIDE.TOP? this.player.moveToVerticalPosition(0) :   this.player.moveToVerticalPosition(this.height, false)
        }


        const ballTraveledCollisionLine = this.ball.getTraveledCollisionLine()
        if(!ballTraveledCollisionLine){
            return
        }

        const collisionWithPlayer = playerBounds.getBoxCollision(ballTraveledCollisionLine)
        if (collisionWithPlayer) {
            this.ball.setPosition(collisionWithPlayer.collisionPoint)
            this.ball.setDirection(playerBounds.getSideNormal(collisionWithPlayer.side)
                .rotate(this.player.getNormalRotationAtPoint(collisionWithPlayer.collisionPoint)))
        }

        const collisionWithOpponent = opponentBounds.getBoxCollision(ballTraveledCollisionLine)
        if (collisionWithOpponent) {
            this.ball.setPosition(collisionWithOpponent.collisionPoint)
            this.ball.setDirection(opponentBounds.getSideNormal(collisionWithOpponent.side)
                .rotate(this.opponent.getNormalRotationAtPoint(collisionWithOpponent.collisionPoint)))
        }

        const collisionWithBounds = this.boardBounds.getBoxCollision(ballTraveledCollisionLine)

        if(!collisionWithBounds) {
            return
        }

        if ([SIDE.LEFT, SIDE.RIGHT].includes(collisionWithBounds.side) ) {
            this.resolveSideWallHit(collisionWithBounds.collisionPoint, collisionWithBounds.side === SIDE.LEFT)
        }
         else {
             this.ball.bounce(collisionWithBounds.collisionPoint, this.boardBounds.getSideNormal(collisionWithBounds.side))
        }


    }


    protected resolveSideWallHit(collisionPoint: Point, isLeftWall: boolean) {
        isLeftWall ? this.score.opponent++ : this.score.player++
        this.ball.stopAndHide()
        setTimeout(() => {
            this.ball.start({
                x: this.width / 2,
                y: this.height / 2
            }, new Vector(isLeftWall ? 1 : -1, 0))
        }, 500)

        this.convertScoreToParticles()
    }

    protected update() {
        const state = this.actor.getSnapshot()
        this.movePlayer(state)
        this.ball.move()
        this.resolveCollisions()
        CollisionEffect.use(this.scoreParticles, {
            x: this.ball.position.x,
            y: this.ball.position.y,
            radius: this.ball.radius * 5
        })
        this.scoreParticles.forEach(particle => particle.update())
    }


    public render() {
        this.update()
        this.ctx.beginPath();
        this.ctx.strokeStyle = "white"
        this.ctx.setLineDash([5, 15]);
        this.ctx.lineWidth = 3;
        this.ctx.moveTo((this.width / 2) - 1, 0);
        this.ctx.lineTo(this.width / 2, this.height / 2 - 100);
        this.ctx.stroke();

        this.ctx.moveTo((this.width / 2) - 1, this.height / 2 + 150);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.player.render()
        this.opponent.render()
        this.scoreParticles.map(particle => particle.draw())
        this.ball.render()

    }
}
