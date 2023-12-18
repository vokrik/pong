
const SPEED_MULTIPLIER = 0.07
export default class Particle {
    private ctx: CanvasRenderingContext2D
    public x: number
    public y: number
    public targetPositionX: number
    public targetPositionY: number
    public vx: number
    public vy: number

    public ease: number
    public friction: number
    private color
    private size: number

    constructor(x: number, y: number, size: number, color: string, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.color = color
        this.size = size

        this.x = x
        this.y = y
        this.targetPositionX = x
        this.targetPositionY = y
        this.vx = 0
        this.vy = 0

        this.ease = 0.05
        this.friction = Math.random() * 0.2 + 0.7
    }

    public setVelocity(vx: number, vy: number) {
        this.vx = vx
        this.vy = vy
    }
    public update(elapsedTimeMs: number) {
        this.x += this.vx * elapsedTimeMs * SPEED_MULTIPLIER
        this.y += this.vy * elapsedTimeMs * SPEED_MULTIPLIER
    }
    public draw() {
        this.ctx.fillStyle = this.color
        this.ctx.fillRect(this.x, this.y, this.size, this.size)
    }
}
