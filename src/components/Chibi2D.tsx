'use client'
import React, { useId, useMemo } from 'react'

interface Chibi2DProps {
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
  className?: string
}

const darken = (hex: string, amt: number) => {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const n = parseInt(c, 16)
  const r = Math.max(0, Math.min(255, (n >> 16) - Math.round(255 * amt)))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xFF) - Math.round(255 * amt)))
  const b = Math.max(0, Math.min(255, (n & 0xFF) - Math.round(255 * amt)))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
const lighten = (hex: string, amt: number) => darken(hex, -amt)

export default function Chibi2D({
  skinColor = '#ffdbac',
  hairColor = '#3b3b3b',
  clothesColor = '#ef4444',
  eyesId = 'eyes_normal',
  eyesColor = '#1a1a1a',
  mouthId = 'mouth_smile',
  hairId = 'hair_short',
  accessoryId = 'acc_none',
  accessoryColor = '#a78bfa',
  decalsId = 'decal_none',
  decalsColor = '#ef4444',
  className = '',
  ...rest
}: Chibi2DProps) {
  const rawId = useId()
  const uid = rawId.replace(/:/g, '')

  const clothesDark = useMemo(() => darken(clothesColor, 0.15), [clothesColor])
  const hairDark = useMemo(() => darken(hairColor, 0.15), [hairColor])
  const hairLight = useMemo(() => lighten(hairColor, 0.12), [hairColor])

  // Capsule dimensions (viewBox 200x340)
  const W = 140       // capsule width
  const R = W / 2      // corner radius = perfect semicircle
  const H = 280        // capsule height
  const CX = 100       // center X
  const TOP = 30       // top Y
  const SPLIT = 175    // where skin meets clothes (Y)

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes cf-${uid} {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes cb-${uid} {
          0%, 92%, 94%, 100% { transform: scaleY(1); }
          93% { transform: scaleY(0.05); }
        }
        .cf-${uid} { animation: cf-${uid} 3s ease-in-out infinite; }
        .cb-${uid} { animation: cb-${uid} 4s ease-in-out infinite; transform-origin: center 155px; }
      `}</style>

      <svg viewBox="0 0 200 340" className={`cf-${uid} w-full h-full max-w-[280px] max-h-[380px]`}
           style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))' }}>
        <defs>
          <clipPath id={`cap-${uid}`}>
            <rect x={CX - R} y={TOP} width={W} height={H} rx={R} ry={R} />
          </clipPath>
        </defs>

        {/* ── CAPSULE BODY ── */}
        <g clipPath={`url(#cap-${uid})`}>
          {/* Top half = skin */}
          <rect x={CX - R} y={TOP} width={W} height={H} fill={skinColor} />
          {/* Bottom half = clothes */}
          <rect x={CX - R} y={SPLIT} width={W} height={H - (SPLIT - TOP)} fill={clothesColor} />
          {/* Clothes dark bottom gradient */}
          <rect x={CX - R} y={SPLIT + 60} width={W} height={H - (SPLIT - TOP) - 60} fill={clothesDark} opacity="0.4" />
          {/* Highlight stripe on clothes */}
          <rect x={CX - R + 12} y={SPLIT + 5} width={8} height={80} rx={4} fill="#fff" opacity="0.15" />

          {/* ── HAIR (inside capsule clip) ── */}
          {hairId !== 'hair_bald' && (<>
            {/* Base hair cap */}
            <ellipse cx={CX} cy={TOP + 35} rx={R + 2} ry={42} fill={hairColor} />

            {/* Bangs */}
            {hairId === 'hair_short' && (<>
              <path d={`M ${CX - 55} ${TOP + 55} C ${CX - 40} ${TOP + 25}, ${CX - 10} ${TOP + 10}, ${CX} ${TOP + 8} C ${CX + 10} ${TOP + 10}, ${CX + 40} ${TOP + 25}, ${CX + 55} ${TOP + 55} L ${CX + 45} ${TOP + 70} C ${CX + 30} ${TOP + 50}, ${CX + 10} ${TOP + 45}, ${CX} ${TOP + 48} C ${CX - 10} ${TOP + 45}, ${CX - 30} ${TOP + 50}, ${CX - 45} ${TOP + 70} Z`} fill={hairColor} />
            </>)}
            {(hairId === 'hair_long' || hairId === 'hair_ponytail' || hairId === 'hair_samurai') && (<>
              <path d={`M ${CX - 58} ${TOP + 60} C ${CX - 45} ${TOP + 25}, ${CX - 15} ${TOP + 8}, ${CX} ${TOP + 5} C ${CX + 15} ${TOP + 8}, ${CX + 45} ${TOP + 25}, ${CX + 58} ${TOP + 60} L ${CX + 48} ${TOP + 80} C ${CX + 30} ${TOP + 55}, ${CX} ${TOP + 50}, ${CX - 30} ${TOP + 55}, ${CX - 48} ${TOP + 80} Z`} fill={hairColor} />
              {/* Side strands */}
              <rect x={CX - R - 2} y={TOP + 50} width={12} height={120} rx={6} fill={hairColor} />
              <rect x={CX + R - 10} y={TOP + 50} width={12} height={120} rx={6} fill={hairColor} />
            </>)}
            {hairId === 'hair_twintails' && (<>
              <path d={`M ${CX - 55} ${TOP + 55} C ${CX - 40} ${TOP + 20}, ${CX} ${TOP + 5}, ${CX + 40} ${TOP + 20} C ${CX + 55} ${TOP + 55}, ${CX + 48} ${TOP + 75}, ${CX - 48} ${TOP + 75} Z`} fill={hairColor} />
              {/* Twin tails */}
              <ellipse cx={CX - 58} cy={SPLIT - 15} rx={14} ry={50} fill={hairColor} />
              <ellipse cx={CX + 58} cy={SPLIT - 15} rx={14} ry={50} fill={hairColor} />
            </>)}
            {hairId === 'hair_curly' && (<>
              <circle cx={CX - 25} cy={TOP + 30} r={22} fill={hairColor} />
              <circle cx={CX + 5} cy={TOP + 20} r={25} fill={hairColor} />
              <circle cx={CX + 30} cy={TOP + 28} r={20} fill={hairColor} />
              <circle cx={CX - 40} cy={TOP + 50} r={18} fill={hairColor} />
              <circle cx={CX + 42} cy={TOP + 48} r={17} fill={hairColor} />
            </>)}
            {hairId === 'hair_mohawk' && (
              <ellipse cx={CX} cy={TOP + 5} rx={16} ry={30} fill={hairColor} />
            )}
            {hairId === 'hair_messy' && (<>
              <path d={`M ${CX - 55} ${TOP + 55} C ${CX - 40} ${TOP + 15}, ${CX} ${TOP}, ${CX + 40} ${TOP + 15} C ${CX + 55} ${TOP + 55}, ${CX + 50} ${TOP + 75}, ${CX - 50} ${TOP + 75} Z`} fill={hairColor} />
              <path d={`M ${CX - 20} ${TOP + 5} L ${CX - 30} ${TOP - 15} L ${CX - 10} ${TOP + 2}`} fill={hairColor} />
              <path d={`M ${CX + 10} ${TOP} L ${CX + 15} ${TOP - 18} L ${CX + 25} ${TOP + 5}`} fill={hairLight} />
              <path d={`M ${CX + 35} ${TOP + 15} L ${CX + 48} ${TOP - 5} L ${CX + 42} ${TOP + 18}`} fill={hairColor} />
            </>)}

            {/* Hair shine */}
            <ellipse cx={CX + 8} cy={TOP + 25} rx={12} ry={6} fill="#fff" opacity="0.12" transform="rotate(-15)" />
          </>)}
        </g>

        {/* Capsule outline */}
        <rect x={CX - R} y={TOP} width={W} height={H} rx={R} ry={R}
              fill="none" stroke="#2d2d3d" strokeWidth="3" />

        {/* ── FACE ── */}
        {/* Eyes */}
        <g className={`cb-${uid}`}>
          {(eyesId === 'eyes_normal' || eyesId === 'eyes_big') && (<>
            <circle cx={CX - 22} cy={148} r={eyesId === 'eyes_big' ? 14 : 11} fill="#111" />
            <circle cx={CX - 22} cy={148} r={eyesId === 'eyes_big' ? 13 : 10} fill={eyesColor} />
            <circle cx={CX - 26} cy={143} r={eyesId === 'eyes_big' ? 5 : 4} fill="#fff" />
            <circle cx={CX - 18} cy={152} r={2} fill="#fff" opacity="0.6" />
            <circle cx={CX + 22} cy={148} r={eyesId === 'eyes_big' ? 14 : 11} fill="#111" />
            <circle cx={CX + 22} cy={148} r={eyesId === 'eyes_big' ? 13 : 10} fill={eyesColor} />
            <circle cx={CX + 18} cy={143} r={eyesId === 'eyes_big' ? 5 : 4} fill="#fff" />
            <circle cx={CX + 26} cy={152} r={2} fill="#fff" opacity="0.6" />
          </>)}
          {eyesId === 'eyes_closed' && (<>
            <path d={`M ${CX - 33} 148 Q ${CX - 22} 157 ${CX - 11} 148`} fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
            <path d={`M ${CX + 11} 148 Q ${CX + 22} 157 ${CX + 33} 148`} fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
          </>)}
          {eyesId === 'eyes_angry' && (<>
            <line x1={CX - 32} y1={142} x2={CX - 12} y2={148} stroke="#111" strokeWidth="3" strokeLinecap="round" />
            <circle cx={CX - 22} cy={152} r={8} fill={eyesColor} />
            <circle cx={CX - 24} cy={150} r={3} fill="#fff" />
            <line x1={CX + 12} y1={148} x2={CX + 32} y2={142} stroke="#111" strokeWidth="3" strokeLinecap="round" />
            <circle cx={CX + 22} cy={152} r={8} fill={eyesColor} />
            <circle cx={CX + 20} cy={150} r={3} fill="#fff" />
          </>)}
          {eyesId === 'eyes_star' && (<>
            <polygon points={`${CX-22},135 ${CX-19},144 ${CX-10},144 ${CX-17},149 ${CX-15},158 ${CX-22},153 ${CX-29},158 ${CX-27},149 ${CX-34},144 ${CX-25},144`} fill={eyesColor} />
            <polygon points={`${CX+22},135 ${CX+25},144 ${CX+34},144 ${CX+27},149 ${CX+29},158 ${CX+22},153 ${CX+15},158 ${CX+17},149 ${CX+10},144 ${CX+19},144`} fill={eyesColor} />
          </>)}
        </g>

        {/* Blush */}
        <ellipse cx={CX - 32} cy={163} rx={10} ry={6} fill="#f9a8d4" opacity="0.5" />
        <line x1={CX - 36} y1={162} x2={CX - 33} y2={164} stroke="#e88" strokeWidth="1.5" opacity="0.6" />
        <line x1={CX - 32} y1={161} x2={CX - 29} y2={163} stroke="#e88" strokeWidth="1.5" opacity="0.6" />
        <ellipse cx={CX + 32} cy={163} rx={10} ry={6} fill="#f9a8d4" opacity="0.5" />
        <line x1={CX + 29} y1={162} x2={CX + 32} y2={164} stroke="#e88" strokeWidth="1.5" opacity="0.6" />
        <line x1={CX + 33} y1={161} x2={CX + 36} y2={163} stroke="#e88" strokeWidth="1.5" opacity="0.6" />

        {/* Mouth */}
        {mouthId === 'mouth_smile' && <path d={`M ${CX - 8} 172 Q ${CX} 180 ${CX + 8} 172`} fill="none" stroke="#2d2d3d" strokeWidth="2" strokeLinecap="round" />}
        {mouthId === 'mouth_open' && <ellipse cx={CX} cy={174} rx={6} ry={8} fill="#c0392b" stroke="#2d2d3d" strokeWidth="1.5" />}
        {mouthId === 'mouth_sad' && <path d={`M ${CX - 8} 178 Q ${CX} 170 ${CX + 8} 178`} fill="none" stroke="#2d2d3d" strokeWidth="2" strokeLinecap="round" />}
        {mouthId === 'mouth_cat' && <path d={`M ${CX - 8} 174 Q ${CX - 4} 178 ${CX} 174 Q ${CX + 4} 178 ${CX + 8} 174`} fill="none" stroke="#2d2d3d" strokeWidth="2" strokeLinecap="round" />}
        {mouthId === 'mouth_vampire' && (<>
          <path d={`M ${CX - 6} 174 L ${CX + 6} 174`} stroke="#2d2d3d" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points={`${CX - 4},174 ${CX - 2},181 ${CX},174`} fill="#fff" />
          <polygon points={`${CX},174 ${CX + 2},181 ${CX + 4},174`} fill="#fff" />
        </>)}

        {/* Decals */}
        {decalsId === 'decal_scar' && <path d={`M ${CX - 30} 130 L ${CX - 20} 155 M ${CX - 28} 140 L ${CX - 22} 138`} stroke={decalsColor} strokeWidth="2" strokeLinecap="round" />}
        {decalsId === 'decal_freckles' && (<>
          <circle cx={CX - 28} cy={160} r={1.5} fill="#b45309" opacity="0.5" />
          <circle cx={CX - 34} cy={157} r={1.5} fill="#b45309" opacity="0.5" />
          <circle cx={CX + 28} cy={160} r={1.5} fill="#b45309" opacity="0.5" />
          <circle cx={CX + 34} cy={157} r={1.5} fill="#b45309" opacity="0.5" />
        </>)}

        {/* ── ACCESSORIES (outside capsule) ── */}
        {accessoryId === 'acc_catears' && (<>
          <path d={`M ${CX - 40} ${TOP + 25} L ${CX - 28} ${TOP - 10} L ${CX - 15} ${TOP + 20}`} fill="#fbcfe8" stroke="#f472b6" strokeWidth="2" strokeLinejoin="round" />
          <path d={`M ${CX + 15} ${TOP + 20} L ${CX + 28} ${TOP - 10} L ${CX + 40} ${TOP + 25}`} fill="#fbcfe8" stroke="#f472b6" strokeWidth="2" strokeLinejoin="round" />
        </>)}
        {accessoryId === 'acc_halo' && (
          <ellipse cx={CX} cy={TOP - 5} rx={30} ry={8} fill="none" stroke={accessoryColor} strokeWidth="4" opacity="0.7" />
        )}
        {accessoryId === 'acc_crown' && (
          <path d={`M ${CX - 25} ${TOP + 15} L ${CX - 15} ${TOP - 8} L ${CX} ${TOP + 5} L ${CX + 15} ${TOP - 8} L ${CX + 25} ${TOP + 15} Z`} fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        )}
        {accessoryId === 'acc_shades' && (<>
          <rect x={CX - 38} y={142} width={28} height={16} rx={4} fill="#111" opacity="0.9" />
          <rect x={CX + 10} y={142} width={28} height={16} rx={4} fill="#111" opacity="0.9" />
          <line x1={CX - 10} y1={150} x2={CX + 10} y2={150} stroke="#333" strokeWidth="2" />
        </>)}

        {/* Ground shadow */}
        <ellipse cx={CX} cy={TOP + H + 8} rx={45} ry={6} fill="rgba(0,0,0,0.1)" />
      </svg>
    </div>
  )
}
