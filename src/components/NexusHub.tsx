'use client'

import React, { useEffect, useState, useRef, useMemo, Suspense, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import { createClient } from '@/utils/supabase/client'
import { ChibiModel } from './Chibi3D'
import { ShoppingCart, Coins, RotateCw, Trash2, X, Move, Sun, Moon, Sunrise, Sunset, Eye, Cloud, CloudRain, CloudDrizzle, Snowflake } from 'lucide-react'

export type TimeOfDay = 'morning' | 'noon' | 'sunset' | 'night'
export type WeatherType = 'clear' | 'drizzle' | 'rain' | 'snow'

/* ═══════════════════════════════════════════════════
   FURNITURE CATALOG — all available items
   ═══════════════════════════════════════════════════ */
interface FurnitureDef {
  id: string
  name: string
  icon: string
  price: number
  category: string
  color: string
  size: [number, number, number] // width, height, depth
  shape: 'box' | 'cylinder' | 'desk' | 'monitor' | 'chair' | 'shelf' | 'plant' | 'lamp' | 'bed' | 'poster'
}

const FURNITURE_CATALOG: FurnitureDef[] = [
  // ─── Gaming / Tech ───
  { id: 'gaming_desk',    name: 'Gaming Desk',     icon: '🖥️', price: 120, category: 'Tech',    color: '#1e1b4b', size: [2, 0.8, 1],    shape: 'desk' },
  { id: 'monitor',        name: 'Monitor',         icon: '🖥️', price: 80,  category: 'Tech',    color: '#111827', size: [0.8, 0.6, 0.1], shape: 'monitor' },
  { id: 'gaming_chair',   name: 'Gaming Chair',    icon: '🪑', price: 100, category: 'Tech',    color: '#7c3aed', size: [0.6, 1.2, 0.6], shape: 'chair' },
  { id: 'pc_tower',       name: 'PC Tower',        icon: '💻', price: 200, category: 'Tech',    color: '#111827', size: [0.4, 0.8, 0.5], shape: 'box' },
  { id: 'keyboard',       name: 'RGB Keyboard',    icon: '⌨️', price: 30,  category: 'Tech',    color: '#1f2937', size: [0.5, 0.05, 0.2], shape: 'box' },
  { id: 'headset_stand',  name: 'Headset Stand',   icon: '🎧', price: 25,  category: 'Tech',    color: '#4f46e5', size: [0.15, 0.4, 0.15], shape: 'cylinder' },
  // ─── Furniture ───
  { id: 'bed',            name: 'Cozy Bed',        icon: '🛏️', price: 150, category: 'Furniture', color: '#6366f1', size: [2, 0.6, 1.4],  shape: 'bed' },
  { id: 'sofa',           name: 'Sofa',            icon: '🛋️', price: 130, category: 'Furniture', color: '#4338ca', size: [1.8, 0.7, 0.8], shape: 'box' },
  { id: 'bookshelf',      name: 'Bookshelf',       icon: '📚', price: 70,  category: 'Furniture', color: '#78350f', size: [1, 1.8, 0.4],  shape: 'shelf' },
  { id: 'coffee_table',   name: 'Coffee Table',    icon: '☕', price: 40,  category: 'Furniture', color: '#92400e', size: [0.8, 0.4, 0.5], shape: 'box' },
  { id: 'wardrobe',       name: 'Wardrobe',        icon: '🚪', price: 90,  category: 'Furniture', color: '#44403c', size: [1, 2, 0.6],    shape: 'box' },
  { id: 'rug',            name: 'Floor Rug',       icon: '🟣', price: 35,  category: 'Furniture', color: '#7e22ce', size: [2, 0.02, 2],   shape: 'box' },
  // ─── Decoration ───
  { id: 'plant_small',    name: 'Small Plant',     icon: '🌿', price: 15,  category: 'Decor',   color: '#16a34a', size: [0.3, 0.5, 0.3], shape: 'plant' },
  { id: 'plant_tall',     name: 'Tall Plant',      icon: '🌴', price: 30,  category: 'Decor',   color: '#15803d', size: [0.4, 1.2, 0.4], shape: 'plant' },
  { id: 'neon_lamp',      name: 'Neon Lamp',       icon: '💡', price: 45,  category: 'Decor',   color: '#ec4899', size: [0.15, 0.8, 0.15], shape: 'lamp' },
  { id: 'poster',         name: 'Wall Poster',     icon: '🖼️', price: 20,  category: 'Decor',   color: '#f59e0b', size: [0.8, 1, 0.05], shape: 'poster' },
  { id: 'led_strip',      name: 'LED Strip Light', icon: '✨', price: 25,  category: 'Decor',   color: '#06b6d4', size: [2, 0.05, 0.05], shape: 'box' },
  { id: 'figurine',       name: 'Figurine',        icon: '🗿', price: 50,  category: 'Decor',   color: '#d97706', size: [0.2, 0.35, 0.2], shape: 'cylinder' },
  { id: 'clock',          name: 'Wall Clock',      icon: '🕐', price: 20,  category: 'Decor',   color: '#f8fafc', size: [0.4, 0.4, 0.05], shape: 'cylinder' },
  { id: 'speaker',        name: 'Bluetooth Speaker',icon: '🔊', price: 35,  category: 'Decor',   color: '#0f172a', size: [0.3, 0.4, 0.2], shape: 'cylinder' },
]

const CATEGORIES = ['All', ...Array.from(new Set(FURNITURE_CATALOG.map(f => f.category)))]

/* ═══════════════════════════════════════════════════
   Placed Item type
   ═══════════════════════════════════════════════════ */
interface PlacedItem {
  uid: string
  defId: string
  position: [number, number, number]
  rotation: number // Y-axis rotation in radians
  color: string
}

/* ═══════════════════════════════════════════════════
   3D FURNITURE RENDERER
   ═══════════════════════════════════════════════════ */
function FurnitureMesh({ def, color, isGhost }: { def: FurnitureDef, color: string, isGhost?: boolean }) {
  const [w, h, d] = def.size
  const mat = useMemo(() => ({
    color, transparent: !!isGhost, opacity: isGhost ? 0.5 : 1,
  }), [color, isGhost])

  switch (def.shape) {
    case 'desk':
      return (
        <group>
          {/* Table top */}
          <mesh position={[0, h - 0.05, 0]} castShadow>
            <boxGeometry args={[w, 0.08, d]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* 4 legs */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([lx, lz], i) => (
            <mesh key={i} position={[lx * (w / 2 - 0.06), (h - 0.05) / 2, lz * (d / 2 - 0.06)]}>
              <boxGeometry args={[0.06, h - 0.05, 0.06]} />
              <meshStandardMaterial color="#374151" transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
            </mesh>
          ))}
        </group>
      )
    case 'monitor':
      return (
        <group>
          {/* Screen */}
          <mesh position={[0, h / 2 + 0.2, 0]} castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial {...mat} emissive="#4f46e5" emissiveIntensity={0.3} />
          </mesh>
          {/* Stand */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.05, 0.12, 0.2, 8]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
        </group>
      )
    case 'chair':
      return (
        <group>
          {/* Seat */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[w, 0.08, d * 0.8]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Back rest */}
          <mesh position={[0, 0.8, -d * 0.35]} castShadow>
            <boxGeometry args={[w, 0.7, 0.08]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Base cylinder */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.15, 0.4, 8]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
        </group>
      )
    case 'shelf':
      return (
        <group>
          {/* Sides */}
          {[-1, 1].map((s, i) => (
            <mesh key={i} position={[s * (w / 2 - 0.03), h / 2, 0]} castShadow>
              <boxGeometry args={[0.05, h, d]} />
              <meshStandardMaterial {...mat} />
            </mesh>
          ))}
          {/* Shelves (4 levels) */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <mesh key={i} position={[0, t * h, 0]}>
              <boxGeometry args={[w, 0.04, d]} />
              <meshStandardMaterial {...mat} />
            </mesh>
          ))}
          {/* Random "books" */}
          {[0.12, 0.37, 0.62, 0.87].map((t, i) => (
            <mesh key={`b${i}`} position={[(Math.random() - 0.5) * w * 0.6, t * h + 0.08, 0]}>
              <boxGeometry args={[0.15 + Math.random() * 0.15, 0.15, d * 0.7]} />
              <meshStandardMaterial color={['#ef4444', '#3b82f6', '#f59e0b', '#10b981'][i]} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
            </mesh>
          ))}
        </group>
      )
    case 'plant':
      return (
        <group>
          {/* Pot */}
          <mesh position={[0, h * 0.15, 0]} castShadow>
            <cylinderGeometry args={[w * 0.4, w * 0.3, h * 0.3, 8]} />
            <meshStandardMaterial color="#78350f" transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
          </mesh>
          {/* Leaves (sphere cluster) */}
          <mesh position={[0, h * 0.6, 0]} castShadow>
            <sphereGeometry args={[w * 0.5, 8, 8]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          <mesh position={[w * 0.15, h * 0.75, w * 0.1]}>
            <sphereGeometry args={[w * 0.35, 6, 6]} />
            <meshStandardMaterial {...mat} />
          </mesh>
        </group>
      )
    case 'lamp':
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[w, w * 1.2, 0.04, 12]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          {/* Pole */}
          <mesh position={[0, h / 2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, h, 8]} />
            <meshStandardMaterial color="#9ca3af" />
          </mesh>
          {/* Bulb */}
          <mesh position={[0, h, 0]}>
            <sphereGeometry args={[w * 0.6, 12, 12]} />
            <meshStandardMaterial {...mat} emissive={color} emissiveIntensity={0.8} />
          </mesh>
          <pointLight position={[0, h, 0]} color={color} intensity={0.5} distance={3} />
        </group>
      )
    case 'bed':
      return (
        <group>
          {/* Mattress */}
          <mesh position={[0, h * 0.5, 0]} castShadow>
            <boxGeometry args={[w, h * 0.4, d]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Pillow */}
          <mesh position={[0, h * 0.75, -d * 0.35]}>
            <boxGeometry args={[w * 0.4, h * 0.2, d * 0.25]} />
            <meshStandardMaterial color="#e0e7ff" transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, h * 0.9, -d * 0.48]} castShadow>
            <boxGeometry args={[w, h * 0.8, 0.06]} />
            <meshStandardMaterial color={color} transparent={isGhost} opacity={isGhost ? 0.5 : 0.9} />
          </mesh>
          {/* Frame */}
          <mesh position={[0, h * 0.2, 0]}>
            <boxGeometry args={[w + 0.06, h * 0.35, d + 0.06]} />
            <meshStandardMaterial color="#1e1b4b" transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
          </mesh>
        </group>
      )
    case 'poster':
      return (
        <mesh position={[0, h / 2, 0]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial {...mat} emissive={color} emissiveIntensity={0.15} />
        </mesh>
      )
    default: // 'box' and 'cylinder'
      if (def.shape === 'cylinder') {
        return (
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[w / 2, w / 2, h, 16]} />
            <meshStandardMaterial {...mat} />
          </mesh>
        )
      }
      return (
        <mesh position={[0, h / 2, 0]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      )
  }
}

