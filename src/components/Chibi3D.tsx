'use client'
import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Cell-shaded toon material (Azur Lane style)
const T = ({ color, emissive }: { color: string; emissive?: string }) => (
  <meshToonMaterial color={color} emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.15 : 0} />
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
}) {
  // ── Body scale ──────────────────────────────────────────────────────────────
  let bScale: [number, number, number] = [1, 1, 1]
  if (bodyId === 'body_chubby')   bScale = [1.18, 0.92, 1.18]
  if (bodyId === 'body_tall')     bScale = [0.92, 1.22, 0.92]
  if (bodyId === 'body_muscular') bScale = [1.28, 1.04, 1.1]

  // ── Animated stage rocks ────────────────────────────────────────────────────
  const AnimatedStage = ({ stageId }: { stageId: string }) => {
    const ref = useRef<THREE.Group>(null)
    useFrame(({ clock }) => {
      if (ref.current) {
        ref.current.rotation.y = clock.getElapsedTime() * 0.3
        ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.08
      }
    })
    if (stageId !== 'stage_rocks') return null
    return (
      <group ref={ref}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[Math.cos(i * 1.26) * 2, Math.sin(i * 1.9) * 0.4, Math.sin(i * 1.26) * 2]}>
            <dodecahedronGeometry args={[0.22, 0]} />
            <T color="#52525b" />
          </mesh>
        ))}
      </group>
    )
  }

  // ────────────────────────────────────────────────────────────────────────────
  // AZUR LANE CHIBI PROPORTIONS
  //  Root at y = -0.9  (so character centre is near camera target)
  //  Body: y = 0 … 0.9
  //  Head: sphere r=0.72 at y = 1.65, scale 1.2 → head is ~55 % of total h
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [0, 0.4, 3.8], fov: 48 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        {/* ── Lighting: soft, anime-friendly ── */}
        <ambientLight intensity={1.4} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={0.9}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.001}
        />
        {/* Back-rim for silhouette */}
        <directionalLight position={[-2, 3, -4]} intensity={0.25} color="#c4b5fd" />

        <Suspense fallback={null}>
          <ContactShadows position={[0, -0.9, 0]} opacity={0.55} scale={5} blur={1.8} far={2.5} />

          <Float speed={2.5} rotationIntensity={0.03} floatIntensity={0.1} floatingRange={[0, 0.07]}>
            <group position={[0, -0.9, 0]} scale={bScale}>

              {/* ══════════════════════ B O D Y ══════════════════════ */}
              <group>

                {/* Torso — very short & round */}
                <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
                  <capsuleGeometry args={[0.34, 0.28, 12, 24]} />
                  <T color={clothesColor} />
                </mesh>

                {/* ── Clothes overlays ── */}
                {clothesId === 'clothes_casual' && (
                  <>
                    <mesh position={[0, 0.88, 0]}>
                      <torusGeometry args={[0.14, 0.038, 12, 24]} />
                      <T color="#ffffff" />
                    </mesh>
                    <mesh position={[0.04, 0.6, 0.33]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.062, 0.062, 0.008, 20]} />
                      <T color="#ffffff" />
                    </mesh>
                  </>
                )}
                {clothesId === 'clothes_suit' && (
                  <>
                    <mesh position={[0, 0.65, 0.32]} rotation={[0.08, 0, 0]}>
                      <boxGeometry args={[0.26, 0.36, 0.008]} />
                      <T color="#f1f5f9" />
                    </mesh>
                    <mesh position={[0, 0.61, 0.33]}>
                      <boxGeometry args={[0.055, 0.28, 0.008]} />
                      <T color="#ef4444" />
                    </mesh>
                    <mesh position={[0, 0.78, 0.33]}>
                      <boxGeometry args={[0.075, 0.055, 0.014]} />
                      <T color="#ef4444" />
                    </mesh>
                    <mesh position={[-0.13, 0.7, 0.33]} rotation={[0, 0, -0.32]}>
                      <boxGeometry args={[0.065, 0.34, 0.008]} />
                      <T color={clothesColor} />
                    </mesh>
                    <mesh position={[0.13, 0.7, 0.33]} rotation={[0, 0, 0.32]}>
                      <boxGeometry args={[0.065, 0.34, 0.008]} />
                      <T color={clothesColor} />
                    </mesh>
                  </>
                )}
                {clothesId === 'clothes_hoodie' && (
                  <>
                    <mesh position={[0, 0.84, -0.18]} rotation={[-0.12, 0, 0]}>
                      <torusGeometry args={[0.28, 0.16, 12, 24]} />
                      <T color={clothesColor} />
                    </mesh>
                    <mesh position={[-0.07, 0.5, 0.33]}>
                      <cylinderGeometry args={[0.007, 0.007, 0.2, 6]} />
                      <T color="#d4d4d4" />
                    </mesh>
                    <mesh position={[0.07, 0.5, 0.33]}>
                      <cylinderGeometry args={[0.007, 0.007, 0.2, 6]} />
                      <T color="#d4d4d4" />
                    </mesh>
                    <mesh position={[0, 0.38, 0.33]}>
                      <boxGeometry args={[0.38, 0.16, 0.016]} />
                      <T color={clothesColor} />
                    </mesh>
                  </>
                )}
                {clothesId === 'clothes_tech' && (
                  <>
                    <mesh position={[0, 0.6, 0.34]} rotation={[0, 0, 0.42]}>
                      <boxGeometry args={[0.62, 0.036, 0.008]} />
                      <T color="#111111" />
                    </mesh>
                    <mesh position={[0, 0.6, 0.34]} rotation={[0, 0, -0.42]}>
                      <boxGeometry args={[0.62, 0.036, 0.008]} />
                      <T color="#111111" />
                    </mesh>
                    <mesh position={[0, 0.34, 0]}>
                      <cylinderGeometry args={[0.35, 0.35, 0.055, 24]} />
                      <T color="#111111" />
                    </mesh>
                  </>
                )}
                {clothesId === 'clothes_robe' && (
                  <>
                    <mesh position={[0, 0.25, 0]}>
                      <cylinderGeometry args={[0.36, 0.48, 0.36, 24]} />
                      <T color={clothesColor} />
                    </mesh>
                    <mesh position={[0, 0.08, 0]}>
                      <cylinderGeometry args={[0.48, 0.48, 0.036, 24]} />
                      <T color="#eab308" />
                    </mesh>
                  </>
                )}
                {clothesId === 'clothes_ninja' && (
                  <mesh position={[0, 0.82, 0.1]} rotation={[0.12, 0, 0]}>
                    <torusGeometry args={[0.28, 0.11, 12, 24]} />
                    <T color="#111111" />
                  </mesh>
                )}
                {clothesId === 'clothes_armor' && (
                  <>
                    <mesh position={[-0.46, 0.72, 0]} rotation={[0, 0, 0.28]}>
                      <cylinderGeometry args={[0.19, 0.19, 0.3, 24]} />
                      <meshToonMaterial color="#a1a1aa" />
                    </mesh>
                    <mesh position={[0.46, 0.72, 0]} rotation={[0, 0, -0.28]}>
                      <cylinderGeometry args={[0.19, 0.19, 0.3, 24]} />
                      <meshToonMaterial color="#a1a1aa" />
                    </mesh>
                    <mesh position={[0, 0.6, 0.1]}>
                      <boxGeometry args={[0.55, 0.42, 0.24]} />
                      <meshToonMaterial color="#a1a1aa" />
                    </mesh>
                  </>
                )}

                {/* ── Arms (short & stubby) ── */}
                <group position={[-0.44, 0.62, 0]} rotation={[0, 0, -0.55]}>
                  <mesh castShadow>
                    <capsuleGeometry args={[0.12, 0.22, 10, 20]} />
                    <T color={['clothes_casual', 'clothes_robe'].includes(clothesId) ? skinColor : clothesColor} />
                  </mesh>
                  {clothesId === 'clothes_casual' && (
                    <mesh position={[0, 0.08, 0]}>
                      <cylinderGeometry args={[0.125, 0.125, 0.14, 20]} />
                      <T color={clothesColor} />
                    </mesh>
                  )}
                </group>
                <group position={[0.44, 0.62, 0]} rotation={[0, 0, 0.55]}>
                  <mesh castShadow>
                    <capsuleGeometry args={[0.12, 0.22, 10, 20]} />
                    <T color={['clothes_casual', 'clothes_robe'].includes(clothesId) ? skinColor : clothesColor} />
                  </mesh>
                  {clothesId === 'clothes_casual' && (
                    <mesh position={[0, 0.08, 0]}>
                      <cylinderGeometry args={[0.125, 0.125, 0.14, 20]} />
                      <T color={clothesColor} />
                    </mesh>
                  )}
                </group>

                {/* ── Neck ── */}
                <mesh position={[0, 0.96, 0]}>
                  <cylinderGeometry args={[0.11, 0.14, 0.16, 20]} />
                  <T color={skinColor} />
                </mesh>

                {/* ── Pelvis / Waist ── */}
                <mesh castShadow position={[0, 0.2, 0]}>
                  {bottomsId === 'bottom_skirt'
                    ? <cylinderGeometry args={[0.32, 0.5, 0.34, 24]} />
                    : <cylinderGeometry args={[0.32, 0.36, 0.22, 24]} />}
                  <T color={bottomsColor} />
                </mesh>

                {/* ── Legs (super stubby) ── */}
                {['bottom_skirt'].includes(bottomsId) ? null : (
                  <>
                    {/* Left */}
                    <group position={[-0.16, -0.06, 0]}>
                      <mesh castShadow>
                        <capsuleGeometry args={[0.12, 0.2, 10, 20]} />
                        <T color={skinColor} />
                      </mesh>
                      {bottomsId !== 'bottom_shorts' && (
                        <mesh position={[0, 0.06, 0]}>
                          <cylinderGeometry args={[0.125, 0.125, 0.28, 20]} />
                          <T color={bottomsColor} />
                        </mesh>
                      )}
                      {bottomsId === 'bottom_shorts' && (
                        <mesh position={[0, 0.1, 0]}>
                          <cylinderGeometry args={[0.125, 0.125, 0.14, 20]} />
                          <T color={bottomsColor} />
                        </mesh>
                      )}
                      {/* Shoe */}
                      <mesh position={[0, -0.22, 0.055]} rotation={[0.1, 0, 0]}>
                        <capsuleGeometry args={[0.1, 0.14, 6, 12]} />
                        <T color="#1c1917" />
                      </mesh>
                    </group>
                    {/* Right */}
                    <group position={[0.16, -0.06, 0]}>
                      <mesh castShadow>
                        <capsuleGeometry args={[0.12, 0.2, 10, 20]} />
                        <T color={skinColor} />
                      </mesh>
                      {bottomsId !== 'bottom_shorts' && (
                        <mesh position={[0, 0.06, 0]}>
                          <cylinderGeometry args={[0.125, 0.125, 0.28, 20]} />
                          <T color={bottomsColor} />
                        </mesh>
                      )}
                      {bottomsId === 'bottom_shorts' && (
                        <mesh position={[0, 0.1, 0]}>
                          <cylinderGeometry args={[0.125, 0.125, 0.14, 20]} />
                          <T color={bottomsColor} />
                        </mesh>
                      )}
                      {/* Shoe */}
                      <mesh position={[0, -0.22, 0.055]} rotation={[0.1, 0, 0]}>
                        <capsuleGeometry args={[0.1, 0.14, 6, 12]} />
                        <T color="#1c1917" />
                      </mesh>
                    </group>
                  </>
                )}
              </group>
              {/* ─────────────────────────────────────────────────────────── */}

              {/* ══════════════════════ H E A D ══════════════════════ */}
              {/* Azur Lane ratio: head ≈ 50 % of total figure height */}
              <group position={[0, 1.62, 0]} scale={[1.18, 1.18, 1.18]}>

                {/* Skull */}
                <mesh castShadow receiveShadow>
                  <sphereGeometry args={[0.68, 36, 36]} />
                  <T color={skinColor} />
                </mesh>
                {/* Slightly flattened chin */}
                <mesh position={[0, -0.38, 0.18]} scale={[0.9, 0.7, 0.7]}>
                  <sphereGeometry args={[0.42, 24, 24]} />
                  <T color={skinColor} />
                </mesh>

                {/* ── EYES: proper Azur Lane layered anime eyes ── */}
                {/* Each eye: white → color → pupil → shine */}
                {(eyesId === 'eyes_normal' || eyesId === 'eyes_big') && (
                  <>
                    {/* LEFT EYE */}
                    <group position={[-0.21, 0.07, 0.62]}>
                      {/* White sclera */}
                      <mesh scale={[1.4, 1.6, 0.05]}>
                        <sphereGeometry args={[eyesId === 'eyes_big' ? 0.115 : 0.092, 20, 20]} />
                        <meshToonMaterial color="#ffffff" />
                      </mesh>
                      {/* Iris (colored) */}
                      <mesh position={[0, 0, 0.04]} scale={[1.1, 1.3, 0.04]}>
                        <sphereGeometry args={[eyesId === 'eyes_big' ? 0.092 : 0.072, 20, 20]} />
                        <meshToonMaterial color={eyesColor} />
                      </mesh>
                      {/* Pupil (black) */}
                      <mesh position={[0, -0.01, 0.07]} scale={[1, 1.15, 0.03]}>
                        <sphereGeometry args={[eyesId === 'eyes_big' ? 0.055 : 0.042, 16, 16]} />
                        <meshToonMaterial color="#111111" />
                      </mesh>
                      {/* Top lash shadow */}
                      <mesh position={[0, eyesId === 'eyes_big' ? 0.095 : 0.078, 0.06]} rotation={[0, 0, 0]}>
                        <boxGeometry args={[eyesId === 'eyes_big' ? 0.24 : 0.2, 0.04, 0.008]} />
                        <meshToonMaterial color="#111111" />
                      </mesh>
                      {/* Highlight dot */}
                      <mesh position={[-0.03, 0.04, 0.1]}>
                        <sphereGeometry args={[0.022, 10, 10]} />
                        <meshToonMaterial color="#ffffff" />
                      </mesh>
                      {/* Small secondary highlight */}
                      <mesh position={[0.04, -0.03, 0.1]}>
                        <sphereGeometry args={[0.012, 8, 8]} />
                        <meshToonMaterial color="#ffffff" />
                      </mesh>
                    </group>
                    {/* RIGHT EYE */}
                    <group position={[0.21, 0.07, 0.62]}>
                      <mesh scale={[1.4, 1.6, 0.05]}>
                        <sphereGeometry args={[eyesId === 'eyes_big' ? 0.115 : 0.092, 20, 20]} />
                        <meshToonMaterial color="#ffffff" />
                      </mesh>
                      <mesh position={[0, 0, 0.04]} scale={[1.1, 1.3, 0.04]}>
                        <sphereGeometry args={[eyesId === 'eyes_big' ? 0.092 : 0.072, 20, 20]} />
                        <meshToonMaterial color={eyesColor} />
                      </mesh>
                      <mesh position={[0, -0.01, 0.07]} scale={[1, 1.15, 0.03]}>
                        <sphereGeometry args={[eyesId === 'eyes_big' ? 0.055 : 0.042, 16, 16]} />
                        <meshToonMaterial color="#111111" />
                      </mesh>
                      <mesh position={[0, eyesId === 'eyes_big' ? 0.095 : 0.078, 0.06]} rotation={[0, 0, 0]}>
                        <boxGeometry args={[eyesId === 'eyes_big' ? 0.24 : 0.2, 0.04, 0.008]} />
                        <meshToonMaterial color="#111111" />
                      </mesh>
                      <mesh position={[0.03, 0.04, 0.1]}>
                        <sphereGeometry args={[0.022, 10, 10]} />
                        <meshToonMaterial color="#ffffff" />
                      </mesh>
                      <mesh position={[-0.04, -0.03, 0.1]}>
                        <sphereGeometry args={[0.012, 8, 8]} />
                        <meshToonMaterial color="#ffffff" />
                      </mesh>
                    </group>
                  </>
                )}
                {eyesId === 'eyes_closed' && (
                  <>
                    <mesh position={[-0.21, 0.07, 0.65]} rotation={[0, 0, 0.12]}>
                      <boxGeometry args={[0.18, 0.03, 0.006]} />
                      <meshToonMaterial color="#1a1a1a" />
                    </mesh>
                    {/* eyelashes */}
                    <mesh position={[-0.21, 0.03, 0.65]} rotation={[0, 0, 0.2]}>
                      <boxGeometry args={[0.16, 0.018, 0.006]} />
                      <meshToonMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh position={[0.21, 0.07, 0.65]} rotation={[0, 0, -0.12]}>
                      <boxGeometry args={[0.18, 0.03, 0.006]} />
                      <meshToonMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh position={[0.21, 0.03, 0.65]} rotation={[0, 0, -0.2]}>
                      <boxGeometry args={[0.16, 0.018, 0.006]} />
                      <meshToonMaterial color="#1a1a1a" />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_angry' && (
                  <>
                    <mesh position={[-0.21, 0.07, 0.65]} rotation={[0, 0, -0.32]}>
                      <boxGeometry args={[0.19, 0.036, 0.006]} />
                      <meshToonMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh position={[-0.21, 0.04, 0.64]}>
                      <boxGeometry args={[0.14, 0.06, 0.006]} />
                      <meshToonMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[0.21, 0.07, 0.65]} rotation={[0, 0, 0.32]}>
                      <boxGeometry args={[0.19, 0.036, 0.006]} />
                      <meshToonMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh position={[0.21, 0.04, 0.64]}>
                      <boxGeometry args={[0.14, 0.06, 0.006]} />
                      <meshToonMaterial color={eyesColor} />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_sad' && (
                  <>
                    <mesh position={[-0.21, 0.07, 0.65]} rotation={[0, 0, 0.32]}>
                      <boxGeometry args={[0.19, 0.036, 0.006]} />
                      <meshToonMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh position={[-0.21, 0.04, 0.64]}>
                      <boxGeometry args={[0.14, 0.07, 0.006]} />
                      <meshToonMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[0.21, 0.07, 0.65]} rotation={[0, 0, -0.32]}>
                      <boxGeometry args={[0.19, 0.036, 0.006]} />
                      <meshToonMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh position={[0.21, 0.04, 0.64]}>
                      <boxGeometry args={[0.14, 0.07, 0.006]} />
                      <meshToonMaterial color={eyesColor} />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_star' && (
                  <>
                    <mesh position={[-0.21, 0.07, 0.63]} rotation={[Math.PI/2, 0, Math.PI/10]} scale={[1, 1, 0.04]}>
                      <cylinderGeometry args={[0.09, 0.09, 0.01, 5]} />
                      <meshToonMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[0.21, 0.07, 0.63]} rotation={[Math.PI/2, 0, Math.PI/10]} scale={[1, 1, 0.04]}>
                      <cylinderGeometry args={[0.09, 0.09, 0.01, 5]} />
                      <meshToonMaterial color={eyesColor} />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_heart' && (
                  <>
                    <group position={[-0.21, 0.07, 0.64]} scale={[1, 1, 0.04]}>
                      <mesh position={[-0.035, 0.035, 0]}><sphereGeometry args={[0.055, 12, 12]} /><meshToonMaterial color={eyesColor} /></mesh>
                      <mesh position={[0.035, 0.035, 0]}><sphereGeometry args={[0.055, 12, 12]} /><meshToonMaterial color={eyesColor} /></mesh>
                      <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.062, 0.1, 12]} /><meshToonMaterial color={eyesColor} /></mesh>
                    </group>
                    <group position={[0.21, 0.07, 0.64]} scale={[1, 1, 0.04]}>
                      <mesh position={[-0.035, 0.035, 0]}><sphereGeometry args={[0.055, 12, 12]} /><meshToonMaterial color={eyesColor} /></mesh>
                      <mesh position={[0.035, 0.035, 0]}><sphereGeometry args={[0.055, 12, 12]} /><meshToonMaterial color={eyesColor} /></mesh>
                      <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.062, 0.1, 12]} /><meshToonMaterial color={eyesColor} /></mesh>
                    </group>
                  </>
                )}
                {eyesId === 'eyes_cyber' && (
                  <mesh position={[0, 0.07, 0.65]}>
                    <boxGeometry args={[0.55, 0.07, 0.008]} />
                    <meshToonMaterial color={eyesColor} emissive={eyesColor} emissiveIntensity={0.8} />
                  </mesh>
                )}

                {/* ── MOUTH ── */}
                {mouthId === 'mouth_smile' && (
                  <mesh position={[0, -0.16, 0.64]} scale={[1.6, 1.6, 0.008]}>
                    <torusGeometry args={[0.062, 0.013, 8, 24, Math.PI]} />
                    <meshToonMaterial color="#1a1a1a" />
                  </mesh>
                )}
                {mouthId === 'mouth_open' && (
                  <mesh position={[0, -0.16, 0.65]} rotation={[Math.PI/2, 0, 0]} scale={[1, 1, 0.009]}>
                    <cylinderGeometry args={[0.065, 0.065, 0.01, 24]} />
                    <meshToonMaterial color="#1a1a1a" />
                  </mesh>
                )}
                {mouthId === 'mouth_sad' && (
                  <mesh position={[0, -0.18, 0.64]} rotation={[0, 0, Math.PI]} scale={[1.6, 1.6, 0.008]}>
                    <torusGeometry args={[0.062, 0.013, 8, 24, Math.PI]} />
                    <meshToonMaterial color="#1a1a1a" />
                  </mesh>
                )}
                {mouthId === 'mouth_cat' && (
                  <group position={[0, -0.16, 0.65]} scale={[1, 1, 0.008]}>
                    <mesh position={[-0.046, 0, 0]}><torusGeometry args={[0.04, 0.011, 8, 24, Math.PI]} /><meshToonMaterial color="#1a1a1a" /></mesh>
                    <mesh position={[0.046, 0, 0]}><torusGeometry args={[0.04, 0.011, 8, 24, Math.PI]} /><meshToonMaterial color="#1a1a1a" /></mesh>
                  </group>
                )}
                {mouthId === 'mouth_vampire' && (
                  <group position={[0, -0.16, 0.65]} scale={[1, 1, 0.008]}>
                    <mesh><boxGeometry args={[0.13, 0.013, 0.008]} /><meshToonMaterial color="#1a1a1a" /></mesh>
                    <mesh position={[-0.046, -0.04, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.016, 0.065, 8]} /><meshToonMaterial color="#f8fafc" /></mesh>
                    <mesh position={[0.046, -0.04, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.016, 0.065, 8]} /><meshToonMaterial color="#f8fafc" /></mesh>
                  </group>
                )}

                {/* ── BLUSH (cute chibi blush circles) ── */}
                <mesh position={[-0.35, -0.08, 0.55]} scale={[1.1, 0.65, 0.07]}>
                  <sphereGeometry args={[0.13, 14, 14]} />
                  <meshToonMaterial color="#f9a8d4" transparent opacity={0.65} />
                </mesh>
                <mesh position={[0.35, -0.08, 0.55]} scale={[1.1, 0.65, 0.07]}>
                  <sphereGeometry args={[0.13, 14, 14]} />
                  <meshToonMaterial color="#f9a8d4" transparent opacity={0.65} />
                </mesh>

                {/* ── DECALS ── */}
                {decalsId === 'decal_scar' && (
                  <mesh position={[-0.2, 0.1, 0.67]} rotation={[0, 0, 0.38]}>
                    <boxGeometry args={[0.036, 0.26, 0.004]} />
                    <meshToonMaterial color={decalsColor} />
                  </mesh>
                )}
                {decalsId === 'decal_bandage' && (
                  <mesh position={[0.04, -0.02, 0.67]} rotation={[0, 0, -0.08]}>
                    <boxGeometry args={[0.28, 0.09, 0.004]} />
                    <meshToonMaterial color="#f5f5f5" />
                  </mesh>
                )}
                {decalsId === 'decal_freckles' && (
                  <group position={[0, 0, 0.67]}>
                    {([-0.25, -0.31, -0.19, 0.25, 0.31, 0.19] as number[]).map((x, i) => (
                      <mesh key={i} position={[x, i < 3 ? 0 : -0.01, 0]}>
                        <sphereGeometry args={[i % 3 === 0 ? 0.018 : i % 3 === 1 ? 0.014 : 0.011, 6, 6]} />
                        <meshToonMaterial color="#b45309" />
                      </mesh>
                    ))}
                  </group>
                )}
                {decalsId === 'decal_tear' && (
                  <mesh position={[0.26, -0.07, 0.67]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.024, 0.058, 14]} />
                    <meshToonMaterial color="#60a5fa" transparent opacity={0.88} />
                  </mesh>
                )}
                {decalsId === 'decal_cyber' && (
                  <group position={[0.36, 0.14, 0.67]}>
                    <mesh><boxGeometry args={[0.013, 0.16, 0.004]} /><meshToonMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={0.5} /></mesh>
                    <mesh position={[0.036, 0.04, 0]}><boxGeometry args={[0.09, 0.013, 0.004]} /><meshToonMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={0.5} /></mesh>
                  </group>
                )}
                {decalsId === 'decal_star' && (
                  <mesh position={[-0.27, -0.1, 0.67]} rotation={[Math.PI/2, 0.18, 0]}>
                    <cylinderGeometry args={[0.036, 0.036, 0.006, 5]} />
                    <meshToonMaterial color={decalsColor} />
                  </mesh>
                )}

                {/* ── HAIR ── */}
                {hairId !== 'hair_bald' && (
                  <group>
                    {/* Hair cap */}
                    {!['hair_mohawk', 'hair_curly'].includes(hairId) && (
                      <mesh position={[0, 0.1, -0.04]}>
                        <sphereGeometry args={[0.72, 28, 28]} />
                        <T color={hairColor} />
                      </mesh>
                    )}
                    {/* Bangs */}
                    {['hair_short', 'hair_long', 'hair_twintails', 'hair_ponytail'].includes(hairId) && (
                      <group position={[0, 0.38, 0.54]} rotation={[0.22, 0, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                          <capsuleGeometry args={[0.12, 0.92, 12, 20]} />
                          <T color={hairColor} />
                        </mesh>
                      </group>
                    )}
                    {hairId === 'hair_long' && (
                      <mesh position={[0, -0.46, -0.38]} rotation={[0.12, 0, 0]}>
                        <capsuleGeometry args={[0.32, 1.1, 12, 20]} />
                        <T color={hairColor} />
                      </mesh>
                    )}
                    {hairId === 'hair_twintails' && (
                      <>
                        <mesh position={[-0.7, -0.22, 0]} rotation={[0, 0, 0.32]}>
                          <capsuleGeometry args={[0.22, 0.92, 12, 20]} />
                          <T color={hairColor} />
                        </mesh>
                        <mesh position={[0.7, -0.22, 0]} rotation={[0, 0, -0.32]}>
                          <capsuleGeometry args={[0.22, 0.92, 12, 20]} />
                          <T color={hairColor} />
                        </mesh>
                      </>
                    )}
                    {hairId === 'hair_curly' && (
                      <mesh position={[0, 0.22, -0.04]}>
                        <sphereGeometry args={[0.88, 28, 28]} />
                        <T color={hairColor} />
                      </mesh>
                    )}
                    {hairId === 'hair_mohawk' && (
                      <group position={[0, 0.62, -0.04]}>
                        {[...Array(5)].map((_, i) => (
                          <mesh key={i} position={[0, Math.sin(i * 0.65) * 0.12, (i - 2) * 0.22]} rotation={[0.12 - i * 0.055, 0, 0]}>
                            <capsuleGeometry args={[0.07, 0.46, 8, 14]} />
                            <T color={hairColor} />
                          </mesh>
                        ))}
                      </group>
                    )}
                    {hairId === 'hair_ponytail' && (
                      <group position={[0, 0.14, -0.7]} rotation={[-0.38, 0, 0]}>
                        <mesh><sphereGeometry args={[0.14, 14, 14]} /><T color={hairColor} /></mesh>
                        <mesh position={[0, -0.45, -0.14]} rotation={[0.12, 0, 0]}>
                          <capsuleGeometry args={[0.18, 0.9, 12, 20]} />
                          <T color={hairColor} />
                        </mesh>
                      </group>
                    )}
                    {hairId === 'hair_samurai' && (
                      <mesh position={[0, 0.76, -0.2]}>
                        <sphereGeometry args={[0.18, 14, 14]} />
                        <T color={hairColor} />
                      </mesh>
                    )}
                    {hairId === 'hair_messy' && (
                      <group position={[0, 0.38, 0]}>
                        {[...Array(10)].map((_, i) => (
                          <mesh key={i} position={[Math.cos(i * 0.628) * 0.42, (i % 3) * 0.11, Math.sin(i * 0.628) * 0.42]} rotation={[Math.cos(i) * 0.45, 0, Math.sin(i) * 0.45]}>
                            <capsuleGeometry args={[0.14, 0.55, 8, 14]} />
                            <T color={hairColor} />
                          </mesh>
                        ))}
                      </group>
                    )}
                  </group>
                )}

                {/* ── ACCESSORIES ── */}
                {accessoryId === 'acc_catears' && (
                  <group position={[0, 0.64, 0]}>
                    <mesh position={[-0.33, 0, 0]} rotation={[0, 0, 0.22]}>
                      <coneGeometry args={[0.09, 0.24, 14]} />
                      <meshToonMaterial color="#fbcfe8" />
                    </mesh>
                    <mesh position={[0.33, 0, 0]} rotation={[0, 0, -0.22]}>
                      <coneGeometry args={[0.09, 0.24, 14]} />
                      <meshToonMaterial color="#fbcfe8" />
                    </mesh>
                  </group>
                )}
                {accessoryId === 'acc_halo' && (
                  <group position={[0, 1.04, 0]} rotation={[Math.PI / 2 + 0.16, 0, 0]}>
                    <mesh>
                      <torusGeometry args={[0.38, 0.032, 14, 48]} />
                      <meshToonMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.6} />
                    </mesh>
                  </group>
                )}
                {accessoryId === 'acc_crown' && (
                  <group position={[0, 0.9, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                      <cylinderGeometry args={[0.3, 0.3, 0.07, 24]} />
                      <meshToonMaterial color="#fbbf24" />
                    </mesh>
                    {[...Array(6)].map((_, i) => (
                      <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 0.3, 0.07, Math.sin(i * Math.PI / 3) * 0.3]}>
                        <coneGeometry args={[0.044, 0.16, 8]} />
                        <meshToonMaterial color="#fbbf24" />
                      </mesh>
                    ))}
                  </group>
                )}
                {accessoryId === 'acc_horns' && (
                  <group position={[0, 0.55, 0.36]}>
                    <mesh position={[-0.22, 0, 0]} rotation={[-0.12, 0, 0.22]}>
                      <coneGeometry args={[0.065, 0.2, 8]} />
                      <meshToonMaterial color={accessoryColor} />
                    </mesh>
                    <mesh position={[0.22, 0, 0]} rotation={[-0.12, 0, -0.22]}>
                      <coneGeometry args={[0.065, 0.2, 8]} />
                      <meshToonMaterial color={accessoryColor} />
                    </mesh>
                  </group>
                )}
                {accessoryId === 'acc_headphones' && (
                  <group>
                    <mesh><torusGeometry args={[0.74, 0.074, 14, 48]} /><meshToonMaterial color="#18181b" /></mesh>
                    <group position={[-0.74, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                      <mesh><cylinderGeometry args={[0.29, 0.29, 0.18, 24]} /><meshToonMaterial color="#27272a" /></mesh>
                      <mesh position={[0, 0, -0.1]}><circleGeometry args={[0.11, 24]} /><meshToonMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} side={2} /></mesh>
                    </group>
                    <group position={[0.74, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                      <mesh><cylinderGeometry args={[0.29, 0.29, 0.18, 24]} /><meshToonMaterial color="#27272a" /></mesh>
                      <mesh position={[0, 0, 0.1]}><circleGeometry args={[0.11, 24]} /><meshToonMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} side={2} /></mesh>
                    </group>
                  </group>
                )}
                {accessoryId === 'acc_visor' && (
                  <group position={[0, 0.07, 0.64]} scale={[1, 1, 0.009]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.14, 0.58, 14, 24]} />
                      <meshToonMaterial color="#111111" transparent opacity={0.78} />
                    </mesh>
                    <mesh position={[0, 0, 1.5]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.12, 0.54, 8, 14]} />
                      <meshToonMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} wireframe />
                    </mesh>
                  </group>
                )}
                {accessoryId === 'acc_shades' && (
                  <group position={[0, 0.07, 0.68]}>
                    <mesh position={[-0.24, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.036, 24]} /><meshToonMaterial color="#111111" /></mesh>
                    <mesh position={[0.24, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.036, 24]} /><meshToonMaterial color="#111111" /></mesh>
                    <mesh><boxGeometry args={[0.22, 0.013, 0.008]} /><meshToonMaterial color="#c4c4c4" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_cybermask' && (
                  <group position={[0, -0.17, 0.61]}>
                    <mesh rotation={[0.08, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.16, 0.37, 14, 24]} />
                      <meshToonMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh position={[0, 0.055, 0.15]}><boxGeometry args={[0.46, 0.032, 0.036]} /><meshToonMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} /></mesh>
                    <mesh position={[0, -0.036, 0.15]}><boxGeometry args={[0.3, 0.028, 0.036]} /><meshToonMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.5} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_gasmask' && (
                  <group position={[0, -0.16, 0.72]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.26, 0.2, 24]} /><meshToonMaterial color="#27272a" /></mesh>
                    <mesh position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.11, 0.11, 0.036, 24]} /><meshToonMaterial color="#111111" /></mesh>
                    <mesh position={[-0.26, -0.07, 0.04]} rotation={[Math.PI / 2, 0, 0.38]}><cylinderGeometry args={[0.13, 0.13, 0.14, 20]} /><meshToonMaterial color="#3f3f46" /></mesh>
                    <mesh position={[0.26, -0.07, 0.04]} rotation={[Math.PI / 2, 0, -0.38]}><cylinderGeometry args={[0.13, 0.13, 0.14, 20]} /><meshToonMaterial color="#3f3f46" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_goggles' && (
                  <group position={[0, 0.46, 0.58]} rotation={[-0.12, 0, 0]}>
                    <mesh position={[-0.18, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.07, 24]} /><meshToonMaterial color="#3f3f46" /></mesh>
                    <mesh position={[0.18, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.07, 24]} /><meshToonMaterial color="#3f3f46" /></mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.036, 0.036, 0.036, 14]} /><meshToonMaterial color="#111111" /></mesh>
                    <mesh position={[-0.18, 0, 0.046]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.009, 24]} /><meshToonMaterial color={accessoryColor} /></mesh>
                    <mesh position={[0.18, 0, 0.046]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.009, 24]} /><meshToonMaterial color={accessoryColor} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_eyepatch' && (
                  <group position={[0, 0.07, 0.66]}>
                    <mesh position={[-0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.036, 24]} /><meshToonMaterial color="#111111" /></mesh>
                    <mesh position={[0, 0, -0.02]} rotation={[0.12, 0, 0.12]}><boxGeometry args={[1.3, 0.013, 0.008]} /><meshToonMaterial color="#111111" /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_kitsune' && (
                  <group position={[-0.52, 0.2, 0.38]} rotation={[0, -0.65, -0.22]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.18, 0.3, 14, 24]} /><meshToonMaterial color="#ffffff" /></mesh>
                    <mesh position={[-0.11, 0.22, 0]} rotation={[0, 0, 0.16]}><coneGeometry args={[0.065, 0.17, 8]} /><meshToonMaterial color="#ffffff" /></mesh>
                    <mesh position={[0.11, 0.22, 0]} rotation={[0, 0, -0.16]}><coneGeometry args={[0.065, 0.17, 8]} /><meshToonMaterial color="#ffffff" /></mesh>
                    <mesh position={[0, 0.07, 0.19]}><boxGeometry args={[0.22, 0.013, 0.008]} /><meshToonMaterial color="#ef4444" /></mesh>
                    <mesh position={[0, 0, 0.19]}><boxGeometry args={[0.013, 0.07, 0.008]} /><meshToonMaterial color="#ef4444" /></mesh>
                  </group>
                )}

              </group>{/* end Head */}

            </group>
          </Float>

          {/* ── Stage ── */}
          <group position={[0, -0.9, 0]}>
            {stageId === 'stage_holo' && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.7, 32]} />
                <meshToonMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.4} wireframe />
              </mesh>
            )}
            {stageId === 'stage_ring' && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.3, 0.042, 14, 48]} />
                <meshToonMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
              </mesh>
            )}
            {stageId === 'stage_pedestal' && (
              <group position={[0, -0.07, 0]}>
                <mesh><cylinderGeometry args={[1.3, 1.55, 0.16, 24]} /><meshToonMaterial color="#18181b" /></mesh>
                <mesh position={[0, 0.09, 0]}><torusGeometry args={[1.3, 0.016, 14, 48]} /><meshToonMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} /></mesh>
              </group>
            )}
            {stageId === 'stage_magic' && (
              <group>
                <mesh rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[2.1, 48]} /><meshToonMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} wireframe /></mesh>
                <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}><circleGeometry args={[2.1, 48]} /><meshToonMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} wireframe /></mesh>
              </group>
            )}
            <AnimatedStage stageId={stageId!} />
          </group>

        </Suspense>

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.0} mipmapBlur intensity={0.5} />
          <Vignette eskil={false} offset={0.14} darkness={0.4} />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2.2}
          maxDistance={6.5}
          autoRotate
          autoRotateSpeed={1.0}
          maxPolarAngle={Math.PI / 1.65}
          minPolarAngle={Math.PI / 5}
          target={[0, 0.55, 0]}
        />
      </Canvas>
    </div>
  )
}
