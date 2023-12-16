import Paddle from "./Paddle";
import {Actor, SnapshotFrom} from "xstate";
import {gamesState} from "./state";
import Ball, {BALL_RADIUS_PERCENT} from "./Ball";
import {Vector} from "vector2d";
import {Point} from "./Point";
import CollisionEffect from "./CollisionEffect";
import CanvasAnalyzer from "./CanvasAnalyzer";
import Particle from "./Particle";
import {Bounds, BOUNDS_TYPE, SIDE} from "./Bounds";

const PADDLE_WIDTH_PERCENT = 0.023
const PADDLE_HEIGHT_PERCENT = 0.2
const PADDLE_DISTANCE_FROM_SIDE_PERCENT = 0.1
const OPPONENT_IDLE_INCORRECTNESS = 0.4

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

    private movePlayer(state: SnapshotFrom<typeof gamesState>) {
        if (state.matches({"Play game": {Player: "Moving up"}})) {
            this.player.moveUp(state.context.elapsedTimeMs)
        }

        if (state.matches({"Play game": {Player: "Moving down"}})) {
            this.player.moveDown(state.context.elapsedTimeMs)
        }
    }


    protected resolveCollisions() {
        let playerBounds = this.player.getBounds()
        let opponentBounds = this.opponent.getBounds()


        const playersCollisionWithBounds = this.boardBounds.getBoxCollision({pointA: playerBounds.box.tr, pointB:playerBounds.box.br})
        if (playersCollisionWithBounds) {
            playersCollisionWithBounds.side === SIDE.TOP? this.player.moveToVerticalPosition(0) :   this.player.moveToVerticalPosition(this.height, false)
            playerBounds = this.player.getBounds()
        }

        const opponentCollisionWithBound = this.boardBounds.getBoxCollision({pointA: opponentBounds.box.tr, pointB:opponentBounds.box.br})
        if (opponentCollisionWithBound) {
            opponentCollisionWithBound.side === SIDE.TOP? this.opponent.moveToVerticalPosition(0) :   this.opponent.moveToVerticalPosition(this.height, false)
            opponentBounds = this.opponent.getBounds()

        }

        let ballTraveledCollisionLine = this.ball.getTraveledCollisionLine()
        if(!ballTraveledCollisionLine){
            return
        }
        const collisionWithPlayer = playerBounds.getBoxCollision(ballTraveledCollisionLine)
        if (collisionWithPlayer && collisionWithPlayer.side === SIDE.RIGHT) {
            const newPosition = collisionWithPlayer.collisionPoint
            newPosition.x+=this.ball.radius
            this.ball.setPosition(newPosition)
            this.ball.setDirection(playerBounds.getSideNormal(collisionWithPlayer.side)
                .rotate(this.player.getNormalRotationAtPoint(collisionWithPlayer.collisionPoint)))
            ballTraveledCollisionLine = this.ball.getTraveledCollisionLine()
        }

        const collisionWithOpponent = opponentBounds.getBoxCollision(ballTraveledCollisionLine)
        if (collisionWithOpponent && collisionWithOpponent.side === SIDE.LEFT) {
            const newPosition = collisionWithOpponent.collisionPoint
            newPosition.x-=this.ball.radius
            this.ball.setPosition(newPosition)
            this.ball.setDirection(opponentBounds.getSideNormal(collisionWithOpponent.side)
                .rotate(this.opponent.getNormalRotationAtPoint(collisionWithOpponent.collisionPoint)))
            ballTraveledCollisionLine = this.ball.getTraveledCollisionLine()
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
            const startingPlayer = isLeftWall ? this.opponent : this.player
            const center = {
                x: this.width / 2,
                y: this.height / 2
            }
            const paddleCenter = startingPlayer.getCenter()
            const centerVector = new Vector(paddleCenter.x - center.x, paddleCenter.y - center.y)
            this.ball.start(center, centerVector.unit())
        }, 500)

        this.convertScoreToParticles()
    }

    protected update() {
        const state = this.actor.getSnapshot()
        this.movePlayer(state)
        this.moveOpponent(state)
        this.ball.update(state.context.elapsedTimeMs)
        this.resolveCollisions()
        CollisionEffect.use(this.scoreParticles, {
            x: this.ball.position.x,
            y: this.ball.position.y,
            radius: this.ball.radius * 2
        })
        this.scoreParticles.forEach(particle => particle.update())
    }


    protected moveOpponent(state: SnapshotFrom<typeof gamesState>){
        const paddleCenter = this.opponent.getCenter()
        const distance = paddleCenter.y - this.ball.position.y


        if(Math.abs(distance) < 30 || Math.random() < OPPONENT_IDLE_INCORRECTNESS) {
            return
        }


        if( Math.sign(distance)  < 0 ) {
            this.opponent.moveDown(state.context.elapsedTimeMs)
        } else {
            this.opponent.moveUp(state.context.elapsedTimeMs)
        }

    }

    public render() {
        this.update()

        this.player.render()
        this.opponent.render()
        this.scoreParticles.map(particle => particle.draw())
        this.ball.render()

    }
}