/* ═══════════════════════════════════════════════════
   PLACED FURNITURE (clickable for selection)
   ═══════════════════════════════════════════════════ */
function PlacedFurniture({
  item, def, selected, onSelect,
}: {
  item: PlacedItem; def: FurnitureDef; selected: boolean
  onSelect: (uid: string) => void
}) {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group
      ref={groupRef}
      position={item.position}
      rotation={[0, item.rotation, 0]}
      onClick={(e) => { e.stopPropagation(); onSelect(item.uid) }}
    >
      {selected && (
        <mesh position={[0, def.size[1] / 2, 0]}>
          <boxGeometry args={[def.size[0] + 0.1, def.size[1] + 0.1, def.size[2] + 0.1]} />
          <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
      <FurnitureMesh def={def} color={item.color} />
    </group>
  )
}

/* ═══════════════════════════════════════════════════
   GHOST PREVIEW (follows mouse on the floor)
   ═══════════════════════════════════════════════════ */
function GhostPreview({
  def, rotation, onPlace, roomW, roomD,
}: {
  def: FurnitureDef; rotation: number
  onPlace: (pos: [number, number, number]) => void
  roomW: number; roomD: number
}) {
  const meshRef = useRef<THREE.Group>(null)
  const { raycaster, camera, gl } = useThree()
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])

  useFrame(({ pointer }) => {
    raycaster.setFromCamera(pointer, camera)
    const intersect = new THREE.Vector3()
    raycaster.ray.intersectPlane(floorPlane, intersect)
    if (meshRef.current && intersect) {
      // Snap to grid cell centers
      const halfW = roomW / 2
      const halfD = roomD / 2
      const snappedX = Math.floor(intersect.x) + 0.5
      const snappedZ = Math.floor(intersect.z) + 0.5
      meshRef.current.position.x = Math.max(-halfW + 0.5, Math.min(halfW - 0.5, snappedX))
      meshRef.current.position.z = Math.max(-halfD + 0.5, Math.min(halfD - 0.5, snappedZ))
      meshRef.current.position.y = 0
    }
  })

  return (
    <group
      ref={meshRef}
      rotation={[0, rotation, 0]}
      onClick={(e) => {
        e.stopPropagation()
        if (meshRef.current) {
          const p = meshRef.current.position
          onPlace([p.x, 0, p.z])
        }
      }}
    >
      <FurnitureMesh def={def} color={def.color} isGhost />
    </group>
  )
}

