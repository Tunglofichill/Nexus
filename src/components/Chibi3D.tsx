'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import { Suspense, useRef } from 'react'

export default function Chibi3D({ 
  skinColor, 
  hairColor, 
  clothesColor,
  hairId
}: { 
  skinColor: string, 
  hairColor: string, 
  clothesColor: string,
  hairId: string
}) {

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0.5, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#6366f1" />
        <pointLight position={[0, 5, -5]} intensity={2} color="#a855f7" />
        
        <Suspense fallback={null}>
          <group position={[0, -1.5, 0]}>
            {/* Body */}
            <mesh position={[0, 0.9, 0]}>
              <capsuleGeometry args={[0.5, 0.8, 16, 32]} />
              <meshStandardMaterial color={clothesColor} roughness={0.6} />
            </mesh>

            {/* Neck (Hidden by clothes, but gives separation) */}
            <mesh position={[0, 1.7, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
              <meshStandardMaterial color={skinColor} roughness={0.4} />
            </mesh>
            
            {/* Head */}
            <mesh position={[0, 2.3, 0]}>
              <boxGeometry args={[1.4, 1.3, 1.4]} />
              {/* Adding a bit of rounded effect by using a sphere or rounded box, but standard box with high segments works too if it was sphere. Let's use sphere for cute chibi */}
            </mesh>

            <mesh position={[0, 2.3, 0]}>
              <sphereGeometry args={[0.8, 32, 32]} />
              <meshStandardMaterial color={skinColor} roughness={0.4} />
            </mesh>

            {/* Eyes */}
            <group position={[0, 2.3, 0.75]}>
              <mesh position={[-0.3, 0.1, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
              <mesh position={[0.3, 0.1, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
              {/* Eye highlights */}
              <mesh position={[-0.33, 0.13, 0.08]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0.27, 0.13, 0.08]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>

            {/* Hair - dynamic based on hairId */}
            {hairId !== 'hair_bald' && (
              <mesh position={[0, 2.9, -0.1]}>
                {hairId === 'hair_short' ? (
                  <boxGeometry args={[1.6, 0.8, 1.6]} />
                ) : hairId === 'hair_long' ? (
                  <capsuleGeometry args={[0.8, 1.5, 16, 16]} />
                ) : (
                  <sphereGeometry args={[0.9, 16, 16]} />
                )}
                
                {hairId === 'hair_neon' ? (
                  <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={0.8} />
                ) : (
                  <meshStandardMaterial color={hairColor} roughness={0.8} />
                )}
              </mesh>
            )}

            {/* If long hair, add the back part */}
            {hairId === 'hair_long' && (
              <mesh position={[0, 1.8, -0.5]}>
                <capsuleGeometry args={[0.7, 1.5, 16, 16]} />
                <meshStandardMaterial color={hairColor} roughness={0.8} />
              </mesh>
            )}

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
