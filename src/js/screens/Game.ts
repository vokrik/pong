import Paddle from "../gameObjects/Paddle";
import {Actor, SnapshotFrom} from "xstate";
import {gamesState} from "../state";
import Ball from "../gameObjects/Ball";
import {Vector} from "vector2d";
import {Bounds, BOUNDS_TYPE, SIDE} from "../gameObjects/Bounds";
import {
    GAME_BALL_SPEED,
    OPPONENT_IDLE_INCORRECTNESS,
    PADDLE_DISTANCE_FROM_SIDE_PERCENT,
    PADDLE_HEIGHT_PERCENT,
    PADDLE_WIDTH_PERCENT
} from "../constants";
import Score from "../gameObjects/Score";
import CameraShakeEffect from "../effects/CameraShakeEffect";
import {Point} from "../sharedTypes";
import {Screen} from "./Screen";
import Particle from "../gameObjects/Particle";
import CanvasAnalyzer from "../CanvasAnalyzer";


export default class Game extends Screen{

    private player: Paddle
    private opponent: Paddle
    public ball: Ball
    private score: Score
    private boardBounds
    private cameraShakeEffect


    constructor(width: number, height: number, actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
        super("Game screen", width, height, actor, ctx)


        const paddleWidth = this.width * PADDLE_WIDTH_PERCENT
        const paddleHeight = this.height * PADDLE_HEIGHT_PERCENT
        const xPadding = this.width * PADDLE_DISTANCE_FROM_SIDE_PERCENT
        const yPosition = height / 2 - paddleHeight / 2


        this.boardBounds = new Bounds({
            tl: {x: 0, y: 0},
            tr: {x: width, y: 0},
            bl: {x: 0, y: height},
            br: {x: width, y: height},
        }, BOUNDS_TYPE.INNER)

        this.player = new Paddle({
            x: xPadding,
            y: yPosition
        }, SIDE.RIGHT, paddleWidth, paddleHeight, this.ctx)

        this.opponent = new Paddle({
                x: width - xPadding - paddleWidth,
                y: yPosition
            },
            SIDE.LEFT, paddleWidth, paddleHeight,
            this.ctx
        )

        this.ball = new Ball(this.width, this.height ,GAME_BALL_SPEED, this.ctx)

        this.ball.start({
            x: width / 2,
            y: height / 2
        }, new Vector(-10, 0))

        this.score = new Score(this.width, this.height, this.actor, this.ctx)
        this.cameraShakeEffect = new CameraShakeEffect(this.width, this.height, this.ctx)
    }

    private movePlayer(state: SnapshotFrom<typeof gamesState>) {
        if (state.matches({"Game screen": {"Idle":{Player: "Moving up"}}})) {
            this.player.moveUp(state.context.elapsedTimeMs)
        }

        if (state.matches({"Game screen": {"Idle":{Player: "Moving down"}}})) {
            this.player.moveDown(state.context.elapsedTimeMs)
        }
    }


    protected resolveCollisions() {
        this.resolvePaddleCollisionsWithBounds()
        this.resolveBallCollisions()
    }

    private resolvePaddleCollisionsWithBounds() {
        let playerBounds = this.player.getBounds()
        let opponentBounds = this.opponent.getBounds()


        const playersCollisionWithBounds = this.boardBounds.getBoxCollision({pointA: playerBounds.box.tr, pointB:playerBounds.box.br})
        if (playersCollisionWithBounds) {
            playersCollisionWithBounds.side === SIDE.TOP? this.player.moveToVerticalPosition(0) :   this.player.moveToVerticalPosition(this.height, false)
        }

        const opponentCollisionWithBound = this.boardBounds.getBoxCollision({pointA: opponentBounds.box.tr, pointB:opponentBounds.box.br})
        if (opponentCollisionWithBound) {
            opponentCollisionWithBound.side === SIDE.TOP? this.opponent.moveToVerticalPosition(0) :   this.opponent.moveToVerticalPosition(this.height, false)
        }
    }

    private resolveBallCollisions() {
        let ballTraveledCollisionLine = this.ball.getTraveledCollisionLine()
        if(!ballTraveledCollisionLine){
            return
        }

        this.resolveBallCollisionsWithPaddle(this.player)
        this.resolveBallCollisionsWithPaddle(this.opponent)
        this.resolveBallCollisionWithBounds()
        this.score.setCollisionPoint({
            x: this.ball.position.x,
            y: this.ball.position.y,
            radius: this.ball.radius
        })
    }

    private resolveBallCollisionsWithPaddle(paddle: Paddle) {
        const paddleBounds = paddle.getBounds()
        const ballTraveledCollisionLine = this.ball.getTraveledCollisionLine()
        const collisionWithPaddle = paddleBounds.getBoxCollision(ballTraveledCollisionLine)

        if (collisionWithPaddle && collisionWithPaddle.side === paddle.activeSide) {
            const newPosition = collisionWithPaddle.collisionPoint
            newPosition.x= collisionWithPaddle.side === SIDE.RIGHT ? newPosition.x + this.ball.radius : newPosition.x - this.ball.radius

            this.ball.setPosition(newPosition)
            this.ball.setDirection(paddleBounds.getSideNormal(paddle.activeSide)
                .rotate(paddle.getNormalRotationAtPoint(collisionWithPaddle.collisionPoint)))
        }
    }

    private resolveBallCollisionWithBounds(){
        const ballTraveledCollisionLine = this.ball.getTraveledCollisionLine()

        const collisionWithBounds = this.boardBounds.getBoxCollision(ballTraveledCollisionLine)

        if(!collisionWithBounds) {
            return
        }

        this.ball.bounce(collisionWithBounds.collisionPoint, this.boardBounds.getSideNormal(collisionWithBounds.side))
        if ([SIDE.LEFT, SIDE.RIGHT].includes(collisionWithBounds.side) ) {
            this.resolveSideWallHit(collisionWithBounds.collisionPoint, collisionWithBounds.side === SIDE.LEFT)
        }

    }

    protected resolveSideWallHit(collisionPoint: Point, isLeftWall: boolean) {
        isLeftWall ? this.actor.send({type:"Opponent Score"}) :  this.actor.send({type:"Player Score"})
        this.cameraShakeEffect.startShake(5)
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

    }

    protected idleUpdate() {
        const state = this.actor.getSnapshot()
        this.movePlayer(state)
        this.moveOpponent(state)
        this.ball.update(state.context.elapsedTimeMs)
        this.resolveCollisions()
        this.score.update()
    }


    protected getTransitionParticles(): Array<Particle> {
        return CanvasAnalyzer.convertCanvasToParticles(this.width, this.height, () => {
            this.player.render()
            this.opponent.render()
            this.score.render()
        }, this.ctx)
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

    public idleRender() {
        this.update()
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.width, this.height)
        this.player.render()
        this.opponent.render()
        this.ball.render()
        this.score.render()
        this.cameraShakeEffect.use()
    }



}
