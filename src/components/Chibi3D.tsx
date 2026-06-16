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
  eyesColor = '#000000',
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
            <mesh castShadow receiveShadow key={i} position={[Math.cos(i * 1.2) * 2, Math.sin(i * 2) * 0.5, Math.sin(i * 1.2) * 2]} rotation={[Math.random(), Math.random(), Math.random()]}>
              <dodecahedronGeometry args={[0.3, 0]} />
              <mesh castShadow receiveShadowPhysicalMaterial color="#3f3f46" roughness={0.8} />
            </mesh>
          ))}
        </group>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
        
        
        {/* Fill light for face */}
        
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
          
          {/* Main Avatar Group */}
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.05, 0.05]}>
            <group position={[0, -1, 0]}>
            
            {/* Body Group */}
            <group position={[0, 0.7, 0]} scale={bodyScale}>
              {/* Torso */}
              <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.45, 0.3, 32, 64]} />
                <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.8} metalness={clothesId === 'clothes_armor' ? 0.8 : 0.1} />
              </mesh>
              
              {/* Detailed Clothes Group */}
              <group>
                {/* Streetwear Details */}
                {clothesId === 'clothes_casual' && (
                  <group>
                    {/* Hem */}
                    <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
                      <cylinderGeometry args={[0.46, 0.46, 0.1, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" roughness={0.9} />
                    </mesh>
                    {/* Collar trim */}
                    <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
                      <torusGeometry args={[0.18, 0.05, 32, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" roughness={0.9} />
                    </mesh>
                    {/* Simple logo */}
                    <mesh castShadow receiveShadow position={[0, 0.1, 0.45]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.1, 0.1, 0.02, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" roughness={0.9} />
                    </mesh>
                  </group>
                )}

                {/* Suit Details */}
                {clothesId === 'clothes_suit' && (
                  <group>
                    {/* White V-neck (Upside down cone) */}
                    <mesh castShadow receiveShadow position={[0, 0.25, 0.35]} rotation={[0.15, 0, Math.PI]}>
                      <coneGeometry args={[, , 6]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" roughness={0.9} />
                    </mesh>
                    {/* Tie */}
                    <mesh castShadow receiveShadow position={[0, 0.15, 0.45]} rotation={[0.15, 0, 0]}>
                      <boxGeometry args={[0.05, 0.35, 0.02]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#ef4444" roughness={0.9} />
                    </mesh>
                    {/* Tie knot */}
                    <mesh castShadow receiveShadow position={[0, 0.32, 0.42]} rotation={[0.15, 0, 0]}>
                      <boxGeometry args={[0.07, 0.07, 0.03]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#ef4444" roughness={0.9} />
                    </mesh>
                    {/* Left Lapel */}
                    <mesh castShadow receiveShadow position={[-0.15, 0.15, 0.46]} rotation={[0.15, 0, -0.4]}>
                      <boxGeometry args={[0.08, 0.5, 0.02]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.9} />
                    </mesh>
                    {/* Right Lapel */}
                    <mesh castShadow receiveShadow position={[0.15, 0.15, 0.46]} rotation={[0.15, 0, 0.4]}>
                      <boxGeometry args={[0.08, 0.5, 0.02]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.9} />
                    </mesh>
                  </group>
                )}

                {/* Techwear Details */}
                {clothesId === 'clothes_tech' && (
                  <group>
                    {/* Cross strap 1 */}
                    <mesh castShadow receiveShadow position={[0, 0.1, 0.45]} rotation={[0, 0, 0.5]}>
                      <boxGeometry args={[0.8, 0.05, 0.02]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#111" />
                    </mesh>
                    {/* Cross strap 2 */}
                    <mesh castShadow receiveShadow position={[0, 0.1, 0.45]} rotation={[0, 0, -0.5]}>
                      <boxGeometry args={[0.8, 0.05, 0.02]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#111" />
                    </mesh>
                    {/* Tactical Belt */}
                    <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
                      <cylinderGeometry args={[0.46, 0.46, 0.1, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#111" />
                    </mesh>
                    {/* Belt Pouches */}
                    <mesh castShadow receiveShadow position={[0.2, -0.2, 0.43]}><boxGeometry args={[0.15, 0.15, 0.1]} /><mesh castShadow receiveShadowPhysicalMaterial color="#27272a" /></mesh>
                    <mesh castShadow receiveShadow position={[-0.2, -0.2, 0.43]}><boxGeometry args={[0.15, 0.15, 0.1]} /><mesh castShadow receiveShadowPhysicalMaterial color="#27272a" /></mesh>
                  </group>
                )}

                {/* Robe Details */}
                {clothesId === 'clothes_robe' && (
                  <group>
                    {/* Robe Skirt covering legs */}
                    <mesh castShadow receiveShadow position={[0, -0.4, 0]}>
                      <cylinderGeometry args={[0.45, 0.55, 0.5, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.9} />
                    </mesh>
                    {/* Gold trim */}
                    <mesh castShadow receiveShadow position={[0, -0.63, 0]}>
                      <cylinderGeometry args={[0.55, 0.55, 0.05, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#eab308" metalness={0.8} />
                    </mesh>
                  </group>
                )}
                
                {/* Ninja Scarf */}
                {clothesId === 'clothes_ninja' && (
                  <mesh castShadow receiveShadow position={[0, 0.4, 0.1]} rotation={[0.2, 0, 0]}>
                    <torusGeometry args={[0.35, 0.15, 32, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color="#111" />
                  </mesh>
                )}
                
                {/* Hoodie Details */}
                {clothesId === 'clothes_hoodie' && (
                  <group>
                    <mesh castShadow receiveShadow position={[0, 0.2, -0.2]} rotation={[-0.2, 0, 0]}>
                      <torusGeometry args={[0.4, 0.2, 32, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.9} />
                    </mesh>
                    {/* Drawstrings */}
                    <mesh castShadow receiveShadow position={[-0.1, 0, 0.45]} rotation={[0, 0, 0]}>
                      <cylinderGeometry args={[0.01, 0.01, 0.3, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" />
                    </mesh>
                    <mesh castShadow receiveShadow position={[0.1, 0, 0.45]} rotation={[0, 0, 0]}>
                      <cylinderGeometry args={[0.01, 0.01, 0.3, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" />
                    </mesh>
                    {/* Kangaroo Pocket */}
                    <mesh castShadow receiveShadow position={[0, -0.2, 0.4]} rotation={[0.2, 0, 0]}>
                      <boxGeometry args={[0.5, 0.25, 0.1]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.9} />
                    </mesh>
                  </group>
                )}
                
                {/* Armor Shoulder Pads */}
                {clothesId === 'clothes_armor' && (
                  <group>
                    <mesh castShadow receiveShadow position={[-0.55, 0.35, 0]} rotation={[0, 0, 0.4]}>
                      <cylinderGeometry args={[0.25, 0.25, 0.4, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#a1a1aa" metalness={0.9} roughness={0.2} />
                    </mesh>
                    <mesh castShadow receiveShadow position={[0.55, 0.35, 0]} rotation={[0, 0, -0.4]}>
                      <cylinderGeometry args={[0.25, 0.25, 0.4, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#a1a1aa" metalness={0.9} roughness={0.2} />
                    </mesh>
                    {/* Chest plate */}
                    <mesh castShadow receiveShadow position={[0, 0.1, 0.1]}>
                      <boxGeometry args={[0.7, 0.5, 0.4]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#a1a1aa" metalness={0.9} roughness={0.2} />
                    </mesh>
                  </group>
                )}
              </group>

              {/* Left Arm */}
              <group position={[-0.55, 0, 0]} rotation={[0, 0, -0.3]}>
                <mesh castShadow receiveShadow>
                  <capsuleGeometry args={[0.15, 0.6, 32, 64]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color={clothesId === 'clothes_casual' ? skinColor : clothesColor} roughness={0.8} />
                </mesh>
                {/* Short sleeves for casual */}
                {clothesId === 'clothes_casual' && (
                  <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.3, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.9} />
                  </mesh>
                )}
                {/* Robe wide sleeves */}
                {clothesId === 'clothes_robe' && (
                  <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
                    <cylinderGeometry args={[0.16, 0.22, 0.4, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.9} />
                  </mesh>
                )}
              </group>
              
              {/* Right Arm */}
              <group position={[0.55, 0, 0]} rotation={[0, 0, 0.3]}>
                <mesh castShadow receiveShadow>
                  <capsuleGeometry args={[0.15, 0.6, 32, 64]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color={clothesId === 'clothes_casual' ? skinColor : clothesColor} roughness={0.8} />
                </mesh>
                {/* Short sleeves for casual */}
                {clothesId === 'clothes_casual' && (
                  <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.3, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.9} />
                  </mesh>
                )}
                {/* Robe wide sleeves */}
                {clothesId === 'clothes_robe' && (
                  <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
                    <cylinderGeometry args={[0.16, 0.22, 0.4, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={clothesColor} roughness={0.9} />
                  </mesh>
                )}
              </group>
              {/* Pants Base / Pelvis */}
              <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
                {bottomsId === 'bottom_skirt' ? (
                  <cylinderGeometry args={[0.46, 0.6, 0.4, 64]} />
                ) : (
                  <cylinderGeometry args={[0.46, 0.44, 0.3, 64]} />
                )}
                <mesh castShadow receiveShadowPhysicalMaterial color={bottomsColor} roughness={0.9} />
              </mesh>
              
              {/* Left Leg */}
              <group position={[-0.2, -0.6, 0]}>
                <mesh castShadow receiveShadow>
                  <capsuleGeometry args={[0.15, 0.5, 32, 64]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color={skinColor} roughness={0.4} />
                </mesh>
                {/* Long Pants */}
                {bottomsId !== 'bottom_shorts' && bottomsId !== 'bottom_skirt' && (
                  <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.5, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={bottomsColor} roughness={0.9} />
                  </mesh>
                )}
                {/* Shorts */}
                {bottomsId === 'bottom_shorts' && (
                  <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.3, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={bottomsColor} roughness={0.9} />
                  </mesh>
                )}
              </group>
              
              {/* Right Leg */}
              <group position={[0.2, -0.6, 0]}>
                <mesh castShadow receiveShadow>
                  <capsuleGeometry args={[0.15, 0.5, 32, 64]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color={skinColor} roughness={0.4} />
                </mesh>
                {/* Long Pants */}
                {bottomsId !== 'bottom_shorts' && bottomsId !== 'bottom_skirt' && (
                  <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.5, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={bottomsColor} roughness={0.9} />
                  </mesh>
                )}
                {/* Shorts */}
                {bottomsId === 'bottom_shorts' && (
                  <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.3, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={bottomsColor} roughness={0.9} />
                  </mesh>
                )}
              </group>
              
              {/* Neck */}
              <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.2, 64]} />
                <mesh castShadow receiveShadowPhysicalMaterial color={skinColor} roughness={0.4} />
              </mesh>
            </group>

            {/* Head Group */}
            <group position={[0, 1.85, 0]} scale={[0.75, 0.75, 0.75]}>
              
              {/* Main Skull */}
              <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <sphereGeometry args={[0.9, 64, 64]} />
                <mesh castShadow receiveShadowPhysicalMaterial color={skinColor} roughness={0.4} />
              </mesh>
              
              {/* Eyes Group */}
              <group position={[0, 0.1, 0.82]}>
                {eyesId === 'eyes_normal' && (
                  <>
                    <mesh castShadow receiveShadow position={[-0.3, 0, 0]}><sphereGeometry args={[0.1, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                    <mesh castShadow receiveShadow position={[0.3, 0, 0]}><sphereGeometry args={[0.1, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_big' && (
                  <>
                    <mesh castShadow receiveShadow position={[-0.3, 0.05, 0]}><sphereGeometry args={[0.18, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                    <mesh castShadow receiveShadow position={[-0.25, 0.12, 0.15]}><sphereGeometry args={[0.05, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" /></mesh>
                    <mesh castShadow receiveShadow position={[0.3, 0.05, 0]}><sphereGeometry args={[0.18, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                    <mesh castShadow receiveShadow position={[0.35, 0.12, 0.15]}><sphereGeometry args={[0.05, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" /></mesh>
                  </>
                )}
                {eyesId === 'eyes_closed' && (
                  <>
                    <mesh castShadow receiveShadow position={[-0.3, 0, 0.05]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.25, 0.02, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                    <mesh castShadow receiveShadow position={[0.3, 0, 0.05]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.25, 0.02, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_angry' && (
                  <>
                    <mesh castShadow receiveShadow position={[-0.3, 0, 0.05]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.25, 0.05, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                    <mesh castShadow receiveShadow position={[0.3, 0, 0.05]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.25, 0.05, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_sad' && (
                  <>
                    <mesh castShadow receiveShadow position={[-0.3, 0, 0.05]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.25, 0.05, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                    <mesh castShadow receiveShadow position={[0.3, 0, 0.05]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.25, 0.05, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_star' && (
                  <>
                    <mesh castShadow receiveShadow position={[-0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.05, 5]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                    <mesh castShadow receiveShadow position={[0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.05, 5]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                  </>
                )}
                {eyesId === 'eyes_heart' && (
                  <>
                    <group position={[-0.3, 0, 0]}>
                      <mesh castShadow receiveShadow position={[-0.05, 0.05, 0]}><sphereGeometry args={[0.08, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                      <mesh castShadow receiveShadow position={[0.05, 0.05, 0]}><sphereGeometry args={[0.08, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                      <mesh castShadow receiveShadow position={[0, -0.05, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.08, 0.15, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                    </group>
                    <group position={[0.3, 0, 0]}>
                      <mesh castShadow receiveShadow position={[-0.05, 0.05, 0]}><sphereGeometry args={[0.08, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                      <mesh castShadow receiveShadow position={[0.05, 0.05, 0]}><sphereGeometry args={[0.08, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                      <mesh castShadow receiveShadow position={[0, -0.05, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.08, 0.15, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
                    </group>
                  </>
                )}
                {eyesId === 'eyes_cyber' && (
                  <mesh castShadow receiveShadow position={[0, 0, 0.05]}>
                    <boxGeometry args={[0.8, 0.1, 0.02]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={eyesColor} emissive={eyesColor} emissiveIntensity={2} />
                  </mesh>
                )}
              </group>

              {/* Mouth */}
              {mouthId === 'mouth_smile' && (
                <mesh castShadow receiveShadow position={[0, -0.15, 0.88]}>
                  <torusGeometry args={[0.08, 0.015, 16, 32, Math.PI]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color="#111" />
                </mesh>
              )}
              {mouthId === 'mouth_open' && (
                <mesh castShadow receiveShadow position={[0, -0.15, 0.88]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} rotation={[Math.PI/2, 0, 0]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color="#ef4444" />
                </mesh>
              )}
              {mouthId === 'mouth_sad' && (
                <mesh castShadow receiveShadow position={[0, -0.2, 0.88]} rotation={[0, 0, Math.PI]}>
                  <torusGeometry args={[0.08, 0.015, 16, 32, Math.PI]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color="#111" />
                </mesh>
              )}
              {mouthId === 'mouth_cat' && (
                <group position={[0, -0.15, 0.88]}>
                  <mesh castShadow receiveShadow position={[-0.05, 0, 0]}>
                    <torusGeometry args={[0.05, 0.015, 16, 32, Math.PI]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color="#111" />
                  </mesh>
                  <mesh castShadow receiveShadow position={[0.05, 0, 0]}>
                    <torusGeometry args={[0.05, 0.015, 16, 32, Math.PI]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color="#111" />
                  </mesh>
                </group>
              )}
              {mouthId === 'mouth_vampire' && (
                <group position={[0, -0.15, 0.88]}>
                  <mesh castShadow receiveShadow position={[0, 0, 0]}>
                    <boxGeometry args={[0.15, 0.015, 0.02]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color="#111" />
                  </mesh>
                  <mesh castShadow receiveShadow position={[-0.05, -0.05, 0]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.02, 0.08, 8]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" />
                  </mesh>
                  <mesh castShadow receiveShadow position={[0.05, -0.05, 0]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.02, 0.08, 8]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" />
                  </mesh>
                </group>
              )}

              {/* Blush */}
              <mesh castShadow receiveShadow position={[-0.45, -0.05, 0.75]} rotation={[0, -0.4, 0]} scale={[1, 1, 0.1]}>
                <sphereGeometry args={[0.15, 64, 64]} />
                <mesh castShadow receiveShadowPhysicalMaterial color="#ff9999" opacity={0.6} transparent roughness={1} />
              </mesh>
              <mesh castShadow receiveShadow position={[0.45, -0.05, 0.75]} rotation={[0, 0.4, 0]} scale={[1, 1, 0.1]}>
                <sphereGeometry args={[0.15, 64, 64]} />
                <mesh castShadow receiveShadowPhysicalMaterial color="#ff9999" opacity={0.6} transparent roughness={1} />
              </mesh>

              {/* Decals */}
              <group position={[0, 0, 0.89]}>
                {decalsId === 'decal_scar' && (
                  <mesh castShadow receiveShadow position={[-0.3, 0.1, 0]} rotation={[0, 0, 0.5]}>
                    <boxGeometry args={[0.05, 0.35, 0.01]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={decalsColor} />
                  </mesh>
                )}
                {decalsId === 'decal_bandage' && (
                  <mesh castShadow receiveShadow position={[0, -0.05, 0]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.35, 0.12, 0.02]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" roughness={0.9} />
                  </mesh>
                )}
                {decalsId === 'decal_cyber' && (
                  <group>
                    <mesh castShadow receiveShadow position={[0.4, 0.2, 0]} rotation={[0, 0.5, 0]}>
                      <boxGeometry args={[0.02, 0.2, 0.02]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={1.5} />
                    </mesh>
                    <mesh castShadow receiveShadow position={[-0.4, -0.2, 0]} rotation={[0, -0.5, 0]}>
                      <boxGeometry args={[0.02, 0.2, 0.02]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={decalsColor} emissive={decalsColor} emissiveIntensity={1.5} />
                    </mesh>
                  </group>
                )}
                {decalsId === 'decal_freckles' && (
                  <group>
                    <mesh castShadow receiveShadow position={[-0.35, 0.02, 0.02]}><sphereGeometry args={[0.025, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#b45309" /></mesh>
                    <mesh castShadow receiveShadow position={[-0.42, 0.0, 0.01]}><sphereGeometry args={[0.02, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#b45309" /></mesh>
                    <mesh castShadow receiveShadow position={[-0.28, -0.02, 0.02]}><sphereGeometry args={[0.015, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#b45309" /></mesh>
                    
                    <mesh castShadow receiveShadow position={[0.35, 0.02, 0.02]}><sphereGeometry args={[0.025, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#b45309" /></mesh>
                    <mesh castShadow receiveShadow position={[0.42, 0.0, 0.01]}><sphereGeometry args={[0.02, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#b45309" /></mesh>
                    <mesh castShadow receiveShadow position={[0.28, -0.02, 0.02]}><sphereGeometry args={[0.015, 64, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#b45309" /></mesh>
                  </group>
                )}
                {decalsId === 'decal_star' && (
                  <mesh castShadow receiveShadow position={[-0.3, -0.1, 0]} rotation={[Math.PI/2, 0.2, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.02, 5]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={decalsColor} />
                  </mesh>
                )}
                {decalsId === 'decal_tear' && (
                  <mesh castShadow receiveShadow position={[0.3, -0.1, 0]} rotation={[Math.PI/2, -0.2, 0]}>
                    <coneGeometry args={[, , 6]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color="#3b82f6" />
                  </mesh>
                )}
              </group>

              {/* Hair Group */}
              {hairId !== 'hair_bald' && (
                <group position={[0, 0, 0]}>
                  {/* Base Hair Volume (Most styles have this) */}
                  {hairId !== 'hair_mohawk' && hairId !== 'hair_curly' && (
                    <mesh castShadow receiveShadow position={[0, 0.15, -0.1]}>
                      <sphereGeometry args={[0.95, 32, 32]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {/* Standard Bangs */}
                  {(hairId === 'hair_short' || hairId === 'hair_long' || hairId === 'hair_twintails' || hairId === 'hair_ponytail') && (
                    <group position={[0, 0.5, 0.72]} rotation={[0.3, 0, 0]}>
                      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
                        <capsuleGeometry args={[0.18, 1.3, 32, 64]} />
                        <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                    </group>
                  )}

                  {hairId === 'hair_long' && (
                    <mesh castShadow receiveShadow position={[0, -0.6, -0.5]} rotation={[0.2, 0, 0]}>
                      <capsuleGeometry args={[0.4, 1.5, 32, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {hairId === 'hair_twintails' && (
                    <group>
                      <mesh castShadow receiveShadow position={[-0.9, -0.3, 0]} rotation={[0, 0, 0.4]}>
                        <capsuleGeometry args={[0.3, 1.2, 32, 64]} />
                        <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                      <mesh castShadow receiveShadow position={[0.9, -0.3, 0]} rotation={[0, 0, -0.4]}>
                        <capsuleGeometry args={[0.3, 1.2, 32, 64]} />
                        <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                    </group>
                  )}

                  {hairId === 'hair_curly' && (
                    <mesh castShadow receiveShadow position={[0, 0.3, -0.1]}>
                      <sphereGeometry args={[1.2, 64, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={1} />
                    </mesh>
                  )}

                  {hairId === 'hair_mohawk' && (
                    <group position={[0, 0.85, -0.1]}>
                      {[...Array(5)].map((_, i) => (
                        <mesh castShadow receiveShadow key={i} position={[0, Math.sin(i*0.8)*0.2, (i-2)*0.3]} rotation={[0.2 - i*0.1, 0, 0]}>
                          <capsuleGeometry args={[0.1, 0.6, 32, 64]} />
                          <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                        </mesh>
                      ))}
                    </group>
                  )}

                  {hairId === 'hair_ponytail' && (
                    <group position={[0, 0.2, -0.9]} rotation={[-0.5, 0, 0]}>
                      <mesh castShadow receiveShadow position={[0, 0, 0]}>
                        <sphereGeometry args={[0.2, 64, 64]} />
                        <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                      <mesh castShadow receiveShadow position={[0, -0.6, -0.2]} rotation={[0.2, 0, 0]}>
                        <capsuleGeometry args={[0.25, 1.2, 32, 64]} />
                        <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                      </mesh>
                    </group>
                  )}

                  {hairId === 'hair_samurai' && (
                    <mesh castShadow receiveShadow position={[0, 1.0, -0.3]}>
                      <sphereGeometry args={[0.25, 64, 64]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  )}

                  {hairId === 'hair_messy' && (
                    <group position={[0, 0.5, 0]}>
                      {[...Array(12)].map((_, i) => (
                        <mesh castShadow receiveShadow key={i} position={[Math.cos(i) * 0.5, Math.random() * 0.5, Math.sin(i) * 0.5]} rotation={[Math.random(), Math.random(), 0]}>
                          <capsuleGeometry args={[0.2, 0.8, 8, 8]} />
                          <mesh castShadow receiveShadowPhysicalMaterial color={hairColor} roughness={0.9} />
                        </mesh>
                      ))}
                    </group>
                  )}
                </group>
              )}

              {/* Accessories Group */}
              {accessoryId === 'acc_visor' && (
                <group position={[0, 0.05, 0.88]}>
                  <mesh castShadow receiveShadow rotation={[0, 0, Math.PI/2]}><capsuleGeometry args={[0.18, 0.8, 32, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#111" transparent opacity={0.8} roughness={0.1} metalness={0.8} /></mesh>
                  <mesh castShadow receiveShadow position={[0, 0, 0.02]} rotation={[0, 0, Math.PI/2]}><capsuleGeometry args={[0.16, 0.75, 8, 16]} /><mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} wireframe /></mesh>
                </group>
              )}
              
              {accessoryId === 'acc_shades' && (
                <group position={[0, 0.05, 0.9]}>
                  <mesh castShadow receiveShadow position={[-0.35, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.05, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#111" roughness={0.1} metalness={0.9} /></mesh>
                  <mesh castShadow receiveShadow position={[0.35, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.05, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#111" roughness={0.1} metalness={0.9} /></mesh>
                  <mesh castShadow receiveShadow position={[0, 0.05, 0]}><boxGeometry args={[0.3, 0.02, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color="#e5e5e5" metalness={1} roughness={0.2} /></mesh>
                </group>
              )}

              {accessoryId === 'acc_cybermask' && (
                <group position={[0, -0.22, 0.8]}>
                  <mesh castShadow receiveShadow rotation={[0.1, 0, Math.PI/2]}><capsuleGeometry args={[0.22, 0.5, 32, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} /></mesh>
                  <mesh castShadow receiveShadow position={[0, 0.08, 0.2]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.6, 0.04, 0.05]} /><mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} /></mesh>
                  <mesh castShadow receiveShadow position={[0, -0.05, 0.2]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.4, 0.04, 0.05]} /><mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} /></mesh>
                </group>
              )}

              {accessoryId === 'acc_gasmask' && (
                <group position={[0, -0.2, 0.95]}>
                  <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.3, 0.35, 0.25, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#27272a" roughness={0.8} /></mesh>
                  <mesh castShadow receiveShadow position={[0, 0, 0.15]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.05, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#111" metalness={0.8} wireframe /></mesh>
                  <mesh castShadow receiveShadow position={[-0.35, -0.1, 0.05]} rotation={[Math.PI/2, 0, 0.5]}><cylinderGeometry args={[0.18, 0.18, 0.2, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#3f3f46" metalness={0.5} /><mesh castShadow receiveShadow position={[0, 0.11, 0]}><cylinderGeometry args={[0.16, 0.16, 0.02, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ef4444" /></mesh></mesh>
                  <mesh castShadow receiveShadow position={[0.35, -0.1, 0.05]} rotation={[Math.PI/2, 0, -0.5]}><cylinderGeometry args={[0.18, 0.18, 0.2, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#3f3f46" metalness={0.5} /><mesh castShadow receiveShadow position={[0, 0.11, 0]}><cylinderGeometry args={[0.16, 0.16, 0.02, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ef4444" /></mesh></mesh>
                </group>
              )}

              {accessoryId === 'acc_catears' && (
                <group position={[0, 0.85, 0]}>
                  <group position={[-0.45, 0, 0]} rotation={[0, 0, 0.3]}><mesh castShadow receiveShadow><coneGeometry args={[, , 6]} /><mesh castShadow receiveShadowPhysicalMaterial color="#fbcfe8" roughness={0.6} /></mesh></group>
                  <group position={[0.45, 0, 0]} rotation={[0, 0, -0.3]}><mesh castShadow receiveShadow><coneGeometry args={[, , 6]} /><mesh castShadow receiveShadowPhysicalMaterial color="#fbcfe8" roughness={0.6} /></mesh></group>
                </group>
              )}

              {accessoryId === 'acc_halo' && (
                <group position={[0, 1.4, 0]} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
                  <mesh castShadow receiveShadow><torusGeometry args={[0.5, 0.04, 16, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} /></mesh>
                  <mesh castShadow receiveShadow><torusGeometry args={[0.42, 0.015, 16, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} /></mesh>
                </group>
              )}

              {accessoryId === 'acc_headphones' && (
                <group position={[0, 0, 0]}>
                  <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[0, 0, 0]}><torusGeometry args={[0.98, 0.1, 16, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#18181b" roughness={0.8} /></mesh>
                  <group position={[-0.98, 0, 0]} rotation={[0, Math.PI/2, 0]}><mesh castShadow receiveShadow><cylinderGeometry args={[0.4, 0.4, 0.25, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#27272a" roughness={0.6} metalness={0.4} /></mesh><mesh castShadow receiveShadow position={[0, 0, -0.13]}><circleGeometry args={[0.15, 32]} /><mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} side={2} /></mesh></group>
                  <group position={[0.98, 0, 0]} rotation={[0, Math.PI/2, 0]}><mesh castShadow receiveShadow><cylinderGeometry args={[0.4, 0.4, 0.25, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#27272a" roughness={0.6} metalness={0.4} /></mesh><mesh castShadow receiveShadow position={[0, 0, 0.13]}><circleGeometry args={[0.15, 32]} /><mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} emissive={accessoryColor} emissiveIntensity={2} side={2} /></mesh><mesh castShadow receiveShadow position={[0, -0.25, -0.2]} rotation={[Math.PI/4, 0, 0]}><capsuleGeometry args={[0.02, 0.4, 8, 8]} /><mesh castShadow receiveShadowPhysicalMaterial color="#111" /></mesh></group>
                </group>
              )}

              {/* NEW ACCESSORIES */}
              {accessoryId === 'acc_crown' && (
                <group position={[0, 1.2, 0]}>
                  <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.1, 64]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color="#fbbf24" metalness={1} roughness={0.2} emissive="#fbbf24" emissiveIntensity={0.5} />
                  </mesh>
                  {[...Array(6)].map((_, i) => (
                    <mesh castShadow receiveShadow key={i} position={[Math.cos(i * Math.PI / 3) * 0.4, 0.1, Math.sin(i * Math.PI / 3) * 0.4]}>
                      <coneGeometry args={[0.05, 0.2, 8]} />
                      <mesh castShadow receiveShadowPhysicalMaterial color="#fbbf24" metalness={1} roughness={0.2} />
                    </mesh>
                  ))}
                </group>
              )}
              {accessoryId === 'acc_horns' && (
                <group position={[0, 0.7, 0.5]}>
                  <mesh castShadow receiveShadow position={[-0.3, 0, 0]} rotation={[-0.2, 0, 0.3]}>
                    <coneGeometry args={[, , 6]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} />
                  </mesh>
                  <mesh castShadow receiveShadow position={[0.3, 0, 0]} rotation={[-0.2, 0, -0.3]}>
                    <coneGeometry args={[, , 6]} />
                    <mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} />
                  </mesh>
                </group>
              )}
              {accessoryId === 'acc_goggles' && (
                <group position={[0, 0.6, 0.75]} rotation={[-0.2, 0, 0]}>
                  <mesh castShadow receiveShadow position={[-0.25, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#3f3f46" metalness={0.8} /></mesh>
                  <mesh castShadow receiveShadow position={[0.25, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#3f3f46" metalness={0.8} /></mesh>
                  <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.05, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#111" /></mesh>
                  {/* Lenses */}
                  <mesh castShadow receiveShadow position={[-0.25, 0, 0.06]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.01, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} metalness={1} roughness={0} /></mesh>
                  <mesh castShadow receiveShadow position={[0.25, 0, 0.06]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.01, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color={accessoryColor} metalness={1} roughness={0} /></mesh>
                </group>
              )}
              {accessoryId === 'acc_eyepatch' && (
                <group position={[0, 0.1, 0.85]}>
                  <mesh castShadow receiveShadow position={[-0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.18, 0.18, 0.05, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#111" /></mesh>
                  <mesh castShadow receiveShadow position={[0, 0, -0.05]} rotation={[0.2, 0, 0.2]}><boxGeometry args={[1.8, 0.02, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color="#111" /></mesh>
                </group>
              )}
              {accessoryId === 'acc_kitsune' && (
                <group position={[-0.7, 0.3, 0.5]} rotation={[0, -0.8, -0.3]}>
                  <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, 0]}><capsuleGeometry args={[0.25, 0.4, 32, 64]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" /></mesh>
                  <mesh castShadow receiveShadow position={[-0.15, 0.3, 0]} rotation={[0, 0, 0.2]}><coneGeometry args={[, , 6]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" /></mesh>
                  <mesh castShadow receiveShadow position={[0.15, 0.3, 0]} rotation={[0, 0, -0.2]}><coneGeometry args={[, , 6]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ffffff" /></mesh>
                  {/* Red Markings */}
                  <mesh castShadow receiveShadow position={[0, 0.1, 0.26]}><boxGeometry args={[0.3, 0.02, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ef4444" /></mesh>
                  <mesh castShadow receiveShadow position={[0, 0, 0.26]}><boxGeometry args={[0.02, 0.1, 0.02]} /><mesh castShadow receiveShadowPhysicalMaterial color="#ef4444" /></mesh>
                </group>
              )}

            </group>
          </group>

          {/* Stage Group */}
          <group position={[0, -1, 0]}>
            {stageId === 'stage_holo' && (
              <mesh castShadow receiveShadow position={[0, -0.05, 0]} rotation={[Math.PI/2, 0, 0]}>
                <circleGeometry args={[2, 32]} />
                <mesh castShadow receiveShadowPhysicalMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} wireframe />
              </mesh>
            )}
            {stageId === 'stage_ring' && (
              <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[1.5, 0.05, 16, 64]} />
                <mesh castShadow receiveShadowPhysicalMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
              </mesh>
            )}
            {stageId === 'stage_pedestal' && (
              <group position={[0, -0.1, 0]}>
                <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[1.5, 1.8, 0.2, 64]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color="#18181b" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh castShadow receiveShadow position={[0, 0.1, 0]} rotation={[Math.PI/2, 0, 0]}>
                  <torusGeometry args={[1.5, 0.02, 16, 64]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} />
                </mesh>
              </group>
            )}
            {stageId === 'stage_magic' && (
              <group position={[0, 0, 0]}>
                <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, 0]}>
                  <circleGeometry args={[2.5, 64]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} wireframe />
                </mesh>
                <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, Math.PI/6]}>
                  <circleGeometry args={[2.5, 64]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} wireframe />
                </mesh>
                <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, 0]}>
                  <circleGeometry args={[1.5, 32]} />
                  <mesh castShadow receiveShadowPhysicalMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} wireframe />
                </mesh>
              </group>
            )}
            <AnimatedStage stageId={stageId!} />
          </group>
          </Float>
        </Suspense>
        
        {/* Post Processing Cinematic Effects */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.8} />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>

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
