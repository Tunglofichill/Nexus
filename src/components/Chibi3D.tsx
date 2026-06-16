'use client'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
// 2.5-head-tall chibi proportions (sweet spot: not too big, not too small)
//
//  HEAD diameter  = 1.04  (r=0.52)
//  TORSO height   = 0.62  (capsule r=0.29, h=0.28)
//  LEGS height    = 0.82  (capsule r=0.12, h=0.42)
//  SHOES          = 0.16  height
//  TOTAL          ≈ 2.64  = 2.54 × head diameters ✓
//
//  Root at y=-1.0  ContactShadows at y=-1.0
//  Feet bottom   ≈ y=-1.0 + (-0.38) + (-0.36) - 0.1  = -1.84 world
//  Head top      ≈ y=-1.0 + 1.35  + 0.52              =  0.87 world
//  Character mid ≈ (-1.84+0.87)/2 = -0.49 world → camera target y=-0.5
// ─────────────────────────────────────────────────────────────────────────────

const OUTLINE = '#111111'

const Toon = ({
  color, opacity = 1, transparent = false, emissive = '#000', emissiveIntensity = 0,
}: { color: string; opacity?: number; transparent?: boolean; emissive?: string; emissiveIntensity?: number }) => (
  <meshToonMaterial color={color} opacity={opacity} transparent={transparent}
    emissive={emissive} emissiveIntensity={emissiveIntensity} />
)

// Outlined sphere
const OSphere = ({ pos, r, col, sc = 1.055 }: { pos: [number,number,number]; r: number; col: string; sc?: number }) => (
  <group position={pos}>
    <mesh scale={sc}><sphereGeometry args={[r, 28, 28]} /><meshBasicMaterial color={OUTLINE} side={THREE.BackSide} /></mesh>
    <mesh><sphereGeometry args={[r, 28, 28]} /><Toon color={col} /></mesh>
  </group>
)

// Outlined capsule
const OCapsule = ({
  pos, rot = [0,0,0] as [number,number,number], radius, height, col, sc = 1.055
}: { pos: [number,number,number]; rot?: [number,number,number]; radius: number; height: number; col: string; sc?: number }) => (
  <group position={pos} rotation={rot}>
    <mesh scale={sc}><capsuleGeometry args={[radius, height, 10, 20]} /><meshBasicMaterial color={OUTLINE} side={THREE.BackSide} /></mesh>
    <mesh><capsuleGeometry args={[radius, height, 10, 20]} /><Toon color={col} /></mesh>
  </group>
)

// Outlined cylinder
const OCylinder = ({
  pos, args, col, rot = [0,0,0] as [number,number,number]
}: { pos: [number,number,number]; args: [number,number,number,number]; col: string; rot?: [number,number,number] }) => (
  <group position={pos} rotation={rot}>
    <mesh scale={1.055}><cylinderGeometry args={args} /><meshBasicMaterial color={OUTLINE} side={THREE.BackSide} /></mesh>
    <mesh><cylinderGeometry args={args} /><Toon color={col} /></mesh>
  </group>
)

