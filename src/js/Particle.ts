
export default class Particle {
    private ctx: CanvasRenderingContext2D
    public x: number
    public y: number
    private targetPositionX: number
    private targetPositionY: number
    private vx: number
    private vy: number

    private ease: number
    private friction: number
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

        this.ease = 0.09
        this.friction = Math.random() * 0.1 + 0.4
    }

    public setVelocity(vx: number, vy: number) {
        this.vx = vx
        this.vy = vy
    }
    public update() {
        this.x += (this.vx *= this.friction) + (this.targetPositionX - this.x) * this.ease
        this.y += (this.vy *= this.friction) + (this.targetPositionY - this.y) * this.ease
    }
    public draw() {
        this.ctx.fillStyle = this.color
        this.ctx.fillRect(this.x, this.y, this.size, this.size)
    }
}
