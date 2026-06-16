import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export default function Chibi3D({ 
  skinColor, 
  hairColor, 
  clothesColor,
  bodyId = 'body_standard',
  eyesId = 'eyes_normal',
  eyesColor = '#000000',
  mouthId = 'mouth_smile',
  hairId = 'hair_short',
  accessoryId = 'acc_none',
  accessoryColor = '#ffffff',
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
  accessoryId?: string,
  accessoryColor?: string,
  decalsId?: string,
  decalsColor?: string,
  stageId?: string
}) {

  // Body modifiers
  let bodyScale: [number, number, number] = [1, 1, 1]
  if (bodyId === 'body_chubby') bodyScale = [1.3, 1, 1.3]
  if (bodyId === 'body_tall') bodyScale = [1, 1.3, 1]
  if (bodyId === 'body_muscular') bodyScale = [1.5, 1.1, 1.1]

  // Animated elements (like floating rocks)
  const AnimatedStage = ({ stageId }: { stageId: string }) => {
    const groupRef = useRef<THREE.Group>(null)
    useFrame(({ clock }) => {
      if (groupRef.current) {
        groupRef.current.rotation.y = clock.getElapsedTime() * 0.2
        groupRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.1 - 1
      }
    })

    if (stageId === 'stage_rocks') {
      return (
        <group ref={groupRef}>
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 1.2) * 2, Math.sin(i * 2) * 0.5, Math.sin(i * 1.2) * 2]} rotation={[Math.random(), Math.random(), Math.random()]}>
              <dodecahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial color="#3f3f46" roughness={0.8} />
            </mesh>
          ))}
        </group>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#6366f1" />
        <pointLight position={[0, 5, -5]} intensity={1.5} color="#a855f7" />
        {/* Fill light for face */}
        <pointLight position={[0, 1.5, 3]} intensity={0.8} color="#ffffff" />
        
        <Suspense fallback={null}>
          {/* Main Avatar Group */}
          <group position={[0, -1, 0]}>
            
            {/* Body Group */}
            <group position={[0, 0.7, 0]} scale={bodyScale}>
              {/* Torso */}
              <mesh position={[0, 0, 0]}>
                <capsuleGeometry args={[0.45, 0.7, 16, 32]} />
                <meshStandardMaterial color={clothesColor} roughness={0.8} metalness={clothesId === 'clothes_armor' ? 0.8 : 0.1} />
              </mesh>
              
              {/* Ninja Scarf */}
              {clothesId === 'clothes_ninja' && (
                <mesh position={[0, 0.4, 0.1]} rotation={[0.2, 0, 0]}>
                  <torusGeometry args={[0.35, 0.15, 16, 32]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
              )}
              {/* Hoodie */}
              {clothesId === 'clothes_hoodie' && (
                <mesh position={[0, 0.2, -0.2]} rotation={[-0.2, 0, 0]}>
                  <torusGeometry args={[0.4, 0.2, 16, 32]} />
                  <meshStandardMaterial color={clothesColor} roughness={0.9} />
                </mesh>
              )}
              {/* Armor Shoulder Pads */}
              {clothesId === 'clothes_armor' && (
                <group>
                  <mesh position={[-0.6, 0.3, 0]} rotation={[0, 0, 0.3]}>
                    <boxGeometry args={[0.4, 0.2, 0.5]} />
                    <meshStandardMaterial color="#a1a1aa" metalness={0.9} roughness={0.2} />
                  </mesh>
                  <mesh position={[0.6, 0.3, 0]} rotation={[0, 0, -0.3]}>
                    <boxGeometry args={[0.4, 0.2, 0.5]} />
                    <meshStandardMaterial color="#a1a1aa" metalness={0.9} roughness={0.2} />
                  </mesh>
                </group>
              )}

              {/* Left Arm */}
              <mesh position={[-0.55, 0, 0]} rotation={[0, 0, -0.3]}>
                <capsuleGeometry args={[0.15, 0.6, 16, 16]} />
                <meshStandardMaterial color={clothesColor} roughness={0.8} />
              </mesh>
              {/* Right Arm */}
              <mesh position={[0.55, 0, 0]} rotation={[0, 0, 0.3]}>
                <capsuleGeometry args={[0.15, 0.6, 16, 16]} />
                <meshStandardMaterial color={clothesColor} roughness={0.8} />
              </mesh>
              {/* Left Leg */}
              <mesh position={[-0.2, -0.6, 0]}>
                <capsuleGeometry args={[0.15, 0.5, 16, 16]} />
                <meshStandardMaterial color={skinColor} roughness={0.4} />
              </mesh>
              {/* Right Leg */}
              <mesh position={[0.2, -0.6, 0]}>
                <capsuleGeometry args={[0.15, 0.5, 16, 16]} />
                <meshStandardMaterial color={skinColor} roughness={0.4} />
              </mesh>
              
              {/* Neck */}
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.2, 16]} />
                <meshStandardMaterial color={skinColor} roughness={0.4} />
              </mesh>
            </group>

            {/* Head Group */}
            <group position={[0, 1.85, 0]} scale={[0.75, 0.75, 0.75]}>
              
              {/* Main Skull */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.9, 32, 32]} />
                <meshStandardMaterial color={skinColor} roughness={0.4} />
              </mesh>
              
              {/* Eyes Group */}
              <group position={[0, 0.1, 0.82]}>
                {eyesId === 'eyes_normal' && (
                  <>
                    <mesh position={[-0.3, 0, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                    <mesh position={[0.3, 0, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_big' && (
                  <>
                    <mesh position={[-0.3, 0.05, 0]}><sphereGeometry args={[0.18, 16, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                    <mesh position={[-0.25, 0.12, 0.15]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#ffffff" /></mesh>
                    <mesh position={[0.3, 0.05, 0]}><sphereGeometry args={[0.18, 16, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                    <mesh position={[0.35, 0.12, 0.15]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#ffffff" /></mesh>
                  </>
                )}
                {eyesId === 'eyes_closed' && (
                  <>
                    <mesh position={[-0.3, 0, 0.05]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.25, 0.02, 0.02]} /><meshStandardMaterial color={eyesColor} /></mesh>
                    <mesh position={[0.3, 0, 0.05]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.25, 0.02, 0.02]} /><meshStandardMaterial color={eyesColor} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_angry' && (
                  <>
                    <mesh position={[-0.3, 0, 0.05]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.25, 0.05, 0.02]} /><meshStandardMaterial color={eyesColor} /></mesh>
                    <mesh position={[0.3, 0, 0.05]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.25, 0.05, 0.02]} /><meshStandardMaterial color={eyesColor} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_sad' && (
                  <>
                    <mesh position={[-0.3, 0, 0.05]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.25, 0.05, 0.02]} /><meshStandardMaterial color={eyesColor} /></mesh>
                    <mesh position={[0.3, 0, 0.05]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.25, 0.05, 0.02]} /><meshStandardMaterial color={eyesColor} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_star' && (
                  <>
                    <mesh position={[-0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.05, 5]} /><meshStandardMaterial color={eyesColor} /></mesh>
                    <mesh position={[0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.05, 5]} /><meshStandardMaterial color={eyesColor} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_heart' && (
                  <>
                    <group position={[-0.3, 0, 0]}>
                      <mesh position={[-0.05, 0.05, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                      <mesh position={[0.05, 0.05, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                      <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.11, 0.15, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                    </group>
                    <group position={[0.3, 0, 0]}>
                      <mesh position={[-0.05, 0.05, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                      <mesh position={[0.05, 0.05, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                      <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.11, 0.15, 16]} /><meshStandardMaterial color={eyesColor} /></mesh>
                    </group>
                  </>
                )}
                {eyesId === 'eyes_cyber' && (
                  <mesh position={[0, 0, 0.05]}>
                    <boxGeometry args={[0.8, 0.1, 0.02]} />
                    <meshStandardMaterial color={eyesColor} emissive={eyesColor} emissiveIntensity={2} />
                  </mesh>
                )}
              </group>

              {/* Mouth */}
              {mouthId === 'mouth_smile' && (
                <mesh position={[0, -0.15, 0.88]}>
                  <torusGeometry args={[0.08, 0.015, 16, 32, Math.PI]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
              )}
              {mouthId === 'mouth_open' && (
                <mesh position={[0, -0.15, 0.88]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} rotation={[Math.PI/2, 0, 0]} />
                  <meshStandardMaterial color="#ef4444" />
                </mesh>
              )}
              {mouthId === 'mouth_sad' && (
                <mesh position={[0, -0.2, 0.88]} rotation={[0, 0, Math.PI]}>
                  <torusGeometry args={[0.08, 0.015, 16, 32, Math.PI]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
              )}
              {mouthId === 'mouth_cat' && (
                <group position={[0, -0.15, 0.88]}>
                  <mesh position={[-0.05, 0, 0]}>
                    <torusGeometry args={[0.05, 0.015, 16, 32, Math.PI]} />
                    <meshStandardMaterial color="#111" />
                  </mesh>
                  <mesh position={[0.05, 0, 0]}>
                    <torusGeometry args={[0.05, 0.015, 16, 32, Math.PI]} />
                    <meshStandardMaterial color="#111" />
                  </mesh>
                </group>
              )}
              {mouthId === 'mouth_vampire' && (
                <group position={[0, -0.15, 0.88]}>
                  <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.15, 0.015, 0.02]} />
                    <meshStandardMaterial color="#111" />
                  </mesh>
                  <mesh position={[-0.05, -0.05, 0]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.02, 0.08, 8]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                  <mesh position={[0.05, -0.05, 0]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.02, 0.08, 8]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                </group>
              )}

              {/* Blush */}
              <mesh position={[-0.45, -0.05, 0.75]} rotation={[0, -0.4, 0]} scale={[1, 1, 0.1]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ff9999" opacity={0.6} transparent roughness={1} />
              </mesh>
              <mesh position={[0.45, -0.05, 0.75]} rotation={[0, 0.4, 0]} scale={[1, 1, 0.1]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ff9999" opacity={0.6} transparent roughness={1} />
              </mesh>

              {/* Decals */}
              <group position={[0, 0, 0.89]}>
                {decalsId === 'decal_scar' && (
                  <mesh position={[-0.3, 0.1, 0]} rotation={[0, 0, 0.5]}>
                    <boxGeometry args={[0.05, 0.35, 0.01]} />
                    <meshStandardMaterial color={decalsColor} />
                  </mesh>
                )}
                {decalsId === 'decal_bandage' && (
                  <mesh position={[0, -0.05, 0]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.35, 0.12, 0.02]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.9} />
                  </mesh>
                )}
                {decalsId === 'decal_cyber' && (
                  <group>
                    <mesh position={[0.4, 0.2, 0]} rotation={[0, 0.5, 0]}>
                      <boxGeometry args={[0.02, 0.2, 0.02]} />
                      <meshStandardMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={1.5} />
                    </mesh>
                    <mesh position={[-0.4, -0.2, 0]} rotation={[0, -0.5, 0]}>
                      <boxGeometry args={[0.02, 0.2, 0.02]} />
                      <meshStandardMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={1.5} />
                    </mesh>
                  </group>
                )}
                {decalsId === 'decal_freckles' && (
                  <group>
                    <mesh position={[-0.4, -0.05, -0.05]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#b45309" /></mesh>
                    <mesh position={[-0.35, -0.08, -0.03]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#b45309" /></mesh>
                    <mesh position={[-0.45, -0.08, -0.08]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#b45309" /></mesh>
                    <mesh position={[0.4, -0.05, -0.05]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#b45309" /></mesh>
                    <mesh position={[0.35, -0.08, -0.03]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#b45309" /></mesh>
                    <mesh position={[0.45, -0.08, -0.08]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#b45309" /></mesh>
                  </group>
                )}
                {decalsId === 'decal_star' && (
                  <mesh position={[-0.3, -0.1, 0]} rotation={[Math.PI/2, 0.2, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.02, 5]} />
                    <meshStandardMaterial color={decalsColor} />
                  </mesh>
                )}
                {decalsId === 'decal_tear' && (
                  <mesh position={[0.3, -0.1, 0]} rotation={[Math.PI/2, -0.2, 0]}>
                    <coneGeometry args={[0.03, 0.08, 16]} />
                    <meshStandardMaterial color="#3b82f6" />
                  </mesh>
                )}
              </group>

              {/* Hair Group */}
              {hairId !== 'hair_bald' && (
                <group position={[0, 0, 0]}>
                  {/* Base Hair Volume (Most styles have this) */}
                  {hairId !== 'hair_mohawk' && hairId !== 'hair_curly' && (
                    <mesh position={[0, 0.15, -0.1]}>
                      <sphereGeometry args={[0.95, 32, 32]} />
                      <meshStandardMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {/* Standard Bangs */}
                  {(hairId === 'hair_short' || hairId === 'hair_long' || hairId === 'hair_twintails' || hairId === 'hair_ponytail') && (
                    <group position={[0, 0.5, 0.72]} rotation={[0.3, 0, 0]}>
                      <mesh rotation={[0, 0, Math.PI / 2]}>
                        <capsuleGeometry args={[0.18, 1.3, 16, 16]} />
                        <meshStandardMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                    </group>
                  )}

                  {hairId === 'hair_long' && (
                    <mesh position={[0, -0.6, -0.5]} rotation={[0.2, 0, 0]}>
                      <capsuleGeometry args={[0.4, 1.5, 16, 16]} />
                      <meshStandardMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {hairId === 'hair_twintails' && (
                    <group>
                      <mesh position={[-0.9, -0.3, 0]} rotation={[0, 0, 0.4]}>
                        <capsuleGeometry args={[0.3, 1.2, 16, 16]} />
                        <meshStandardMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                      <mesh position={[0.9, -0.3, 0]} rotation={[0, 0, -0.4]}>
                        <capsuleGeometry args={[0.3, 1.2, 16, 16]} />
                        <meshStandardMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                    </group>
                  )}

                  {hairId === 'hair_curly' && (
                    <mesh position={[0, 0.3, -0.1]}>
                      <sphereGeometry args={[1.2, 16, 16]} />
                      <meshStandardMaterial color={hairColor} roughness={1} />
                    </mesh>
                  )}

                  {hairId === 'hair_mohawk' && (
                    <mesh position={[0, 0.8, -0.1]} rotation={[0.2, 0, 0]}>
                      <boxGeometry args={[0.2, 1.2, 1.5]} />
                      <meshStandardMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {hairId === 'hair_ponytail' && (
                    <group position={[0, 0.2, -0.9]} rotation={[-0.5, 0, 0]}>
                      <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshStandardMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                      <mesh position={[0, -0.6, -0.2]} rotation={[0.2, 0, 0]}>
                        <capsuleGeometry args={[0.25, 1.2, 16, 16]} />
                        <meshStandardMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                    </group>
                  )}

                  {hairId === 'hair_samurai' && (
                    <mesh position={[0, 1.0, -0.3]}>
                      <sphereGeometry args={[0.25, 16, 16]} />
                      <meshStandardMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {hairId === 'hair_messy' && (
                    <group position={[0, 0.5, 0]}>
                      {[...Array(12)].map((_, i) => (
                        <mesh key={i} position={[Math.cos(i) * 0.5, Math.random() * 0.5, Math.sin(i) * 0.5]} rotation={[Math.random(), Math.random(), 0]}>
                          <capsuleGeometry args={[0.2, 0.8, 8, 8]} />
                          <meshStandardMaterial color={hairColor} roughness={0.9} />
                        </mesh>
                      ))}
                    </group>
                  )}
                </group>
              )}

              {/* Accessories Group */}
              {accessoryId === 'acc_visor' && (
                <group position={[0, 0.05, 0.88]}>
                  <mesh rotation={[0, 0, Math.PI/2]}><capsuleGeometry args={[0.18, 0.8, 16, 32]} /><meshStandardMaterial color="#111" transparent opacity={0.8} roughness={0.1} metalness={0.8} /></mesh>
                  <mesh position={[0, 0, 0.02]} rotation={[0, 0, Math.PI/2]}><capsuleGeometry args={[0.16, 0.75, 8, 16]} /><meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} wireframe /></mesh>
                </group>
              )}
              
              {accessoryId === 'acc_shades' && (
                <group position={[0, 0.05, 0.9]}>
                  <mesh position={[-0.35, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.05, 32]} /><meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} /></mesh>
                  <mesh position={[0.35, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.05, 32]} /><meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} /></mesh>
                  <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#e5e5e5" metalness={1} roughness={0.2} /></mesh>
                </group>
              )}

              {accessoryId === 'acc_cybermask' && (
                <group position={[0, -0.22, 0.8]}>
                  <mesh rotation={[0.1, 0, Math.PI/2]}><capsuleGeometry args={[0.22, 0.5, 16, 32]} /><meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} /></mesh>
                  <mesh position={[0, 0.08, 0.2]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.6, 0.04, 0.05]} /><meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} /></mesh>
                  <mesh position={[0, -0.05, 0.2]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.4, 0.04, 0.05]} /><meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} /></mesh>
                </group>
              )}

              {accessoryId === 'acc_gasmask' && (
                <group position={[0, -0.2, 0.95]}>
                  <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.3, 0.35, 0.25, 32]} /><meshStandardMaterial color="#27272a" roughness={0.8} /></mesh>
                  <mesh position={[0, 0, 0.15]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.05, 16]} /><meshStandardMaterial color="#111" metalness={0.8} wireframe /></mesh>
                  <mesh position={[-0.35, -0.1, 0.05]} rotation={[Math.PI/2, 0, 0.5]}><cylinderGeometry args={[0.18, 0.18, 0.2, 32]} /><meshStandardMaterial color="#3f3f46" metalness={0.5} /><mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.16, 0.16, 0.02, 32]} /><meshStandardMaterial color="#ef4444" /></mesh></mesh>
                  <mesh position={[0.35, -0.1, 0.05]} rotation={[Math.PI/2, 0, -0.5]}><cylinderGeometry args={[0.18, 0.18, 0.2, 32]} /><meshStandardMaterial color="#3f3f46" metalness={0.5} /><mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.16, 0.16, 0.02, 32]} /><meshStandardMaterial color="#ef4444" /></mesh></mesh>
                </group>
              )}

              {accessoryId === 'acc_catears' && (
                <group position={[0, 0.85, 0]}>
                  <group position={[-0.45, 0, 0]} rotation={[0, 0, 0.3]}><mesh><coneGeometry args={[0.3, 0.7, 32]} /><meshStandardMaterial color={accessoryColor} roughness={0.9} /></mesh><mesh position={[0, 0.05, 0.15]} rotation={[-0.1, 0, 0]}><coneGeometry args={[0.15, 0.5, 16]} /><meshStandardMaterial color="#fbcfe8" roughness={0.6} /></mesh></group>
                  <group position={[0.45, 0, 0]} rotation={[0, 0, -0.3]}><mesh><coneGeometry args={[0.3, 0.7, 32]} /><meshStandardMaterial color={accessoryColor} roughness={0.9} /></mesh><mesh position={[0, 0.05, 0.15]} rotation={[-0.1, 0, 0]}><coneGeometry args={[0.15, 0.5, 16]} /><meshStandardMaterial color="#fbcfe8" roughness={0.6} /></mesh></group>
                </group>
              )}

              {accessoryId === 'acc_halo' && (
                <group position={[0, 1.4, 0]} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
                  <mesh><torusGeometry args={[0.5, 0.04, 16, 64]} /><meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} /></mesh>
                  <mesh><torusGeometry args={[0.42, 0.015, 16, 64]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} /></mesh>
                </group>
              )}

              {accessoryId === 'acc_headphones' && (
                <group position={[0, 0, 0]}>
                  <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}><torusGeometry args={[0.98, 0.1, 16, 64]} /><meshStandardMaterial color="#18181b" roughness={0.8} /></mesh>
                  <group position={[-0.98, 0, 0]} rotation={[0, Math.PI/2, 0]}><mesh><cylinderGeometry args={[0.4, 0.4, 0.25, 32]} /><meshStandardMaterial color="#27272a" roughness={0.6} metalness={0.4} /></mesh><mesh position={[0, 0, -0.13]}><circleGeometry args={[0.15, 32]} /><meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} side={2} /></mesh></group>
                  <group position={[0.98, 0, 0]} rotation={[0, Math.PI/2, 0]}><mesh><cylinderGeometry args={[0.4, 0.4, 0.25, 32]} /><meshStandardMaterial color="#27272a" roughness={0.6} metalness={0.4} /></mesh><mesh position={[0, 0, 0.13]}><circleGeometry args={[0.15, 32]} /><meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} side={2} /></mesh><mesh position={[0, -0.25, -0.2]} rotation={[Math.PI/4, 0, 0]}><capsuleGeometry args={[0.02, 0.4, 8, 8]} /><meshStandardMaterial color="#111" /></mesh></group>
                </group>
              )}

              {/* NEW ACCESSORIES */}
              {accessoryId === 'acc_crown' && (
                <group position={[0, 1.2, 0]}>
                  <mesh rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
                    <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} emissive="#fbbf24" emissiveIntensity={0.5} />
                  </mesh>
                  {[...Array(6)].map((_, i) => (
                    <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 0.4, 0.1, Math.sin(i * Math.PI / 3) * 0.4]}>
                      <coneGeometry args={[0.05, 0.2, 8]} />
                      <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} />
                    </mesh>
                  ))}
                </group>
              )}
              {accessoryId === 'acc_horns' && (
                <group position={[0, 0.7, 0.5]}>
                  <mesh position={[-0.3, 0, 0]} rotation={[-0.2, 0, 0.3]}>
                    <coneGeometry args={[0.1, 0.4, 16]} />
                    <meshStandardMaterial color={accessoryColor} />
                  </mesh>
                  <mesh position={[0.3, 0, 0]} rotation={[-0.2, 0, -0.3]}>
                    <coneGeometry args={[0.1, 0.4, 16]} />
                    <meshStandardMaterial color={accessoryColor} />
                  </mesh>
                </group>
              )}
              {accessoryId === 'acc_goggles' && (
                <group position={[0, 0.6, 0.75]} rotation={[-0.2, 0, 0]}>
                  <mesh position={[-0.25, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1, 16]} /><meshStandardMaterial color="#3f3f46" metalness={0.8} /></mesh>
                  <mesh position={[0.25, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1, 16]} /><meshStandardMaterial color="#3f3f46" metalness={0.8} /></mesh>
                  <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.05, 8]} /><meshStandardMaterial color="#111" /></mesh>
                  {/* Lenses */}
                  <mesh position={[-0.25, 0, 0.06]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.01, 16]} /><meshStandardMaterial color={accessoryColor} metalness={1} roughness={0} /></mesh>
                  <mesh position={[0.25, 0, 0.06]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.01, 16]} /><meshStandardMaterial color={accessoryColor} metalness={1} roughness={0} /></mesh>
                </group>
              )}
              {accessoryId === 'acc_eyepatch' && (
                <group position={[0, 0.1, 0.85]}>
                  <mesh position={[-0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.18, 0.18, 0.05, 16]} /><meshStandardMaterial color="#111" /></mesh>
                  <mesh position={[0, 0, -0.05]} rotation={[0.2, 0, 0.2]}><boxGeometry args={[1.8, 0.02, 0.02]} /><meshStandardMaterial color="#111" /></mesh>
                </group>
              )}
              {accessoryId === 'acc_kitsune' && (
                <group position={[-0.7, 0.3, 0.5]} rotation={[0, -0.8, -0.3]}>
                  <mesh rotation={[Math.PI/2, 0, 0]}><capsuleGeometry args={[0.25, 0.4, 16, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
                  <mesh position={[-0.15, 0.3, 0]} rotation={[0, 0, 0.2]}><coneGeometry args={[0.1, 0.3, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
                  <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.1, 0.3, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
                  {/* Red Markings */}
                  <mesh position={[0, 0.1, 0.26]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#ef4444" /></mesh>
                  <mesh position={[0, 0, 0.26]}><boxGeometry args={[0.02, 0.1, 0.02]} /><meshStandardMaterial color="#ef4444" /></mesh>
                </group>
              )}

            </group>
          </group>

          {/* Stage Group */}
          <group position={[0, -1, 0]}>
            {stageId === 'stage_holo' && (
              <mesh position={[0, -0.05, 0]} rotation={[Math.PI/2, 0, 0]}>
                <circleGeometry args={[2, 32]} />
                <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} wireframe />
              </mesh>
            )}
            {stageId === 'stage_ring' && (
              <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[1.5, 0.05, 16, 64]} />
                <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
              </mesh>
            )}
            {stageId === 'stage_pedestal' && (
              <group position={[0, -0.1, 0]}>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[1.5, 1.8, 0.2, 32]} />
                  <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.1, 0]} rotation={[Math.PI/2, 0, 0]}>
                  <torusGeometry args={[1.5, 0.02, 16, 64]} />
                  <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} />
                </mesh>
              </group>
            )}
            {stageId === 'stage_magic' && (
              <group position={[0, 0, 0]}>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                  <circleGeometry args={[2.5, 6]} />
                  <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} wireframe />
                </mesh>
                <mesh rotation={[Math.PI/2, 0, Math.PI/6]}>
                  <circleGeometry args={[2.5, 6]} />
                  <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} wireframe />
                </mesh>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                  <circleGeometry args={[1.5, 32]} />
                  <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} wireframe />
                </mesh>
              </group>
            )}
            <AnimatedStage stageId={stageId!} />
          </group>
        </Suspense>
        
        <OrbitControls 
          enableZoom={true} 
          minDistance={2}
          maxDistance={8}
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={1.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 4}
          target={[0, 1.2, 0]}
        />
      </Canvas>
    </div>
  )
}
