import Particle from "./Particle";

export default class CanvasAnalyzer {

    static convertCanvasToParticles(width: number, height: number, gap: number, renderCanvas: () => void, ctx: CanvasRenderingContext2D): Array<Particle> {
        const particles = []

        const originalCanvasData =  ctx.getImageData(0, 0, width, height )
        ctx.clearRect(0, 0, width, height)
        renderCanvas()
        const pixels = ctx.getImageData(0, 0, width, height ).data
        ctx.putImageData(originalCanvasData, 0, 0)

        for (let y = 0; y < height; y += gap) {
            for (let x = 0; x < width; x += gap) {
                const index = (y * width + x) * 4
                const r = pixels[index]
                const g = pixels[index + 1]
                const b = pixels[index + 2]
                const alpha = pixels[index + 3]
                if (alpha > 0) {
                    particles.push(new Particle(x, y, gap, `rgb(${r},${g},${b})`, ctx))
                }
            }
        }
        return particles
    }
}