'use client'
import React, { useRef, useState, useCallback } from 'react'
import Chibi2D from './Chibi2D'

/**
 * Chibi2.5D — wraps the full Chibi2D SVG with CSS 3D perspective transforms.
 * Nothing is removed from the body; we just add depth via rotateX/Y on mouse move.
 */

interface Chibi25DProps {
  skinColor: string
  hairColor: string
  clothesColor: string
  bodyId?: string
  eyesId?: string
  eyesColor?: string
  mouthId?: string
  hairId?: string
  clothesId?: string
  accessoryId?: string
  accessoryColor?: string
  bottomsId?: string
  bottomsColor?: string
  decalsId?: string
  decalsColor?: string
  stageId?: string
  className?: string
}

export default function Chibi25D(props: Chibi25DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    // Normalize to -1..1
    const nx = (e.clientX - cx) / (rect.width / 2)
    const ny = (e.clientY - cy) / (rect.height / 2)
    // Max 15° rotation
    setRotate({ x: -ny * 12, y: nx * 15 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 })
    setIsHovering(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="w-full h-full flex items-center justify-center"
      style={{ perspective: '800px' }}
    >
      <div
        className="relative"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: isHovering ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Drop shadow layer — sits behind the SVG */}
        <div
          className="absolute inset-0 rounded-[50px] blur-xl opacity-30 bg-black/40 pointer-events-none"
          style={{
            transform: `translateZ(-20px) translateX(${rotate.y * 0.8}px) translateY(${-rotate.x * 0.5 + 8}px)`,
            transition: isHovering ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
          }}
        />

        {/* The actual full Chibi2D — nothing removed */}
        <div style={{ transform: 'translateZ(0px)' }}>
          <Chibi2D {...props} />
        </div>

        {/* Subtle highlight reflection on top — gives a glossy 3D feel */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[50px] overflow-hidden"
          style={{ transform: 'translateZ(1px)' }}
        >
          <div
            className="absolute w-full h-full"
            style={{
              background: `radial-gradient(circle at ${50 + rotate.y * 2}% ${40 + rotate.x * 1.5}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
