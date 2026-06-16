'use client'
import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import * as THREE from 'three'
import { ToneMappingMode } from 'postprocessing'

// ────────────────────────────────────────────────────────────────
// PLAY TOGETHER 3H PROPORTIONS + AZUR LANE "PREMIUM" ANIME SHADING
// ────────────────────────────────────────────────────────────────

// 1. Generate perfect hard-step Anime Gradient Map for Toon Shader
const createGradientMap = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 1
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = '#666666' // Shadow tone
    context.fillRect(0, 0, 2, 1)
    context.fillStyle = '#ffffff' // Highlight tone
    context.fillRect(2, 0, 2, 1)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  return texture
}

// Global gradient map (lazy loaded)
let toonGradientMap: THREE.Texture | null = null

// Helper to get dark outline color from base color
const getOutlineColor = (hex: string) => {
  const c = new THREE.Color(hex)
  c.lerp(new THREE.Color(0x000000), 0.6) // Darken by 60%
  // add a tiny bit of blue/purple tint for anime style shadows
  c.lerp(new THREE.Color(0x1e1b4b), 0.15)
  return c.getStyle()
}

const Toon = ({
  color, opacity = 1, transparent = false, emissive = '#000', emissiveIntensity = 0,
}: { color: string; opacity?: number; transparent?: boolean; emissive?: string; emissiveIntensity?: number }) => {
  if (!toonGradientMap && typeof window !== 'undefined') toonGradientMap = createGradientMap()
  return (
    <meshToonMaterial 
      color={color} 
      gradientMap={toonGradientMap}
      opacity={opacity} 
      transparent={transparent}
      emissive={emissive} 
      emissiveIntensity={emissiveIntensity} 
    />
  )
}

const OSphere = ({ pos, r, col, sc = 1.054 }: { pos: [number,number,number]; r: number; col: string; sc?: number }) => (
  <group position={pos}>
    <mesh scale={sc}><sphereGeometry args={[r, 28, 28]} /><meshBasicMaterial color={getOutlineColor(col)} side={THREE.BackSide} /></mesh>
    <mesh><sphereGeometry args={[r, 28, 28]} /><Toon color={col} /></mesh>
  </group>
)

const OCapsule = ({
  pos, rot = [0,0,0] as [number,number,number], radius, height, col, sc = 1.054,
}: { pos: [number,number,number]; rot?: [number,number,number]; radius: number; height: number; col: string; sc?: number }) => (
  <group position={pos} rotation={rot}>
    <mesh scale={sc}><capsuleGeometry args={[radius, height, 10, 20]} /><meshBasicMaterial color={getOutlineColor(col)} side={THREE.BackSide} /></mesh>
    <mesh><capsuleGeometry args={[radius, height, 10, 20]} /><Toon color={col} /></mesh>
  </group>
)

