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
                <meshStandardMaterial color={clothesColor} roughness={0.8} />
              </mesh>
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
              
              {/* Neck (connecting torso to head) */}
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.2, 16]} />
                <meshStandardMaterial color={skinColor} roughness={0.4} />
              </mesh>
            </group>

            {/* Head Group (Chibi heads are big and low) */}
            <group position={[0, 1.85, 0]} scale={[0.75, 0.75, 0.75]}>
              
              {/* Main Skull */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.9, 32, 32]} />
                <meshStandardMaterial color={skinColor} roughness={0.4} />
              </mesh>
              
              {/* Eyes */}
              {eyesId === 'eyes_normal' && (
                <>
                  {/* Left Eye */}
                  <mesh position={[-0.3, 0.1, 0.85]}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshStandardMaterial color={eyesColor} />
                  </mesh>
                  {/* Right Eye */}
                  <mesh position={[0.3, 0.1, 0.85]}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshStandardMaterial color={eyesColor} />
                  </mesh>
                </>
              )}
              {eyesId === 'eyes_big' && (
                <>
                  <mesh position={[-0.3, 0.15, 0.83]}>
                    <sphereGeometry args={[0.18, 16, 16]} />
                    <meshStandardMaterial color={eyesColor} />
                  </mesh>
                  {/* Highlight left */}
                  <mesh position={[-0.25, 0.22, 1]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                  <mesh position={[0.3, 0.15, 0.83]}>
                    <sphereGeometry args={[0.18, 16, 16]} />
                    <meshStandardMaterial color={eyesColor} />
                  </mesh>
                  {/* Highlight right */}
                  <mesh position={[0.35, 0.22, 1]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                </>
              )}
              {eyesId === 'eyes_closed' && (
                <>
                  <mesh position={[-0.3, 0.1, 0.87]} rotation={[0, 0, 0.2]}>
                    <boxGeometry args={[0.25, 0.02, 0.02]} />
                    <meshStandardMaterial color={eyesColor} />
                  </mesh>
                  <mesh position={[0.3, 0.1, 0.87]} rotation={[0, 0, -0.2]}>
                    <boxGeometry args={[0.25, 0.02, 0.02]} />
                    <meshStandardMaterial color={eyesColor} />
                  </mesh>
                </>
              )}

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

              {/* Flat Blush (so it doesn't look like tumors) */}
              <mesh position={[-0.45, -0.05, 0.75]} rotation={[0, -0.4, 0]} scale={[1, 1, 0.1]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ff9999" opacity={0.6} transparent roughness={1} />
              </mesh>
              <mesh position={[0.45, -0.05, 0.75]} rotation={[0, 0.4, 0]} scale={[1, 1, 0.1]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ff9999" opacity={0.6} transparent roughness={1} />
              </mesh>

              {/* Decals */}
              {decalsId === 'decal_scar' && (
                <mesh position={[-0.3, 0.1, 0.9]} rotation={[0, 0, 0.5]}>
                  <boxGeometry args={[0.05, 0.35, 0.01]} />
                  <meshStandardMaterial color={decalsColor} />
                </mesh>
              )}
              {decalsId === 'decal_bandage' && (
                <mesh position={[0, -0.05, 0.9]} rotation={[0, 0, -0.1]}>
                  <boxGeometry args={[0.35, 0.12, 0.02]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.9} />
                </mesh>
              )}
              {decalsId === 'decal_cyber' && (
                <group position={[0, 0, 0.88]}>
                  <mesh position={[0.4, 0.2, 0]} rotation={[0, 0.5, 0]}>
                    <boxGeometry args={[0.02, 0.2, 0.02]} />
                    <meshStandardMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={1.5} />
                  </mesh>
                  <mesh position={[0.45, 0.1, 0]} rotation={[0, 0.5, Math.PI/4]}>
                    <boxGeometry args={[0.02, 0.15, 0.02]} />
                    <meshStandardMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={1.5} />
                  </mesh>
                  <mesh position={[-0.4, -0.2, 0]} rotation={[0, -0.5, 0]}>
                    <boxGeometry args={[0.02, 0.2, 0.02]} />
                    <meshStandardMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={1.5} />
                  </mesh>
                </group>
              )}

              {/* Hair Group */}
              {hairId !== 'hair_bald' && (
                <group position={[0, 0, 0]}>
                  {/* Main Hair Volume */}
                  <mesh position={[0, 0.15, -0.1]}>
                    <sphereGeometry args={[0.95, 32, 32]} />
                    <meshStandardMaterial color={hairColor} roughness={0.9} />
                  </mesh>

                  {/* Bangs */}
                  {hairId !== 'hair_curly' && (
                    <group position={[0, 0.5, 0.72]} rotation={[0.3, 0, 0]}>
                      <mesh rotation={[0, 0, Math.PI / 2]}>
                        <capsuleGeometry args={[0.18, 1.3, 16, 16]} />
                        <meshStandardMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                    </group>
                  )}

                  {/* Long hair extension */}
                  {hairId === 'hair_long' && (
                    <mesh position={[0, -0.6, -0.5]} rotation={[0.2, 0, 0]}>
                      <capsuleGeometry args={[0.4, 1.5, 16, 16]} />
                      <meshStandardMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {/* Twin tails */}
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

                  {/* Curly Afro override */}
                  {hairId === 'hair_curly' && (
                    <mesh position={[0, 0.3, -0.1]}>
                      <sphereGeometry args={[1.2, 16, 16]} />
                      <meshStandardMaterial color={hairColor} roughness={1} />
                    </mesh>
                  )}
                </group>
              )}

              {/* Accessories Group (BEAUTIFIED) */}
              {accessoryId === 'acc_visor' && (
                <group position={[0, 0.05, 0.88]}>
                  {/* Base Glass */}
                  <mesh rotation={[0, 0, Math.PI/2]}>
                    <capsuleGeometry args={[0.18, 0.8, 16, 32]} />
                    <meshStandardMaterial color="#111" transparent opacity={0.8} roughness={0.1} metalness={0.8} />
                  </mesh>
                  {/* Glowing Wireframe/Rim */}
                  <mesh position={[0, 0, 0.02]} rotation={[0, 0, Math.PI/2]}>
                    <capsuleGeometry args={[0.16, 0.75, 8, 16]} />
                    <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} wireframe />
                  </mesh>
                </group>
              )}
              
              {accessoryId === 'acc_shades' && (
                <group position={[0, 0.05, 0.9]}>
                  {/* Left Lens */}
                  <mesh position={[-0.35, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.22, 0.22, 0.05, 32]} />
                    <meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} />
                  </mesh>
                  {/* Right Lens */}
                  <mesh position={[0.35, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.22, 0.22, 0.05, 32]} />
                    <meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} />
                  </mesh>
                  {/* Bridge */}
                  <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.3, 0.02, 0.02]} />
                    <meshStandardMaterial color="#e5e5e5" metalness={1} roughness={0.2} />
                  </mesh>
                </group>
              )}

              {accessoryId === 'acc_cybermask' && (
                <group position={[0, -0.22, 0.8]}>
                  {/* Main Mask Body */}
                  <mesh rotation={[0.1, 0, Math.PI/2]}>
                    <capsuleGeometry args={[0.22, 0.5, 16, 32]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
                  </mesh>
                  {/* Top glowing LED slit */}
                  <mesh position={[0, 0.08, 0.2]} rotation={[0.1, 0, 0]}>
                    <boxGeometry args={[0.6, 0.04, 0.05]} />
                    <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} />
                  </mesh>
                  {/* Bottom glowing LED slit */}
                  <mesh position={[0, -0.05, 0.2]} rotation={[0.1, 0, 0]}>
                    <boxGeometry args={[0.4, 0.04, 0.05]} />
                    <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} />
                  </mesh>
                </group>
              )}

              {accessoryId === 'acc_gasmask' && (
                <group position={[0, -0.2, 0.95]}>
                  {/* Main respirator */}
                  <mesh rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.3, 0.35, 0.25, 32]} />
                    <meshStandardMaterial color="#27272a" roughness={0.8} />
                  </mesh>
                  {/* Center Grill */}
                  <mesh position={[0, 0, 0.15]} rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                    <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} wireframe />
                  </mesh>
                  {/* Left Filter */}
                  <mesh position={[-0.35, -0.1, 0.05]} rotation={[Math.PI/2, 0, 0.5]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.2, 32]} />
                    <meshStandardMaterial color="#3f3f46" metalness={0.5} roughness={0.6} />
                    <mesh position={[0, 0.11, 0]}>
                       <cylinderGeometry args={[0.16, 0.16, 0.02, 32]} />
                       <meshStandardMaterial color="#ef4444" />
                    </mesh>
                  </mesh>
                  {/* Right Filter */}
                  <mesh position={[0.35, -0.1, 0.05]} rotation={[Math.PI/2, 0, -0.5]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.2, 32]} />
                    <meshStandardMaterial color="#3f3f46" metalness={0.5} roughness={0.6} />
                    <mesh position={[0, 0.11, 0]}>
                       <cylinderGeometry args={[0.16, 0.16, 0.02, 32]} />
                       <meshStandardMaterial color="#ef4444" />
                    </mesh>
                  </mesh>
                </group>
              )}

              {accessoryId === 'acc_catears' && (
                <group position={[0, 0.85, 0]}>
                  {/* Left Ear */}
                  <group position={[-0.45, 0, 0]} rotation={[0, 0, 0.3]}>
                    <mesh>
                      <coneGeometry args={[0.3, 0.7, 32]} />
                      <meshStandardMaterial color={accessoryColor} roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 0.05, 0.15]} rotation={[-0.1, 0, 0]}>
                      <coneGeometry args={[0.15, 0.5, 16]} />
                      <meshStandardMaterial color="#fbcfe8" roughness={0.6} />
                    </mesh>
                  </group>
                  {/* Right Ear */}
                  <group position={[0.45, 0, 0]} rotation={[0, 0, -0.3]}>
                    <mesh>
                      <coneGeometry args={[0.3, 0.7, 32]} />
                      <meshStandardMaterial color={accessoryColor} roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 0.05, 0.15]} rotation={[-0.1, 0, 0]}>
                      <coneGeometry args={[0.15, 0.5, 16]} />
                      <meshStandardMaterial color="#fbcfe8" roughness={0.6} />
                    </mesh>
                  </group>
                </group>
              )}

              {accessoryId === 'acc_halo' && (
                <group position={[0, 1.4, 0]} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
                  {/* Outer glowing ring */}
                  <mesh>
                    <torusGeometry args={[0.5, 0.04, 16, 64]} />
                    <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} />
                  </mesh>
                  {/* Inner bright ring */}
                  <mesh>
                    <torusGeometry args={[0.42, 0.015, 16, 64]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
                  </mesh>
                </group>
              )}

              {accessoryId === 'acc_headphones' && (
                <group position={[0, 0, 0]}>
                  {/* Headband */}
                  <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                    <torusGeometry args={[0.98, 0.1, 16, 64]} />
                    <meshStandardMaterial color="#18181b" roughness={0.8} />
                  </mesh>
                  {/* Left Earcup */}
                  <group position={[-0.98, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                    <mesh>
                      <cylinderGeometry args={[0.4, 0.4, 0.25, 32]} />
                      <meshStandardMaterial color="#27272a" roughness={0.6} metalness={0.4} />
                    </mesh>
                    {/* Glowing Logo */}
                    <mesh position={[0, 0, -0.13]}>
                      <circleGeometry args={[0.15, 32]} />
                      <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} side={2} />
                    </mesh>
                  </group>
                  {/* Right Earcup & Mic */}
                  <group position={[0.98, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                    <mesh>
                      <cylinderGeometry args={[0.4, 0.4, 0.25, 32]} />
                      <meshStandardMaterial color="#27272a" roughness={0.6} metalness={0.4} />
                    </mesh>
                    {/* Glowing Logo */}
                    <mesh position={[0, 0, 0.13]}>
                      <circleGeometry args={[0.15, 32]} />
                      <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} side={2} />
                    </mesh>
                    {/* Microphone */}
                    <mesh position={[0, -0.25, -0.2]} rotation={[Math.PI/4, 0, 0]}>
                      <capsuleGeometry args={[0.02, 0.4, 8, 8]} />
                      <meshStandardMaterial color="#111" />
                    </mesh>
                  </group>
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
