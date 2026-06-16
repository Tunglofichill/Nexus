'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import { Suspense } from 'react'

export default function Chibi3D({ 
  skinColor, 
  hairColor, 
  clothesColor,
  hairId,
  accessoryId,
  accessoryColor,
  bodyId,
  eyesId,
  mouthId
}: { 
  skinColor: string, 
  hairColor: string, 
  clothesColor: string,
  hairId: string,
  accessoryId: string,
  accessoryColor: string,
  bodyId: string,
  eyesId: string,
  mouthId: string
}) {

  // Determine Body Scale
  let bodyScale: [number, number, number] = [1, 1, 1]
  if (bodyId === 'body_chubby') bodyScale = [1.4, 0.85, 1.4]
  if (bodyId === 'body_tall') bodyScale = [0.85, 1.3, 0.85]
  if (bodyId === 'body_muscular') bodyScale = [1.5, 1.1, 1.0]

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0.5, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#6366f1" />
        <pointLight position={[0, 5, -5]} intensity={2} color="#a855f7" />
        
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            
            {/* Body Group */}
            <group position={[0, 0.7, 0]} scale={bodyScale}>
              {/* Torso */}
              <mesh position={[0, 0, 0]}>
                <capsuleGeometry args={[0.35, 0.4, 16, 32]} />
                <meshStandardMaterial color={clothesColor} roughness={0.7} />
              </mesh>

              {/* Left Arm */}
              <mesh position={[-0.45, 0.1, 0]} rotation={[0, 0, -0.3]}>
                <capsuleGeometry args={[0.12, 0.35, 16, 16]} />
                <meshStandardMaterial color={clothesColor} roughness={0.7} />
              </mesh>
              {/* Left Hand */}
              <mesh position={[-0.5, -0.2, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color={skinColor} roughness={0.4} />
              </mesh>

              {/* Right Arm */}
              <mesh position={[0.45, 0.1, 0]} rotation={[0, 0, 0.3]}>
                <capsuleGeometry args={[0.12, 0.35, 16, 16]} />
                <meshStandardMaterial color={clothesColor} roughness={0.7} />
              </mesh>
              {/* Right Hand */}
              <mesh position={[0.5, -0.2, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color={skinColor} roughness={0.4} />
              </mesh>

              {/* Left Leg */}
              <mesh position={[-0.18, -0.45, 0]}>
                <capsuleGeometry args={[0.14, 0.3, 16, 16]} />
                <meshStandardMaterial color={clothesColor} roughness={0.7} />
              </mesh>

              {/* Right Leg */}
              <mesh position={[0.18, -0.45, 0]}>
                <capsuleGeometry args={[0.14, 0.3, 16, 16]} />
                <meshStandardMaterial color={clothesColor} roughness={0.7} />
              </mesh>
            </group>

            {/* Neck */}
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 0.2, 16]} />
              <meshStandardMaterial color={skinColor} roughness={0.4} />
            </mesh>
            
            {/* Head Group */}
            <group position={[0, 1.85, 0]} scale={[0.75, 0.75, 0.75]}>
              {/* Head Sphere */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.9, 32, 32]} />
                <meshStandardMaterial color={skinColor} roughness={0.4} />
              </mesh>

              {/* Face Elements */}
              <group position={[0, -0.2, 0.8]}>
                
                {/* Eyes */}
                {eyesId === 'eyes_closed' ? (
                  <>
                    <mesh position={[-0.35, 0, 0]} scale={[1, 0.1, 1]}>
                      <sphereGeometry args={[0.12, 16, 16]} />
                      <meshBasicMaterial color="#000000" />
                    </mesh>
                    <mesh position={[0.35, 0, 0]} scale={[1, 0.1, 1]}>
                      <sphereGeometry args={[0.12, 16, 16]} />
                      <meshBasicMaterial color="#000000" />
                    </mesh>
                  </>
                ) : (
                  <>
                    {/* Normal / Big Eyes */}
                    <mesh position={[-0.35, 0, 0]}>
                      <sphereGeometry args={[eyesId === 'eyes_big' ? 0.16 : 0.12, 16, 16]} />
                      <meshBasicMaterial color="#000000" />
                    </mesh>
                    <mesh position={[-0.38, 0.04, 0.1]}>
                      <sphereGeometry args={[0.04, 8, 8]} />
                      <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[0.35, 0, 0]}>
                      <sphereGeometry args={[eyesId === 'eyes_big' ? 0.16 : 0.12, 16, 16]} />
                      <meshBasicMaterial color="#000000" />
                    </mesh>
                    <mesh position={[0.32, 0.04, 0.1]}>
                      <sphereGeometry args={[0.04, 8, 8]} />
                      <meshBasicMaterial color="#ffffff" />
                    </mesh>
                  </>
                )}

                {/* Blush */}
                <mesh position={[-0.5, -0.15, 0]} scale={[1, 1, 0.2]}>
                  <sphereGeometry args={[0.18, 16, 16]} />
                  <meshStandardMaterial color="#ff9999" transparent opacity={0.6} depthWrite={false} />
                </mesh>
                <mesh position={[0.5, -0.15, 0]} scale={[1, 1, 0.2]}>
                  <sphereGeometry args={[0.18, 16, 16]} />
                  <meshStandardMaterial color="#ff9999" transparent opacity={0.6} depthWrite={false} />
                </mesh>

                {/* Mouth */}
                <mesh 
                  position={[0, -0.15, 0.08]} 
                  scale={mouthId === 'mouth_open' ? [1, 1, 0.2] : [1, 0.5, 0.2]}
                  rotation={mouthId === 'mouth_sad' ? [0, 0, Math.PI] : [0, 0, 0]}
                >
                  <sphereGeometry args={[0.06, 16, 16]} />
                  <meshStandardMaterial color={mouthId === 'mouth_open' ? '#ff5555' : '#ffaaaa'} />
                </mesh>
              </group>

              {/* Hair Group */}
              {hairId !== 'hair_bald' && (
                <group position={[0, 0, 0]}>
                  
                  {/* Curly Hair (Multiple spheres) */}
                  {hairId === 'hair_curly' ? (
                    <group position={[0, 0.2, 0]}>
                      {[[-0.5,0,0], [0.5,0,0], [0,0.5,0], [-0.4,0.4,0.4], [0.4,0.4,0.4], [0,-0.2,-0.5]].map((pos, i) => (
                        <mesh key={i} position={pos as any}>
                          <sphereGeometry args={[0.5, 16, 16]} />
                          <meshStandardMaterial color={hairColor} roughness={0.9} />
                        </mesh>
                      ))}
                    </group>
                  ) : (
                    // Default Volume
                    <mesh position={[0, 0.15, -0.1]}>
                      <sphereGeometry args={[0.96, 32, 32]} />
                      {hairId === 'hair_neon' ? (
                        <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={0.8} />
                      ) : (
                        <meshStandardMaterial color={hairColor} roughness={0.9} />
                      )}
                    </mesh>
                  )}

                  {/* Bangs */}
                  {hairId !== 'hair_curly' && (
                    <mesh position={[0, 0.55, 0.8]} rotation={[0.2, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.15, 1.2, 16, 16]} />
                      <meshStandardMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {/* Long hair extension */}
                  {hairId === 'hair_long' && (
                    <mesh position={[0, -0.8, -0.6]} rotation={[-0.2, 0, 0]}>
                      <capsuleGeometry args={[0.6, 1.5, 16, 16]} />
                      <meshStandardMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {/* Twin Tails */}
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
                </group>
              )}

              {/* Accessories Group */}
              {accessoryId === 'acc_visor' && (
                <mesh position={[0, 0.05, 0.88]}>
                  <boxGeometry args={[1.3, 0.35, 0.2]} />
                  <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={1} opacity={0.9} transparent />
                </mesh>
              )}
              {accessoryId === 'acc_shades' && (
                <group position={[0, 0.05, 0.95]}>
                  <mesh position={[-0.35, 0, 0]}>
                    <boxGeometry args={[0.5, 0.3, 0.1]} />
                    <meshStandardMaterial color="#111" />
                  </mesh>
                  <mesh position={[0.35, 0, 0]}>
                    <boxGeometry args={[0.5, 0.3, 0.1]} />
                    <meshStandardMaterial color="#111" />
                  </mesh>
                  <mesh position={[0, 0.1, 0]}>
                    <boxGeometry args={[0.4, 0.05, 0.05]} />
                    <meshStandardMaterial color="#111" />
                  </mesh>
                </group>
              )}
              {accessoryId === 'acc_cybermask' && (
                <mesh position={[0, -0.3, 0.8]}>
                  <boxGeometry args={[0.8, 0.4, 0.3]} />
                  <meshStandardMaterial color="#111" emissive={accessoryColor} emissiveIntensity={0.5} />
                </mesh>
              )}
              {accessoryId === 'acc_gasmask' && (
                <group position={[0, -0.2, 0.95]}>
                  <mesh rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.25, 0.35, 0.2, 16]} />
                    <meshStandardMaterial color="#222" />
                  </mesh>
                  {/* Filters */}
                  <mesh position={[-0.25, -0.1, 0.1]} rotation={[Math.PI/2, 0, 0.4]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
                    <meshStandardMaterial color="#444" />
                  </mesh>
                  <mesh position={[0.25, -0.1, 0.1]} rotation={[Math.PI/2, 0, -0.4]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
                    <meshStandardMaterial color="#444" />
                  </mesh>
                </group>
              )}
              {accessoryId === 'acc_catears' && (
                <group position={[0, 0.85, 0]}>
                  <mesh position={[-0.45, 0, 0]} rotation={[0, 0, 0.3]}>
                    <coneGeometry args={[0.25, 0.6, 16]} />
                    <meshStandardMaterial color={accessoryColor} roughness={0.9} />
                  </mesh>
                  <mesh position={[0.45, 0, 0]} rotation={[0, 0, -0.3]}>
                    <coneGeometry args={[0.25, 0.6, 16]} />
                    <meshStandardMaterial color={accessoryColor} roughness={0.9} />
                  </mesh>
                </group>
              )}
              {accessoryId === 'acc_halo' && (
                <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
                  <torusGeometry args={[0.5, 0.06, 16, 32]} />
                  <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.8} />
                </mesh>
              )}
              {accessoryId === 'acc_headphones' && (
                <group position={[0, 0, 0]}>
                  <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                    <torusGeometry args={[0.98, 0.08, 16, 32]} />
                    <meshStandardMaterial color="#18181b" roughness={0.8} />
                  </mesh>
                  <mesh position={[-0.98, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
                    <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.4} />
                  </mesh>
                  <mesh position={[0.98, 0, 0]} rotation={[0, Math.PI/2, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
                    <meshStandardMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={0.4} />
                  </mesh>
                </group>
              )}
            </group>
          </group>
          <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls 
          enableZoom={true} 
          minDistance={3}
          maxDistance={10}
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={1.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  )
}
