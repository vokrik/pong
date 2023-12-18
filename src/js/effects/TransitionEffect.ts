import Particle from "../gameObjects/Particle";
import {Actor} from "xstate";
import {gamesState} from "../state";


export enum TransitionType {
    IN,
    OUT
}
export default class TransitionEffect {

    private ctx: CanvasRenderingContext2D
    private width: number
    private height: number
    private particles: Array<Particle>
    private actor

    constructor( width: number, height: number, actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
        this.width = width
        this.height = height
        this.actor = actor
        this.ctx = ctx
        this.particles = []

    }

    public startTransition(type: TransitionType, particles: Array<Particle>) {
        this.particles = particles
        type === TransitionType.IN ? this.startIn() : this.startOut()
    }
    private startIn() {
        const middleX = this.width / 2
        this.particles.forEach(particle => {
                particle.x = particle.targetPositionX > middleX? this.width : 0
                particle.y = Math.random() * this.height
            }
        )
    }

    private startOut() {
        const middleX = this.width / 2
        this.particles.forEach(particle => {
                particle.targetPositionX = particle.targetPositionX > middleX? this.width + 50 : -50
                particle.targetPositionY = Math.random() * this.height
            }
        )
    }


    public use() {
        const state = this.actor.getSnapshot()
        this.particles.forEach(particle =>{
            particle.vx = particle.vx * particle.friction + (particle.targetPositionX - particle.x) * particle.ease
            particle.vy = particle.vy * particle.friction + (particle.targetPositionY - particle.y) * particle.ease
        } )
    }


}