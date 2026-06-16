'use client'
import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

export default function Chibi3D({ 
  skinColor, 
  hairColor, 
  clothesColor,
  bodyId = 'body_standard',
  eyesId = 'eyes_normal',
  eyesColor = '#1a1a1a',
  mouthId = 'mouth_smile',
  hairId = 'hair_short',
  clothesId = 'clothes_casual',
  accessoryId = 'acc_none',
  accessoryColor = '#ffffff',
  bottomsId = 'bottom_jeans',
  bottomsColor = '#1e3a8a',
  decalsId = 'decal_none',
  decalsColor = '#ef4444',
  stageId = 'stage_none'
}: { 
  skinColor: string, 
  hairColor: string, 
  clothesColor: string,
  bodyId?: string,
  eyesId?: string,
  eyesColor?: string,
  mouthId?: string,
  hairId?: string,
  clothesId?: string,
  accessoryId?: string,
  accessoryColor?: string,
  bottomsId?: string,
  bottomsColor?: string,
  decalsId?: string,
  decalsColor?: string,
  stageId?: string
}) {

  let bodyScale: [number, number, number] = [1, 1, 1]
  if (bodyId === 'body_chubby') bodyScale = [1.2, 0.95, 1.2]
  if (bodyId === 'body_tall')   bodyScale = [0.95, 1.2, 0.95]
  if (bodyId === 'body_muscular') bodyScale = [1.3, 1.05, 1.1]

  const AnimatedStage = ({ stageId }: { stageId: string }) => {
    const groupRef = useRef<THREE.Group>(null)
    useFrame(({ clock }) => {
      if (groupRef.current) {
        groupRef.current.rotation.y = clock.getElapsedTime() * 0.3
        groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.08 - 0.95
      }
    })
    if (stageId === 'stage_rocks') {
      return (
        <group ref={groupRef}>
          {[...Array(5)].map((_, i) => (
            <mesh castShadow receiveShadow key={i} position={[Math.cos(i * 1.2) * 2, Math.sin(i * 2) * 0.5, Math.sin(i * 1.2) * 2]}>
              <dodecahedronGeometry args={[0.25, 0]} />
              <meshPhysicalMaterial color="#3f3f46" roughness={0.7} metalness={0.3} />
            </mesh>
          ))}
        </group>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 0.8, 4.5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.001}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
        />
        <directionalLight position={[-3, 3, -4]} intensity={0.4} color="#a5b4fc" />
        <pointLight position={[0, -0.5, 3]} intensity={0.5} color="#fde68a" />

        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <ContactShadows position={[0, -0.8, 0]} opacity={0.5} scale={6} blur={2} far={3} />

          <Float speed={3} rotationIntensity={0.04} floatIntensity={0.12} floatingRange={[0, 0.08]}>
            <group position={[0, -0.8, 0]} scale={bodyScale}>

              {/* BODY */}
              <group position={[0, 0, 0]}>
                {/* Torso */}
                <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
                  <capsuleGeometry args={[0.38, 0.45, 16, 32]} />
                  <meshPhysicalMaterial color={clothesColor} roughness={0.75} metalness={clothesId === 'clothes_armor' ? 0.85 : 0.05} />
                </mesh>

                {clothesId === 'clothes_casual' && (
                  <group>
                    <mesh castShadow position={[0, 0.92, 0]}>
                      <torusGeometry args={[0.16, 0.04, 16, 32]} />
                      <meshPhysicalMaterial color="#ffffff" roughness={0.9} />
                    </mesh>
                    <mesh castShadow position={[0.05, 0.6, 0.37]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.07, 0.07, 0.01, 32]} />
                      <meshPhysicalMaterial color="#ffffff" roughness={0.9} />
                    </mesh>
                  </group>
                )}

                {clothesId === 'clothes_suit' && (
                  <group>
                    <mesh castShadow position={[0, 0.65, 0.36]} rotation={[0.1, 0, 0]}>
                      <boxGeometry args={[0.28, 0.4, 0.01]} />
                      <meshPhysicalMaterial color="#ffffff" roughness={0.9} />
                    </mesh>
                    <mesh castShadow position={[0, 0.62, 0.37]}>
                      <boxGeometry args={[0.06, 0.32, 0.01]} />
                      <meshPhysicalMaterial color="#ef4444" roughness={0.8} />
                    </mesh>
                    <mesh castShadow position={[0, 0.79, 0.37]}>
                      <boxGeometry args={[0.08, 0.06, 0.02]} />
                      <meshPhysicalMaterial color="#ef4444" roughness={0.8} />
                    </mesh>
                    <mesh castShadow position={[-0.14, 0.72, 0.37]} rotation={[0, 0, -0.35]}>
                      <boxGeometry args={[0.07, 0.38, 0.01]} />
                      <meshPhysicalMaterial color={clothesColor} roughness={0.8} />
                    </mesh>
                    <mesh castShadow position={[0.14, 0.72, 0.37]} rotation={[0, 0, 0.35]}>
                      <boxGeometry args={[0.07, 0.38, 0.01]} />
                      <meshPhysicalMaterial color={clothesColor} roughness={0.8} />
                    </mesh>
                  </group>
                )}

                {clothesId === 'clothes_hoodie' && (
                  <group>
                    <mesh castShadow position={[0, 0.88, -0.22]} rotation={[-0.15, 0, 0]}>
                      <torusGeometry args={[0.32, 0.18, 16, 32]} />
                      <meshPhysicalMaterial color={clothesColor} roughness={0.9} />
                    </mesh>
                    <mesh castShadow position={[-0.08, 0.5, 0.38]}>
                      <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
                      <meshPhysicalMaterial color="#cccccc" />
                    </mesh>
                    <mesh castShadow position={[0.08, 0.5, 0.38]}>
                      <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
                      <meshPhysicalMaterial color="#cccccc" />
                    </mesh>
                    <mesh castShadow position={[0, 0.38, 0.37]}>
                      <boxGeometry args={[0.42, 0.18, 0.02]} />
                      <meshPhysicalMaterial color={clothesColor} roughness={0.9} />
                    </mesh>
                  </group>
                )}

                {clothesId === 'clothes_tech' && (
                  <group>
                    <mesh castShadow position={[0, 0.6, 0.38]} rotation={[0, 0, 0.45]}>
                      <boxGeometry args={[0.7, 0.04, 0.01]} />
                      <meshPhysicalMaterial color="#111" />
                    </mesh>
                    <mesh castShadow position={[0, 0.6, 0.38]} rotation={[0, 0, -0.45]}>
                      <boxGeometry args={[0.7, 0.04, 0.01]} />
                      <meshPhysicalMaterial color="#111" />
                    </mesh>
                    <mesh castShadow position={[0, 0.35, 0]}>
                      <cylinderGeometry args={[0.39, 0.39, 0.06, 32]} />
                      <meshPhysicalMaterial color="#111" />
                    </mesh>
                    <mesh castShadow position={[0.2, 0.35, 0.39]}>
                      <boxGeometry args={[0.12, 0.12, 0.06]} />
                      <meshPhysicalMaterial color="#27272a" />
                    </mesh>
                    <mesh castShadow position={[-0.2, 0.35, 0.39]}>
                      <boxGeometry args={[0.12, 0.12, 0.06]} />
                      <meshPhysicalMaterial color="#27272a" />
                    </mesh>
                  </group>
                )}

                {clothesId === 'clothes_robe' && (
                  <group>
                    <mesh castShadow position={[0, 0.25, 0]}>
                      <cylinderGeometry args={[0.4, 0.52, 0.4, 32]} />
                      <meshPhysicalMaterial color={clothesColor} roughness={0.9} />
                    </mesh>
                    <mesh castShadow position={[0, 0.07, 0]}>
                      <cylinderGeometry args={[0.52, 0.52, 0.04, 32]} />
                      <meshPhysicalMaterial color="#eab308" metalness={0.8} roughness={0.3} />
                    </mesh>
                  </group>
                )}

                {clothesId === 'clothes_ninja' && (
                  <mesh castShadow position={[0, 0.84, 0.1]} rotation={[0.15, 0, 0]}>
                    <torusGeometry args={[0.3, 0.12, 16, 32]} />
                    <meshPhysicalMaterial color="#111111" roughness={0.6} />
                  </mesh>
                )}

                {clothesId === 'clothes_armor' && (
                  <group>
                    <mesh castShadow position={[-0.5, 0.75, 0]} rotation={[0, 0, 0.3]}>
                      <cylinderGeometry args={[0.22, 0.22, 0.35, 32]} />
                      <meshPhysicalMaterial color="#a1a1aa" metalness={0.95} roughness={0.15} />
                    </mesh>
                    <mesh castShadow position={[0.5, 0.75, 0]} rotation={[0, 0, -0.3]}>
                      <cylinderGeometry args={[0.22, 0.22, 0.35, 32]} />
                      <meshPhysicalMaterial color="#a1a1aa" metalness={0.95} roughness={0.15} />
                    </mesh>
                    <mesh castShadow position={[0, 0.62, 0.12]}>
                      <boxGeometry args={[0.6, 0.45, 0.28]} />
                      <meshPhysicalMaterial color="#a1a1aa" metalness={0.95} roughness={0.15} />
                    </mesh>
                  </group>
                )}

                {/* Left Arm */}
                <group position={[-0.48, 0.65, 0]} rotation={[0, 0, -0.5]}>
                  <mesh castShadow receiveShadow>
                    <capsuleGeometry args={[0.14, 0.3, 16, 32]} />
                    <meshPhysicalMaterial color={['clothes_casual','clothes_robe'].includes(clothesId) ? skinColor : clothesColor} roughness={0.7} metalness={clothesId === 'clothes_armor' ? 0.85 : 0.0} />
                  </mesh>
                  {clothesId === 'clothes_casual' && (
                    <mesh castShadow position={[0, 0.1, 0]}>
                      <cylinderGeometry args={[0.145, 0.145, 0.18, 32]} />
                      <meshPhysicalMaterial color={clothesColor} roughness={0.8} />
                    </mesh>
                  )}
                </group>

                {/* Right Arm */}
                <group position={[0.48, 0.65, 0]} rotation={[0, 0, 0.5]}>
                  <mesh castShadow receiveShadow>
                    <capsuleGeometry args={[0.14, 0.3, 16, 32]} />
                    <meshPhysicalMaterial color={['clothes_casual','clothes_robe'].includes(clothesId) ? skinColor : clothesColor} roughness={0.7} metalness={clothesId === 'clothes_armor' ? 0.85 : 0.0} />
                  </mesh>
                  {clothesId === 'clothes_casual' && (
                    <mesh castShadow position={[0, 0.1, 0]}>
                      <cylinderGeometry args={[0.145, 0.145, 0.18, 32]} />
                      <meshPhysicalMaterial color={clothesColor} roughness={0.8} />
                    </mesh>
                  )}
                </group>

                {/* Neck */}
                <mesh castShadow position={[0, 1.0, 0]}>
                  <cylinderGeometry args={[0.13, 0.16, 0.18, 32]} />
                  <meshPhysicalMaterial color={skinColor} roughness={0.5} />
                </mesh>

                {/* Pelvis */}
                <mesh castShadow receiveShadow position={[0, 0.17, 0]}>
                  {bottomsId === 'bottom_skirt'
                    ? <cylinderGeometry args={[0.35, 0.55, 0.38, 32]} />
                    : <cylinderGeometry args={[0.35, 0.39, 0.26, 32]} />}
                  <meshPhysicalMaterial color={bottomsColor} roughness={0.85} />
                </mesh>

                {/* Left Leg */}
                <group position={[-0.18, -0.1, 0]}>
                  <mesh castShadow receiveShadow>
                    <capsuleGeometry args={[0.14, 0.28, 16, 32]} />
                    <meshPhysicalMaterial color={skinColor} roughness={0.5} />
                  </mesh>
                  {bottomsId !== 'bottom_shorts' && bottomsId !== 'bottom_skirt' && (
                    <mesh castShadow position={[0, 0.08, 0]}>
                      <cylinderGeometry args={[0.145, 0.145, 0.36, 32]} />
                      <meshPhysicalMaterial color={bottomsColor} roughness={0.85} />
                    </mesh>
                  )}
                  {bottomsId === 'bottom_shorts' && (
                    <mesh castShadow position={[0, 0.12, 0]}>
                      <cylinderGeometry args={[0.145, 0.145, 0.18, 32]} />
                      <meshPhysicalMaterial color={bottomsColor} roughness={0.85} />
                    </mesh>
                  )}
                  <mesh castShadow position={[0, -0.25, 0.06]} rotation={[0.15, 0, 0]}>
                    <capsuleGeometry args={[0.12, 0.16, 8, 16]} />
                    <meshPhysicalMaterial color="#222" roughness={0.8} />
                  </mesh>
                </group>

                {/* Right Leg */}
                <group position={[0.18, -0.1, 0]}>
                  <mesh castShadow receiveShadow>
                    <capsuleGeometry args={[0.14, 0.28, 16, 32]} />
                    <meshPhysicalMaterial color={skinColor} roughness={0.5} />
                  </mesh>
                  {bottomsId !== 'bottom_shorts' && bottomsId !== 'bottom_skirt' && (
                    <mesh castShadow position={[0, 0.08, 0]}>
                      <cylinderGeometry args={[0.145, 0.145, 0.36, 32]} />
                      <meshPhysicalMaterial color={bottomsColor} roughness={0.85} />
                    </mesh>
                  )}
                  {bottomsId === 'bottom_shorts' && (
                    <mesh castShadow position={[0, 0.12, 0]}>
                      <cylinderGeometry args={[0.145, 0.145, 0.18, 32]} />
                      <meshPhysicalMaterial color={bottomsColor} roughness={0.85} />
                    </mesh>
                  )}
                  <mesh castShadow position={[0, -0.25, 0.06]} rotation={[0.15, 0, 0]}>
                    <capsuleGeometry args={[0.12, 0.16, 8, 16]} />
                    <meshPhysicalMaterial color="#222" roughness={0.8} />
                  </mesh>
                </group>
              </group>

              {/* HEAD */}
              <group position={[0, 1.7, 0]} scale={[1.1, 1.1, 1.1]}>

                <mesh castShadow receiveShadow>
                  <sphereGeometry args={[0.72, 48, 48]} />
                  <meshPhysicalMaterial color={skinColor} roughness={0.45} />
                </mesh>

                {/* EYES */}
                {eyesId === 'eyes_normal' && (
                  <>
                    <mesh position={[-0.22, 0.06, 0.67]} scale={[1, 1, 0.01]}>
                      <sphereGeometry args={[0.09, 32, 32]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[-0.17, 0.11, 0.73]}>
                      <sphereGeometry args={[0.025, 16, 16]} />
                      <meshPhysicalMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[0.22, 0.06, 0.67]} scale={[1, 1, 0.01]}>
                      <sphereGeometry args={[0.09, 32, 32]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[0.27, 0.11, 0.73]}>
                      <sphereGeometry args={[0.025, 16, 16]} />
                      <meshPhysicalMaterial color="#ffffff" />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_big' && (
                  <>
                    <mesh position={[-0.22, 0.08, 0.67]} scale={[1, 1, 0.01]}>
                      <sphereGeometry args={[0.14, 32, 32]} />
                      <meshPhysicalMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[-0.22, 0.06, 0.69]} scale={[1, 1, 0.01]}>
                      <sphereGeometry args={[0.1, 32, 32]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[-0.16, 0.12, 0.73]}>
                      <sphereGeometry args={[0.03, 16, 16]} />
                      <meshPhysicalMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[0.22, 0.08, 0.67]} scale={[1, 1, 0.01]}>
                      <sphereGeometry args={[0.14, 32, 32]} />
                      <meshPhysicalMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[0.22, 0.06, 0.69]} scale={[1, 1, 0.01]}>
                      <sphereGeometry args={[0.1, 32, 32]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[0.28, 0.12, 0.73]}>
                      <sphereGeometry args={[0.03, 16, 16]} />
                      <meshPhysicalMaterial color="#ffffff" />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_closed' && (
                  <>
                    <mesh position={[-0.22, 0.06, 0.69]} rotation={[0, 0, 0.15]}>
                      <boxGeometry args={[0.2, 0.025, 0.01]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[0.22, 0.06, 0.69]} rotation={[0, 0, -0.15]}>
                      <boxGeometry args={[0.2, 0.025, 0.01]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_angry' && (
                  <>
                    <mesh position={[-0.22, 0.06, 0.69]} rotation={[0, 0, -0.28]}>
                      <boxGeometry args={[0.2, 0.04, 0.01]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[0.22, 0.06, 0.69]} rotation={[0, 0, 0.28]}>
                      <boxGeometry args={[0.2, 0.04, 0.01]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_sad' && (
                  <>
                    <mesh position={[-0.22, 0.06, 0.69]} rotation={[0, 0, 0.28]}>
                      <boxGeometry args={[0.2, 0.04, 0.01]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                    <mesh position={[0.22, 0.06, 0.69]} rotation={[0, 0, -0.28]}>
                      <boxGeometry args={[0.2, 0.04, 0.01]} />
                      <meshPhysicalMaterial color={eyesColor} />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_star' && (
                  <>
                    <mesh position={[-0.22, 0.06, 0.68]} rotation={[Math.PI/2, 0, 0]} scale={[1, 1, 0.01]}>
                      <cylinderGeometry args={[0.1, 0.1, 0.01, 5]} />
                      <meshPhysicalMaterial color={eyesColor} emissive={eyesColor} emissiveIntensity={0.5} />
                    </mesh>
                    <mesh position={[0.22, 0.06, 0.68]} rotation={[Math.PI/2, 0, 0]} scale={[1, 1, 0.01]}>
                      <cylinderGeometry args={[0.1, 0.1, 0.01, 5]} />
                      <meshPhysicalMaterial color={eyesColor} emissive={eyesColor} emissiveIntensity={0.5} />
                    </mesh>
                  </>
                )}
                {eyesId === 'eyes_heart' && (
                  <>
                    <group position={[-0.22, 0.06, 0.68]} scale={[1, 1, 0.01]}>
                      <mesh position={[-0.04, 0.04, 0]}><sphereGeometry args={[0.06, 16, 16]} /><meshPhysicalMaterial color={eyesColor} /></mesh>
                      <mesh position={[0.04, 0.04, 0]}><sphereGeometry args={[0.06, 16, 16]} /><meshPhysicalMaterial color={eyesColor} /></mesh>
                      <mesh position={[0, -0.04, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.07, 0.12, 16]} /><meshPhysicalMaterial color={eyesColor} /></mesh>
                    </group>
                    <group position={[0.22, 0.06, 0.68]} scale={[1, 1, 0.01]}>
                      <mesh position={[-0.04, 0.04, 0]}><sphereGeometry args={[0.06, 16, 16]} /><meshPhysicalMaterial color={eyesColor} /></mesh>
                      <mesh position={[0.04, 0.04, 0]}><sphereGeometry args={[0.06, 16, 16]} /><meshPhysicalMaterial color={eyesColor} /></mesh>
                      <mesh position={[0, -0.04, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.07, 0.12, 16]} /><meshPhysicalMaterial color={eyesColor} /></mesh>
                    </group>
                  </>
                )}
                {eyesId === 'eyes_cyber' && (
                  <mesh position={[0, 0.06, 0.69]}>
                    <boxGeometry args={[0.62, 0.08, 0.01]} />
                    <meshPhysicalMaterial color={eyesColor} emissive={eyesColor} emissiveIntensity={3} />
                  </mesh>
                )}

                {/* MOUTH */}
                {mouthId === 'mouth_smile' && (
                  <mesh position={[0, -0.14, 0.68]} scale={[1.5, 1.5, 0.01]}>
                    <torusGeometry args={[0.07, 0.014, 8, 32, Math.PI]} />
                    <meshPhysicalMaterial color="#1a1a1a" />
                  </mesh>
                )}
                {mouthId === 'mouth_open' && (
                  <mesh position={[0, -0.14, 0.685]} rotation={[Math.PI/2, 0, 0]} scale={[1, 1, 0.01]}>
                    <cylinderGeometry args={[0.07, 0.07, 0.01, 32]} />
                    <meshPhysicalMaterial color="#1a1a1a" />
                  </mesh>
                )}
                {mouthId === 'mouth_sad' && (
                  <mesh position={[0, -0.16, 0.68]} rotation={[0, 0, Math.PI]} scale={[1.5, 1.5, 0.01]}>
                    <torusGeometry args={[0.07, 0.014, 8, 32, Math.PI]} />
                    <meshPhysicalMaterial color="#1a1a1a" />
                  </mesh>
                )}
                {mouthId === 'mouth_cat' && (
                  <group position={[0, -0.14, 0.69]} scale={[1, 1, 0.01]}>
                    <mesh position={[-0.05, 0, 0]}><torusGeometry args={[0.045, 0.012, 8, 32, Math.PI]} /><meshPhysicalMaterial color="#1a1a1a" /></mesh>
                    <mesh position={[0.05, 0, 0]}><torusGeometry args={[0.045, 0.012, 8, 32, Math.PI]} /><meshPhysicalMaterial color="#1a1a1a" /></mesh>
                  </group>
                )}
                {mouthId === 'mouth_vampire' && (
                  <group position={[0, -0.14, 0.69]} scale={[1, 1, 0.01]}>
                    <mesh><boxGeometry args={[0.14, 0.014, 0.01]} /><meshPhysicalMaterial color="#1a1a1a" /></mesh>
                    <mesh position={[-0.05, -0.04, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.018, 0.07, 8]} /><meshPhysicalMaterial color="#ffffff" /></mesh>
                    <mesh position={[0.05, -0.04, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.018, 0.07, 8]} /><meshPhysicalMaterial color="#ffffff" /></mesh>
                  </group>
                )}

                {/* BLUSH */}
                <mesh position={[-0.38, -0.06, 0.58]} scale={[1, 0.55, 0.08]}>
                  <sphereGeometry args={[0.14, 16, 16]} />
                  <meshPhysicalMaterial color="#ffb3ba" opacity={0.55} transparent roughness={1} />
                </mesh>
                <mesh position={[0.38, -0.06, 0.58]} scale={[1, 0.55, 0.08]}>
                  <sphereGeometry args={[0.14, 16, 16]} />
                  <meshPhysicalMaterial color="#ffb3ba" opacity={0.55} transparent roughness={1} />
                </mesh>

                {/* DECALS */}
                {decalsId === 'decal_scar' && (
                  <mesh position={[-0.22, 0.1, 0.7]} rotation={[0, 0, 0.4]}>
                    <boxGeometry args={[0.04, 0.28, 0.005]} />
                    <meshPhysicalMaterial color={decalsColor} />
                  </mesh>
                )}
                {decalsId === 'decal_bandage' && (
                  <mesh position={[0.05, -0.02, 0.7]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.3, 0.1, 0.005]} />
                    <meshPhysicalMaterial color="#ffffff" roughness={0.9} />
                  </mesh>
                )}
                {decalsId === 'decal_freckles' && (
                  <group position={[0, 0, 0.7]}>
                    <mesh position={[-0.28, 0.0, 0.0]}><sphereGeometry args={[0.02, 8, 8]} /><meshPhysicalMaterial color="#b45309" /></mesh>
                    <mesh position={[-0.34, 0.0, 0.0]}><sphereGeometry args={[0.016, 8, 8]} /><meshPhysicalMaterial color="#b45309" /></mesh>
                    <mesh position={[-0.22, -0.02, 0.0]}><sphereGeometry args={[0.013, 8, 8]} /><meshPhysicalMaterial color="#b45309" /></mesh>
                    <mesh position={[0.28, 0.0, 0.0]}><sphereGeometry args={[0.02, 8, 8]} /><meshPhysicalMaterial color="#b45309" /></mesh>
                    <mesh position={[0.34, 0.0, 0.0]}><sphereGeometry args={[0.016, 8, 8]} /><meshPhysicalMaterial color="#b45309" /></mesh>
                    <mesh position={[0.22, -0.02, 0.0]}><sphereGeometry args={[0.013, 8, 8]} /><meshPhysicalMaterial color="#b45309" /></mesh>
                  </group>
                )}
                {decalsId === 'decal_tear' && (
                  <mesh position={[0.28, -0.06, 0.71]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.028, 0.065, 16]} />
                    <meshPhysicalMaterial color="#3b82f6" transparent opacity={0.9} />
                  </mesh>
                )}
                {decalsId === 'decal_cyber' && (
                  <group position={[0.38, 0.15, 0.7]}>
                    <mesh><boxGeometry args={[0.015, 0.18, 0.005]} /><meshPhysicalMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={2} /></mesh>
                    <mesh position={[0.04, 0.04, 0]}><boxGeometry args={[0.1, 0.015, 0.005]} /><meshPhysicalMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={2} /></mesh>
                  </group>
                )}
                {decalsId === 'decal_star' && (
                  <mesh position={[-0.3, -0.1, 0.7]} rotation={[Math.PI/2, 0.2, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.008, 5]} />
                    <meshPhysicalMaterial color={decalsColor} />
                  </mesh>
                )}

                {/* HAIR */}
                {hairId !== 'hair_bald' && (
                  <group>
                    {!['hair_mohawk','hair_curly'].includes(hairId) && (
                      <mesh position={[0, 0.12, -0.05]}>
                        <sphereGeometry args={[0.76, 32, 32]} />
                        <meshPhysicalMaterial color={hairColor} roughness={0.85} />
                      </mesh>
                    )}
                    {['hair_short','hair_long','hair_twintails','hair_ponytail'].includes(hairId) && (
                      <group position={[0, 0.42, 0.58]} rotation={[0.25, 0, 0]}>
                        <mesh rotation={[0, 0, Math.PI/2]}>
                          <capsuleGeometry args={[0.14, 1.0, 16, 32]} />
                          <meshPhysicalMaterial color={hairColor} roughness={0.85} />
                        </mesh>
                      </group>
                    )}
                    {hairId === 'hair_long' && (
                      <mesh position={[0, -0.5, -0.4]} rotation={[0.15, 0, 0]}>
                        <capsuleGeometry args={[0.35, 1.2, 16, 32]} />
                        <meshPhysicalMaterial color={hairColor} roughness={0.85} />
                      </mesh>
                    )}
                    {hairId === 'hair_twintails' && (
                      <group>
                        <mesh position={[-0.75, -0.25, 0]} rotation={[0, 0, 0.35]}>
                          <capsuleGeometry args={[0.24, 1.0, 16, 32]} />
                          <meshPhysicalMaterial color={hairColor} roughness={0.85} />
                        </mesh>
                        <mesh position={[0.75, -0.25, 0]} rotation={[0, 0, -0.35]}>
                          <capsuleGeometry args={[0.24, 1.0, 16, 32]} />
                          <meshPhysicalMaterial color={hairColor} roughness={0.85} />
                        </mesh>
                      </group>
                    )}
                    {hairId === 'hair_curly' && (
                      <mesh position={[0, 0.25, -0.05]}>
                        <sphereGeometry args={[0.95, 32, 32]} />
                        <meshPhysicalMaterial color={hairColor} roughness={1} />
                      </mesh>
                    )}
                    {hairId === 'hair_mohawk' && (
                      <group position={[0, 0.68, -0.05]}>
                        {[...Array(5)].map((_, i) => (
                          <mesh key={i} position={[0, Math.sin(i*0.7)*0.15, (i-2)*0.24]} rotation={[0.15 - i*0.06, 0, 0]}>
                            <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
                            <meshPhysicalMaterial color={hairColor} roughness={0.85} />
                          </mesh>
                        ))}
                      </group>
                    )}
                    {hairId === 'hair_ponytail' && (
                      <group position={[0, 0.16, -0.74]} rotation={[-0.4, 0, 0]}>
                        <mesh><sphereGeometry args={[0.16, 16, 16]} /><meshPhysicalMaterial color={hairColor} roughness={0.85} /></mesh>
                        <mesh position={[0, -0.5, -0.15]} rotation={[0.15, 0, 0]}>
                          <capsuleGeometry args={[0.2, 1.0, 16, 32]} />
                          <meshPhysicalMaterial color={hairColor} roughness={0.85} />
                        </mesh>
                      </group>
                    )}
                    {hairId === 'hair_samurai' && (
                      <mesh position={[0, 0.82, -0.22]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshPhysicalMaterial color={hairColor} roughness={0.85} />
                      </mesh>
                    )}
                    {hairId === 'hair_messy' && (
                      <group position={[0, 0.4, 0]}>
                        {[...Array(10)].map((_, i) => (
                          <mesh key={i} position={[Math.cos(i * 0.628) * 0.45, (i % 3)*0.12, Math.sin(i * 0.628) * 0.45]} rotation={[Math.cos(i)*0.5, 0, Math.sin(i)*0.5]}>
                            <capsuleGeometry args={[0.16, 0.6, 8, 16]} />
                            <meshPhysicalMaterial color={hairColor} roughness={0.9} />
                          </mesh>
                        ))}
                      </group>
                    )}
                  </group>
                )}

                {/* ACCESSORIES */}
                {accessoryId === 'acc_visor' && (
                  <group position={[0, 0.06, 0.68]} scale={[1, 1, 0.01]}>
                    <mesh rotation={[0, 0, Math.PI/2]}>
                      <capsuleGeometry args={[0.15, 0.64, 16, 32]} />
                      <meshPhysicalMaterial color="#111" transparent opacity={0.82} roughness={0.08} metalness={0.8} />
                    </mesh>
                    <mesh position={[0, 0, 0.5]} rotation={[0, 0, Math.PI/2]}>
                      <capsuleGeometry args={[0.13, 0.6, 8, 16]} />
                      <meshPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} wireframe />
                    </mesh>
                  </group>
                )}
                {accessoryId === 'acc_shades' && (
                  <group position={[0, 0.06, 0.72]}>
                    <mesh position={[-0.27, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.17, 0.17, 0.04, 32]} />
                      <meshPhysicalMaterial color="#111" roughness={0.08} metalness={0.9} />
                    </mesh>
                    <mesh position={[0.27, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.17, 0.17, 0.04, 32]} />
                      <meshPhysicalMaterial color="#111" roughness={0.08} metalness={0.9} />
                    </mesh>
                    <mesh><boxGeometry args={[0.24, 0.015, 0.01]} /><meshPhysicalMaterial color="#cccccc" metalness={1} roughness={0.2} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_cybermask' && (
                  <group position={[0, -0.18, 0.64]}>
                    <mesh rotation={[0.1, 0, Math.PI/2]}>
                      <capsuleGeometry args={[0.18, 0.4, 16, 32]} />
                      <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
                    </mesh>
                    <mesh position={[0, 0.06, 0.16]}><boxGeometry args={[0.5, 0.035, 0.04]} /><meshPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} /></mesh>
                    <mesh position={[0, -0.04, 0.16]}><boxGeometry args={[0.32, 0.03, 0.04]} /><meshPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_gasmask' && (
                  <group position={[0, -0.16, 0.76]}>
                    <mesh rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.25, 0.28, 0.22, 32]} />
                      <meshPhysicalMaterial color="#27272a" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0, 0.12]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.12, 0.12, 0.04, 32]} />
                      <meshPhysicalMaterial color="#111" metalness={0.8} wireframe />
                    </mesh>
                    <mesh position={[-0.28, -0.08, 0.04]} rotation={[Math.PI/2, 0, 0.4]}>
                      <cylinderGeometry args={[0.14, 0.14, 0.16, 32]} />
                      <meshPhysicalMaterial color="#3f3f46" metalness={0.5} />
                    </mesh>
                    <mesh position={[0.28, -0.08, 0.04]} rotation={[Math.PI/2, 0, -0.4]}>
                      <cylinderGeometry args={[0.14, 0.14, 0.16, 32]} />
                      <meshPhysicalMaterial color="#3f3f46" metalness={0.5} />
                    </mesh>
                  </group>
                )}
                {accessoryId === 'acc_catears' && (
                  <group position={[0, 0.68, 0]}>
                    <mesh position={[-0.36, 0, 0]} rotation={[0, 0, 0.25]}>
                      <coneGeometry args={[0.1, 0.26, 16]} />
                      <meshPhysicalMaterial color="#fbcfe8" roughness={0.6} />
                    </mesh>
                    <mesh position={[0.36, 0, 0]} rotation={[0, 0, -0.25]}>
                      <coneGeometry args={[0.1, 0.26, 16]} />
                      <meshPhysicalMaterial color="#fbcfe8" roughness={0.6} />
                    </mesh>
                  </group>
                )}
                {accessoryId === 'acc_halo' && (
                  <group position={[0, 1.1, 0]} rotation={[Math.PI/2 + 0.18, 0, 0]}>
                    <mesh><torusGeometry args={[0.42, 0.035, 16, 64]} /><meshPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_headphones' && (
                  <group>
                    <mesh><torusGeometry args={[0.8, 0.08, 16, 64]} /><meshPhysicalMaterial color="#18181b" roughness={0.8} /></mesh>
                    <group position={[-0.8, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                      <mesh><cylinderGeometry args={[0.32, 0.32, 0.2, 32]} /><meshPhysicalMaterial color="#27272a" roughness={0.6} metalness={0.4} /></mesh>
                      <mesh position={[0, 0, -0.11]}><circleGeometry args={[0.12, 32]} /><meshPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} side={2} /></mesh>
                    </group>
                    <group position={[0.8, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                      <mesh><cylinderGeometry args={[0.32, 0.32, 0.2, 32]} /><meshPhysicalMaterial color="#27272a" roughness={0.6} metalness={0.4} /></mesh>
                      <mesh position={[0, 0, 0.11]}><circleGeometry args={[0.12, 32]} /><meshPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} side={2} /></mesh>
                    </group>
                  </group>
                )}
                {accessoryId === 'acc_crown' && (
                  <group position={[0, 0.95, 0]}>
                    <mesh rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.34, 0.34, 0.08, 32]} />
                      <meshPhysicalMaterial color="#fbbf24" metalness={0.95} roughness={0.15} emissive="#fbbf24" emissiveIntensity={0.3} />
                    </mesh>
                    {[...Array(6)].map((_, i) => (
                      <mesh key={i} position={[Math.cos(i * Math.PI/3) * 0.34, 0.08, Math.sin(i * Math.PI/3) * 0.34]}>
                        <coneGeometry args={[0.05, 0.18, 8]} />
                        <meshPhysicalMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
                      </mesh>
                    ))}
                  </group>
                )}
                {accessoryId === 'acc_horns' && (
                  <group position={[0, 0.58, 0.38]}>
                    <mesh position={[-0.24, 0, 0]} rotation={[-0.15, 0, 0.25]}>
                      <coneGeometry args={[0.07, 0.22, 8]} />
                      <meshPhysicalMaterial color={accessoryColor} roughness={0.7} />
                    </mesh>
                    <mesh position={[0.24, 0, 0]} rotation={[-0.15, 0, -0.25]}>
                      <coneGeometry args={[0.07, 0.22, 8]} />
                      <meshPhysicalMaterial color={accessoryColor} roughness={0.7} />
                    </mesh>
                  </group>
                )}
                {accessoryId === 'acc_goggles' && (
                  <group position={[0, 0.48, 0.6]} rotation={[-0.15, 0, 0]}>
                    <mesh position={[-0.2, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.16, 0.16, 0.08, 32]} />
                      <meshPhysicalMaterial color="#3f3f46" metalness={0.8} />
                    </mesh>
                    <mesh position={[0.2, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.16, 0.16, 0.08, 32]} />
                      <meshPhysicalMaterial color="#3f3f46" metalness={0.8} />
                    </mesh>
                    <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.04, 0.04, 0.04, 16]} /><meshPhysicalMaterial color="#111" /></mesh>
                    <mesh position={[-0.2, 0, 0.05]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.01, 32]} /><meshPhysicalMaterial color={accessoryColor} metalness={1} roughness={0} /></mesh>
                    <mesh position={[0.2, 0, 0.05]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.01, 32]} /><meshPhysicalMaterial color={accessoryColor} metalness={1} roughness={0} /></mesh>
                  </group>
                )}
                {accessoryId === 'acc_eyepatch' && (
                  <group position={[0, 0.06, 0.7]}>
                    <mesh position={[-0.22, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.14, 0.14, 0.04, 32]} />
                      <meshPhysicalMaterial color="#111" />
                    </mesh>
                    <mesh position={[0, 0, -0.02]} rotation={[0.15, 0, 0.15]}>
                      <boxGeometry args={[1.4, 0.015, 0.01]} />
                      <meshPhysicalMaterial color="#111" />
                    </mesh>
                  </group>
                )}
                {accessoryId === 'acc_kitsune' && (
                  <group position={[-0.55, 0.22, 0.4]} rotation={[0, -0.7, -0.25]}>
                    <mesh rotation={[Math.PI/2, 0, 0]}>
                      <capsuleGeometry args={[0.2, 0.32, 16, 32]} />
                      <meshPhysicalMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[-0.12, 0.24, 0]} rotation={[0, 0, 0.18]}><coneGeometry args={[0.07, 0.18, 8]} /><meshPhysicalMaterial color="#ffffff" /></mesh>
                    <mesh position={[0.12, 0.24, 0]} rotation={[0, 0, -0.18]}><coneGeometry args={[0.07, 0.18, 8]} /><meshPhysicalMaterial color="#ffffff" /></mesh>
                    <mesh position={[0, 0.08, 0.21]}><boxGeometry args={[0.24, 0.015, 0.01]} /><meshPhysicalMaterial color="#ef4444" /></mesh>
                    <mesh position={[0, 0, 0.21]}><boxGeometry args={[0.015, 0.08, 0.01]} /><meshPhysicalMaterial color="#ef4444" /></mesh>
                  </group>
                )}

              </group>

            </group>
          </Float>

          {/* Stage */}
          <group position={[0, -0.8, 0]}>
            {stageId === 'stage_holo' && (
              <mesh rotation={[Math.PI/2, 0, 0]}>
                <circleGeometry args={[1.8, 32]} />
                <meshPhysicalMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} wireframe />
              </mesh>
            )}
            {stageId === 'stage_ring' && (
              <mesh rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[1.4, 0.045, 16, 64]} />
                <meshPhysicalMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
              </mesh>
            )}
            {stageId === 'stage_pedestal' && (
              <group position={[0, -0.08, 0]}>
                <mesh><cylinderGeometry args={[1.4, 1.65, 0.18, 32]} /><meshPhysicalMaterial color="#18181b" metalness={0.8} roughness={0.2} /></mesh>
                <mesh position={[0, 0.1, 0]}><torusGeometry args={[1.4, 0.018, 16, 64]} /><meshPhysicalMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} /></mesh>
              </group>
            )}
            {stageId === 'stage_magic' && (
              <group>
                <mesh rotation={[Math.PI/2, 0, 0]}><circleGeometry args={[2.2, 64]} /><meshPhysicalMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} wireframe /></mesh>
                <mesh rotation={[Math.PI/2, 0, Math.PI/6]}><circleGeometry args={[2.2, 64]} /><meshPhysicalMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} wireframe /></mesh>
              </group>
            )}
            <AnimatedStage stageId={stageId!} />
          </group>

        </Suspense>

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.1} mipmapBlur intensity={0.6} />
          <Vignette eskil={false} offset={0.12} darkness={0.45} />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={7}
          autoRotate
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 5}
          target={[0, 0.6, 0]}
        />
      </Canvas>
    </div>
  )
}
