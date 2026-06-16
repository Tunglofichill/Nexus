'use client'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── Toon material shorthand ────────────────────────────────────────────────
const Toon = ({ color, opacity = 1, transparent = false, emissive = '#000000', emissiveIntensity = 0 }: {
  color: string; opacity?: number; transparent?: boolean; emissive?: string; emissiveIntensity?: number
}) => (
  <meshToonMaterial
    color={color}
    opacity={opacity}
    transparent={transparent}
    emissive={emissive}
    emissiveIntensity={emissiveIntensity}
  />
)

// ─── Inverted-hull outline ───────────────────────────────────────────────────
const Outline = ({ radius, scale = 1.055, color = '#1a1a1a', children }: {
  radius?: number; scale?: number; color?: string; children: React.ReactNode
}) => (
  <group>
    <group scale={scale}>
      {children}
      {/* replaced in each usage below by backside variant */}
    </group>
    {children}
  </group>
)

export default function Chibi3D({
  skinColor,
  hairColor,
  clothesColor,
  bodyId = 'body_standard',
  eyesId = 'eyes_normal',
  eyesColor = '#3b82f6',
  mouthId = 'mouth_smile',
  hairId = 'hair_short',
  clothesId = 'clothes_casual',
  accessoryId = 'acc_none',
  accessoryColor = '#ffffff',
  bottomsId = 'bottom_jeans',
  bottomsColor = '#1e40af',
  decalsId = 'decal_none',
  decalsColor = '#ef4444',
  stageId = 'stage_none',
}: {
  skinColor: string; hairColor: string; clothesColor: string
  bodyId?: string; eyesId?: string; eyesColor?: string; mouthId?: string
  hairId?: string; clothesId?: string; accessoryId?: string; accessoryColor?: string
  bottomsId?: string; bottomsColor?: string; decalsId?: string; decalsColor?: string
  stageId?: string
}) {
  let bScale: [number, number, number] = [1, 1, 1]
  if (bodyId === 'body_chubby')   bScale = [1.15, 0.94, 1.15]
  if (bodyId === 'body_tall')     bScale = [0.92, 1.2, 0.92]
  if (bodyId === 'body_muscular') bScale = [1.25, 1.05, 1.1]

  const OUTLINE = '#111111'

  // ── Reusable outlined sphere ──────────────────────────────────────────────
  const OBody = ({ pos, r, col, args }: { pos: [number,number,number], r?: number, col: string, args?: any }) => (
    <group position={pos}>
      <mesh scale={1.06}>
        <sphereGeometry args={args ?? [r ?? 0.5, 28, 28]} />
        <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={args ?? [r ?? 0.5, 28, 28]} />
        <Toon color={col} />
      </mesh>
    </group>
  )

  const OCapsule = ({ pos, rot = [0,0,0] as [number,number,number], radius, height, col, sc = 1.06 }:
    { pos: [number,number,number], rot?: [number,number,number], radius: number, height: number, col: string, sc?: number }) => (
    <group position={pos} rotation={rot}>
      <mesh scale={sc}>
        <capsuleGeometry args={[radius, height, 10, 20]} />
        <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <capsuleGeometry args={[radius, height, 10, 20]} />
        <Toon color={col} />
      </mesh>
    </group>
  )

  // ── Flat disc for face elements ───────────────────────────────────────────
  const FaceCircle = ({ pos, r, col, opacity = 1 }: { pos: [number,number,number], r: number, col: string, opacity?: number }) => (
    <mesh position={pos} rotation={[0, 0, 0]}>
      <circleGeometry args={[r, 24]} />
      <Toon color={col} opacity={opacity} transparent={opacity < 1} />
    </mesh>
  )
  const FaceRect = ({ pos, w, h, col, rot = [0,0,0] as [number,number,number] }: { pos: [number,number,number], w: number, h: number, col: string, rot?: [number,number,number] }) => (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[w, h]} />
      <Toon color={col} />
    </mesh>
  )

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [0, 0.3, 3.6], fov: 50 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[2, 4, 3]} intensity={0.7} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
        <directionalLight position={[-2, 2, -4]} intensity={0.2} color="#c4b5fd" />

        <Suspense fallback={null}>
          <ContactShadows position={[0, -0.95, 0]} opacity={0.6} scale={5} blur={1.6} far={2.2} />

          <Float speed={2} rotationIntensity={0.03} floatIntensity={0.08} floatingRange={[0, 0.06]}>
            <group position={[0, -0.92, 0]} scale={bScale}>

              {/* ═══════════════ BODY ═══════════════ */}
              <group>

                {/* Torso outline + fill */}
                <group position={[0, 0.54, 0]}>
                  <mesh scale={1.055}>
                    <capsuleGeometry args={[0.33, 0.25, 10, 20]} />
                    <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                  </mesh>
                  <mesh>
                    <capsuleGeometry args={[0.33, 0.25, 10, 20]} />
                    <Toon color={clothesColor} />
                  </mesh>

                  {/* Clothes details on torso */}
                  {clothesId === 'clothes_casual' && (
                    <>
                      <mesh position={[0, 0.34, 0]}>
                        <torusGeometry args={[0.13, 0.034, 10, 24]} />
                        <Toon color="#f8fafc" />
                      </mesh>
                      <mesh position={[0.04, 0.05, 0.32]} rotation={[Math.PI/2, 0, 0]}>
                        <cylinderGeometry args={[0.055, 0.055, 0.007, 18]} />
                        <Toon color="#f8fafc" />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_suit' && (
                    <>
                      <mesh position={[0, 0.1, 0.32]} rotation={[0.08, 0, 0]}>
                        <planeGeometry args={[0.24, 0.34]} />
                        <Toon color="#f8fafc" />
                      </mesh>
                      <mesh position={[0, 0.07, 0.325]}>
                        <planeGeometry args={[0.05, 0.28]} />
                        <Toon color="#ef4444" />
                      </mesh>
                      <mesh position={[0, 0.23, 0.325]}>
                        <planeGeometry args={[0.072, 0.05]} />
                        <Toon color="#ef4444" />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_hoodie' && (
                    <>
                      <mesh position={[0, 0.3, -0.18]} rotation={[-0.12, 0, 0]}>
                        <torusGeometry args={[0.26, 0.15, 10, 20]} />
                        <Toon color={clothesColor} />
                      </mesh>
                      <mesh position={[0, -0.12, 0.32]}>
                        <planeGeometry args={[0.36, 0.15]} />
                        <Toon color={clothesColor} />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_tech' && (
                    <>
                      <mesh position={[0, 0.06, 0.33]} rotation={[0, 0, 0.42]}>
                        <planeGeometry args={[0.6, 0.033]} />
                        <Toon color="#111" />
                      </mesh>
                      <mesh position={[0, 0.06, 0.33]} rotation={[0, 0, -0.42]}>
                        <planeGeometry args={[0.6, 0.033]} />
                        <Toon color="#111" />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_robe' && (
                    <>
                      <mesh position={[0, -0.28, 0]}>
                        <cylinderGeometry args={[0.34, 0.46, 0.32, 22]} />
                        <Toon color={clothesColor} />
                      </mesh>
                      <mesh position={[0, -0.42, 0]}>
                        <cylinderGeometry args={[0.46, 0.46, 0.033, 22]} />
                        <Toon color="#eab308" />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_ninja' && (
                    <mesh position={[0, 0.3, 0.1]} rotation={[0.12, 0, 0]}>
                      <torusGeometry args={[0.26, 0.1, 10, 20]} />
                      <Toon color="#111" />
                    </mesh>
                  )}
                  {clothesId === 'clothes_armor' && (
                    <>
                      <mesh position={[-0.42, 0.18, 0]} rotation={[0, 0, 0.26]}>
                        <cylinderGeometry args={[0.17, 0.17, 0.28, 20]} />
                        <meshToonMaterial color="#a1a1aa" />
                      </mesh>
                      <mesh position={[0.42, 0.18, 0]} rotation={[0, 0, -0.26]}>
                        <cylinderGeometry args={[0.17, 0.17, 0.28, 20]} />
                        <meshToonMaterial color="#a1a1aa" />
                      </mesh>
                      <mesh position={[0, 0.06, 0.1]}>
                        <boxGeometry args={[0.52, 0.38, 0.22]} />
                        <meshToonMaterial color="#a1a1aa" />
                      </mesh>
                    </>
                  )}
                </group>

                {/* Arms */}
                <OCapsule pos={[-0.42, 0.62, 0]} rot={[0,0,-0.55]} radius={0.115} height={0.2}
                  col={['clothes_casual','clothes_robe'].includes(clothesId) ? skinColor : clothesColor} />
                <OCapsule pos={[0.42, 0.62, 0]} rot={[0,0,0.55]} radius={0.115} height={0.2}
                  col={['clothes_casual','clothes_robe'].includes(clothesId) ? skinColor : clothesColor} />

                {/* Sleeve cuffs for casual */}
                {clothesId === 'clothes_casual' && (
                  <>
                    <mesh position={[-0.32, 0.68, 0]} rotation={[0, 0, -0.55]}>
                      <cylinderGeometry args={[0.12, 0.12, 0.12, 18]} />
                      <Toon color={clothesColor} />
                    </mesh>
                    <mesh position={[0.32, 0.68, 0]} rotation={[0, 0, 0.55]}>
                      <cylinderGeometry args={[0.12, 0.12, 0.12, 18]} />
                      <Toon color={clothesColor} />
                    </mesh>
                  </>
                )}

                {/* Neck */}
                <mesh position={[0, 0.93, 0]}>
                  <cylinderGeometry args={[0.1, 0.13, 0.14, 18]} />
                  <Toon color={skinColor} />
                </mesh>

                {/* Waist/Pelvis */}
                <group position={[0, 0.2, 0]}>
                  <mesh scale={1.04}>
                    {bottomsId === 'bottom_skirt'
                      ? <cylinderGeometry args={[0.3, 0.48, 0.32, 22]} />
                      : <cylinderGeometry args={[0.3, 0.34, 0.2, 22]} />}
                    <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                  </mesh>
                  <mesh>
                    {bottomsId === 'bottom_skirt'
                      ? <cylinderGeometry args={[0.3, 0.48, 0.32, 22]} />
                      : <cylinderGeometry args={[0.3, 0.34, 0.2, 22]} />}
                    <Toon color={bottomsColor} />
                  </mesh>
                </group>

                {/* Legs (only if not skirt) */}
                {bottomsId !== 'bottom_skirt' && (
                  <>
                    {/* Left leg */}
                    <group position={[-0.15, -0.08, 0]}>
                      <OCapsule pos={[0,0,0]} radius={0.115} height={0.2} col={skinColor} sc={1.055} />
                      {/* pants cover */}
                      {bottomsId !== 'bottom_shorts' && (
                        <mesh position={[0, 0.06, 0]}>
                          <cylinderGeometry args={[0.12, 0.12, 0.3, 18]} />
                          <Toon color={bottomsColor} />
                        </mesh>
                      )}
                      {/* Shoe */}
                      <group position={[0, -0.22, 0.05]}>
                        <mesh scale={1.06}>
                          <capsuleGeometry args={[0.1, 0.13, 6, 12]} />
                          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                        </mesh>
                        <mesh>
                          <capsuleGeometry args={[0.1, 0.13, 6, 12]} />
                          <Toon color="#1c1917" />
                        </mesh>
                      </group>
                    </group>
                    {/* Right leg */}
                    <group position={[0.15, -0.08, 0]}>
                      <OCapsule pos={[0,0,0]} radius={0.115} height={0.2} col={skinColor} sc={1.055} />
                      {bottomsId !== 'bottom_shorts' && (
                        <mesh position={[0, 0.06, 0]}>
                          <cylinderGeometry args={[0.12, 0.12, 0.3, 18]} />
                          <Toon color={bottomsColor} />
                        </mesh>
                      )}
                      <group position={[0, -0.22, 0.05]}>
                        <mesh scale={1.06}>
                          <capsuleGeometry args={[0.1, 0.13, 6, 12]} />
                          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                        </mesh>
                        <mesh>
                          <capsuleGeometry args={[0.1, 0.13, 6, 12]} />
                          <Toon color="#1c1917" />
                        </mesh>
                      </group>
                    </group>
                  </>
                )}
              </group>

              {/* ═══════════════ HEAD ═══════════════ */}
              <group position={[0, 1.62, 0]} scale={[1.15, 1.15, 1.15]}>

                {/* Skull with outline */}
                <mesh scale={1.05}>
                  <sphereGeometry args={[0.66, 32, 32]} />
                  <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                </mesh>
                <mesh>
                  <sphereGeometry args={[0.66, 32, 32]} />
                  <Toon color={skinColor} />
                </mesh>

                {/* ── FACE PANEL (flat disc, slightly in front) ── */}
                {/* All face elements sit on z ≈ 0.62 plane */}

                {/* ══ EYES ══ */}
                {/* eyes_normal / eyes_big: proper layered anime eye */}
                {(eyesId === 'eyes_normal' || eyesId === 'eyes_big') && (() => {
                  const EYE_W = eyesId === 'eyes_big' ? 0.22 : 0.18
                  const EYE_H = eyesId === 'eyes_big' ? 0.26 : 0.22
                  const Z = 0.635
                  const renderEye = (side: -1 | 1) => (
                    <group key={side} position={[side * 0.2, 0.09, Z]}>
                      {/* Black lash frame / background */}
                      <mesh position={[0, 0, -0.002]}>
                        <planeGeometry args={[EYE_W + 0.04, EYE_H + 0.02]} />
                        <Toon color="#111111" />
                      </mesh>
                      {/* White sclera */}
                      <mesh position={[0, -0.014, 0]}>
                        <planeGeometry args={[EYE_W, EYE_H * 0.72]} />
                        <Toon color="#ffffff" />
                      </mesh>
                      {/* Colored iris */}
                      <mesh position={[0, -0.02, 0.001]}>
                        <circleGeometry args={[EYE_W * 0.38, 20]} />
                        <Toon color={eyesColor || '#3b82f6'} />
                      </mesh>
                      {/* Pupil */}
                      <mesh position={[0, -0.025, 0.002]}>
                        <circleGeometry args={[EYE_W * 0.22, 16]} />
                        <Toon color="#111111" />
                      </mesh>
                      {/* Highlight big */}
                      <mesh position={[side === -1 ? -0.032 : 0.032, 0.018, 0.003]}>
                        <circleGeometry args={[EYE_W * 0.14, 12]} />
                        <Toon color="#ffffff" />
                      </mesh>
                      {/* Highlight small */}
                      <mesh position={[side === -1 ? 0.022 : -0.022, -0.018, 0.003]}>
                        <circleGeometry args={[EYE_W * 0.075, 10]} />
                        <Toon color="#ffffff" />
                      </mesh>
                      {/* Top lash thicker bar */}
                      <mesh position={[0, EYE_H * 0.36, 0.003]}>
                        <planeGeometry args={[EYE_W + 0.04, 0.038]} />
                        <Toon color="#111111" />
                      </mesh>
                    </group>
                  )
                  return <>{renderEye(-1)}{renderEye(1)}</>
                })()}

                {eyesId === 'eyes_closed' && (
                  <>
                    {/* Left — upward arc for closed happy eye */}
                    <mesh position={[-0.2, 0.09, 0.635]} rotation={[0, 0, 0.08]}>
                      <torusGeometry args={[0.08, 0.015, 6, 20, Math.PI]} />
                      <Toon color="#111111" />
                    </mesh>
                    <mesh position={[0.2, 0.09, 0.635]} rotation={[0, 0, -0.08]}>
                      <torusGeometry args={[0.08, 0.015, 6, 20, Math.PI]} />
                      <Toon color="#111111" />
                    </mesh>
                  </>
                )}

                {eyesId === 'eyes_angry' && (
                  <>
                    {/* angled black bar + colored fill */}
                    <group position={[-0.2, 0.09, 0.635]}>
                      <mesh position={[0, 0.08, 0]} rotation={[0, 0, -0.36]}>
                        <planeGeometry args={[0.2, 0.038]} />
                        <Toon color="#111111" />
                      </mesh>
                      <mesh position={[0, -0.01, 0]}>
                        <planeGeometry args={[0.17, 0.12]} />
                        <Toon color={eyesColor || '#3b82f6'} />
                      </mesh>
                    </group>
                    <group position={[0.2, 0.09, 0.635]}>
                      <mesh position={[0, 0.08, 0]} rotation={[0, 0, 0.36]}>
                        <planeGeometry args={[0.2, 0.038]} />
                        <Toon color="#111111" />
                      </mesh>
                      <mesh position={[0, -0.01, 0]}>
                        <planeGeometry args={[0.17, 0.12]} />
                        <Toon color={eyesColor || '#3b82f6'} />
                      </mesh>
                    </group>
                  </>
                )}

                {eyesId === 'eyes_sad' && (
                  <>
                    <group position={[-0.2, 0.09, 0.635]}>
                      <mesh position={[0, 0.08, 0]} rotation={[0, 0, 0.36]}>
                        <planeGeometry args={[0.2, 0.038]} />
                        <Toon color="#111111" />
                      </mesh>
                      <mesh position={[0, -0.01, 0]}>
                        <planeGeometry args={[0.17, 0.12]} />
                        <Toon color={eyesColor || '#60a5fa'} />
                      </mesh>
                    </group>
                    <group position={[0.2, 0.09, 0.635]}>
                      <mesh position={[0, 0.08, 0]} rotation={[0, 0, -0.36]}>
                        <planeGeometry args={[0.2, 0.038]} />
                        <Toon color="#111111" />
                      </mesh>
                      <mesh position={[0, -0.01, 0]}>
                        <planeGeometry args={[0.17, 0.12]} />
                        <Toon color={eyesColor || '#60a5fa'} />
                      </mesh>
                    </group>
                  </>
                )}

                {eyesId === 'eyes_star' && (
                  <>
                    <group position={[-0.2, 0.09, 0.63]}>
                      <mesh position={[0, 0, -0.002]}>
                        <planeGeometry args={[0.22, 0.22]} />
                        <Toon color="#111111" />
                      </mesh>
                      <mesh rotation={[0, 0, Math.PI / 10]}>
                        <circleGeometry args={[0.09, 5]} />
                        <Toon color={eyesColor} />
                      </mesh>
                      <mesh position={[-0.03, 0.04, 0.002]}>
                        <circleGeometry args={[0.025, 10]} />
                        <Toon color="#ffffff" />
                      </mesh>
                    </group>
                    <group position={[0.2, 0.09, 0.63]}>
                      <mesh position={[0, 0, -0.002]}>
                        <planeGeometry args={[0.22, 0.22]} />
                        <Toon color="#111111" />
                      </mesh>
                      <mesh rotation={[0, 0, Math.PI / 10]}>
                        <circleGeometry args={[0.09, 5]} />
                        <Toon color={eyesColor} />
                      </mesh>
                      <mesh position={[0.03, 0.04, 0.002]}>
                        <circleGeometry args={[0.025, 10]} />
                        <Toon color="#ffffff" />
                      </mesh>
                    </group>
                  </>
                )}

                {eyesId === 'eyes_heart' && (
                  <>
                    {([-1, 1] as const).map(side => (
                      <group key={side} position={[side * 0.2, 0.09, 0.632]}>
                        <mesh position={[-0.032, 0.03, 0]}><circleGeometry args={[0.057, 14]} /><Toon color={eyesColor} /></mesh>
                        <mesh position={[0.032, 0.03, 0]}><circleGeometry args={[0.057, 14]} /><Toon color={eyesColor} /></mesh>
                        <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.062, 0.1, 12]} /><Toon color={eyesColor} /></mesh>
                        <mesh position={[side === -1 ? -0.025 : 0.025, 0.04, 0.002]}><circleGeometry args={[0.018, 10]} /><Toon color="#ffffff" /></mesh>
                      </group>
                    ))}
                  </>
                )}

                {eyesId === 'eyes_cyber' && (
                  <mesh position={[0, 0.09, 0.636]}>
                    <planeGeometry args={[0.5, 0.07]} />
                    <Toon color={eyesColor} emissive={eyesColor} emissiveIntensity={0.6} />
                  </mesh>
                )}

                {/* ══ NOSE ══ tiny bump */}
                <mesh position={[0, -0.05, 0.655]} scale={[1.1, 0.8, 0.5]}>
                  <sphereGeometry args={[0.028, 10, 10]} />
                  <Toon color={skinColor} />
                </mesh>

                {/* ══ MOUTH ══ */}
                {mouthId === 'mouth_smile' && (
                  <mesh position={[0, -0.19, 0.63]} rotation={[0, 0, 0]} scale={[1.6, 1.6, 0.01]}>
                    <torusGeometry args={[0.065, 0.014, 6, 22, Math.PI]} />
                    <Toon color="#111111" />
                  </mesh>
                )}
                {mouthId === 'mouth_open' && (
                  <>
                    <mesh position={[0, -0.19, 0.635]}>
                      <circleGeometry args={[0.068, 20]} />
                      <Toon color="#111111" />
                    </mesh>
                    <mesh position={[0, -0.2, 0.636]}>
                      <circleGeometry args={[0.056, 20]} />
                      <Toon color="#ef4444" />
                    </mesh>
                  </>
                )}
                {mouthId === 'mouth_sad' && (
                  <mesh position={[0, -0.21, 0.63]} rotation={[0, 0, Math.PI]} scale={[1.6, 1.6, 0.01]}>
                    <torusGeometry args={[0.065, 0.014, 6, 22, Math.PI]} />
                    <Toon color="#111111" />
                  </mesh>
                )}
                {mouthId === 'mouth_cat' && (
                  <group position={[0, -0.19, 0.634]} scale={[1, 1, 0.01]}>
                    <mesh position={[-0.044, 0, 0]}><torusGeometry args={[0.038, 0.012, 6, 20, Math.PI]} /><Toon color="#111111" /></mesh>
                    <mesh position={[0.044, 0, 0]}><torusGeometry args={[0.038, 0.012, 6, 20, Math.PI]} /><Toon color="#111111" /></mesh>
                  </group>
                )}
                {mouthId === 'mouth_vampire' && (
                  <group position={[0, -0.19, 0.634]}>
                    <mesh><planeGeometry args={[0.13, 0.013]} /><Toon color="#111111" /></mesh>
                    <mesh position={[-0.042, -0.038, 0.001]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.014, 0.058, 8]} /><Toon color="#f8fafc" /></mesh>
                    <mesh position={[0.042, -0.038, 0.001]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.014, 0.058, 8]} /><Toon color="#f8fafc" /></mesh>
                  </group>
                )}

                {/* ══ BLUSH ══ */}
                <mesh position={[-0.34, -0.1, 0.595]} scale={[1.2, 0.62, 0.07]}>
                  <circleGeometry args={[0.12, 16]} />
                  <Toon color="#f9a8d4" opacity={0.7} transparent />
                </mesh>
                <mesh position={[0.34, -0.1, 0.595]} scale={[1.2, 0.62, 0.07]}>
                  <circleGeometry args={[0.12, 16]} />
                  <Toon color="#f9a8d4" opacity={0.7} transparent />
                </mesh>

                {/* ══ DECALS ══ */}
                {decalsId === 'decal_scar' && (
                  <mesh position={[-0.2, 0.1, 0.645]} rotation={[0, 0, 0.38]}>
                    <planeGeometry args={[0.032, 0.24]} />
                    <Toon color={decalsColor} />
                  </mesh>
                )}
                {decalsId === 'decal_bandage' && (
                  <mesh position={[0.04, -0.02, 0.645]} rotation={[0, 0, -0.08]}>
                    <planeGeometry args={[0.26, 0.084]} />
                    <Toon color="#f5f5f5" />
                  </mesh>
                )}
                {decalsId === 'decal_freckles' && (
                  <group position={[0, 0, 0.645]}>
                    {[-0.23, -0.29, -0.17, 0.23, 0.29, 0.17].map((x, i) => (
                      <mesh key={i} position={[x, -0.01, 0]}>
                        <circleGeometry args={[i % 3 === 0 ? 0.016 : i % 3 === 1 ? 0.013 : 0.01, 8]} />
                        <Toon color="#b45309" />
                      </mesh>
                    ))}
                  </group>
                )}
                {decalsId === 'decal_tear' && (
                  <mesh position={[0.24, -0.07, 0.645]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.022, 0.055, 12]} />
                    <Toon color="#60a5fa" opacity={0.9} transparent />
                  </mesh>
                )}
                {decalsId === 'decal_cyber' && (
                  <group position={[0.34, 0.14, 0.644]}>
                    <mesh><planeGeometry args={[0.012, 0.15]} /><Toon color={decalsColor} emissive={decalsColor} emissiveIntensity={0.5} /></mesh>
                    <mesh position={[0.034, 0.038, 0]}><planeGeometry args={[0.085, 0.012]} /><Toon color={decalsColor} emissive={decalsColor} emissiveIntensity={0.5} /></mesh>
                  </group>
                )}
                {decalsId === 'decal_star' && (
                  <mesh position={[-0.25, -0.1, 0.644]} rotation={[Math.PI/2, 0.18, 0]}>
                    <cylinderGeometry args={[0.033, 0.033, 0.006, 5]} />
                    <Toon color={decalsColor} />
                  </mesh>
                )}

                {/* ══ HAIR ══ */}
                {hairId !== 'hair_bald' && (
                  <group>
                    {/* Hair cap */}
                    {!['hair_mohawk', 'hair_curly'].includes(hairId) && (
                      <group position={[0, 0.1, -0.04]}>
                        <mesh scale={1.04}>
                          <sphereGeometry args={[0.68, 26, 26]} />
                          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                        </mesh>
                        <mesh>
                          <sphereGeometry args={[0.68, 26, 26]} />
                          <Toon color={hairColor} />
                        </mesh>
                      </group>
                    )}
                    {/* Bangs */}
                    {['hair_short','hair_long','hair_twintails','hair_ponytail'].includes(hairId) && (
                      <group position={[0, 0.36, 0.5]} rotation={[0.2, 0, 0]}>
                        <mesh rotation={[0, 0, Math.PI/2]}>
                          <capsuleGeometry args={[0.12, 0.86, 10, 18]} />
                          <Toon color={hairColor} />
                        </mesh>
                      </group>
                    )}
                    {hairId === 'hair_long' && (
                      <mesh position={[0, -0.44, -0.36]} rotation={[0.12, 0, 0]}>
                        <capsuleGeometry args={[0.3, 1.05, 10, 18]} />
                        <Toon color={hairColor} />
                      </mesh>
                    )}
                    {hairId === 'hair_twintails' && (
                      <>
                        <mesh position={[-0.66, -0.2, 0]} rotation={[0, 0, 0.3]}>
                          <capsuleGeometry args={[0.2, 0.86, 10, 18]} />
                          <Toon color={hairColor} />
                        </mesh>
                        <mesh position={[0.66, -0.2, 0]} rotation={[0, 0, -0.3]}>
                          <capsuleGeometry args={[0.2, 0.86, 10, 18]} />
                          <Toon color={hairColor} />
                        </mesh>
                      </>
                    )}
                    {hairId === 'hair_curly' && (
                      <mesh position={[0, 0.2, -0.04]}>
                        <sphereGeometry args={[0.84, 26, 26]} />
                        <Toon color={hairColor} />
                      </mesh>
                    )}
                    {hairId === 'hair_mohawk' && (
                      <group position={[0, 0.6, -0.04]}>
                        {[...Array(5)].map((_, i) => (
                          <mesh key={i} position={[0, Math.sin(i*0.65)*0.1, (i-2)*0.2]} rotation={[0.1-i*0.05, 0, 0]}>
                            <capsuleGeometry args={[0.065, 0.42, 8, 14]} />
                            <Toon color={hairColor} />
                          </mesh>
                        ))}
                      </group>
                    )}
                    {hairId === 'hair_ponytail' && (
                      <group position={[0, 0.12, -0.66]} rotation={[-0.36, 0, 0]}>
                        <mesh><sphereGeometry args={[0.13, 14, 14]} /><Toon color={hairColor} /></mesh>
                        <mesh position={[0, -0.42, -0.12]} rotation={[0.12, 0, 0]}>
                          <capsuleGeometry args={[0.17, 0.86, 10, 18]} />
                          <Toon color={hairColor} />
                        </mesh>
                      </group>
                    )}
                    {hairId === 'hair_samurai' && (
                      <mesh position={[0, 0.72, -0.18]}>
                        <sphereGeometry args={[0.17, 14, 14]} />
                        <Toon color={hairColor} />
                      </mesh>
                    )}
                    {hairId === 'hair_messy' && (
                      <group position={[0, 0.36, 0]}>
                        {[...Array(10)].map((_, i) => (
                          <mesh key={i} position={[Math.cos(i*0.628)*0.4, (i%3)*0.1, Math.sin(i*0.628)*0.4]} rotation={[Math.cos(i)*0.4, 0, Math.sin(i)*0.4]}>
                            <capsuleGeometry args={[0.13, 0.52, 8, 14]} />
                            <Toon color={hairColor} />
                          </mesh>
                        ))}
                      </group>
                    )}
                  </group>
                )}

                {/* ══ ACCESSORIES ══ */}
                {accessoryId === 'acc_catears' && (
                  <group position={[0, 0.62, 0]}>
                    <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.2]}><coneGeometry args={[0.088, 0.22, 14]} /><Toon color="#fbcfe8" /></mesh>
                    <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.088, 0.22, 14]} /><Toon color="#fbcfe8" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_halo' && (
                  <group position={[0, 1.0, 0]} rotation={[Math.PI/2+0.16, 0, 0]}>
                    <mesh><torusGeometry args={[0.36, 0.03, 12, 48]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.6} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_headphones' && (
                  <group>
                    <mesh><torusGeometry args={[0.7, 0.07, 12, 48]} /><Toon color="#111" /></mesh>
                    <group position={[-0.7, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                      <mesh><cylinderGeometry args={[0.27, 0.27, 0.17, 22]} /><Toon color="#27272a" /></mesh>
                      <mesh position={[0, 0, -0.094]}><circleGeometry args={[0.1, 20]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} side={2} /></mesh>
                    </group>
                    <group position={[0.7, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                      <mesh><cylinderGeometry args={[0.27, 0.27, 0.17, 22]} /><Toon color="#27272a" /></mesh>
                      <mesh position={[0, 0, 0.094]}><circleGeometry args={[0.1, 20]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} side={2} /></mesh>
                    </group>
                  </group>
                )}
                {accessoryId === 'acc_crown' && (
                  <group position={[0, 0.88, 0]}>
                    <mesh rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.28, 0.28, 0.065, 22]} />
                      <Toon color="#fbbf24" />
                    </mesh>
                    {[...Array(6)].map((_, i) => (
                      <mesh key={i} position={[Math.cos(i*Math.PI/3)*0.28, 0.065, Math.sin(i*Math.PI/3)*0.28]}>
                        <coneGeometry args={[0.042, 0.15, 8]} />
                        <Toon color="#fbbf24" />
                      </mesh>
                    ))}
                  </group>
                )}
                {accessoryId === 'acc_horns' && (
                  <group position={[0, 0.53, 0.36]}>
                    <mesh position={[-0.2, 0, 0]} rotation={[-0.1, 0, 0.2]}><coneGeometry args={[0.062, 0.19, 8]} /><Toon color={accessoryColor} /></mesh>
                    <mesh position={[0.2, 0, 0]} rotation={[-0.1, 0, -0.2]}><coneGeometry args={[0.062, 0.19, 8]} /><Toon color={accessoryColor} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_shades' && (
                  <group position={[0, 0.09, 0.65]}>
                    <mesh position={[-0.22, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.033, 22]} /><Toon color="#111" /></mesh>
                    <mesh position={[0.22, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.033, 22]} /><Toon color="#111" /></mesh>
                    <mesh position={[0, 0.008, 0]}><planeGeometry args={[0.2, 0.012]} /><Toon color="#aaa" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_visor' && (
                  <group position={[0, 0.09, 0.636]} scale={[1, 1, 0.01]}>
                    <mesh rotation={[0, 0, Math.PI/2]}><capsuleGeometry args={[0.14, 0.54, 12, 22]} /><Toon color="#111" opacity={0.8} transparent /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_cybermask' && (
                  <group position={[0, -0.16, 0.58]}>
                    <mesh rotation={[0.08, 0, Math.PI/2]}><capsuleGeometry args={[0.15, 0.35, 12, 22]} /><Toon color="#1a1a1a" /></mesh>
                    <mesh position={[0, 0.05, 0.15]}><planeGeometry args={[0.42, 0.03]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} /></mesh>
                    <mesh position={[0, -0.03, 0.15]}><planeGeometry args={[0.28, 0.026]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_gasmask' && (
                  <group position={[0, -0.15, 0.68]}>
                    <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.21, 0.24, 0.19, 22]} /><Toon color="#27272a" /></mesh>
                    <mesh position={[0, 0, 0.1]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.033, 22]} /><Toon color="#111" /></mesh>
                    <mesh position={[-0.24, -0.065, 0.036]} rotation={[Math.PI/2, 0, 0.36]}><cylinderGeometry args={[0.12, 0.12, 0.13, 18]} /><Toon color="#3f3f46" /></mesh>
                    <mesh position={[0.24, -0.065, 0.036]} rotation={[Math.PI/2, 0, -0.36]}><cylinderGeometry args={[0.12, 0.12, 0.13, 18]} /><Toon color="#3f3f46" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_goggles' && (
                  <group position={[0, 0.44, 0.55]} rotation={[-0.12, 0, 0]}>
                    <mesh position={[-0.17, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.065, 22]} /><Toon color="#3f3f46" /></mesh>
                    <mesh position={[0.17, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.065, 22]} /><Toon color="#3f3f46" /></mesh>
                    <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.033, 0.033, 0.033, 14]} /><Toon color="#111" /></mesh>
                    <mesh position={[-0.17, 0, 0.042]} rotation={[Math.PI/2, 0, 0]}><circleGeometry args={[0.09, 20]} /><Toon color={accessoryColor} /></mesh>
                    <mesh position={[0.17, 0, 0.042]} rotation={[Math.PI/2, 0, 0]}><circleGeometry args={[0.09, 20]} /><Toon color={accessoryColor} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_eyepatch' && (
                  <group position={[0, 0.09, 0.64]}>
                    <mesh position={[-0.19, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.033, 22]} /><Toon color="#111" /></mesh>
                    <mesh rotation={[0.1, 0, 0.1]}><planeGeometry args={[1.2, 0.012]} /><Toon color="#111" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_kitsune' && (
                  <group position={[-0.5, 0.19, 0.36]} rotation={[0, -0.62, -0.2]}>
                    <mesh rotation={[Math.PI/2, 0, 0]}><capsuleGeometry args={[0.17, 0.28, 12, 22]} /><Toon color="#ffffff" /></mesh>
                    <mesh position={[-0.1, 0.21, 0]} rotation={[0, 0, 0.15]}><coneGeometry args={[0.062, 0.16, 8]} /><Toon color="#ffffff" /></mesh>
                    <mesh position={[0.1, 0.21, 0]} rotation={[0, 0, -0.15]}><coneGeometry args={[0.062, 0.16, 8]} /><Toon color="#ffffff" /></mesh>
                    <mesh position={[0, 0.07, 0.18]}><planeGeometry args={[0.2, 0.012]} /><Toon color="#ef4444" /></mesh>
                    <mesh position={[0, 0, 0.18]}><planeGeometry args={[0.012, 0.065]} /><Toon color="#ef4444" /></mesh>
                  </group>
                )}

              </group>{/* end Head group */}

            </group>
          </Float>

          {/* ── Stage ── */}
          <group position={[0, -0.92, 0]}>
            {stageId === 'stage_holo' && (<mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[1.6,32]} /><meshToonMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.4} wireframe /></mesh>)}
            {stageId === 'stage_ring' && (<mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.25,0.04,12,48]} /><meshToonMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} /></mesh>)}
            {stageId === 'stage_pedestal' && (<group position={[0,-0.06,0]}><mesh><cylinderGeometry args={[1.22,1.45,0.15,22]} /><Toon color="#18181b" /></mesh><mesh position={[0,0.09,0]}><torusGeometry args={[1.22,0.014,12,48]} /><meshToonMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} /></mesh></group>)}
            {stageId === 'stage_magic' && (<group><mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[2.0,48]} /><meshToonMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} wireframe /></mesh><mesh rotation={[Math.PI/2,0,Math.PI/6]}><circleGeometry args={[2.0,48]} /><meshToonMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} wireframe /></mesh></group>)}
          </group>

        </Suspense>

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.0} mipmapBlur intensity={0.5} />
          <Vignette eskil={false} offset={0.15} darkness={0.38} />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2.2}
          maxDistance={6}
          autoRotate
          autoRotateSpeed={0.9}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 6}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  )
}