/* ═══════════════════════════════════════════════════
   ROOM WALLS + FLOOR
   ═══════════════════════════════════════════════════ */
const DEFAULT_ROOM_W = 8
const DEFAULT_ROOM_D = 6

function Room({ roomW, roomD }: { roomW: number; roomD: number }) {
  const WALL_H = 3
  const wallColor = '#1a1a2e'

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#1e1e2e" roughness={0.7} />
      </mesh>

      {/* Grid lines */}
      <gridHelper args={[Math.max(roomW, roomD), Math.max(roomW, roomD), '#4f46e550', '#4f46e530']} position={[0, 0.01, 0]} />

      {/* ─── WALLS ─── */}
      {/* Back wall (with window hole) */}
      {/* Left section of back wall */}
      <mesh position={[-(roomW / 2 - roomW * 0.15), WALL_H / 2, -roomD / 2]}>
        <boxGeometry args={[roomW * 0.3, WALL_H, 0.08]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      {/* Right section of back wall */}
      <mesh position={[(roomW / 2 - roomW * 0.15), WALL_H / 2, -roomD / 2]}>
        <boxGeometry args={[roomW * 0.3, WALL_H, 0.08]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      {/* Top section above window */}
      <mesh position={[0, WALL_H - 0.3, -roomD / 2]}>
        <boxGeometry args={[roomW * 0.4, 0.6, 0.08]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      {/* Bottom section below window */}
      <mesh position={[0, 0.4, -roomD / 2]}>
        <boxGeometry args={[roomW * 0.4, 0.8, 0.08]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      {/* Window frame glow */}
      <mesh position={[0, WALL_H / 2, -roomD / 2 + 0.05]}>
        <boxGeometry args={[roomW * 0.4 + 0.06, WALL_H * 0.5 + 0.06, 0.02]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>

      {/* Left wall (solid) */}
      <mesh position={[-roomW / 2, WALL_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[roomD, WALL_H, 0.08]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Right wall (solid) */}
      <mesh position={[roomW / 2, WALL_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[roomD, WALL_H, 0.08]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Front wall (lower half only — so camera can see in) */}
      <mesh position={[0, 0.5, roomD / 2]}>
        <boxGeometry args={[roomW, 1, 0.08]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* ─── NEON TRIM at wall base ─── */}
      {/* Left & Right */}
      <mesh position={[-roomW / 2, 0.02, 0]}>
        <boxGeometry args={[0.04, 0.04, roomD]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[roomW / 2, 0.02, 0]}>
        <boxGeometry args={[0.04, 0.04, roomD]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.8} />
      </mesh>
      {/* Front & Back */}
      <mesh position={[0, 0.02, -roomD / 2]}>
        <boxGeometry args={[roomW, 0.04, 0.04]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.02, roomD / 2]}>
        <boxGeometry args={[roomW, 0.04, 0.04]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════
   HANOI CITY GENERATOR — Procedural Grid System
   ═══════════════════════════════════════════════════ */

// Seeded pseudo-random for stable geometry across renders
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function HanoiCity({ floor, baseType, timeOfDay, weather }: { floor: number; baseType: string, timeOfDay: TimeOfDay, weather: WeatherType }) {
  // Bỏ điều kiện return null để nhà nào cũng có background
  // Colors based on Time of Day and Weather
  const skyColor = useMemo(() => {
    if (weather === 'rain' || weather === 'snow') {
      return timeOfDay === 'night' ? '#0f172a' : '#475569' // Overcast grey
    }
    if (weather === 'drizzle') {
      return timeOfDay === 'night' ? '#141c2f' : '#64748b' // Light overcast
    }
    switch(timeOfDay) {
      case 'morning': return '#87CEEB'
      case 'noon': return '#4169E1'
      case 'sunset': return '#FF7F50'
      case 'night': return floor <= 7 ? '#1e1b4b' : '#070b1a'
    }
  }, [timeOfDay, floor, weather])

  const horizonColor = useMemo(() => {
    if (weather === 'rain' || weather === 'snow') {
      return timeOfDay === 'night' ? '#1e293b' : '#64748b' // Overcast grey
    }
    if (weather === 'drizzle') {
      return timeOfDay === 'night' ? '#273245' : '#8597ad' // Light overcast
    }
    switch(timeOfDay) {
      case 'morning': return '#B0E0E6'
      case 'noon': return '#87CEFA'
      case 'sunset': return '#FF4500'
      case 'night': return floor <= 7 ? '#4338ca' : '#312e81'
    }
  }, [timeOfDay, floor, weather])

  const fogColor = horizonColor

  const buildingColor = useMemo(() => {
    if (weather === 'rain' || weather === 'snow') {
      return timeOfDay === 'night' ? '#0f172a' : '#64748b' 
    }
    switch(timeOfDay) {
      case 'morning': return '#ffffff' 
      case 'noon': return '#ffffff'    
      case 'sunset': return '#fed7aa'  // Hắt sáng cam
      case 'night': return '#1e1b4b'   
    }
  }, [timeOfDay, weather])

  // ─── HANOI PROCEDURAL GENERATOR ───
  const { buildings, sidewalks, trees, windows } = useMemo(() => {
    const gridSize = 25 // 50x50 tiles
    const tileSize = 3.5 // meters
    const bArr = []
    const sArr = []
    const tArr = []
    const wArr = []
    
    // Bảng màu nhà ống đặc trưng: Vàng kem, Xanh lơ nhạt, Trắng xám, Hồng phấn
    const palettes = ['#fef3c7', '#e0f2fe', '#f3f4f6', '#fce7f3', '#d1d5db', '#ffedd5']

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        // Đường chính cắt ngang dọc (Shifted để Tâm 0,0 nằm trọn trong Lô Đất)
        const isRoadX = Math.abs(x - 4) % 8 <= 1 // Đường rộng 2 tile
        const isRoadZ = Math.abs(z - 5) % 10 <= 1
        
        const px = x * tileSize
        const pz = z * tileSize
        
        if (!isRoadX && !isRoadZ) {
          // Lô đất (Block)
          
          // Trống bán kính 1 tile quanh tâm để nhường chỗ cho Phòng của User (Không xây nhà, cây, vỉa hè)
          if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue
          
          sArr.push({ x: px, y: 0.1, z: pz }) // Vỉa hè
          
          // Không xây nhà quá sát phòng user để đỡ che view
          if (Math.abs(x) <= 2 && Math.abs(z) <= 2) continue

          const rand = seededRandom(x * 713 + z * 927 + floor)
          
          if (rand < 0.15) {
            // Cây xanh (Cây Sấu, Xà Cừ ven đường)
            tArr.push({ x: px, y: 2, z: pz, scale: 0.6 + rand * 0.8 })
          } else {
            // Nhà Ống (Tube House)
            const bw = tileSize * 0.9
            const bd = tileSize * 0.95
            
            // Xoay nhà hướng ra đường
            let actualW = bw
            let actualD = bd
            if (Math.abs(x) % 8 === 2 || Math.abs(x) % 8 === 7) {
              actualW = bd
              actualD = bw
            }
            
            // Cao tầng (3 đến 7 tầng)
            const bh = 9 + Math.floor(rand * 5) * 3 
            
            // Chọn màu sơn nhà
            const color = palettes[Math.floor(rand * palettes.length)]
            
            bArr.push({ x: px, y: bh/2 + 0.2, z: pz, bw: actualW, bh, bd: actualD, color })
            
            // Cửa sổ
            if (rand > 0.3 && timeOfDay === 'night' || timeOfDay === 'sunset' || weather !== 'clear') {
              wArr.push({
                x: px + (rand - 0.5) * actualW * 0.8,
                y: bh * (0.3 + rand * 0.5),
                z: pz + (rand - 0.5) * actualD * 0.8,
                opacity: 0.4 + rand * 0.6
              })
            }
          }
        }
      }
    }
    return { buildings: bArr, sidewalks: sArr, trees: tArr, windows: wArr }
  }, [floor, timeOfDay, weather])

  // Stars (high floors only, mostly at night, none if cloudy)
  const stars = useMemo(() => {
    if (timeOfDay === 'noon' || timeOfDay === 'morning' || weather !== 'clear') return []
    const arr = []
    const count = 60
    for (let i = 0; i < count; i++) {
      const angle = seededRandom(i * 31) * Math.PI * 2
      const elev = 8 + seededRandom(i * 37) * 15
      const r2 = 30 + seededRandom(i * 41) * 10
      arr.push({
        x: Math.cos(angle) * r2,
        y: elev,
        z: Math.sin(angle) * r2,
        size: 0.05 + seededRandom(i * 43) * 0.05,
      })
    }
    return arr
  }, [timeOfDay, weather])

  // Add Fog directly into the group context
  useFrame(({ scene }) => {
    const fogDensity = weather === 'rain' ? 30 : weather === 'snow' ? 25 : weather === 'drizzle' ? 40 : 50
    if (!scene.fog) {
      scene.fog = new THREE.Fog(fogColor, 10, fogDensity)
    } else {
      ;(scene.fog as THREE.Fog).color.set(fogColor)
      ;(scene.fog as THREE.Fog).far = THREE.MathUtils.lerp((scene.fog as THREE.Fog).far, fogDensity, 0.05)
    }
    scene.background = new THREE.Color(skyColor)
  })

  return (
    <group>
      {/* 360° Sky cylinder */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[30, 30, 25, 32, 1, true]} />
        <meshBasicMaterial color={skyColor} side={THREE.BackSide} />
      </mesh>

      {/* Horizon glow ring */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[29, 29, 4, 32, 1, true]} />
        <meshBasicMaterial color={horizonColor} side={THREE.BackSide} transparent opacity={0.25} />
      </mesh>

      {/* Ground plane (Asphalt Road) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={weather === 'rain' || weather === 'drizzle' ? '#111116' : '#1a1a24'} roughness={weather === 'rain' ? 0.1 : 0.8} />
      </mesh>

      {/* Sidewalks (Instanced) */}
      <InstancedSidewalks data={sidewalks} color={buildingColor} />

      {/* Tube Houses (Instanced) */}
      <InstancedBuildings data={buildings} globalColor={buildingColor} />

      {/* Trees (Instanced) */}
      <InstancedTrees data={trees} timeOfDay={timeOfDay} weather={weather} />

      {/* Window lights (Instanced) */}
      <InstancedWindows data={windows} />

      {/* Stars */}
      <group>
        {stars.map((s, i) => (
          <mesh key={`s-${i}`} position={[s.x, s.y, s.z]}>
            <sphereGeometry args={[s.size, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════
   INSTANCED MESH COMPONENTS FOR HANOI CITY
   ═══════════════════════════════════════════════════ */
function InstancedSidewalks({ data, color }: { data: any[], color: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  useEffect(() => {
    if (!meshRef.current) return
    data.forEach((s, i) => {
      dummy.position.set(s.x, s.y, s.z)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [data])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]} receiveShadow>
      <boxGeometry args={[3.3, 0.2, 3.3]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </instancedMesh>
  )
}

function InstancedBuildings({ data, globalColor }: { data: any[], globalColor: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorObj = useMemo(() => new THREE.Color(), [])
  
  useEffect(() => {
    if (!meshRef.current) return
    data.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z)
      dummy.scale.set(b.bw, b.bh, b.bd)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
      
      colorObj.set(b.color)
      meshRef.current!.setColorAt(i, colorObj)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [data])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={globalColor} roughness={0.8} />
    </instancedMesh>
  )
}

function InstancedTrees({ data, timeOfDay, weather }: { data: any[], timeOfDay: string, weather: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  useEffect(() => {
    if (!meshRef.current) return
    data.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z)
      dummy.scale.set(t.scale, t.scale * 1.5, t.scale)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [data])

  // Cây tối đi khi trời tối
  const treeColor = timeOfDay === 'night' || weather !== 'clear' ? '#166534' : '#22c55e'

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]} castShadow receiveShadow>
      <coneGeometry args={[1, 2, 6]} />
      <meshStandardMaterial color={treeColor} roughness={0.9} />
    </instancedMesh>
  )
}

function InstancedWindows({ data }: { data: any[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  useEffect(() => {
    if (!meshRef.current) return
    data.forEach((w, i) => {
      dummy.position.set(w.x, w.y, w.z)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [data])

  if (data.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
    </instancedMesh>
  )
}
function ShopPanel({
  coins, onBuy, onClose,
}: {
  coins: number
  onBuy: (def: FurnitureDef) => void
  onClose: () => void
}) {
  const [activeCategory, setActiveCategory] = useState('All')
  const filtered = activeCategory === 'All'
    ? FURNITURE_CATALOG
    : FURNITURE_CATALOG.filter(f => f.category === activeCategory)

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[340px] bg-slate-900/95 backdrop-blur-xl border-l border-indigo-500/30 z-30 flex flex-col overflow-hidden animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-indigo-400" />
          <h3 className="font-bold text-white text-lg">Furniture Shop</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-1 p-3 border-b border-slate-700/50 overflow-x-auto scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
        {filtered.map(def => (
          <button
            key={def.id}
            onClick={() => onBuy(def)}
            disabled={coins < def.price}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              coins >= def.price
                ? 'bg-slate-800/80 border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-700/80 cursor-pointer'
                : 'bg-slate-800/40 border-slate-700/30 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="text-2xl">{def.icon}</span>
            <span className="text-xs font-semibold text-white text-center leading-tight">{def.name}</span>
            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Coins size={12} /> {def.price}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ITEM TOOLBAR (when a placed item is selected)
   ═══════════════════════════════════════════════════ */
function ItemToolbar({
  onRotate, onDelete, onDeselect,
}: {
  onRotate: () => void; onDelete: () => void; onDeselect: () => void
}) {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl px-4 py-2 shadow-2xl">
      <button onClick={onRotate} className="p-2 hover:bg-indigo-600/30 rounded-lg transition-colors" title="Rotate">
        <RotateCw size={18} className="text-indigo-400" />
      </button>
      <button onClick={onDelete} className="p-2 hover:bg-red-600/30 rounded-lg transition-colors" title="Delete (refund 50%)">
        <Trash2 size={18} className="text-red-400" />
      </button>
      <button onClick={onDeselect} className="p-2 hover:bg-slate-600/30 rounded-lg transition-colors" title="Deselect">
        <X size={18} className="text-slate-400" />
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   WEATHER SYSTEM (Instanced Particles)
   ═══════════════════════════════════════════════════ */
function WeatherEffects({ weather }: { weather: WeatherType }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  const count = weather === 'rain' ? 8000 : weather === 'drizzle' ? 2000 : weather === 'snow' ? 4000 : 0
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  // Create initial particle positions
  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < 8000; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 30,
        z: (Math.random() - 0.5) * 40,
        speed: weather === 'rain' ? 0.3 + Math.random() * 0.2 : weather === 'drizzle' ? 0.15 + Math.random() * 0.1 : 0.02 + Math.random() * 0.03,
        drift: weather === 'snow' ? (Math.random() - 0.5) * 0.02 : weather === 'drizzle' ? (Math.random() - 0.5) * 0.005 : 0
      })
    }
    return arr
  }, [weather])

  useFrame(() => {
    if (!meshRef.current || count === 0) return
    particles.forEach((p, i) => {
      if (i >= count) return
      p.y -= p.speed
      p.x += p.drift
      if (p.y < -2) {
        p.y = 30 // Reset to top
        p.x = (Math.random() - 0.5) * 40
      }
      dummy.position.set(p.x, p.y, p.z)
      
      // Rotate rain drops to look like falling streaks
      if (weather === 'rain') dummy.scale.set(1, 1, 1)
      else if (weather === 'drizzle') dummy.scale.set(0.5, 0.7, 0.5) // Nhỏ hơn, mảnh hơn
      else dummy.scale.set(2, 2, 2)
      
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (weather === 'clear') return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[0,0,0]}>
      {weather === 'rain' || weather === 'drizzle' ? (
        <boxGeometry args={[0.015, 0.4, 0.015]} />
      ) : (
        <sphereGeometry args={[0.03, 4, 4]} />
      )}
      <meshBasicMaterial 
        color={weather === 'rain' || weather === 'drizzle' ? '#87CEFA' : '#ffffff'} 
        transparent 
        opacity={weather === 'rain' ? 0.4 : weather === 'drizzle' ? 0.25 : 0.8} 
        depthWrite={false}
      />
    </instancedMesh>
  )
}

/* ═══════════════════════════════════════════════════
   CAMERA RIG FOR ADMIN VIEW
   ═══════════════════════════════════════════════════ */
function CameraRig({ adminView }: { adminView: boolean }) {
  const { camera } = useThree()
  
  useFrame(() => {
    if (adminView) {
      // Fly up to bird-eye view
      camera.position.lerp(new THREE.Vector3(0, 30, 20), 0.05)
    } else {
      // Normal room view constraints are handled by OrbitControls, 
      // but we smoothly return to normal altitude if we were high up
      if (camera.position.y > 15) {
        camera.position.lerp(new THREE.Vector3(8, 8, 8), 0.05)
      }
    }
  })
  return null
}

/* ═══════════════════════════════════════════════════
   MAIN NEXUS HUB COMPONENT
   ═══════════════════════════════════════════════════ */
export default function NexusHub() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [coins, setCoins] = useState(1000)
  const [roomW, setRoomW] = useState(DEFAULT_ROOM_W)
  const [roomD, setRoomD] = useState(DEFAULT_ROOM_D)
  const [baseType, setBaseType] = useState('house')
  const [baseFloor, setBaseFloor] = useState(0)
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([])
  const [shopOpen, setShopOpen] = useState(false)
  const [placingDef, setPlacingDef] = useState<FurnitureDef | null>(null)
  const [ghostRotation, setGhostRotation] = useState(0)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('noon')
  const [weather, setWeather] = useState<WeatherType>('clear')
  const [adminView, setAdminView] = useState(false)

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        const meta = data.user.user_metadata
        setUserData(meta)
        setCoins(meta.coins ?? 1000)
        setRoomW(meta.base_room_w ?? DEFAULT_ROOM_W)
        setRoomD(meta.base_room_d ?? DEFAULT_ROOM_D)
        setBaseType(meta.base_type ?? 'house')
        setBaseFloor(meta.base_floor ?? 0)
        setPlacedItems(meta.base_data ?? [])
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  // Save base data
  const saveBase = useCallback(async (newCoins: number, newItems: PlacedItem[]) => {
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: { coins: newCoins, base_data: newItems }
    })
  }, [])

  // Buy handler
  const handleBuy = useCallback((def: FurnitureDef) => {
    if (coins < def.price) return
    setPlacingDef(def)
    setGhostRotation(0)
    setShopOpen(false)
    setSelectedItem(null)
  }, [coins])

  // Place handler
  const handlePlace = useCallback((pos: [number, number, number]) => {
    if (!placingDef) return
    const newItem: PlacedItem = {
      uid: `${placingDef.id}_${Date.now()}`,
      defId: placingDef.id,
      position: pos,
      rotation: ghostRotation,
      color: placingDef.color,
    }
    const newItems = [...placedItems, newItem]
    const newCoins = coins - placingDef.price
    setPlacedItems(newItems)
    setCoins(newCoins)
    setPlacingDef(null)
    saveBase(newCoins, newItems)
  }, [placingDef, ghostRotation, placedItems, coins, saveBase])

  // Rotate selected item
  const handleRotateSelected = useCallback(() => {
    if (!selectedItem) return
    setPlacedItems(prev => {
      const updated = prev.map(item =>
        item.uid === selectedItem ? { ...item, rotation: item.rotation + Math.PI / 4 } : item
      )
      saveBase(coins, updated)
      return updated
    })
  }, [selectedItem, coins, saveBase])

  // Delete selected item (refund 50%)
  const handleDeleteSelected = useCallback(() => {
    if (!selectedItem) return
    const item = placedItems.find(i => i.uid === selectedItem)
    if (!item) return
    const def = FURNITURE_CATALOG.find(f => f.id === item.defId)
    const refund = def ? Math.floor(def.price * 0.5) : 0
    const newItems = placedItems.filter(i => i.uid !== selectedItem)
    const newCoins = coins + refund
    setPlacedItems(newItems)
    setCoins(newCoins)
    setSelectedItem(null)
    saveBase(newCoins, newItems)
  }, [selectedItem, placedItems, coins, saveBase])

  // Keyboard shortcut for rotation while placing
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (placingDef) {
          setGhostRotation(prev => prev + Math.PI / 4)
        }
      }
      if (e.key === 'Escape') {
        setPlacingDef(null)
        setSelectedItem(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [placingDef])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0f101a]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-[#0f101a] overflow-hidden select-none">
      {/* ─── Top HUD ─── */}
      <div className="absolute top-4 right-4 z-20 flex gap-3 pointer-events-auto">
        {/* Floor badge for apartments */}
        {baseType === 'studio' && baseFloor > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 px-4 py-2 rounded-full text-indigo-300 font-bold shadow-lg">
            🏢 Tầng {baseFloor}
          </div>
        )}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-amber-500/30 px-4 py-2 rounded-full text-amber-400 font-bold shadow-lg shadow-amber-500/10">
          <Coins size={18} /> {coins}
        </div>
        <button
          onClick={() => { setShopOpen(!shopOpen); setPlacingDef(null); setSelectedItem(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all ${
            shopOpen
              ? 'bg-indigo-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          <ShoppingCart size={18} />
          Shop
        </button>
      </div>

      {/* ─── Bottom HUD (Time Controls & Admin) ─── */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-3 pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full p-1 flex gap-1 shadow-lg">
          <button onClick={() => setWeather('clear')} className={`p-2 rounded-full transition-colors ${weather === 'clear' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Clear"><Sun size={18} /></button>
          <button onClick={() => setWeather('drizzle')} className={`p-2 rounded-full transition-colors ${weather === 'drizzle' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Drizzle"><CloudDrizzle size={18} /></button>
          <button onClick={() => setWeather('rain')} className={`p-2 rounded-full transition-colors ${weather === 'rain' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Heavy Rain"><CloudRain size={18} /></button>
          <button onClick={() => setWeather('snow')} className={`p-2 rounded-full transition-colors ${weather === 'snow' ? 'bg-blue-300 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Snow"><Snowflake size={18} /></button>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full p-1 flex gap-1 shadow-lg">
          <button onClick={() => setTimeOfDay('morning')} className={`p-2 rounded-full transition-colors ${timeOfDay === 'morning' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Morning"><Sunrise size={18} /></button>
          <button onClick={() => setTimeOfDay('noon')} className={`p-2 rounded-full transition-colors ${timeOfDay === 'noon' ? 'bg-yellow-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Noon"><Sun size={18} /></button>
          <button onClick={() => setTimeOfDay('sunset')} className={`p-2 rounded-full transition-colors ${timeOfDay === 'sunset' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Sunset"><Sunset size={18} /></button>
          <button onClick={() => setTimeOfDay('night')} className={`p-2 rounded-full transition-colors ${timeOfDay === 'night' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Night"><Moon size={18} /></button>
        </div>
        
        <button
          onClick={() => setAdminView(!adminView)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all ${
            adminView
              ? 'bg-emerald-500 text-white border-2 border-white'
              : 'bg-emerald-600/80 hover:bg-emerald-500 text-white backdrop-blur-md'
          }`}
        >
          <Eye size={18} />
          {adminView ? 'Exit Admin View' : 'Admin View'}
        </button>
      </div>

      {/* ─── Placing Instructions ─── */}
      {placingDef && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-indigo-600/90 backdrop-blur-md px-6 py-2 rounded-full text-white font-bold text-sm flex items-center gap-3 shadow-lg">
          <Move size={16} />
          Click to place {placingDef.name} • Press R to rotate • ESC to cancel
        </div>
      )}

      {/* ─── Selected Item Toolbar ─── */}
      {selectedItem && !placingDef && (
        <ItemToolbar
          onRotate={handleRotateSelected}
          onDelete={handleDeleteSelected}
          onDeselect={() => setSelectedItem(null)}
        />
      )}

      {/* ─── Shop Panel ─── */}
      {shopOpen && (
        <ShopPanel coins={coins} onBuy={handleBuy} onClose={() => setShopOpen(false)} />
      )}

      {/* ─── 3D Canvas ─── */}
      <div className="w-full h-full">
        <Canvas shadows camera={{ position: [8, 8, 8], fov: 35 }}>
          <CameraRig adminView={adminView} />
          <WeatherEffects weather={weather} />
          
          <ambientLight intensity={timeOfDay === 'night' ? 0.3 : weather !== 'clear' ? 0.4 : timeOfDay === 'sunset' ? 0.6 : 0.8} />
          
          <directionalLight
            position={timeOfDay === 'sunset' ? [-10, 5, -10] : [5, 15, 5]}
            intensity={timeOfDay === 'night' ? 0.2 : weather !== 'clear' ? 0.3 : timeOfDay === 'noon' ? 1.5 : 1.0}
            color={timeOfDay === 'sunset' && weather === 'clear' ? '#FF8C00' : timeOfDay === 'night' ? '#4B0082' : '#ffffff'}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          
          {timeOfDay === 'night' && (
            <pointLight position={[-3, 4, -3]} intensity={0.5} color="#818cf8" distance={10} />
          )}

          {weather === 'clear' && (
            <Environment preset={timeOfDay === 'night' ? 'night' : timeOfDay === 'sunset' ? 'sunset' : 'city'} />
          )}

          <HanoiCity floor={baseFloor} baseType={baseType} timeOfDay={timeOfDay} weather={weather} />
          <Room roomW={roomW} roomD={roomD} />

          {/* Placed furniture */}
          {placedItems.map(item => {
            const def = FURNITURE_CATALOG.find(f => f.id === item.defId)
            if (!def) return null
            return (
              <PlacedFurniture
                key={item.uid}
                item={item}
                def={def}
                selected={selectedItem === item.uid}
                onSelect={setSelectedItem}
              />
            )
          })}

          {/* Ghost preview */}
          {placingDef && (
            <GhostPreview def={placingDef} rotation={ghostRotation} onPlace={handlePlace} roomW={roomW} roomD={roomD} />
          )}

          {/* Character Avatar */}
          {userData?.avatar_data && (
            <group position={[0, 0.55, 0]}>
              <Suspense fallback={null}>
                <ChibiModel {...userData.avatar_data} />
              </Suspense>
            </group>
          )}

          <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={12} blur={2.5} far={3} />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={4}
            maxDistance={adminView ? 50 : 18}
            maxPolarAngle={adminView ? Math.PI / 2 : Math.PI / 2.3}
            minPolarAngle={adminView ? 0 : Math.PI / 6}
            target={adminView ? [0, 0, 0] : [0, 0, 0]}
          />
        </Canvas>
      </div>
    </div>
  )
}
