"use client"

import type React from "react"
import { useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface Position {
  x: number
  y: number
}

interface Point {
  position: Position
  time: number
  drift: Position
  age: number
  direction: Position
}

interface SVGFollowerProps {
  width?: string | number
  height?: string | number
  colors?: string[]
  removeDelay?: number
  className?: string
}

class Follower {
  private points: Point[] = []
  private line: SVGPathElement
  private color: string
  private stage: SVGSVGElement

  constructor(stage: SVGSVGElement, color: string) {
    this.stage = stage
    this.color = color
    this.line = document.createElementNS("http://www.w3.org/2000/svg", "path")
    this.line.style.fill = "none" // Path should not be filled
    this.line.style.stroke = color
    this.line.style.strokeWidth = "1"
    this.line.style.pointerEvents = "none"
    this.stage.appendChild(this.line)
  }

  private getDrift(): number {
    return (Math.random() - 0.5) * 3
  }

  public add(position: Position) {
    const direction = { x: 0, y: 0 }
    if (this.points[0]) {
      direction.x = (position.x - this.points[0].position.x) * 0.25
      direction.y = (position.y - this.points[0].position.y) * 0.25
    }

    const point: Point = {
      position: position,
      time: Date.now(),
      drift: {
        x: this.getDrift() + direction.x / 2,
        y: this.getDrift() + direction.y / 2,
      },
      age: 0,
      direction: direction,
    }

    const shapeChance = Math.random()
    const chance = 0.05
    if (shapeChance < chance) this.makeCircle(point)
    else if (shapeChance < chance * 2) this.makeSquare(point)
    else if (shapeChance < chance * 3) this.makeTriangle(point)

    this.points.unshift(point)
  }

  private createLine(points: Point[]): string {
    if (points.length === 0) return ""
    const path: string[] = ["M"]

    let forward = true
    let i = 0

    while (i >= 0) {
      const point = points[i]
      const offsetX = point.direction.x * ((i - points.length) / points.length) * 0.6
      const offsetY = point.direction.y * ((i - points.length) / points.length) * 0.6
      const x = point.position.x + (forward ? offsetY : -offsetY)
      const y = point.position.y + (forward ? offsetX : -offsetX)

      path.push(String(x + point.drift.x * point.age))
      path.push(String(y + point.drift.y * point.age))

      i += forward ? 1 : -1
      if (i === points.length) {
        i--
        forward = false
      }
    }

    return path.join(" ")
  }

  public update(removeDelay: number) {
    const now = Date.now()
    
    // Increment age for all points exactly once per frame
    this.points.forEach(p => {
      p.age += 0.2
    })

    // Remove all old points
    while (this.points.length > 0) {
      const last = this.points[this.points.length - 1]
      if (last.time < now - removeDelay) {
        this.points.pop()
      } else {
        break
      }
    }
    
    this.line.setAttribute("d", this.createLine(this.points))
  }

  public destroy() {
    if (this.stage.contains(this.line)) {
      this.stage.removeChild(this.line)
    }
  }

  private makeCircle(point: Point) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    const radius = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 0.8
    circle.setAttribute("r", String(radius))
    circle.style.fill = this.color
    circle.style.pointerEvents = "none"
    circle.setAttribute("cx", "0")
    circle.setAttribute("cy", "0")
    this.moveShape(circle, point)
  }

  private makeSquare(point: Point) {
    const size = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.2
    const square = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    square.setAttribute("width", String(size))
    square.setAttribute("height", String(size))
    square.style.fill = this.color
    square.style.pointerEvents = "none"
    this.moveShape(square, point)
  }

  private makeTriangle(point: Point) {
    const size = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.2
    const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
    triangle.setAttribute("points", `0,0 ${size},${size / 2} 0,${size}`)
    triangle.style.fill = this.color
    triangle.style.pointerEvents = "none"
    this.moveShape(triangle, point)
  }

  private moveShape(shape: SVGElement, point: Point) {
    this.stage.appendChild(shape)
    const driftX = point.position.x + point.direction.x * (Math.random() * 20) + point.drift.x * (Math.random() * 10)
    const driftY = point.position.y + point.direction.y * (Math.random() * 20) + point.drift.y * (Math.random() * 10)

    shape.style.transform = `translate(${point.position.x}px, ${point.position.y}px)`
    shape.style.transition = "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)"

    setTimeout(() => {
      shape.style.transform = `translate(${driftX}px, ${driftY}px) scale(0) rotate(${Math.random() * 360}deg)`
      setTimeout(() => {
        if (this.stage.contains(shape)) {
          this.stage.removeChild(shape)
        }
      }, 800)
    }, 20)
  }
}

export function SVGFollower({
  width = "100%",
  height = "100%",
  colors = ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.08)"],
  removeDelay = 400,
  className = "",
}: SVGFollowerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const followersRef = useRef<Follower[]>([])
  const animationRef = useRef<number>()

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const position: Position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }

      if (
        position.x >= 0 && 
        position.y >= 0 && 
        position.x <= rect.width && 
        position.y <= rect.height
      ) {
        followersRef.current.forEach((follower) => follower.add(position))
      }
    },
    [],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const touch = e.touches[0]
      const position: Position = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }

      if (
        position.x >= 0 && 
        position.y >= 0 && 
        position.x <= rect.width && 
        position.y <= rect.height
      ) {
        followersRef.current.forEach((follower) => follower.add(position))
      }
    },
    [],
  )

  const animate = useCallback(() => {
    followersRef.current.forEach((follower) => follower.update(removeDelay))
    animationRef.current = requestAnimationFrame(animate)
  }, [removeDelay])

  useEffect(() => {
    if (!svgRef.current) return
    
    // Clear any existing content in the SVG to prevent orphaned paths from hot reloads or Strict Mode
    svgRef.current.innerHTML = ""
    
    followersRef.current = colors.map((color) => new Follower(svgRef.current!, color))
    
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)
    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Important: Cleanup follower paths on unmount
      followersRef.current.forEach(f => f.destroy())
    }
  }, [colors, animate, handleMouseMove, handleTouchMove])

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none select-none overflow-hidden -z-1", className)}
      style={{ width, height }}
    >
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg" 
        className="absolute inset-0" 
      />
    </div>
  )
}