export default function Chibi3D({
  skinColor, hairColor, clothesColor,
  bodyId = 'body_standard',
  eyesId = 'eyes_normal', eyesColor = '#3b82f6',
  mouthId = 'mouth_smile',
  hairId = 'hair_short',
  clothesId = 'clothes_casual',
  accessoryId = 'acc_none', accessoryColor = '#a78bfa',
  bottomsId = 'bottom_jeans', bottomsColor = '#1e40af',
  decalsId = 'decal_none', decalsColor = '#ef4444',
  stageId = 'stage_none',
}: {
  skinColor: string; hairColor: string; clothesColor: string
  bodyId?: string; eyesId?: string; eyesColor?: string; mouthId?: string
  hairId?: string; clothesId?: string; accessoryId?: string; accessoryColor?: string
  bottomsId?: string; bottomsColor?: string; decalsId?: string; decalsColor?: string
  stageId?: string
}) {
  let bScale: [number,number,number] = [1,1,1]
  if (bodyId === 'body_chubby')   bScale = [1.14, 0.94, 1.14]
  if (bodyId === 'body_tall')     bScale = [0.92, 1.18, 0.92]
  if (bodyId === 'body_muscular') bScale = [1.22, 1.04, 1.08]

  // ── Single-eye renderer (used twice for left/right) ──────────────────────
  const renderAnimeEye = (side: -1|1, big: boolean) => {
    const W  = big ? 0.19 : 0.155
    const H  = big ? 0.23 : 0.195
    const IR = big ? 0.073 : 0.058  // iris radius
    const PR = big ? 0.044 : 0.035  // pupil radius
    const x  = side * 0.195
    return (
      <group key={side} position={[x, 0.08, 0.495]}>
        {/* Dark lash frame */}
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[W + 0.04, H + 0.018]} />
          <Toon color="#111111" />
        </mesh>
        {/* White sclera (bottom 72%) */}
        <mesh position={[0, -0.013, 0]}>
          <planeGeometry args={[W, H * 0.72]} />
          <Toon color="#ffffff" />
        </mesh>
        {/* Colored iris */}
        <mesh position={[0, -0.018, 0.001]}>
          <circleGeometry args={[IR, 20]} />
          <Toon color={eyesColor || '#3b82f6'} />
        </mesh>
        {/* Dark pupil */}
        <mesh position={[0, -0.022, 0.002]}>
          <circleGeometry args={[PR, 16]} />
          <Toon color="#0f0f0f" />
        </mesh>
        {/* Highlight big */}
        <mesh position={[side === -1 ? -0.028 : 0.028, 0.015, 0.003]}>
          <circleGeometry args={[0.026, 12]} />
          <Toon color="#ffffff" />
        </mesh>
        {/* Highlight small */}
        <mesh position={[side === -1 ? 0.018 : -0.018, -0.016, 0.003]}>
          <circleGeometry args={[0.014, 10]} />
          <Toon color="#ffffff" />
        </mesh>
        {/* Top lash bar */}
        <mesh position={[0, H * 0.35, 0.003]}>
          <planeGeometry args={[W + 0.04, 0.034]} />
          <Toon color="#0f0f0f" />
        </mesh>
      </group>
    )
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [0, -0.1, 4.2], fov: 46 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <ambientLight intensity={1.7} />
        <directionalLight position={[2, 5, 3]} intensity={0.75} castShadow
          shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
        <directionalLight position={[-2, 2, -4]} intensity={0.18} color="#c4b5fd" />

        <Suspense fallback={null}>
          <ContactShadows position={[0, -1.0, 0]} opacity={0.65} scale={5} blur={1.8} far={2.5} />

          <Float speed={2} rotationIntensity={0.03} floatIntensity={0.08} floatingRange={[0, 0.06]}>
            {/* ROOT: y=-1.0 → feet near world y=-1.0 */}
            <group position={[0, -1.0, 0]} scale={bScale}>

              {/* ══════════════════════════════════════════════════════
                  B O D Y  SECTION  (y: 0 → 1.0 from root)
                  Torso center y=0.46, top≈0.46+0.14+0.29=0.89
              ══════════════════════════════════════════════════════ */}
              <group>

                {/* TORSO */}
                <group position={[0, 0.46, 0]}>
                  <mesh scale={1.055}>
                    <capsuleGeometry args={[0.29, 0.28, 10, 20]} />
                    <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                  </mesh>
                  <mesh>
                    <capsuleGeometry args={[0.29, 0.28, 10, 20]} />
                    <Toon color={clothesColor} />
                  </mesh>

                  {/* ── Clothes Details ── */}
                  {clothesId === 'clothes_casual' && (
                    <>
                      {/* collar ring */}
                      <mesh position={[0, 0.27, 0]}>
                        <torusGeometry args={[0.12, 0.032, 10, 22]} />
                        <Toon color="#f8fafc" />
                      </mesh>
                      {/* logo */}
                      <mesh position={[0.03, 0.06, 0.28]} rotation={[Math.PI/2,0,0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.006, 16]} />
                        <Toon color="#f8fafc" />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_suit' && (
                    <>
                      <mesh position={[0, 0.06, 0.28]}>
                        <planeGeometry args={[0.21, 0.3]} />
                        <Toon color="#f8fafc" />
                      </mesh>
                      <mesh position={[0, 0.04, 0.285]}>
                        <planeGeometry args={[0.04, 0.22]} />
                        <Toon color="#ef4444" />
                      </mesh>
                      <mesh position={[0, 0.2, 0.285]}>
                        <planeGeometry args={[0.055, 0.04]} />
                        <Toon color="#ef4444" />
                      </mesh>
                      <mesh position={[-0.1, 0.14, 0.285]} rotation={[0,0,-0.3]}>
                        <planeGeometry args={[0.05, 0.28]} />
                        <Toon color={clothesColor} />
                      </mesh>
                      <mesh position={[0.1, 0.14, 0.285]} rotation={[0,0,0.3]}>
                        <planeGeometry args={[0.05, 0.28]} />
                        <Toon color={clothesColor} />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_hoodie' && (
                    <>
                      <mesh position={[0, 0.26, -0.16]} rotation={[-0.1, 0, 0]}>
                        <torusGeometry args={[0.22, 0.13, 10, 20]} />
                        <Toon color={clothesColor} />
                      </mesh>
                      <mesh position={[0, -0.1, 0.27]}>
                        <planeGeometry args={[0.32, 0.12]} />
                        <Toon color={clothesColor} />
                      </mesh>
                      <mesh position={[-0.05, 0.0, 0.28]}>
                        <cylinderGeometry args={[0.006, 0.006, 0.16, 6]} />
                        <Toon color="#d4d4d4" />
                      </mesh>
                      <mesh position={[0.05, 0.0, 0.28]}>
                        <cylinderGeometry args={[0.006, 0.006, 0.16, 6]} />
                        <Toon color="#d4d4d4" />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_tech' && (
                    <>
                      <mesh position={[0, 0.06, 0.29]} rotation={[0,0,0.4]}>
                        <planeGeometry args={[0.56, 0.03]} />
                        <Toon color="#111" />
                      </mesh>
                      <mesh position={[0, 0.06, 0.29]} rotation={[0,0,-0.4]}>
                        <planeGeometry args={[0.56, 0.03]} />
                        <Toon color="#111" />
                      </mesh>
                      <mesh position={[0, -0.12, 0]}>
                        <cylinderGeometry args={[0.3, 0.3, 0.05, 22]} />
                        <Toon color="#111" />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_robe' && (
                    <>
                      <mesh position={[0, -0.24, 0]}>
                        <cylinderGeometry args={[0.3, 0.42, 0.3, 22]} />
                        <Toon color={clothesColor} />
                      </mesh>
                      <mesh position={[0, -0.37, 0]}>
                        <cylinderGeometry args={[0.42, 0.42, 0.03, 22]} />
                        <Toon color="#eab308" />
                      </mesh>
                    </>
                  )}
                  {clothesId === 'clothes_ninja' && (
                    <mesh position={[0, 0.26, 0.08]} rotation={[0.1,0,0]}>
                      <torusGeometry args={[0.24, 0.1, 10, 20]} />
                      <Toon color="#111" />
                    </mesh>
                  )}
                  {clothesId === 'clothes_armor' && (
                    <>
                      <mesh position={[-0.36, 0.18, 0]} rotation={[0,0,0.24]}>
                        <cylinderGeometry args={[0.16, 0.16, 0.26, 20]} />
                        <meshToonMaterial color="#a1a1aa" />
                      </mesh>
                      <mesh position={[0.36, 0.18, 0]} rotation={[0,0,-0.24]}>
                        <cylinderGeometry args={[0.16, 0.16, 0.26, 20]} />
                        <meshToonMaterial color="#a1a1aa" />
                      </mesh>
                      <mesh position={[0, 0.06, 0.1]}>
                        <boxGeometry args={[0.46, 0.36, 0.2]} />
                        <meshToonMaterial color="#a1a1aa" />
                      </mesh>
                    </>
                  )}
                </group>

                {/* NECK */}
                <mesh position={[0, 0.82, 0]}>
                  <cylinderGeometry args={[0.09, 0.11, 0.12, 18]} />
                  <Toon color={skinColor} />
                </mesh>

                {/* ARMS — short, slightly angled out */}
                <OCapsule pos={[-0.37, 0.52, 0]} rot={[0, 0, -0.52]} radius={0.1} height={0.22}
                  col={['clothes_casual','clothes_robe'].includes(clothesId) ? skinColor : clothesColor} />
                <OCapsule pos={[0.37, 0.52, 0]}  rot={[0, 0,  0.52]} radius={0.1} height={0.22}
                  col={['clothes_casual','clothes_robe'].includes(clothesId) ? skinColor : clothesColor} />
                {/* Sleeve cuffs for casual */}
                {clothesId === 'clothes_casual' && (
                  <>
                    <mesh position={[-0.26, 0.57, 0]} rotation={[0,0,-0.52]}>
                      <cylinderGeometry args={[0.105, 0.105, 0.1, 18]} />
                      <Toon color={clothesColor} />
                    </mesh>
                    <mesh position={[0.26, 0.57, 0]} rotation={[0,0, 0.52]}>
                      <cylinderGeometry args={[0.105, 0.105, 0.1, 18]} />
                      <Toon color={clothesColor} />
                    </mesh>
                  </>
                )}

                {/* PELVIS/WAIST */}
                <group position={[0, 0.14, 0]}>
                  <mesh scale={1.04}>
                    {bottomsId === 'bottom_skirt'
                      ? <cylinderGeometry args={[0.27, 0.46, 0.35, 22]} />
                      : <cylinderGeometry args={[0.27, 0.31, 0.2, 22]} />}
                    <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                  </mesh>
                  <mesh>
                    {bottomsId === 'bottom_skirt'
                      ? <cylinderGeometry args={[0.27, 0.46, 0.35, 22]} />
                      : <cylinderGeometry args={[0.27, 0.31, 0.2, 22]} />}
                    <Toon color={bottomsColor} />
                  </mesh>
                </group>

                {/* LEGS */}
                {bottomsId !== 'bottom_skirt' && (
                  <>
                    {([-1, 1] as const).map(side => (
                      <group key={side} position={[side * 0.14, -0.22, 0]}>
                        {/* Upper leg / thigh (pants or skin-for-shorts) */}
                        <group>
                          <mesh scale={1.055}>
                            <capsuleGeometry args={[0.1, 0.36, 10, 18]} />
                            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                          </mesh>
                          <mesh>
                            <capsuleGeometry args={[0.1, 0.36, 10, 18]} />
                            <Toon color={bottomsId === 'bottom_shorts' ? skinColor : bottomsColor} />
                          </mesh>
                        </group>
                        {/* Lower leg for shorts (exposed skin) */}
                        {bottomsId === 'bottom_shorts' && (
                          <group position={[0, -0.32, 0]}>
                            <mesh scale={1.055}>
                              <capsuleGeometry args={[0.09, 0.2, 10, 18]} />
                              <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                            </mesh>
                            <mesh>
                              <capsuleGeometry args={[0.09, 0.2, 10, 18]} />
                              <Toon color={skinColor} />
                            </mesh>
                          </group>
                        )}
                        {/* SHOE */}
                        <group position={[0, bottomsId === 'bottom_shorts' ? -0.52 : -0.38, 0.055]}
                               rotation={[0.14, 0, 0]}>
                          <mesh scale={1.06}>
                            <capsuleGeometry args={[0.09, 0.17, 6, 12]} />
                            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                          </mesh>
                          <mesh>
                            <capsuleGeometry args={[0.09, 0.17, 6, 12]} />
                            <Toon color="#1c1917" />
                          </mesh>
                        </group>
                      </group>
                    ))}
                  </>
                )}
              </group>

              {/* ══════════════════════════════════════════════════════
                  H E A D  at y=1.35  (head top ≈ 1.35+0.52=1.87)
                  Total fig from shoe bottom (-0.22-0.38-0.09-0.09)=-0.78
                  + root offset gives world y: -1.0-0.78=-1.78 to -1.0+1.87=0.87
                  Height = 2.65 ≈ 2.55 × head-diameter (1.04). ✓
              ══════════════════════════════════════════════════════ */}
              <group position={[0, 1.35, 0]}>

                {/* Skull */}
                <mesh scale={1.05}>
                  <sphereGeometry args={[0.52, 32, 32]} />
                  <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                </mesh>
                <mesh>
                  <sphereGeometry args={[0.52, 32, 32]} />
                  <Toon color={skinColor} />
                </mesh>

                {/* Face features scaled to head radius 0.52:
                    face z-surface ≈ 0.50
                    eye x-center   ≈ ±0.195
                    eye y-center   ≈ 0.08                      */}

                {/* ── EYES ── */}
                {(eyesId === 'eyes_normal' || eyesId === 'eyes_big') && (
                  <>{renderAnimeEye(-1, eyesId === 'eyes_big')}{renderAnimeEye(1, eyesId === 'eyes_big')}</>
                )}
                {eyesId === 'eyes_closed' && (
                  <>
                    <mesh position={[-0.195, 0.08, 0.498]} rotation={[0,0, 0.1]}>
                      <torusGeometry args={[0.065, 0.013, 6, 20, Math.PI]} />
                      <Toon color="#111" />
                    </mesh>
                    <mesh position={[ 0.195, 0.08, 0.498]} rotation={[0,0,-0.1]}>
                      <torusGeometry args={[0.065, 0.013, 6, 20, Math.PI]} />
                      <Toon color="#111" />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_angry' && (
                  <>
                    {([-1,1] as const).map(s => (
                      <group key={s} position={[s*0.195, 0.08, 0.495]}>
                        <mesh position={[0, 0.07, 0]} rotation={[0,0,s*-0.32]}>
                          <planeGeometry args={[0.16, 0.032]} />
                          <Toon color="#111" />
                        </mesh>
                        <mesh position={[0,-0.01,0]}>
                          <planeGeometry args={[0.14, 0.1]} />
                          <Toon color={eyesColor||'#3b82f6'} />
                        </mesh>
                      </group>
                    ))}
                  </>
                )}
                {eyesId === 'eyes_sad' && (
                  <>
                    {([-1,1] as const).map(s => (
                      <group key={s} position={[s*0.195, 0.08, 0.495]}>
                        <mesh position={[0, 0.07, 0]} rotation={[0,0,s*0.32]}>
                          <planeGeometry args={[0.16, 0.032]} />
                          <Toon color="#111" />
                        </mesh>
                        <mesh position={[0,-0.01,0]}>
                          <planeGeometry args={[0.14, 0.1]} />
                          <Toon color={eyesColor||'#60a5fa'} />
                        </mesh>
                      </group>
                    ))}
                  </>
                )}
                {eyesId === 'eyes_star' && (
                  <>
                    {([-1,1] as const).map(s => (
                      <group key={s} position={[s*0.195, 0.08, 0.492]}>
                        <mesh position={[0,0,-0.001]}><planeGeometry args={[0.18,0.18]} /><Toon color="#111" /></mesh>
                        <mesh rotation={[0,0,Math.PI/10]}><circleGeometry args={[0.074,5]} /><Toon color={eyesColor} /></mesh>
                        <mesh position={[s*-0.024,0.016,0.001]}><circleGeometry args={[0.02,10]} /><Toon color="#fff" /></mesh>
                      </group>
                    ))}
                  </>
                )}
                {eyesId === 'eyes_heart' && (
                  <>
                    {([-1,1] as const).map(s => (
                      <group key={s} position={[s*0.195, 0.08, 0.494]}>
                        <mesh position={[-0.028,0.025,0]}><circleGeometry args={[0.046,14]} /><Toon color={eyesColor} /></mesh>
                        <mesh position={[0.028,0.025,0]}><circleGeometry args={[0.046,14]} /><Toon color={eyesColor} /></mesh>
                        <mesh position={[0,-0.018,0]} rotation={[0,0,Math.PI]}><coneGeometry args={[0.05,0.082,12]} /><Toon color={eyesColor} /></mesh>
                        <mesh position={[s*-0.02,0.03,0.001]}><circleGeometry args={[0.015,10]} /><Toon color="#fff" /></mesh>
                      </group>
                    ))}
                  </>
                )}
                {eyesId === 'eyes_cyber' && (
                  <mesh position={[0, 0.08, 0.496]}>
                    <planeGeometry args={[0.44, 0.058]} />
                    <Toon color={eyesColor} emissive={eyesColor} emissiveIntensity={0.6} />
                  </mesh>
                )}

                {/* ── NOSE (tiny cute bump) ── */}
                <mesh position={[0, -0.04, 0.515]} scale={[1.0, 0.7, 0.4]}>
                  <sphereGeometry args={[0.022, 10, 10]} />
                  <Toon color={skinColor} />
                </mesh>

                {/* ── MOUTH ── */}
                {mouthId === 'mouth_smile' && (
                  <mesh position={[0,-0.17,0.498]} scale={[1.4,1.4,0.008]}>
                    <torusGeometry args={[0.055,0.012,6,20,Math.PI]} />
                    <Toon color="#111" />
                  </mesh>
                )}
                {mouthId === 'mouth_open' && (
                  <>
                    <mesh position={[0,-0.17,0.5]}><circleGeometry args={[0.056,20]} /><Toon color="#111" /></mesh>
                    <mesh position={[0,-0.172,0.502]}><circleGeometry args={[0.044,20]} /><Toon color="#ef4444" /></mesh>
                  </>
                )}
                {mouthId === 'mouth_sad' && (
                  <mesh position={[0,-0.19,0.498]} rotation={[0,0,Math.PI]} scale={[1.4,1.4,0.008]}>
                    <torusGeometry args={[0.055,0.012,6,20,Math.PI]} />
                    <Toon color="#111" />
                  </mesh>
                )}
                {mouthId === 'mouth_cat' && (
                  <group position={[0,-0.17,0.498]} scale={[1,1,0.008]}>
                    <mesh position={[-0.036,0,0]}><torusGeometry args={[0.034,0.01,6,18,Math.PI]} /><Toon color="#111" /></mesh>
                    <mesh position={[0.036,0,0]}><torusGeometry args={[0.034,0.01,6,18,Math.PI]} /><Toon color="#111" /></mesh>
                  </group>
                )}
                {mouthId === 'mouth_vampire' && (
                  <group position={[0,-0.17,0.498]}>
                    <mesh><planeGeometry args={[0.11,0.011]} /><Toon color="#111" /></mesh>
                    <mesh position={[-0.036,-0.032,0.001]} rotation={[0,0,Math.PI]}><coneGeometry args={[0.012,0.048,8]} /><Toon color="#f8fafc" /></mesh>
                    <mesh position={[0.036,-0.032,0.001]} rotation={[0,0,Math.PI]}><coneGeometry args={[0.012,0.048,8]} /><Toon color="#f8fafc" /></mesh>
                  </group>
                )}

                {/* ── BLUSH ── */}
                <mesh position={[-0.3,-0.1,0.46]} scale={[1.15,0.6,0.07]}>
                  <circleGeometry args={[0.1,16]} />
                  <Toon color="#f9a8d4" opacity={0.72} transparent />
                </mesh>
                <mesh position={[0.3,-0.1,0.46]} scale={[1.15,0.6,0.07]}>
                  <circleGeometry args={[0.1,16]} />
                  <Toon color="#f9a8d4" opacity={0.72} transparent />
                </mesh>

                {/* ── DECALS ── */}
                {decalsId === 'decal_scar' && (
                  <mesh position={[-0.17,0.1,0.5]} rotation={[0,0,0.36]}>
                    <planeGeometry args={[0.028,0.2]} />
                    <Toon color={decalsColor} />
                  </mesh>
                )}
                {decalsId === 'decal_bandage' && (
                  <mesh position={[0.03,-0.02,0.5]} rotation={[0,0,-0.07]}>
                    <planeGeometry args={[0.22,0.072]} />
                    <Toon color="#f5f5f5" />
                  </mesh>
                )}
                {decalsId === 'decal_freckles' && (
                  <group position={[0,0,0.5]}>
                    {[-0.2,-0.255,-0.15,0.2,0.255,0.15].map((x,i) => (
                      <mesh key={i} position={[x,-0.01,0]}>
                        <circleGeometry args={[i%3===0?0.014:i%3===1?0.011:0.009,8]} />
                        <Toon color="#b45309" />
                      </mesh>
                    ))}
                  </group>
                )}
                {decalsId === 'decal_tear' && (
                  <mesh position={[0.2,-0.065,0.5]} rotation={[0,0,Math.PI]}>
                    <coneGeometry args={[0.02,0.048,12]} />
                    <Toon color="#60a5fa" opacity={0.9} transparent />
                  </mesh>
                )}
                {decalsId === 'decal_cyber' && (
                  <group position={[0.28,0.12,0.5]}>
                    <mesh><planeGeometry args={[0.01,0.13]} /><Toon color={decalsColor} emissive={decalsColor} emissiveIntensity={0.5} /></mesh>
                    <mesh position={[0.028,0.032,0]}><planeGeometry args={[0.072,0.01]} /><Toon color={decalsColor} emissive={decalsColor} emissiveIntensity={0.5} /></mesh>
                  </group>
                )}
                {decalsId === 'decal_star' && (
                  <mesh position={[-0.2,-0.09,0.5]} rotation={[Math.PI/2,0.16,0]}>
                    <cylinderGeometry args={[0.028,0.028,0.005,5]} />
                    <Toon color={decalsColor} />
                  </mesh>
                )}

                {/* ── HAIR ── */}
                {hairId !== 'hair_bald' && (
                  <group>
                    {/* Hair cap (most styles) */}
                    {!['hair_mohawk','hair_curly'].includes(hairId) && (
                      <group position={[0,0.09,-0.03]}>
                        <mesh scale={1.04}>
                          <sphereGeometry args={[0.535,26,26]} />
                          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
                        </mesh>
                        <mesh>
                          <sphereGeometry args={[0.535,26,26]} />
                          <Toon color={hairColor} />
                        </mesh>
                      </group>
                    )}
                    {/* Bangs */}
                    {['hair_short','hair_long','hair_twintails','hair_ponytail'].includes(hairId) && (
                      <group position={[0,0.3,0.4]} rotation={[0.2,0,0]}>
                        <mesh rotation={[0,0,Math.PI/2]}>
                          <capsuleGeometry args={[0.1,0.72,10,18]} />
                          <Toon color={hairColor} />
                        </mesh>
                      </group>
                    )}
                    {hairId === 'hair_long' && (
                      <mesh position={[0,-0.35,-0.3]} rotation={[0.1,0,0]}>
                        <capsuleGeometry args={[0.27,0.9,10,18]} />
                        <Toon color={hairColor} />
                      </mesh>
                    )}
                    {hairId === 'hair_twintails' && (
                      <>
                        <mesh position={[-0.54,-0.18,0]} rotation={[0,0,0.28]}>
                          <capsuleGeometry args={[0.17,0.72,10,18]} />
                          <Toon color={hairColor} />
                        </mesh>
                        <mesh position={[0.54,-0.18,0]} rotation={[0,0,-0.28]}>
                          <capsuleGeometry args={[0.17,0.72,10,18]} />
                          <Toon color={hairColor} />
                        </mesh>
                      </>
                    )}
                    {hairId === 'hair_curly' && (
                      <mesh position={[0,0.18,-0.03]}>
                        <sphereGeometry args={[0.65,26,26]} />
                        <Toon color={hairColor} />
                      </mesh>
                    )}
                    {hairId === 'hair_mohawk' && (
                      <group position={[0,0.5,-0.03]}>
                        {[...Array(5)].map((_,i) => (
                          <mesh key={i} position={[0,Math.sin(i*0.65)*0.1,(i-2)*0.18]} rotation={[0.1-i*0.05,0,0]}>
                            <capsuleGeometry args={[0.055,0.36,8,14]} />
                            <Toon color={hairColor} />
                          </mesh>
                        ))}
                      </group>
                    )}
                    {hairId === 'hair_ponytail' && (
                      <group position={[0,0.09,-0.53]} rotation={[-0.34,0,0]}>
                        <mesh><sphereGeometry args={[0.11,14,14]} /><Toon color={hairColor} /></mesh>
                        <mesh position={[0,-0.36,-0.1]} rotation={[0.1,0,0]}>
                          <capsuleGeometry args={[0.14,0.72,10,18]} />
                          <Toon color={hairColor} />
                        </mesh>
                      </group>
                    )}
                    {hairId === 'hair_samurai' && (
                      <mesh position={[0,0.6,-0.16]}>
                        <sphereGeometry args={[0.14,14,14]} />
                        <Toon color={hairColor} />
                      </mesh>
                    )}
                    {hairId === 'hair_messy' && (
                      <group position={[0,0.3,0]}>
                        {[...Array(10)].map((_,i) => (
                          <mesh key={i} position={[Math.cos(i*0.628)*0.34,(i%3)*0.09,Math.sin(i*0.628)*0.34]} rotation={[Math.cos(i)*0.4,0,Math.sin(i)*0.4]}>
                            <capsuleGeometry args={[0.11,0.44,8,14]} />
                            <Toon color={hairColor} />
                          </mesh>
                        ))}
                      </group>
                    )}
                  </group>
                )}

                {/* ── ACCESSORIES ── */}
                {accessoryId === 'acc_catears' && (
                  <group position={[0,0.5,0]}>
                    <mesh position={[-0.24,0,0]} rotation={[0,0,0.18]}><coneGeometry args={[0.075,0.19,14]} /><Toon color="#fbcfe8" /></mesh>
                    <mesh position={[0.24,0,0]} rotation={[0,0,-0.18]}><coneGeometry args={[0.075,0.19,14]} /><Toon color="#fbcfe8" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_halo' && (
                  <group position={[0,0.82,0]} rotation={[Math.PI/2+0.15,0,0]}>
                    <mesh><torusGeometry args={[0.3,0.026,12,48]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.6} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_headphones' && (
                  <group>
                    <mesh><torusGeometry args={[0.56,0.062,12,48]} /><Toon color="#111" /></mesh>
                    {([-1,1] as const).map(s => (
                      <group key={s} position={[s*0.56,0,0]} rotation={[0,Math.PI/2,0]}>
                        <mesh><cylinderGeometry args={[0.22,0.22,0.14,22]} /><Toon color="#27272a" /></mesh>
                        <mesh position={[0,0,s*0.078]}><circleGeometry args={[0.088,20]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} side={2} /></mesh>
                      </group>
                    ))}
                  </group>
                )}
                {accessoryId === 'acc_crown' && (
                  <group position={[0,0.72,0]}>
                    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.24,0.24,0.055,22]} /><Toon color="#fbbf24" /></mesh>
                    {[...Array(6)].map((_,i) => (
                      <mesh key={i} position={[Math.cos(i*Math.PI/3)*0.24,0.055,Math.sin(i*Math.PI/3)*0.24]}>
                        <coneGeometry args={[0.036,0.12,8]} />
                        <Toon color="#fbbf24" />
                      </mesh>
                    ))}
                  </group>
                )}
                {accessoryId === 'acc_horns' && (
                  <group position={[0,0.44,0.3]}>
                    <mesh position={[-0.16,0,0]} rotation={[-0.1,0,0.18]}><coneGeometry args={[0.052,0.16,8]} /><Toon color={accessoryColor} /></mesh>
                    <mesh position={[0.16,0,0]} rotation={[-0.1,0,-0.18]}><coneGeometry args={[0.052,0.16,8]} /><Toon color={accessoryColor} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_shades' && (
                  <group position={[0,0.08,0.505]}>
                    <mesh position={[-0.18,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.112,0.112,0.028,22]} /><Toon color="#111" /></mesh>
                    <mesh position={[0.18,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.112,0.112,0.028,22]} /><Toon color="#111" /></mesh>
                    <mesh position={[0,0.006,0]}><planeGeometry args={[0.16,0.01]} /><Toon color="#aaa" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_visor' && (
                  <group position={[0,0.08,0.498]} scale={[1,1,0.009]}>
                    <mesh rotation={[0,0,Math.PI/2]}><capsuleGeometry args={[0.112,0.44,12,22]} /><Toon color="#111" opacity={0.8} transparent /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_cybermask' && (
                  <group position={[0,-0.13,0.46]}>
                    <mesh rotation={[0.07,0,Math.PI/2]}><capsuleGeometry args={[0.12,0.27,12,22]} /><Toon color="#1a1a1a" /></mesh>
                    <mesh position={[0,0.04,0.12]}><planeGeometry args={[0.34,0.024]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} /></mesh>
                    <mesh position={[0,-0.026,0.12]}><planeGeometry args={[0.22,0.02]} /><Toon color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_gasmask' && (
                  <group position={[0,-0.12,0.51]}>
                    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.17,0.2,0.16,22]} /><Toon color="#27272a" /></mesh>
                    <mesh position={[0,0,0.088]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.082,0.082,0.028,22]} /><Toon color="#111" /></mesh>
                    <mesh position={[-0.2,-0.055,0.03]} rotation={[Math.PI/2,0,0.34]}><cylinderGeometry args={[0.1,0.1,0.1,18]} /><Toon color="#3f3f46" /></mesh>
                    <mesh position={[0.2,-0.055,0.03]} rotation={[Math.PI/2,0,-0.34]}><cylinderGeometry args={[0.1,0.1,0.1,18]} /><Toon color="#3f3f46" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_goggles' && (
                  <group position={[0,0.36,0.43]} rotation={[-0.1,0,0]}>
                    <mesh position={[-0.14,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.11,0.11,0.055,22]} /><Toon color="#3f3f46" /></mesh>
                    <mesh position={[0.14,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.11,0.11,0.055,22]} /><Toon color="#3f3f46" /></mesh>
                    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.028,0.028,0.028,14]} /><Toon color="#111" /></mesh>
                    <mesh position={[-0.14,0,0.034]} rotation={[Math.PI/2,0,0]}><circleGeometry args={[0.076,20]} /><Toon color={accessoryColor} /></mesh>
                    <mesh position={[0.14,0,0.034]} rotation={[Math.PI/2,0,0]}><circleGeometry args={[0.076,20]} /><Toon color={accessoryColor} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_eyepatch' && (
                  <group position={[0,0.08,0.5]}>
                    <mesh position={[-0.16,0,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.1,0.1,0.028,22]} /><Toon color="#111" /></mesh>
                    <mesh rotation={[0.1,0,0.09]}><planeGeometry args={[1.02,0.01]} /><Toon color="#111" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_kitsune' && (
                  <group position={[-0.4,0.16,0.29]} rotation={[0,-0.6,-0.18]}>
                    <mesh rotation={[Math.PI/2,0,0]}><capsuleGeometry args={[0.15,0.24,12,22]} /><Toon color="#fff" /></mesh>
                    <mesh position={[-0.09,0.18,0]} rotation={[0,0,0.14]}><coneGeometry args={[0.054,0.14,8]} /><Toon color="#fff" /></mesh>
                    <mesh position={[0.09,0.18,0]} rotation={[0,0,-0.14]}><coneGeometry args={[0.054,0.14,8]} /><Toon color="#fff" /></mesh>
                    <mesh position={[0,0.06,0.16]}><planeGeometry args={[0.18,0.01]} /><Toon color="#ef4444" /></mesh>
                    <mesh position={[0,0,0.16]}><planeGeometry args={[0.01,0.055]} /><Toon color="#ef4444" /></mesh>
                  </group>
                )}

              </group>{/* end Head */}

            </group>
          </Float>

          {/* Stage */}
          <group position={[0,-1.0,0]}>
            {stageId === 'stage_holo' && (<mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[1.5,32]} /><meshToonMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.4} wireframe /></mesh>)}
            {stageId === 'stage_ring' && (<mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.1,0.036,12,48]} /><meshToonMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} /></mesh>)}
            {stageId === 'stage_pedestal' && (<group><mesh><cylinderGeometry args={[1.05,1.25,0.12,22]} /><Toon color="#18181b" /></mesh><mesh position={[0,0.08,0]}><torusGeometry args={[1.05,0.012,12,48]} /><meshToonMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} /></mesh></group>)}
            {stageId === 'stage_magic' && (<group><mesh rotation={[Math.PI/2,0,0]}><circleGeometry args={[1.8,48]} /><meshToonMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} wireframe /></mesh><mesh rotation={[Math.PI/2,0,Math.PI/6]}><circleGeometry args={[1.8,48]} /><meshToonMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} wireframe /></mesh></group>)}
          </group>
        </Suspense>

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.0} mipmapBlur intensity={0.45} />
          <Vignette eskil={false} offset={0.16} darkness={0.36} />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2.5}
          maxDistance={6.5}
          autoRotate
          autoRotateSpeed={0.85}
          maxPolarAngle={Math.PI / 1.75}
          minPolarAngle={Math.PI / 6}
          target={[0, -0.1, 0]}
        />
      </Canvas>
    </div>
  )
}
