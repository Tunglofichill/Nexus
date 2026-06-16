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
          <group position={[0, -1, 0]}>
            
            {/* Body (Cute and small) */}
            <mesh position={[0, 0.8, 0]}>
              <capsuleGeometry args={[0.45, 0.6, 16, 32]} />
              <meshStandardMaterial color={clothesColor} roughness={0.7} />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 0.2, 16]} />
              <meshStandardMaterial color={skinColor} roughness={0.4} />
            </mesh>
            
            {/* Head (Big and round) */}
            <mesh position={[0, 2.2, 0]}>
              <sphereGeometry args={[0.9, 32, 32]} />
              <meshStandardMaterial color={skinColor} roughness={0.4} />
            </mesh>

            {/* Eyes (Big, cute, wide apart but not too much) */}
            <group position={[0, 2.2, 0.82]}>
              {/* Left Eye */}
              <mesh position={[-0.35, 0.1, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
              {/* Left Highlight */}
              <mesh position={[-0.38, 0.14, 0.1]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>

              {/* Right Eye */}
              <mesh position={[0.35, 0.1, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
              {/* Right Highlight */}
              <mesh position={[0.32, 0.14, 0.1]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>

            {/* Blush (Cute pink cheeks) */}
            <group position={[0, 2.2, 0.8]}>
              <mesh position={[-0.5, -0.1, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ff9999" transparent opacity={0.6} />
              </mesh>
              <mesh position={[0.5, -0.1, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ff9999" transparent opacity={0.6} />
              </mesh>
            </group>

            {/* Hair - dynamic based on hairId */}
            {hairId !== 'hair_bald' && (
              <group position={[0, 2.2, 0]}>
                {/* Main Hair Volume */}
                <mesh position={[0, 0.3, -0.1]}>
                  {hairId === 'hair_short' ? (
                    <sphereGeometry args={[0.95, 32, 32]} />
                  ) : hairId === 'hair_long' ? (
                    <sphereGeometry args={[0.95, 32, 32]} />
                  ) : (
                    <sphereGeometry args={[0.95, 32, 32]} />
                  )}
                  {hairId === 'hair_neon' ? (
                    <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={0.8} />
                  ) : (
                    <meshStandardMaterial color={hairColor} roughness={0.9} />
                  )}
                </mesh>

                {/* Bangs (Front part of hair) */}
                <mesh position={[0, 0.7, 0.5]}>
                  <capsuleGeometry args={[0.2, 0.8, 16, 16]} />
                  <meshStandardMaterial color={hairColor} roughness={0.9} />
                  <group rotation={[0, 0, Math.PI / 2]}>
                    <mesh position={[0, 0, 0]}>
                      <capsuleGeometry args={[0.2, 0.8, 16, 16]} />
                      <meshStandardMaterial color={hairColor} roughness={0.9} />
                    </mesh>
                  </group>
                </mesh>

                {/* Long hair extension */}
                {hairId === 'hair_long' && (
                  <mesh position={[0, -0.8, -0.6]} rotation={[-0.2, 0, 0]}>
                    <capsuleGeometry args={[0.6, 1.5, 16, 16]} />
                    <meshStandardMaterial color={hairColor} roughness={0.9} />
                  </mesh>
                )}
              </group>
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