// Inner model component handles animation via useFrame
function ChibiModel({
  skinColor, hairColor, clothesColor,
  bodyId = 'body_standard', eyesId = 'eyes_normal', eyesColor = '#3b82f6', mouthId = 'mouth_smile',
  hairId = 'hair_short', clothesId = 'clothes_casual', accessoryId = 'acc_none', accessoryColor = '#a78bfa',
  bottomsId = 'bottom_jeans', bottomsColor = '#1e40af', decalsId = 'decal_none', decalsColor = '#ef4444'
}: any) {
  
  let bScale: [number,number,number] = [1,1,1]
  if (bodyId === 'body_chubby')   bScale = [1.13, 0.95, 1.13]
  if (bodyId === 'body_tall')     bScale = [0.93, 1.16, 0.93]
  if (bodyId === 'body_muscular') bScale = [1.2, 1.04, 1.07]

  const EZ = 0.44   // eye/face feature z
  const NZ = 0.455  // nose z
  const BZ = 0.42   // blush z

  // --- Animation Refs ---
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const hairRef = useRef<THREE.Group>(null)
  const eyesRef = useRef<THREE.Group>(null)
  
  // Blinking logic state
  const [blinkState, setBlinkState] = useState({ isBlinking: false, timer: 0, nextBlink: Math.random() * 3 + 2 })

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    
    // 1. Idle breathing (Body squish & head bob)
    if (bodyRef.current) {
      const breath = Math.sin(t * 2) * 0.015
      bodyRef.current.scale.set(1 + breath*0.5, 1 - breath, 1 + breath*0.5)
      bodyRef.current.position.y = 0.44 - breath * 0.5
    }
    
    // Head slightly follows the breathing, with a delayed offset
    if (headRef.current) {
      const bob = Math.sin(t * 2 - 0.5) * 0.01
      headRef.current.position.y = 1.35 + bob
      headRef.current.rotation.x = Math.sin(t * 1.5) * 0.02
      headRef.current.rotation.z = Math.cos(t * 1.2) * 0.02
    }

    // Hair subtle wind sway
    if (hairRef.current) {
      hairRef.current.rotation.x = Math.sin(t * 2.5) * 0.03
      hairRef.current.rotation.z = Math.cos(t * 3) * 0.015
    }

    // Blinking logic (only for normal eyes)
    if (eyesId === 'eyes_normal' || eyesId === 'eyes_big' || eyesId === 'eyes_star' || eyesId === 'eyes_heart') {
      let newState = { ...blinkState }
      newState.timer += delta
      if (!newState.isBlinking && newState.timer > newState.nextBlink) {
        newState.isBlinking = true
        newState.timer = 0
      } else if (newState.isBlinking && newState.timer > 0.15) { // Blink duration 0.15s
        newState.isBlinking = false
        newState.timer = 0
        newState.nextBlink = Math.random() * 4 + 2 // Next blink in 2-6s
      }
      setBlinkState(newState)

      if (eyesRef.current) {
        // Squish Y scale to 0.1 when blinking
        eyesRef.current.scale.y = THREE.MathUtils.lerp(eyesRef.current.scale.y, newState.isBlinking ? 0.1 : 1, 0.4)
      }
    }
  })

  const renderAnimeEye = (side: -1|1, big: boolean) => {
    const W  = big ? 0.175 : 0.145
    const H  = big ? 0.21  : 0.18
    const IR = big ? 0.066 : 0.054
    const PR = big ? 0.039 : 0.032
    const x  = side * 0.175
    return (
      <group key={side} position={[x, 0.07, EZ]}>
        <mesh position={[0, 0, -0.001]}><planeGeometry args={[W + 0.036, H + 0.016]} /><Toon color="#1a1a1a" /></mesh>
        <mesh position={[0, -0.012, 0]}><planeGeometry args={[W, H * 0.72]} /><Toon color="#ffffff" /></mesh>
        <mesh position={[0, -0.016, 0.001]}><circleGeometry args={[IR, 20]} /><Toon color={eyesColor} /></mesh>
        <mesh position={[0, -0.02, 0.002]}><circleGeometry args={[PR, 16]} /><Toon color="#09090b" /></mesh>
        <mesh position={[side === -1 ? -0.025 : 0.025, 0.013, 0.003]}><circleGeometry args={[0.022, 12]} /><Toon color="#ffffff" /></mesh>
        <mesh position={[side === -1 ? 0.015 : -0.015, -0.013, 0.003]}><circleGeometry args={[0.012, 10]} /><Toon color="#ffffff" /></mesh>
        <mesh position={[0, H * 0.35, 0.003]}><planeGeometry args={[W + 0.036, 0.03]} /><Toon color="#1a1a1a" /></mesh>
      </group>
    )
  }

  return (
    <group scale={bScale}>
      {/* ═══════════ B O D Y ═══════════ */}
      <group>
        {/* Torso animated ref */}
        <group ref={bodyRef} position={[0, 0.44, 0]}>
          <mesh scale={1.055}>
            <capsuleGeometry args={[0.27, 0.26, 10, 20]} />
            <meshBasicMaterial color={getOutlineColor(clothesColor)} side={THREE.BackSide} />
          </mesh>
          <mesh>
            <capsuleGeometry args={[0.27, 0.26, 10, 20]} />
            <Toon color={clothesColor} />
          </mesh>

          {/* Clothes details */}
          {clothesId === 'clothes_casual' && (
            <>
              <mesh position={[0, 0.25, 0]}><torusGeometry args={[0.11, 0.028, 10, 22]} /><Toon color="#f8fafc" /></mesh>
              <mesh position={[0.025, 0.06, 0.26]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.044, 0.044, 0.005, 16]} /><Toon color="#f8fafc" /></mesh>
            </>
          )}
          {clothesId === 'clothes_suit' && (
            <>
              <mesh position={[0, 0.05, 0.26]}><planeGeometry args={[0.19, 0.28]} /><Toon color="#f8fafc" /></mesh>
              <mesh position={[0, 0.04, 0.265]}><planeGeometry args={[0.036, 0.2]} /><Toon color="#ef4444" /></mesh>
              <mesh position={[0, 0.18, 0.265]}><planeGeometry args={[0.05, 0.036]} /><Toon color="#ef4444" /></mesh>
              <mesh position={[-0.09, 0.12, 0.265]} rotation={[0,0,-0.28]}><planeGeometry args={[0.044, 0.25]} /><Toon color={clothesColor} /></mesh>
              <mesh position={[0.09, 0.12, 0.265]} rotation={[0,0,0.28]}><planeGeometry args={[0.044, 0.25]} /><Toon color={clothesColor} /></mesh>
            </>
          )}
          {clothesId === 'clothes_hoodie' && (
            <>
              <mesh position={[0, 0.24, -0.14]} rotation={[-0.1,0,0]}><torusGeometry args={[0.2, 0.12, 10, 20]} /><Toon color={clothesColor} /></mesh>
              <mesh position={[0, -0.09, 0.25]}><planeGeometry args={[0.28, 0.1]} /><Toon color={clothesColor} /></mesh>
              <mesh position={[-0.04, -0.01, 0.26]}><cylinderGeometry args={[0.005, 0.005, 0.14, 6]} /><Toon color="#d4d4d4" /></mesh>
              <mesh position={[0.04, -0.01, 0.26]}><cylinderGeometry args={[0.005, 0.005, 0.14, 6]} /><Toon color="#d4d4d4" /></mesh>
            </>
          )}
          {clothesId === 'clothes_tech' && (
            <>
              <mesh position={[0, 0.05, 0.27]} rotation={[0,0,0.4]}><planeGeometry args={[0.5, 0.026]} /><Toon color="#111" /></mesh>
              <mesh position={[0, 0.05, 0.27]} rotation={[0,0,-0.4]}><planeGeometry args={[0.5, 0.026]} /><Toon color="#111" /></mesh>
              <mesh position={[0, -0.11, 0]}><cylinderGeometry args={[0.28, 0.28, 0.044, 22]} /><Toon color="#111" /></mesh>
            </>
          )}
          {clothesId === 'clothes_robe' && (
            <>
              <mesh position={[0, -0.22, 0]}><cylinderGeometry args={[0.27, 0.38, 0.26, 22]} /><Toon color={clothesColor} /></mesh>
              <mesh position={[0, -0.34, 0]}><cylinderGeometry args={[0.38, 0.38, 0.026, 22]} /><Toon color="#eab308" /></mesh>
            </>
          )}
          {clothesId === 'clothes_ninja' && (
            <mesh position={[0, 0.24, 0.07]} rotation={[0.1,0,0]}><torusGeometry args={[0.21, 0.09, 10, 20]} /><Toon color="#111" /></mesh>
          )}
          {clothesId === 'clothes_armor' && (
            <>
              <mesh position={[-0.33, 0.16, 0]} rotation={[0,0,0.22]}><cylinderGeometry args={[0.15, 0.15, 0.24, 20]} /><meshToonMaterial color="#a1a1aa" /></mesh>
              <mesh position={[0.33, 0.16, 0]} rotation={[0,0,-0.22]}><cylinderGeometry args={[0.15, 0.15, 0.24, 20]} /><meshToonMaterial color="#a1a1aa" /></mesh>
              <mesh position={[0, 0.05, 0.09]}><boxGeometry args={[0.42, 0.32, 0.18]} /><meshToonMaterial color="#a1a1aa" /></mesh>
            </>
          )}
        </group>

        {/* Neck */}
        <mesh position={[0, 0.78, 0]}><cylinderGeometry args={[0.082, 0.1, 0.11, 18]} /><Toon color={skinColor} /></mesh>

        {/* Arms */}
        <OCapsule pos={[-0.34, 0.5, 0]} rot={[0,0,-0.5]} radius={0.092} height={0.2} col={['clothes_casual','clothes_robe'].includes(clothesId) ? skinColor : clothesColor} />
        <OCapsule pos={[0.34, 0.5, 0]}  rot={[0,0, 0.5]} radius={0.092} height={0.2} col={['clothes_casual','clothes_robe'].includes(clothesId) ? skinColor : clothesColor} />
        {clothesId === 'clothes_casual' && (
          <>
            <mesh position={[-0.24, 0.54, 0]} rotation={[0,0,-0.5]}><cylinderGeometry args={[0.096, 0.096, 0.09, 18]} /><Toon color={clothesColor} /></mesh>
            <mesh position={[0.24, 0.54, 0]} rotation={[0,0, 0.5]}><cylinderGeometry args={[0.096, 0.096, 0.09, 18]} /><Toon color={clothesColor} /></mesh>
          </>
        )}

        {/* Pelvis */}
        <group position={[0, 0.12, 0]}>
          <mesh scale={1.04}>
            {bottomsId === 'bottom_skirt' ? <cylinderGeometry args={[0.25, 0.44, 0.32, 22]} /> : <cylinderGeometry args={[0.25, 0.29, 0.18, 22]} />}
            <meshBasicMaterial color={getOutlineColor(bottomsColor)} side={THREE.BackSide} />
          </mesh>
          <mesh>
            {bottomsId === 'bottom_skirt' ? <cylinderGeometry args={[0.25, 0.44, 0.32, 22]} /> : <cylinderGeometry args={[0.25, 0.29, 0.18, 22]} />}
            <Toon color={bottomsColor} />
          </mesh>
        </group>

        {/* Legs */}
        {bottomsId !== 'bottom_skirt' && (
          ([-1, 1] as const).map(side => (
            // A-pose rotation (slight outward spread)
            <group key={side} position={[side * 0.14, -0.28, 0]} rotation={[0, side * 0.1, side * -0.05]}>
              <group>
                <mesh scale={1.054}><capsuleGeometry args={[0.1, 0.42, 10, 18]} /><meshBasicMaterial color={getOutlineColor(bottomsId === 'bottom_shorts' ? skinColor : bottomsColor)} side={THREE.BackSide} /></mesh>
                <mesh><capsuleGeometry args={[0.1, 0.42, 10, 18]} /><Toon color={bottomsId === 'bottom_shorts' ? skinColor : bottomsColor} /></mesh>
              </group>
              {bottomsId === 'bottom_shorts' && (
                <group position={[0, -0.38, 0]}>
                  <mesh scale={1.054}><capsuleGeometry args={[0.088, 0.19, 10, 18]} /><meshBasicMaterial color={getOutlineColor(skinColor)} side={THREE.BackSide} /></mesh>
                  <mesh><capsuleGeometry args={[0.088, 0.19, 10, 18]} /><Toon color={skinColor} /></mesh>
                </group>
              )}
              {/* Shoe: rotate to lay flat on the ground, pointing forward */}
              <group position={[0, bottomsId === 'bottom_shorts' ? -0.52 : -0.42, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh scale={1.06}><capsuleGeometry args={[0.09, 0.16, 6, 12]} /><meshBasicMaterial color={getOutlineColor('#1c1917')} side={THREE.BackSide} /></mesh>
                <mesh><capsuleGeometry args={[0.09, 0.16, 6, 12]} /><Toon color="#1c1917" /></mesh>
              </group>
            </group>
          ))
        )}
      </group>

      {/* ═══════════ H E A D ═══════════ */}
      <group ref={headRef} position={[0, 1.35, 0]}>

        {/* Skull */}
        <mesh scale={1.05}>
          <sphereGeometry args={[0.46, 32, 32]} />
          <meshBasicMaterial color={getOutlineColor(skinColor)} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.46, 32, 32]} />
          <Toon color={skinColor} />
        </mesh>

        {/* ── EYES (animated group) ── */}
        <group ref={eyesRef}>
          {(eyesId === 'eyes_normal' || eyesId === 'eyes_big') && (
            <>{renderAnimeEye(-1, eyesId === 'eyes_big')}{renderAnimeEye(1, eyesId === 'eyes_big')}</>
          )}
          {eyesId === 'eyes_closed' && (
            <>
              <mesh position={[-0.175, 0.07, EZ]} rotation={[0,0, 0.1]}><torusGeometry args={[0.056, 0.011, 6, 20, Math.PI]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
              <mesh position={[ 0.175, 0.07, EZ]} rotation={[0,0,-0.1]}><torusGeometry args={[0.056, 0.011, 6, 20, Math.PI]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
            </>
          )}
          {eyesId === 'eyes_angry' && (
            ([-1,1] as const).map(s => (
              <group key={s} position={[s*0.175, 0.07, EZ]}>
                <mesh position={[0,0.065,0]} rotation={[0,0,s*-0.30]}><planeGeometry args={[0.14, 0.028]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
                <mesh position={[0,-0.008,0]}><planeGeometry args={[0.12, 0.088]} /><Toon color={eyesColor||'#3b82f6'} /></mesh>
              </group>
            ))
          )}
          {eyesId === 'eyes_sad' && (
            ([-1,1] as const).map(s => (
              <group key={s} position={[s*0.175, 0.07, EZ]}>
                <mesh position={[0,0.065,0]} rotation={[0,0,s*0.30]}><planeGeometry args={[0.14, 0.028]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
                <mesh position={[0,-0.008,0]}><planeGeometry args={[0.12, 0.088]} /><Toon color={eyesColor||'#60a5fa'} /></mesh>
              </group>
            ))
          )}
          {eyesId === 'eyes_star' && (
            ([-1,1] as const).map(s => (
              <group key={s} position={[s*0.175, 0.07, EZ]}>
                <mesh position={[0,0,-0.001]}><planeGeometry args={[0.16,0.16]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
                <mesh rotation={[0,0,Math.PI/10]}><circleGeometry args={[0.065,5]} /><Toon color={eyesColor} /></mesh>
                <mesh position={[s*-0.02,0.014,0.001]}><circleGeometry args={[0.017,10]} /><Toon color="#fff" /></mesh>
              </group>
            ))
          )}
          {eyesId === 'eyes_heart' && (
            ([-1,1] as const).map(s => (
              <group key={s} position={[s*0.175, 0.07, EZ]}>
                <mesh position={[-0.024,0.022,0]}><circleGeometry args={[0.04,14]} /><Toon color={eyesColor} /></mesh>
                <mesh position={[0.024,0.022,0]}><circleGeometry args={[0.04,14]} /><Toon color={eyesColor} /></mesh>
                <mesh position={[0,-0.016,0]} rotation={[0,0,Math.PI]}><coneGeometry args={[0.044,0.07,12]} /><Toon color={eyesColor} /></mesh>
                <mesh position={[s*-0.018,0.026,0.001]}><circleGeometry args={[0.013,10]} /><Toon color="#fff" /></mesh>
              </group>
            ))
          )}
          {eyesId === 'eyes_cyber' && (
            <mesh position={[0, 0.07, EZ]}>
              <planeGeometry args={[0.38, 0.05]} />
              <Toon color={eyesColor} emissive={eyesColor} emissiveIntensity={0.6} />
            </mesh>
          )}
        </group>

        {/* ── NOSE ── */}
        <mesh position={[0, -0.04, NZ]} scale={[0.95, 0.68, 0.4]}>
          <sphereGeometry args={[0.019, 10, 10]} />
          <Toon color={skinColor} />
        </mesh>

        {/* ── MOUTH ── */}
        {mouthId === 'mouth_smile' && (
          <mesh position={[0,-0.155,EZ]} scale={[1.32,1.32,0.008]}><torusGeometry args={[0.048,0.011,6,20,Math.PI]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
        )}
        {mouthId === 'mouth_open' && (
          <>
            <mesh position={[0,-0.155,EZ]}><circleGeometry args={[0.05,20]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
            <mesh position={[0,-0.157,EZ+0.002]}><circleGeometry args={[0.038,20]} /><Toon color="#ef4444" /></mesh>
          </>
        )}
        {mouthId === 'mouth_sad' && (
          <mesh position={[0,-0.172,EZ]} rotation={[0,0,Math.PI]} scale={[1.32,1.32,0.008]}><torusGeometry args={[0.048,0.011,6,20,Math.PI]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
        )}
        {mouthId === 'mouth_cat' && (
          <group position={[0,-0.155,EZ]} scale={[1,1,0.008]}>
            <mesh position={[-0.03,0,0]}><torusGeometry args={[0.03,0.009,6,18,Math.PI]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
            <mesh position={[0.03,0,0]}><torusGeometry args={[0.03,0.009,6,18,Math.PI]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
          </group>
        )}
        {mouthId === 'mouth_vampire' && (
          <group position={[0,-0.155,EZ]}>
            <mesh><planeGeometry args={[0.096,0.01]} /><Toon color={getOutlineColor(skinColor)} /></mesh>
            <mesh position={[-0.031,-0.028,0.001]} rotation={[0,0,Math.PI]}><coneGeometry args={[0.01,0.042,8]} /><Toon color="#f8fafc" /></mesh>
            <mesh position={[0.031,-0.028,0.001]} rotation={[0,0,Math.PI]}><coneGeometry args={[0.01,0.042,8]} /><Toon color="#f8fafc" /></mesh>
          </group>
        )}

        {/* ── BLUSH ── */}
        <mesh position={[-0.26,-0.09,BZ]} scale={[1.1,0.58,0.065]}>
          <circleGeometry args={[0.088,16]} /><Toon color="#f9a8d4" opacity={0.72} transparent />
        </mesh>
        <mesh position={[0.26,-0.09,BZ]} scale={[1.1,0.58,0.065]}>
          <circleGeometry args={[0.088,16]} /><Toon color="#f9a8d4" opacity={0.72} transparent />
        </mesh>

        {/* ── DECALS ── */}
        {decalsId === 'decal_scar' && (
          <mesh position={[-0.15,0.09,EZ]} rotation={[0,0,0.34]}><planeGeometry args={[0.024,0.17]} /><Toon color={decalsColor} /></mesh>
        )}
        {decalsId === 'decal_bandage' && (
          <mesh position={[0.026,-0.018,EZ]} rotation={[0,0,-0.06]}><planeGeometry args={[0.19,0.062]} /><Toon color="#f5f5f5" /></mesh>
        )}
        {decalsId === 'decal_freckles' && (
          <group position={[0,0,EZ]}>
            {[-0.17,-0.22,-0.13,0.17,0.22,0.13].map((x,i) => (
              <mesh key={i} position={[x,-0.008,0]}><circleGeometry args={[i%3===0?0.012:i%3===1?0.009:0.007,8]} /><Toon color="#b45309" /></mesh>
            ))}
          </group>
        )}
        {decalsId === 'decal_tear' && (
          <mesh position={[0.18,-0.058,EZ]} rotation={[0,0,Math.PI]}><coneGeometry args={[0.017,0.042,12]} /><Toon color="#60a5fa" opacity={0.9} transparent /></mesh>
        )}
        {decalsId === 'decal_cyber' && (
          <group position={[0.24,0.1,EZ]}>
            <mesh><planeGeometry args={[0.009,0.11]} /><Toon color={decalsColor} emissive={decalsColor} emissiveIntensity={0.5} /></mesh>
            <mesh position={[0.024,0.028,0]}><planeGeometry args={[0.062,0.009]} /><Toon color={decalsColor} emissive={decalsColor} emissiveIntensity={0.5} /></mesh>
          </group>
        )}
        {decalsId === 'decal_star' && (
          <mesh position={[-0.17,-0.08,EZ]} rotation={[Math.PI/2,0.14,0]}><cylinderGeometry args={[0.024,0.024,0.004,5]} /><Toon color={decalsColor} /></mesh>
        )}

        {/* ── HAIR ── */}
        {hairId !== 'hair_bald' && (
          <group ref={hairRef}>
            {!['hair_mohawk','hair_curly'].includes(hairId) && (
              <group position={[0,0.08,-0.02]}>
                <mesh scale={1.04}><sphereGeometry args={[0.474,26,26]} /><meshBasicMaterial color={getOutlineColor(hairColor)} side={THREE.BackSide} /></mesh>
                <mesh><sphereGeometry args={[0.474,26,26]} /><Toon color={hairColor} /></mesh>
              </group>
            )}
            {['hair_short','hair_long','hair_twintails','hair_ponytail'].includes(hairId) && (
              <group position={[0,0.27,0.35]} rotation={[0.2,0,0]}>
                <mesh rotation={[0,0,Math.PI/2]}><capsuleGeometry args={[0.088,0.62,10,18]} /><Toon color={hairColor} /></mesh>
              </group>
            )}
            {hairId === 'hair_long' && (
              <mesh position={[0,-0.3,-0.26]} rotation={[0.1,0,0]}><capsuleGeometry args={[0.24,0.8,10,18]} /><Toon color={hairColor} /></mesh>
            )}
            {hairId === 'hair_twintails' && (
              <>
                <mesh position={[-0.48,-0.16,0]} rotation={[0,0,0.26]}><capsuleGeometry args={[0.15,0.64,10,18]} /><Toon color={hairColor} /></mesh>
                <mesh position={[0.48,-0.16,0]} rotation={[0,0,-0.26]}><capsuleGeometry args={[0.15,0.64,10,18]} /><Toon color={hairColor} /></mesh>
              </>
            )}
            {hairId === 'hair_curly' && (
              <mesh position={[0,0.16,-0.02]}><sphereGeometry args={[0.58,26,26]} /><Toon color={hairColor} /></mesh>
            )}
            {hairId === 'hair_mohawk' && (
              <group position={[0,0.44,-0.02]}>
                {[...Array(5)].map((_,i) => (
                  <mesh key={i} position={[0,Math.sin(i*0.65)*0.09,(i-2)*0.16]} rotation={[0.1-i*0.045,0,0]}>
                    <capsuleGeometry args={[0.048,0.32,8,14]} /><Toon color={hairColor} />
                  </mesh>
                ))}
              </group>
            )}
            {hairId === 'hair_ponytail' && (
              <group position={[0,0.08,-0.46]} rotation={[-0.32,0,0]}>
                <mesh><sphereGeometry args={[0.1,14,14]} /><Toon color={hairColor} /></mesh>
                <mesh position={[0,-0.32,-0.09]} rotation={[0.1,0,0]}><capsuleGeometry args={[0.12,0.64,10,18]} /><Toon color={hairColor} /></mesh>
              </group>
            )}
            {hairId === 'hair_samurai' && (
              <mesh position={[0,0.54,-0.14]}><sphereGeometry args={[0.12,14,14]} /><Toon color={hairColor} /></mesh>
            )}
            {hairId === 'hair_messy' && (
              <group position={[0,0.27,0]}>
                {[...Array(10)].map((_,i) => (
                  <mesh key={i} position={[Math.cos(i*0.628)*0.3,(i%3)*0.08,Math.sin(i*0.628)*0.3]} rotation={[Math.cos(i)*0.38,0,Math.sin(i)*0.38]}>
                    <capsuleGeometry args={[0.096,0.39,8,14]} /><Toon color={hairColor} />
                  </mesh>
                ))}
              </group>
            )}
          </group>
        )}

        {/* ── ACCESSORIES ── */}
        {accessoryId === 'acc_catears' && (
          <group position={[0,0.44,0]}>
            <mesh position={[-0.21,0,0]} rotation={[0,0,0.17]}><coneGeometry args={[0.066,0.17,14]} /><Toon color="#fbcfe8" /></mesh>
            <mesh position={[0.21,0,0]} rotation={[0,0,-0.17]}><coneGeometry args={[0.066,0.17,14]} /><Toon color="#fbcfe8" /></mesh>
          </group>
        )}
        {accessoryId === 'acc_halo' && (
          <group position={[0,0.74,0]} rotation={[Math.PI/2+0.15,0,0]}>
            <mesh><torusGeometry args={[0.27,0.022,12,48]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.6} /></mesh>
          </group>
        )}
        {accessoryId === 'acc_headphones' && (
          <group>
            <mesh><torusGeometry args={[0.5,0.055,12,48]} /><Toon color="#111" /></mesh>
            {([-1,1] as const).map(s => (
              <group key={s} position={[s*0.5,0,0]} rotation={[0,Math.PI/2,0]}>
                <mesh><cylinderGeometry args={[0.2,0.2,0.12,22]} /><Toon color="#27272a" /></mesh>
                <mesh position={[0,0,s*0.07]}><circleGeometry args={[0.078,20]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} /></mesh>
              </group>
            ))}
          </group>
        )}
        {accessoryId === 'acc_crown' && (
          <group position={[0,0.64,0]}>
            <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.21,0.21,0.05,22]} /><Toon color="#fbbf24" /></mesh>
            {[...Array(6)].map((_,i) => (
              <mesh key={i} position={[Math.cos(i*Math.PI/3)*0.21,0.05,Math.sin(i*Math.PI/3)*0.21]}>
                <coneGeometry args={[0.032,0.106,8]} /><Toon color="#fbbf24" />
              </mesh>
            ))}
          </group>
        )}
        {accessoryId === 'acc_horns' && (
          <group position={[0,0.4,0.26]}>
            <mesh position={[-0.14,0,0]} rotation={[-0.1,0,0.16]}><coneGeometry args={[0.046,0.14,8]} /><Toon color={accessoryColor} /></mesh>
            <mesh position={[0.14,0,0]} rotation={[-0.1,0,-0.16]}><coneGeometry args={[0.046,0.14,8]} /><Toon color={accessoryColor} /></mesh>
          </group>
        )}
        {accessoryId === 'acc_shades' && (
          <group position={[0,0.07,EZ+0.006]}>
            <mesh position={[-0.16,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.1,0.1,0.025,22]} /><Toon color="#111" /></mesh>
            <mesh position={[0.16,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.1,0.1,0.025,22]} /><Toon color="#111" /></mesh>
            <mesh position={[0,0.005,0]}><planeGeometry args={[0.14,0.009]} /><Toon color="#aaa" /></mesh>
          </group>
        )}
        {accessoryId === 'acc_visor' && (
          <group position={[0,0.07,EZ+0.002]} scale={[1,1,0.008]}>
            <mesh rotation={[0,0,Math.PI/2]}><capsuleGeometry args={[0.1,0.38,12,22]} /><Toon color="#111" opacity={0.8} transparent /></mesh>
          </group>
        )}
        {accessoryId === 'acc_cybermask' && (
          <group position={[0,-0.11,0.4]}>
            <mesh rotation={[0.07,0,Math.PI/2]}><capsuleGeometry args={[0.106,0.24,12,22]} /><Toon color="#1a1a1a" /></mesh>
            <mesh position={[0,0.036,0.106]}><planeGeometry args={[0.3,0.022]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} /></mesh>
            <mesh position={[0,-0.022,0.106]}><planeGeometry args={[0.19,0.018]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} /></mesh>
          </group>
        )}
        {accessoryId === 'acc_gasmask' && (
          <group position={[0,-0.11,0.44]}>
            <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.15,0.18,0.14,22]} /><Toon color="#27272a" /></mesh>
            <mesh position={[0,0,0.078]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.072,0.072,0.025,22]} /><Toon color="#111" /></mesh>
            <mesh position={[-0.17,-0.048,0.026]} rotation={[Math.PI/2,0,0.32]}><cylinderGeometry args={[0.088,0.088,0.088,18]} /><Toon color="#3f3f46" /></mesh>
            <mesh position={[0.17,-0.048,0.026]} rotation={[Math.PI/2,0,-0.32]}><cylinderGeometry args={[0.088,0.088,0.088,18]} /><Toon color="#3f3f46" /></mesh>
          </group>
        )}
        {accessoryId === 'acc_goggles' && (
          <group position={[0,0.32,0.38]} rotation={[-0.1,0,0]}>
            <mesh position={[-0.12,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.096,0.096,0.048,22]} /><Toon color="#3f3f46" /></mesh>
            <mesh position={[0.12,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.096,0.096,0.048,22]} /><Toon color="#3f3f46" /></mesh>
            <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.024,0.024,0.024,14]} /><Toon color="#111" /></mesh>
            <mesh position={[-0.12,0,0.03]} rotation={[Math.PI/2,0,0]}><circleGeometry args={[0.066,20]} /><Toon color={accessoryColor} /></mesh>
            <mesh position={[0.12,0,0.03]} rotation={[Math.PI/2,0,0]}><circleGeometry args={[0.066,20]} /><Toon color={accessoryColor} /></mesh>
          </group>
        )}
        {accessoryId === 'acc_eyepatch' && (
          <group position={[0,0.07,EZ+0.006]}>
            <mesh position={[-0.14,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.088,0.088,0.024,22]} /><Toon color="#111" /></mesh>
            <mesh rotation={[0.09,0,0.08]}><planeGeometry args={[0.9,0.009]} /><Toon color="#111" /></mesh>
          </group>
        )}
        {accessoryId === 'acc_kitsune' && (
          <group position={[-0.36,0.14,0.26]} rotation={[0,-0.58,-0.16]}>
            <mesh rotation={[Math.PI/2,0,0]}><capsuleGeometry args={[0.13,0.21,12,22]} /><Toon color="#fff" /></mesh>
            <mesh position={[-0.08,0.16,0]} rotation={[0,0,0.13]}><coneGeometry args={[0.048,0.12,8]} /><Toon color="#fff" /></mesh>
            <mesh position={[0.08,0.16,0]} rotation={[0,0,-0.13]}><coneGeometry args={[0.048,0.12,8]} /><Toon color="#fff" /></mesh>
            <mesh position={[0,0.054,0.14]}><planeGeometry args={[0.16,0.009]} /><Toon color="#ef4444" /></mesh>
            <mesh position={[0,0,0.14]}><planeGeometry args={[0.009,0.048]} /><Toon color="#ef4444" /></mesh>
          </group>
        )}
      </group>
    </group>
  )
}

// ── Main Component Wrapper ──
export default function Chibi3D(props: any) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [0, -0.3, 4.5], fov: 44 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <ambientLight intensity={1.8} />
        {/* Soft, beautiful multi-directional lighting for anime style */}
        <directionalLight position={[2, 4, 3]} intensity={0.9} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
        <directionalLight position={[-3, 3, -4]} intensity={0.5} color="#c4b5fd" />
        <directionalLight position={[0, -2, 2]} intensity={0.3} color="#fcd34d" /> {/* warm bounce light */}

        <Suspense fallback={null}>
          <ContactShadows position={[0, -1.9, 0]} opacity={0.65} scale={5} blur={2} far={2.5} color="#312e81" />

          {/* Render the Chibi Model with its useFrame animations inside the Canvas */}
          <group position={[0, -1.0, 0]}>
            <ChibiModel {...props} />
          </group>

          {/* Stage */}
          <group position={[0,-1.9, 0]}>
            {props.stageId === 'stage_holo' && (<mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[1.4,32]} /><meshToonMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.4} wireframe /></mesh>)}
            {props.stageId === 'stage_ring' && (<mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.0,0.032,12,48]} /><meshToonMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} /></mesh>)}
            {props.stageId === 'stage_pedestal' && (<group><mesh><cylinderGeometry args={[0.96,1.14,0.11,22]} /><Toon color="#18181b" /></mesh><mesh position={[0,0.073,0]}><torusGeometry args={[0.96,0.011,12,48]} /><meshToonMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} /></mesh></group>)}
            {props.stageId === 'stage_magic' && (<group><mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[1.62,48]} /><meshToonMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} wireframe /></mesh><mesh rotation={[Math.PI/2,0,Math.PI/6]}><circleGeometry args={[1.62,48]} /><meshToonMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} wireframe /></mesh></group>)}
          </group>
        </Suspense>

        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={0.9} mipmapBlur intensity={0.5} radius={0.6} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} resolution={256} />
          <Vignette eskil={false} offset={0.16} darkness={0.36} />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2.5}
          maxDistance={7}
          autoRotate
          autoRotateSpeed={0.85}
          maxPolarAngle={Math.PI / 1.75}
          minPolarAngle={Math.PI / 6}
          target={[0, -0.55, 0]}
        />
      </Canvas>
    </div>
  )
}