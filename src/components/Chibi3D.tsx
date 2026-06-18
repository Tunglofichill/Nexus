'use client'

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import Chibi2D from './Chibi2D'

/* ──────────────────────────────────────────────────
   APPROACH: "Hidden DOM Capture"
   1. Render the full Chibi2D (transparentBody) in a hidden <div>
   2. Capture the rendered <svg> element via XMLSerializer
   3. Convert SVG → Image → Canvas → THREE.CanvasTexture
   4. Map texture onto a flat plane in front of the 3D capsule
   ────────────────────────────────────────────────── */

/* ─── Color helpers ─── */
function adjustColor(hex: string, amt: number) {
  return '#' + hex.replace(/^#/, '').replace(/../g, c =>
    ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amt)).toString(16)).substr(-2)
  )
}

function outlineColor(hex: string) {
  const c = new THREE.Color(hex)
  c.lerp(new THREE.Color(0x000000), 0.55)
  c.lerp(new THREE.Color(0x1e1b4b), 0.12)
  return c
}

/* ─── Toon gradient map ─── */
let _gradMap: THREE.Texture | null = null
function getGradientMap() {
  if (_gradMap) return _gradMap
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = 4; c.height = 1
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#777'; ctx.fillRect(0, 0, 2, 1)
  ctx.fillStyle = '#fff'; ctx.fillRect(2, 0, 2, 1)
  const t = new THREE.CanvasTexture(c)
  t.minFilter = THREE.NearestFilter
  t.magFilter = THREE.NearestFilter
  _gradMap = t
  return t
}

/* ─── Outlined hemisphere ─── */
function OHemi({ pos, r, col, flip }: {
  pos: [number, number, number]; r: number; col: string; flip?: boolean
}) {
  const phiStart = flip ? Math.PI / 2 : 0
  const gm = getGradientMap()
  return (
    <group position={pos}>
      <mesh scale={1.04}>
        <sphereGeometry args={[r, 48, 24, 0, Math.PI * 2, phiStart, Math.PI / 2]} />
        <meshBasicMaterial color={outlineColor(col)} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[r, 48, 24, 0, Math.PI * 2, phiStart, Math.PI / 2]} />
        {gm ? <meshToonMaterial color={col} gradientMap={gm} /> : <meshStandardMaterial color={col} />}
      </mesh>
    </group>
  )
}

/* ─── Outlined cylinder ─── */
function OCyl({ pos, r, h, col }: {
  pos: [number, number, number]; r: number; h: number; col: string
}) {
  const gm = getGradientMap()
  return (
    <group position={pos}>
      <mesh scale={1.04}>
        <cylinderGeometry args={[r, r, h, 48, 1, true]} />
        <meshBasicMaterial color={outlineColor(col)} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[r, r, h, 48, 1, true]} />
        {gm ? <meshToonMaterial color={col} gradientMap={gm} /> : <meshStandardMaterial color={col} />}
      </mesh>
    </group>
  )
}

/* ─── Hook: capture hidden SVG → THREE.CanvasTexture ─── */
function useCapturedTexture(
  hiddenRef: React.RefObject<HTMLDivElement | null>,
  deps: any[]
) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    // wait a tick for the hidden SVG to render
    const timer = setTimeout(() => {
      if (!hiddenRef.current) return
      const svg = hiddenRef.current.querySelector('svg')
      if (!svg) return
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svg)
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 680
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, 512, 680)
        }
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
        setTexture(prev => {
          if (prev) prev.dispose()
          return tex
        })
        URL.revokeObjectURL(url)
      }
      img.onerror = () => URL.revokeObjectURL(url)
      img.src = url
    }, 150)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return texture
}

/* ─── Props ─── */
interface Chibi3DProps {
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

/* ─── Inner 3D Scene ─── */
function CapsuleScene({
  skinColor, hairColor, clothesColor, faceTexture,
}: {
  skinColor: string; hairColor: string; clothesColor: string
  faceTexture: THREE.CanvasTexture | null
}) {
  const groupRef = useRef<THREE.Group>(null)
  const clothesDark = useMemo(() => adjustColor(clothesColor, -25), [clothesColor])

  // Gentle idle sway
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.03
    }
  })

  // Capsule proportions — small pill
  const R = 0.25
  const H = 0.5 // cylinder segment height

  return (
    <group ref={groupRef}>
      {/* Hair (top hemisphere) */}
      <OHemi pos={[0, H / 2, 0]} r={R} col={hairColor} />

      {/* Skin (upper cylinder) */}
      <OCyl pos={[0, H / 4, 0]} r={R} h={H / 2} col={skinColor} />

      {/* Clothes (lower cylinder) */}
      <OCyl pos={[0, -H / 4, 0]} r={R} h={H / 2} col={clothesColor} />

      {/* Clothes bottom (bottom hemisphere) */}
      <OHemi pos={[0, -H / 2, 0]} r={R} col={clothesDark} flip />

      {/* Face decal — flat plane textured from the captured SVG */}
      {faceTexture && (
        <mesh position={[0, 0.04, R + 0.005]}>
          <planeGeometry args={[R * 2, R * 3.2]} />
          <meshBasicMaterial
            map={faceTexture}
            transparent
            alphaTest={0.02}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
      )}
    </group>
  )
}

/* ─── Exported Reusable 3D Model ─── */
export function ChibiModel(props: Chibi3DProps) {
  const hiddenRef = useRef<HTMLDivElement>(null)

  const faceTexture = useCapturedTexture(hiddenRef, [
    props.eyesId, props.eyesColor,
    props.mouthId,
    props.accessoryId, props.accessoryColor,
    props.decalsId, props.decalsColor,
    props.skinColor, props.hairColor, props.clothesColor,
  ])

  return (
    <group>
      {/* Hidden Chibi2D renderer via Html — never visible, only used for SVG capture */}
      <Html style={{ opacity: 0, pointerEvents: 'none', position: 'absolute', zIndex: -100 }} center transform={false}>
        <div ref={hiddenRef} style={{ width: 200, height: 280, overflow: 'hidden' }}>
          <Chibi2D
            skinColor={props.skinColor}
            hairColor={props.hairColor}
            clothesColor={props.clothesColor}
            eyesId={props.eyesId}
            eyesColor={props.eyesColor}
            mouthId={props.mouthId}
            accessoryId={props.accessoryId}
            accessoryColor={props.accessoryColor}
            decalsId={props.decalsId}
            decalsColor={props.decalsColor}
            transparentBody={true}
          />
        </div>
      </Html>

      <CapsuleScene
        skinColor={props.skinColor}
        hairColor={props.hairColor}
        clothesColor={props.clothesColor}
        faceTexture={faceTexture}
      />
    </group>
  )
}

/* ─── Exported Wrapper Component for Standalone Canvas ─── */
export default function Chibi3D(props: Chibi3DProps) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 28 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 5]} intensity={1.2} />
        <pointLight position={[-4, -3, -4]} intensity={0.3} color="#c7d2fe" />

        <Environment preset="city" />

        <ChibiModel {...props} />

        <ContactShadows position={[0, -0.7, 0]} opacity={0.35} scale={2} blur={2.5} far={1.2} />

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={2}
          maxDistance={5}
        />
      </Canvas>
    </div>
  )
}