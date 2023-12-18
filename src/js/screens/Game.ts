import Paddle from "../gameObjects/Paddle";
import {Actor, SnapshotFrom} from "xstate";
import {gamesState} from "../state";
import Ball from "../gameObjects/Ball";
import {Vector} from "vector2d";
import {Point} from "../gameObjects/Point";
import CollisionEffect from "../effects/CollisionEffect";
import CanvasAnalyzer from "../CanvasAnalyzer";
import Particle from "../gameObjects/Particle";
import {Bounds, BOUNDS_TYPE, SIDE} from "../gameObjects/Bounds";
import {
    FONT_SIZE_TITLE_TO_HEIGHT_RATIO, GAME_BALL_SPEED, OPPONENT_IDLE_INCORRECTNESS,
    PADDLE_DISTANCE_FROM_SIDE_PERCENT,
    PADDLE_HEIGHT_PERCENT,
    PADDLE_WIDTH_PERCENT
} from "../constants";




export default class Game {

    private ctx: CanvasRenderingContext2D
    private scoreParticles: Array<Particle>
    private ballParticles: Array<Particle>
    private player: Paddle
    private opponent: Paddle
    public ball: Ball
    private width: number
    private height: number
    private boardBounds
    private actor: Actor<typeof gamesState>
    private cameraShakeFrames = 0
    private cameraShakeIntensity = 0


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

        this.ball = new Ball(this.width, this.height ,GAME_BALL_SPEED, this.ctx)
        this.ball.start({
            x: width / 2,
            y: height / 2
        }, new Vector(-10, 0))
        this.ballParticles = []
        this.convertScoreToParticles()

    }

    private convertScoreToParticles() {
        const score = this.actor.getSnapshot().context.score
        this.scoreParticles = CanvasAnalyzer.convertCanvasToParticles(this.width, this.height, () => {
            const scoreSize = Math.ceil(this.height * FONT_SIZE_TITLE_TO_HEIGHT_RATIO)

            this.ctx.fillStyle = "white"
            this.ctx.font = `${scoreSize}px Silkscreen`
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.clearRect(0, 0, this.width, this.height)
            this.ctx.fillText(`${score.player} : ${score.opponent}`, this.width / 2, this.height / 2)
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
    private convertBallToParticles() {
        this.ballParticles = CanvasAnalyzer.convertCanvasToParticles(this.width, this.height, () => {
            this.ball.render()
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

        this.ball.bounce(collisionWithBounds.collisionPoint, this.boardBounds.getSideNormal(collisionWithBounds.side))
        if ([SIDE.LEFT, SIDE.RIGHT].includes(collisionWithBounds.side) ) {
            this.resolveSideWallHit(collisionWithBounds.collisionPoint, collisionWithBounds.side === SIDE.LEFT)
        }

        if(this.ballParticles.length) {
            this.ballParticles.forEach(particle => {
                this.boardBounds.getBoxCollision(ballTraveledCollisionLine)
            })
        }

    }


    protected resolveSideWallHit(collisionPoint: Point, isLeftWall: boolean) {
        isLeftWall ? this.actor.send({type:"Opponent Score"}) :  this.actor.send({type:"Player Score"})
        this.shakeCamera(5)
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
            radius: this.ball.radius
        })
        this.scoreParticles.forEach(particle => particle.update(state.context.elapsedTimeMs))
        this.ballParticles.forEach(particle => particle.update(state.context.elapsedTimeMs))
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
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.width, this.height)

        this.player.render()
        this.opponent.render()
        this.scoreParticles.map(particle => particle.draw())
        this.ballParticles.map(particle => particle.draw())
        this.ball.render()
        this.cameraShake()
    }

    private shakeCamera(intensity: number) {
        this.cameraShakeFrames = 6
        this.cameraShakeIntensity = intensity
    }
    public cameraShake() {
        if(this.cameraShakeFrames <= 0) {
            return
        }
        const dx = Math.round( Math.cos((Math.PI / 6) * this.cameraShakeFrames) * this.cameraShakeIntensity)
        const originalCanvasData =  this.ctx.getImageData(0, 0, this.width, this.height )
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.width, this.height)
        this.ctx.putImageData(originalCanvasData, dx, 0)
        this.cameraShakeFrames -= 1
    }

}
