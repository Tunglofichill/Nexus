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

export default function Chibi2D({
  skinColor = '#ffdbac',
  hairColor = '#3b3b3b',
  clothesColor = '#ef4444',
  eyesId = 'eyes_normal',
  eyesColor = '#1a1a1a',
  mouthId = 'mouth_smile',
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

  // Capsule: viewBox 200x340
  const W = 140, R = 70, H = 280, CX = 100, TOP = 30
  const SPLIT = 175  // skin | clothes divider

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes cf-${uid} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes cb-${uid} { 0%,92%,94%,100%{transform:scaleY(1)} 93%{transform:scaleY(0.05)} }
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

        {/* ── BACKGROUND ACCESSORIES ── */}
        {accessoryId === 'acc_wings' && (<>
          <path d={`M ${CX-50} ${TOP+100} Q ${CX-130} ${TOP+20} ${CX-140} ${TOP+120} Q ${CX-80} ${TOP+150} ${CX-50} ${TOP+140} Z`} fill={accessoryColor} opacity="0.9" stroke="#cbd5e1" strokeWidth="2" />
          <path d={`M ${CX+50} ${TOP+100} Q ${CX+130} ${TOP+20} ${CX+140} ${TOP+120} Q ${CX+80} ${TOP+150} ${CX+50} ${TOP+140} Z`} fill={accessoryColor} opacity="0.9" stroke="#cbd5e1" strokeWidth="2" />
        </>)}

        {/* ── CAPSULE ── */}
        <g clipPath={`url(#cap-${uid})`}>
          {/* Skin (top) */}
          <rect x={CX - R} y={TOP} width={W} height={H} fill={skinColor} />
          {/* Clothes color (bottom) — just a flat color */}
          <rect x={CX - R} y={SPLIT} width={W} height={H - (SPLIT - TOP)} fill={clothesColor} />
          <rect x={CX - R} y={SPLIT + 60} width={W} height={H - (SPLIT - TOP) - 60} fill={clothesDark} opacity="0.3" />
          {/* Highlight stripe */}
          <rect x={CX - R + 12} y={SPLIT + 5} width={7} height={75} rx={3.5} fill="#fff" opacity="0.12" />

          {/* ── HAIR — just a small cap on the very top, HIGH forehead ── */}
          <ellipse cx={CX} cy={TOP + 12} rx={R + 2} ry={28} fill={hairColor} />
          {/* Hair shine */}
          <ellipse cx={CX + 10} cy={TOP + 8} rx={14} ry={5} fill="#fff" opacity="0.1" />
        </g>

        {/* Capsule outline */}
        <rect x={CX - R} y={TOP} width={W} height={H} rx={R} ry={R}
              fill="none" stroke="#2d2d3d" strokeWidth="3" />

        {/* ── FACE ── */}
        <g className={`cb-${uid}`}>
          {(eyesId === 'eyes_normal' || eyesId === 'eyes_big') && (<>
            {/* Left eye */}
            <circle cx={CX - 22} cy={148} r={eyesId === 'eyes_big' ? 14 : 11} fill="#111" />
            <circle cx={CX - 22} cy={148} r={eyesId === 'eyes_big' ? 13 : 10} fill={eyesColor} />
            <circle cx={CX - 26} cy={143} r={eyesId === 'eyes_big' ? 5 : 4} fill="#fff" />
            <circle cx={CX - 18} cy={152} r={2} fill="#fff" opacity="0.6" />
            {/* Right eye */}
            <circle cx={CX + 22} cy={148} r={eyesId === 'eyes_big' ? 14 : 11} fill="#111" />
            <circle cx={CX + 22} cy={148} r={eyesId === 'eyes_big' ? 13 : 10} fill={eyesColor} />
            <circle cx={CX + 18} cy={143} r={eyesId === 'eyes_big' ? 5 : 4} fill="#fff" />
            <circle cx={CX + 26} cy={152} r={2} fill="#fff" opacity="0.6" />
          </>)}
          {eyesId === 'eyes_closed' && (<>
            <path d={`M ${CX-33} 148 Q ${CX-22} 157 ${CX-11} 148`} fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
            <path d={`M ${CX+11} 148 Q ${CX+22} 157 ${CX+33} 148`} fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
          </>)}
          {eyesId === 'eyes_angry' && (<>
            <line x1={CX-32} y1={142} x2={CX-12} y2={148} stroke="#111" strokeWidth="3" strokeLinecap="round" />
            <circle cx={CX-22} cy={152} r={8} fill={eyesColor} />
            <circle cx={CX-24} cy={150} r={3} fill="#fff" />
            <line x1={CX+12} y1={148} x2={CX+32} y2={142} stroke="#111" strokeWidth="3" strokeLinecap="round" />
            <circle cx={CX+22} cy={152} r={8} fill={eyesColor} />
            <circle cx={CX+20} cy={150} r={3} fill="#fff" />
          </>)}
          {eyesId === 'eyes_star' && (<>
            <polygon points={`${CX-22},135 ${CX-19},144 ${CX-10},144 ${CX-17},149 ${CX-15},158 ${CX-22},153 ${CX-29},158 ${CX-27},149 ${CX-34},144 ${CX-25},144`} fill={eyesColor} />
            <polygon points={`${CX+22},135 ${CX+25},144 ${CX+34},144 ${CX+27},149 ${CX+29},158 ${CX+22},153 ${CX+15},158 ${CX+17},149 ${CX+10},144 ${CX+19},144`} fill={eyesColor} />
          </>)}
        </g>

        {/* Blush */}
        <ellipse cx={CX - 32} cy={163} rx={10} ry={6} fill="#f9a8d4" opacity="0.5" />
        <line x1={CX-36} y1={162} x2={CX-33} y2={164} stroke="#e88" strokeWidth="1.5" opacity="0.6" />
        <line x1={CX-32} y1={161} x2={CX-29} y2={163} stroke="#e88" strokeWidth="1.5" opacity="0.6" />
        <ellipse cx={CX + 32} cy={163} rx={10} ry={6} fill="#f9a8d4" opacity="0.5" />
        <line x1={CX+29} y1={162} x2={CX+32} y2={164} stroke="#e88" strokeWidth="1.5" opacity="0.6" />
        <line x1={CX+33} y1={161} x2={CX+36} y2={163} stroke="#e88" strokeWidth="1.5" opacity="0.6" />

        {/* Mouth */}
        {mouthId === 'mouth_smile' && <path d={`M ${CX-8} 172 Q ${CX} 180 ${CX+8} 172`} fill="none" stroke="#2d2d3d" strokeWidth="2" strokeLinecap="round" />}
        {mouthId === 'mouth_open' && <ellipse cx={CX} cy={174} rx={6} ry={8} fill="#c0392b" stroke="#2d2d3d" strokeWidth="1.5" />}
        {mouthId === 'mouth_sad' && <path d={`M ${CX-8} 178 Q ${CX} 170 ${CX+8} 178`} fill="none" stroke="#2d2d3d" strokeWidth="2" strokeLinecap="round" />}
        {mouthId === 'mouth_cat' && <path d={`M ${CX-8} 174 Q ${CX-4} 178 ${CX} 174 Q ${CX+4} 178 ${CX+8} 174`} fill="none" stroke="#2d2d3d" strokeWidth="2" strokeLinecap="round" />}
        {mouthId === 'mouth_vampire' && (<>
          <path d={`M ${CX-6} 174 L ${CX+6} 174`} stroke="#2d2d3d" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points={`${CX-4},174 ${CX-2},181 ${CX},174`} fill="#fff" />
          <polygon points={`${CX},174 ${CX+2},181 ${CX+4},174`} fill="#fff" />
        </>)}

        {/* Decals */}
        {decalsId === 'decal_scar' && <path d={`M ${CX-30} 130 L ${CX-20} 155 M ${CX-28} 140 L ${CX-22} 138`} stroke={decalsColor} strokeWidth="2" strokeLinecap="round" />}
        {decalsId === 'decal_freckles' && (<>
          <circle cx={CX-28} cy={160} r={1.5} fill="#b45309" opacity="0.5" />
          <circle cx={CX-34} cy={157} r={1.5} fill="#b45309" opacity="0.5" />
          <circle cx={CX+28} cy={160} r={1.5} fill="#b45309" opacity="0.5" />
          <circle cx={CX+34} cy={157} r={1.5} fill="#b45309" opacity="0.5" />
        </>)}
        {decalsId === 'decal_bandaid' && (<>
          <rect x={CX-38} y={150} width={16} height={8} rx={2} fill={decalsColor} transform={`rotate(-15 ${CX-30} 154)`} />
          <rect x={CX-34} y={152} width={4} height={4} rx={1} fill="#fff" opacity="0.5" transform={`rotate(-15 ${CX-30} 154)`} />
        </>)}
        {decalsId === 'decal_blush' && (<>
          <ellipse cx={CX - 32} cy={163} rx={14} ry={8} fill={decalsColor} opacity="0.6" />
          <ellipse cx={CX + 32} cy={163} rx={14} ry={8} fill={decalsColor} opacity="0.6" />
        </>)}
        {decalsId === 'decal_star' && (<>
          <path d={`M ${CX-30} 155 L ${CX-28} 160 L ${CX-23} 160 L ${CX-27} 163 L ${CX-25} 168 L ${CX-30} 165 L ${CX-35} 168 L ${CX-33} 163 L ${CX-37} 160 L ${CX-32} 160 Z`} fill={decalsColor} />
        </>)}
        {decalsId === 'decal_heart' && (<>
          <path d={`M ${CX-30} 158 A 3 3 0 0 1 ${CX-24} 158 A 3 3 0 0 1 ${CX-18} 158 Q ${CX-18} 163 ${CX-24} 168 Q ${CX-30} 163 ${CX-30} 158 Z`} fill={decalsColor} />
        </>)}
        {decalsId === 'decal_tears' && (<>
          <path d={`M ${CX-25} 155 Q ${CX-20} 170 ${CX-25} 175 Q ${CX-30} 170 ${CX-25} 155 Z`} fill="#60a5fa" opacity="0.8" />
          <path d={`M ${CX+25} 155 Q ${CX+30} 170 ${CX+25} 175 Q ${CX+20} 170 ${CX+25} 155 Z`} fill="#60a5fa" opacity="0.8" />
        </>)}

        {/* Accessories (outside capsule) */}
        {accessoryId === 'acc_catears' && (<>
          <path d={`M ${CX-40} ${TOP+25} L ${CX-28} ${TOP-10} L ${CX-15} ${TOP+20}`} fill="#fbcfe8" stroke="#f472b6" strokeWidth="2" strokeLinejoin="round" />
          <path d={`M ${CX+15} ${TOP+20} L ${CX+28} ${TOP-10} L ${CX+40} ${TOP+25}`} fill="#fbcfe8" stroke="#f472b6" strokeWidth="2" strokeLinejoin="round" />
        </>)}
        {accessoryId === 'acc_halo' && (
          <ellipse cx={CX} cy={TOP-5} rx={30} ry={8} fill="none" stroke={accessoryColor} strokeWidth="4" opacity="0.7" />
        )}
        {accessoryId === 'acc_crown' && (
          <path d={`M ${CX-25} ${TOP+15} L ${CX-15} ${TOP-8} L ${CX} ${TOP+5} L ${CX+15} ${TOP-8} L ${CX+25} ${TOP+15} Z`} fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        )}
        {accessoryId === 'acc_shades' && (<>
          <rect x={CX-38} y={142} width={28} height={16} rx={4} fill="#111" opacity="0.9" />
          <rect x={CX+10} y={142} width={28} height={16} rx={4} fill="#111" opacity="0.9" />
          <line x1={CX-10} y1={150} x2={CX+10} y2={150} stroke="#333" strokeWidth="2" />
        </>)}
        {accessoryId === 'acc_sprout' && (<>
          <path d={`M ${CX} ${TOP+5} Q ${CX-15} ${TOP-20} ${CX-5} ${TOP-25} Q ${CX} ${TOP-15} ${CX} ${TOP+5}`} fill={accessoryColor} />
          <path d={`M ${CX} ${TOP+5} Q ${CX+20} ${TOP-15} ${CX+15} ${TOP-25} Q ${CX+5} ${TOP-20} ${CX} ${TOP+5}`} fill={accessoryColor} />
        </>)}
        {accessoryId === 'acc_horns' && (<>
          <path d={`M ${CX-25} ${TOP+10} Q ${CX-35} ${TOP-15} ${CX-20} ${TOP-20} Q ${CX-15} ${TOP-5} ${CX-15} ${TOP+5}`} fill={accessoryColor} />
          <path d={`M ${CX+25} ${TOP+10} Q ${CX+35} ${TOP-15} ${CX+20} ${TOP-20} Q ${CX+15} ${TOP-5} ${CX+15} ${TOP+5}`} fill={accessoryColor} />
        </>)}
        {accessoryId === 'acc_flower' && (<>
          <circle cx={CX-40} cy={TOP+30} r={6} fill="#fbbf24" />
          <circle cx={CX-48} cy={TOP+30} r={6} fill={accessoryColor} />
          <circle cx={CX-32} cy={TOP+30} r={6} fill={accessoryColor} />
          <circle cx={CX-40} cy={TOP+22} r={6} fill={accessoryColor} />
          <circle cx={CX-40} cy={TOP+38} r={6} fill={accessoryColor} />
        </>)}
        {accessoryId === 'acc_cap' && (<>
          <path d={`M ${CX-45} ${TOP+25} L ${CX-75} ${TOP+25} Q ${CX-65} ${TOP+18} ${CX-50} ${TOP+15} Z`} fill={accessoryColor} opacity="0.9" />
          <path d={`M ${CX-45} ${TOP+25} Q ${CX} ${TOP-15} ${CX+45} ${TOP+25} Z`} fill={accessoryColor} />
          <ellipse cx={CX} cy={TOP-2} rx={4} ry={2} fill="#111" opacity="0.3" />
        </>)}
        {accessoryId === 'acc_beanie' && (<>
          <path d={`M ${CX-45} ${TOP+30} Q ${CX} ${TOP-20} ${CX+45} ${TOP+30} Z`} fill={accessoryColor} />
          <rect x={CX-46} y={TOP+25} width={92} height={12} rx={4} fill={accessoryColor} opacity="0.8" />
          <circle cx={CX} cy={TOP-10} r={8} fill={accessoryColor} />
        </>)}
        {accessoryId === 'acc_headphones' && (<>
          <path d={`M ${CX-45} ${TOP+30} Q ${CX} ${TOP-20} ${CX+45} ${TOP+30}`} fill="none" stroke="#333" strokeWidth="6" />
          <rect x={CX-55} y={TOP+20} width={15} height={30} rx={6} fill={accessoryColor} />
          <rect x={CX+40} y={TOP+20} width={15} height={30} rx={6} fill={accessoryColor} />
        </>)}
        {accessoryId === 'acc_glasses' && (<>
          <rect x={CX-35} y={135} width={24} height={20} rx={4} fill="none" stroke={accessoryColor} strokeWidth="3" />
          <rect x={CX+11} y={135} width={24} height={20} rx={4} fill="none" stroke={accessoryColor} strokeWidth="3" />
          <line x1={CX-11} y1={145} x2={CX+11} y2={145} stroke={accessoryColor} strokeWidth="3" />
        </>)}

        {/* Ground shadow */}
        <ellipse cx={CX} cy={TOP + H + 8} rx={45} ry={6} fill="rgba(0,0,0,0.1)" />
      </svg>
    </div>
  )
}
