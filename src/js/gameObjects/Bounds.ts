import {Vector} from "vector2d";
import {BoundingBox, Line, Point} from "../sharedTypes";



export enum SIDE {
    LEFT   ,
    RIGHT,
    BOTTOM,
    TOP
}

export enum BOUNDS_TYPE {
    INNER,
    OUTER
}

type BoxCollision = {
    collisionPoint: Point
    side: SIDE
}

export class Bounds {
    public box
    private type: BOUNDS_TYPE
    constructor(box: BoundingBox, type: BOUNDS_TYPE) {
        this.box = box
        this.type = type
    }

    getBoxCollision(line: Line): BoxCollision {

       const boxCollisions: Array<BoxCollision> = [
           {
              collisionPoint: this.intersectionOf2Lines(line, {
                  pointA: this.box.tl,
                  pointB: this.box.bl
              }),
               side: SIDE.LEFT
           }
           ,
           {
               collisionPoint: this.intersectionOf2Lines(line, {
                   pointA: this.box.tr,
                   pointB: this.box.br
               }),
               side: SIDE.RIGHT
           }
          ,
           {
               collisionPoint: this.intersectionOf2Lines(line, {
                   pointA: this.box.tl,
                   pointB: this.box.tr
               }),
               side: SIDE.TOP
           },
           {
               collisionPoint: this.intersectionOf2Lines(line, {
                   pointA: this.box.bl,
                   pointB: this.box.br
               }),
               side: SIDE.BOTTOM
           },


       ].filter(boxCollision => !!boxCollision.collisionPoint)

        if(!boxCollisions.length) {
            return null
        }

        boxCollisions.sort((collisionA,collisionB) => {
           const dax = line.pointA.x - collisionA.collisionPoint.x
           const day = line.pointA.y - collisionA.collisionPoint.y
            const dbx = line.pointA.x - collisionB.collisionPoint.x
            const dby = line.pointA.y - collisionB.collisionPoint.y

            const distanceA = dax * dax + day* day
            const distanceB = dbx * dbx + dby* dby

            return distanceB - distanceA
        })

        return boxCollisions[0]
    }

    private intersectionOf2Lines(lineA: Line, lineB: Line) {

        if ((lineA.pointA.x === lineA.pointB.x && lineA.pointA.y === lineA.pointB.y) || (lineB.pointA.x === lineB.pointB.x && lineB.pointA.y === lineB.pointB.y)) {
            return null
        }

        const denominator = ((lineB.pointB.y - lineB.pointA.y) * (lineA.pointB.x - lineA.pointA.x) - (lineB.pointB.x - lineB.pointA.x) * (lineA.pointB.y - lineA.pointA.y))

        // Lines are parallel
        if (denominator === 0) {
            return null
        }

        let ua = ((lineB.pointB.x - lineB.pointA.x) * (lineA.pointA.y - lineB.pointA.y) - (lineB.pointB.y - lineB.pointA.y) * (lineA.pointA.x - lineB.pointA.x)) / denominator
        let ub = ((lineA.pointB.x - lineA.pointA.x) * (lineA.pointA.y - lineB.pointA.y) - (lineA.pointB.y - lineA.pointA.y) * (lineA.pointA.x - lineB.pointA.x)) / denominator

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return null
        }

        let x = lineA.pointA.x + ua * (lineA.pointB.x - lineA.pointA.x)
        let y = lineA.pointA.y + ua * (lineA.pointB.y - lineA.pointA.y)

        return {x, y}
    }


    public getSideNormal(side: SIDE): Vector {
        const typeSign = BOUNDS_TYPE.INNER? 1 : -1
        switch (side){
            case SIDE.LEFT:
                return new Vector(typeSign * 1,0)
            case SIDE.RIGHT:
                return new Vector(typeSign *-1, 0)
            case SIDE.TOP:
                return new Vector(0, typeSign *1)
            case SIDE.BOTTOM:
                return new Vector(0, typeSign *-1)
        }
    }
}