export type BoundingBox ={
    tl: Point,
    tr: Point,
    bl: Point,
    br: Point
}

export type Line = {
    pointA: Point
    pointB: Point
}

export type Point = { x: number, y: number }