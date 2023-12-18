import Particle from "./gameObjects/Particle";

const GAP = 3
export default class CanvasAnalyzer {

    static convertCanvasToParticles(width: number, height: number, renderCanvas: () => void, ctx: CanvasRenderingContext2D): Array<Particle> {
        const particles = []

        const originalCanvasData =  ctx.getImageData(0, 0, width, height )
        ctx.clearRect(0, 0, width, height)
        renderCanvas()
        const pixels = ctx.getImageData(0, 0, width, height ).data
        ctx.putImageData(originalCanvasData, 0, 0)

        for (let y = 0; y < height; y += GAP) {
            for (let x = 0; x < width; x += GAP) {
                const index = (y * width + x) * 4
                const r = pixels[index]
                const g = pixels[index + 1]
                const b = pixels[index + 2]
                const alpha = pixels[index + 3]
                if (alpha > 0) {
                    particles.push(new Particle(x, y, GAP, `rgb(${r},${g},${b})`, ctx))
                }
            }
        }
        return particles
    }
}