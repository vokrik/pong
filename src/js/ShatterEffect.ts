import Particle from "./Particle";
import {SIDE} from "./Bounds";

export default class HorizontalWallShatter {


    static use(width: number, height: number, particles: Array<Particle>) {
        particles.map(particle => {

            const dx = 0 - particle.x

            particle.setVelocity(dx, 0)
        })
    }
}