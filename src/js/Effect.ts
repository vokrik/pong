const CELL_WIDTH = 50
const CELL_HEIGHT = 50

class Cell {
    private effect: Effect
    private x: number
    private y: number
    private positionX: number
    private positionY: number
    private speedX: number
    private speedY: number
    private image: CanvasImageSource
    private vx: number
    private vy: number
    private slideX: number
    private slideY: number
    private ease: number
    private friction: number
    private randomize: number


    constructor(x: number, y: number, index: number,  effect: Effect) {
        this.effect = effect
        this.x = x
        this.y = y
        this.vx = 0
        this.vy = 0
        this.slideX = 0
        this.slideY = 0
        this.ease = 0.1
        this.friction = 0.4
        this.positionX = this.effect.width * 0.5
        this.positionY = this.effect.height
        this.randomize = Math.random()* 20 + 2
        this.speedX = 0
        this.speedY = 0
        setTimeout( () => {
            this.start()
        },  index )
        this.image = document.getElementById('projectImage') as CanvasImageSource
    }

    private start() {
        this.speedX = (this.x - this.positionX) / this.randomize
        this.speedY = (this.y - this.positionY) / this.randomize
    }

    render() {
        if(Math.abs(this.speedX) > 0.01 || Math.abs(this.speedY) > 0.01) {
            // position
            this.speedX = (this.x - this.positionX) / this.randomize
            this.speedY = (this.y - this.positionY) / this.randomize
            this.positionX += this.speedX
            this.positionY += this.speedY
        }


        // crop
        if(this.effect.mouse.x !== null && this.effect.mouse.y !== null) {
            const dx =  this.effect.mouse.x - this.x
            const dy = this.effect.mouse.y - this.y
            const distance = Math.hypot(dx, dy)

            if(distance < this.effect.mouse.radius) {
                const angle = Math.atan2(dy, dx)
                const force =   distance / this.effect.mouse.radius * 2
                this.vx = force * Math.cos(angle)
                this.vy = force * Math.sin(angle)
            } else {
                this.vx = 0
                this.vy = 0
            }
        } else {
            this.vx = 0
            this.vy = 0
        }

        this.slideX += (this.vx *= this.friction)  - this.slideX * this.ease
        this.slideY += (this.vy *= this.friction)  - this.slideY * this.ease

        this.effect.ctx.drawImage(this.image, this.x + this.slideX, this.y + this.slideY, this.effect.cellWidth, this.effect.cellHeight ,this.positionX, this.positionY, this.effect.cellWidth, this.effect.cellHeight)
        // this.effect.ctx.strokeRect(this.positionX, this.positionY, this.effect.cellWidth, this.effect.cellHeight)
    }
}

export default class Effect {
    public ctx: CanvasRenderingContext2D
    public width: number
    public height: number
    public cellHeight: number
    public cellWidth: number
    private grid: Array<Cell>
    public mouse: {
        x?: number
        y?: number
        radius: number
    }
    constructor(width: number, height: number, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.width = width
        this.height = height
        this.cellWidth = this.width / CELL_WIDTH
        this.cellHeight = this.height / CELL_HEIGHT
        this.grid = []
        this.createGrid()
        this.mouse = {
            x: null,
            y: null,
            radius: 100
        }
        document.addEventListener('mousemove', e => {
            this.mouse.x = e.x
            this.mouse.y = e.y
        })
        document.addEventListener('mouseleave', e => {
            this.mouse.x = null
            this.mouse.y = null
        })
    }

    private createGrid() {
        let i = 0
        for (let y = 0; y < this.height; y += this.cellHeight) {
            for(let x = 0; x< this.width; x += this.cellWidth) {
                this.grid.push(new Cell(x, y, i++, this))
            }
        }
    }

    public render() {
        this.grid.forEach(it => it.render())
    }
}