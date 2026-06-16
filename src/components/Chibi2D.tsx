'use client'
import React, { useMemo } from 'react'

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

// ────────────────────────────────────────────────────────────────
// COLOR UTILITIES
// ────────────────────────────────────────────────────────────────
const darken = (hex: string, amount: number) => {
  let color = hex.replace('#', '')
  if (color.length === 3) color = color.split('').map(c => c + c).join('')
  const num = parseInt(color, 16)
  let r = Math.max(0, Math.min(255, (num >> 16) - Math.round(255 * amount)))
  let g = Math.max(0, Math.min(255, ((num >> 8) & 0xFF) - Math.round(255 * amount)))
  let b = Math.max(0, Math.min(255, (num & 0xFF) - Math.round(255 * amount)))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const lighten = (hex: string, amount: number) => darken(hex, -amount)

// ────────────────────────────────────────────────────────────────
// COORDINATE SYSTEM (viewBox 500x500)
//
// HEAD:   center (250, 130), rx=90, ry=82
// NECK:   center (250, 215)
// TORSO:  center (250, 260), rx=55, ry=42
// PELVIS: center (250, 300), rx=45, ry=18
// ARM:    shoulder ~(195/305, 240), hand ~(170/330, 310)
// LEG:    hip ~(220/280, 310), foot ~(220/280, 385)
// SHOE:   center ~(220/280, 392)
// ────────────────────────────────────────────────────────────────

export default function Chibi2D({
  skinColor = '#fcd34d',
  hairColor = '#3b82f6',
  clothesColor = '#ef4444',
  bodyId = 'body_standard',
  eyesId = 'eyes_normal',
  eyesColor = '#3b82f6',
  mouthId = 'mouth_smile',
  hairId = 'hair_short',
  clothesId = 'clothes_casual',
  accessoryId = 'acc_none',
  accessoryColor = '#a78bfa',
  bottomsId = 'bottom_jeans',
  bottomsColor = '#1e40af',
  decalsId = 'decal_none',
  decalsColor = '#ef4444',
  stageId = 'stage_none',
  className = ''
}: Chibi2DProps) {

  const skinDark = useMemo(() => darken(skinColor, 0.12), [skinColor])
  const skinShadow = useMemo(() => darken(skinColor, 0.22), [skinColor])
  const hairDark = useMemo(() => darken(hairColor, 0.18), [hairColor])
  const hairLight = useMemo(() => lighten(hairColor, 0.15), [hairColor])
  const clothesDark = useMemo(() => darken(clothesColor, 0.18), [clothesColor])
  const clothesLight = useMemo(() => lighten(clothesColor, 0.12), [clothesColor])
  const bottomsDark = useMemo(() => darken(bottomsColor, 0.18), [bottomsColor])
  const eyeDark = useMemo(() => darken(eyesColor, 0.35), [eyesColor])
  const eyeLight = useMemo(() => lighten(eyesColor, 0.25), [eyesColor])
  const outlineColor = '#2d2d3d'

  // Body type scaling
  let bodyW = 1, bodyH = 1
  if (bodyId === 'body_chubby') { bodyW = 1.15; bodyH = 0.96 }
  if (bodyId === 'body_tall') { bodyW = 0.94; bodyH = 1.12 }
  if (bodyId === 'body_muscular') { bodyW = 1.18; bodyH = 1.04 }

  // Unique IDs for gradients (prevent clashes when multiple instances)
  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), [])

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes chibi-float-${uid} {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes chibi-blink-${uid} {
          0%, 93%, 95%, 100% { transform: scaleY(1); }
          94% { transform: scaleY(0.08); }
        }
        @keyframes chibi-hair-${uid} {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.5deg); }
        }
        .chibi-float-${uid} { animation: chibi-float-${uid} 3.5s ease-in-out infinite; }
        .chibi-blink-${uid} { animation: chibi-blink-${uid} 4s ease-in-out infinite; transform-origin: center 145px; }
        .chibi-hair-${uid} { animation: chibi-hair-${uid} 4s ease-in-out infinite; transform-origin: 250px 80px; }
      `}</style>

      {/* ── MAIN SVG ── */}
      <svg
        viewBox="0 0 500 470"
        className={`chibi-float-${uid} w-full h-full max-w-[500px] max-h-[500px] z-10`}
        style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.18))' }}
      >
        <defs>
          <linearGradient id={`hg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hairLight} />
            <stop offset="100%" stopColor={hairDark} />
          </linearGradient>
          <linearGradient id={`eg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={eyeDark} />
            <stop offset="55%" stopColor={eyesColor} />
            <stop offset="100%" stopColor={eyeLight} />
          </linearGradient>
          <linearGradient id={`cg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={clothesLight} />
            <stop offset="100%" stopColor={clothesDark} />
          </linearGradient>
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bottomsColor} />
            <stop offset="100%" stopColor={bottomsDark} />
          </linearGradient>
          <linearGradient id={`sk-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skinColor} />
            <stop offset="100%" stopColor={skinDark} />
          </linearGradient>
          <clipPath id={`headClip-${uid}`}>
            <ellipse cx="250" cy="130" rx="90" ry="82" />
          </clipPath>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="250" cy="420" rx="70" ry="12" fill="rgba(0,0,0,0.12)" />

        <g transform={`translate(250,250) scale(${bodyW},${bodyH}) translate(-250,-250)`}>

          {/* ═══════════════ BACK HAIR ═══════════════ */}
          <g className={`chibi-hair-${uid}`}>
            {/* Hair cap (back part) — large ellipse behind head */}
            {hairId !== 'hair_bald' && (
              <ellipse cx="250" cy="110" rx="100" ry="88" fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2.5" />
            )}
            {/* Long hair back */}
            {hairId === 'hair_long' && (
              <path d="M 155 130 C 145 220, 150 320, 170 370 Q 250 385 330 370 C 350 320, 355 220, 345 130"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2" />
            )}
            {hairId === 'hair_twintails' && (<>
              <path d="M 155 120 C 110 180, 80 290, 100 360 C 120 370, 140 340, 155 280 C 155 220, 155 160, 155 120"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2" />
              <path d="M 345 120 C 390 180, 420 290, 400 360 C 380 370, 360 340, 345 280 C 345 220, 345 160, 345 120"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2" />
            </>)}
            {hairId === 'hair_ponytail' && (
              <path d="M 230 85 C 200 100, 200 200, 220 340 C 240 360, 260 360, 280 340 C 290 240, 300 100, 270 85"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2" />
            )}
          </g>

          {/* ═══════════════ LEGS ═══════════════ */}
          <g>
            {/* Left leg skin */}
            <path d="M 210 305 C 208 330, 207 360, 210 388 C 213 395, 228 395, 230 388 C 232 360, 231 330, 230 305 Z"
                  fill={`url(#sk-${uid})`} stroke={outlineColor} strokeWidth="2" />
            {/* Right leg skin */}
            <path d="M 270 305 C 268 330, 267 360, 270 388 C 273 395, 288 395, 290 388 C 292 360, 291 330, 290 305 Z"
                  fill={`url(#sk-${uid})`} stroke={outlineColor} strokeWidth="2" />

            {/* Pants overlay */}
            {bottomsId === 'bottom_jeans' && (<>
              <path d="M 208 305 C 207 330, 207 355, 209 375 C 212 380, 229 380, 231 375 C 233 355, 233 330, 232 305 Z"
                    fill={`url(#bg-${uid})`} stroke={outlineColor} strokeWidth="2" />
              <path d="M 268 305 C 267 330, 267 355, 269 375 C 272 380, 289 380, 291 375 C 293 355, 293 330, 292 305 Z"
                    fill={`url(#bg-${uid})`} stroke={outlineColor} strokeWidth="2" />
            </>)}
            {bottomsId === 'bottom_shorts' && (<>
              <path d="M 208 305 C 207 320, 208 335, 210 340 C 213 344, 228 344, 231 340 C 233 335, 233 320, 232 305 Z"
                    fill={`url(#bg-${uid})`} stroke={outlineColor} strokeWidth="2" />
              <path d="M 268 305 C 267 320, 268 335, 270 340 C 273 344, 288 344, 291 340 C 293 335, 293 320, 292 305 Z"
                    fill={`url(#bg-${uid})`} stroke={outlineColor} strokeWidth="2" />
            </>)}

            {/* Shoes */}
            <ellipse cx="220" cy="395" rx="18" ry="10" fill="#292524" stroke={outlineColor} strokeWidth="2" />
            <ellipse cx="220" cy="393" rx="14" ry="6" fill="#3f3f46" />
            <ellipse cx="280" cy="395" rx="18" ry="10" fill="#292524" stroke={outlineColor} strokeWidth="2" />
            <ellipse cx="280" cy="393" rx="14" ry="6" fill="#3f3f46" />
          </g>

          {/* ═══════════════ BODY ═══════════════ */}
          <g>
            {/* Left arm */}
            <path d="M 195 242 C 178 260, 168 290, 172 310 C 175 318, 185 318, 188 310 C 192 290, 196 270, 205 252"
                  fill={['clothes_casual','clothes_robe'].includes(clothesId) ? `url(#sk-${uid})` : `url(#cg-${uid})`}
                  stroke={outlineColor} strokeWidth="2" />
            {/* Left hand */}
            <circle cx="180" cy="314" r="10" fill={skinColor} stroke={outlineColor} strokeWidth="2" />

            {/* Right arm */}
            <path d="M 305 242 C 322 260, 332 290, 328 310 C 325 318, 315 318, 312 310 C 308 290, 304 270, 295 252"
                  fill={['clothes_casual','clothes_robe'].includes(clothesId) ? `url(#sk-${uid})` : `url(#cg-${uid})`}
                  stroke={outlineColor} strokeWidth="2" />
            {/* Right hand */}
            <circle cx="320" cy="314" r="10" fill={skinColor} stroke={outlineColor} strokeWidth="2" />

            {/* Neck */}
            <rect x="237" y="205" width="26" height="30" rx="13" fill={skinDark} stroke={outlineColor} strokeWidth="1.5" />

            {/* Skirt (if applicable) */}
            {bottomsId === 'bottom_skirt' && (
              <path d="M 195 290 C 195 285, 305 285, 305 290 L 320 345 C 320 355, 180 355, 180 345 Z"
                    fill={bottomsColor} stroke={outlineColor} strokeWidth="2" />
            )}

            {/* Torso */}
            <path d="M 195 235 C 195 215, 305 215, 305 235 L 310 300 C 310 315, 190 315, 190 300 Z"
                  fill={`url(#cg-${uid})`} stroke={outlineColor} strokeWidth="2.5" />

            {/* Clothes details */}
            {clothesId === 'clothes_casual' && (<>
              {/* Collar */}
              <path d="M 230 220 L 250 240 L 270 220" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              {/* Sleeve hems — subtle line marks */}
              <path d="M 198 252 Q 200 250 205 252" fill="none" stroke={clothesDark} strokeWidth="1.5" />
              <path d="M 302 252 Q 300 250 295 252" fill="none" stroke={clothesDark} strokeWidth="1.5" />
            </>)}
            {clothesId === 'clothes_suit' && (<>
              <path d="M 235 220 L 250 240 L 265 220" fill="#fff" stroke="none" opacity="0.9" />
              <path d="M 247 232 L 250 285 L 253 232" fill="#ef4444" />
              <line x1="250" y1="220" x2="230" y2="305" stroke={clothesDark} strokeWidth="2.5" />
              <line x1="250" y1="220" x2="270" y2="305" stroke={clothesDark} strokeWidth="2.5" />
            </>)}
            {clothesId === 'clothes_hoodie' && (<>
              <ellipse cx="250" cy="222" rx="30" ry="14" fill={clothesDark} stroke={outlineColor} strokeWidth="1.5" />
              <path d="M 220 270 Q 250 280 280 270" fill="none" stroke={clothesDark} strokeWidth="2" />
            </>)}
          </g>

          {/* ═══════════════ HEAD & FACE ═══════════════ */}
          <g>
            {/* Head shape */}
            <ellipse cx="250" cy="130" rx="90" ry="82" fill={skinColor} stroke={outlineColor} strokeWidth="2.5" />
            {/* Subtle cheek shading */}
            <ellipse cx="250" cy="155" rx="75" ry="50" fill={skinDark} opacity="0.15" />

            {/* Blush */}
            <ellipse cx="178" cy="162" rx="16" ry="8" fill="#f9a8d4" opacity="0.5" />
            <ellipse cx="322" cy="162" rx="16" ry="8" fill="#f9a8d4" opacity="0.5" />

            {/* ── EYES ── */}
            <g className={`chibi-blink-${uid}`}>
              {(eyesId === 'eyes_normal' || eyesId === 'eyes_big') && (<>
                {/* Left Eye */}
                <g transform="translate(205, 138)">
                  {/* White */}
                  <ellipse cx="0" cy="0" rx={eyesId === 'eyes_big' ? 20 : 16} ry={eyesId === 'eyes_big' ? 24 : 20} fill="#fff" stroke={outlineColor} strokeWidth="2" />
                  {/* Iris */}
                  <ellipse cx="0" cy="2" rx={eyesId === 'eyes_big' ? 14 : 12} ry={eyesId === 'eyes_big' ? 18 : 15} fill={`url(#eg-${uid})`} />
                  {/* Pupil */}
                  <circle cx="0" cy="4" r={eyesId === 'eyes_big' ? 7 : 6} fill="#111" />
                  {/* Highlights */}
                  <circle cx="-5" cy="-6" r="5" fill="#fff" opacity="0.9" />
                  <circle cx="4" cy="6" r="2.5" fill="#fff" opacity="0.6" />
                  {/* Upper eyelash */}
                  <path d={`M ${eyesId === 'eyes_big' ? -22 : -18} -${eyesId === 'eyes_big' ? 18 : 14} Q 0 -${eyesId === 'eyes_big' ? 30 : 24} ${eyesId === 'eyes_big' ? 22 : 18} -${eyesId === 'eyes_big' ? 18 : 14}`}
                        fill="none" stroke={outlineColor} strokeWidth="3.5" strokeLinecap="round" />
                </g>
                {/* Right Eye */}
                <g transform="translate(295, 138)">
                  <ellipse cx="0" cy="0" rx={eyesId === 'eyes_big' ? 20 : 16} ry={eyesId === 'eyes_big' ? 24 : 20} fill="#fff" stroke={outlineColor} strokeWidth="2" />
                  <ellipse cx="0" cy="2" rx={eyesId === 'eyes_big' ? 14 : 12} ry={eyesId === 'eyes_big' ? 18 : 15} fill={`url(#eg-${uid})`} />
                  <circle cx="0" cy="4" r={eyesId === 'eyes_big' ? 7 : 6} fill="#111" />
                  <circle cx="5" cy="-6" r="5" fill="#fff" opacity="0.9" />
                  <circle cx="-4" cy="6" r="2.5" fill="#fff" opacity="0.6" />
                  <path d={`M -${eyesId === 'eyes_big' ? 22 : 18} -${eyesId === 'eyes_big' ? 18 : 14} Q 0 -${eyesId === 'eyes_big' ? 30 : 24} ${eyesId === 'eyes_big' ? 22 : 18} -${eyesId === 'eyes_big' ? 18 : 14}`}
                        fill="none" stroke={outlineColor} strokeWidth="3.5" strokeLinecap="round" />
                </g>
              </>)}

              {eyesId === 'eyes_closed' && (<>
                <path d="M 186 140 Q 205 155 224 140" fill="none" stroke={outlineColor} strokeWidth="3" strokeLinecap="round" />
                <path d="M 276 140 Q 295 155 314 140" fill="none" stroke={outlineColor} strokeWidth="3" strokeLinecap="round" />
              </>)}

              {eyesId === 'eyes_angry' && (<>
                <line x1="186" y1="128" x2="224" y2="138" stroke={outlineColor} strokeWidth="3.5" strokeLinecap="round" />
                <ellipse cx="205" cy="145" rx="12" ry="14" fill={eyesColor} stroke={outlineColor} strokeWidth="2" />
                <circle cx="205" cy="147" r="5" fill="#111" />
                <line x1="314" y1="138" x2="276" y2="128" stroke={outlineColor} strokeWidth="3.5" strokeLinecap="round" />
                <ellipse cx="295" cy="145" rx="12" ry="14" fill={eyesColor} stroke={outlineColor} strokeWidth="2" />
                <circle cx="295" cy="147" r="5" fill="#111" />
              </>)}

              {eyesId === 'eyes_star' && (<>
                <polygon points="205,120 209,134 223,134 212,142 215,156 205,148 195,156 198,142 187,134 201,134" fill={eyesColor} stroke={outlineColor} strokeWidth="2" />
                <circle cx="200" cy="132" r="3" fill="#fff" opacity="0.8" />
                <polygon points="295,120 299,134 313,134 302,142 305,156 295,148 285,156 288,142 277,134 291,134" fill={eyesColor} stroke={outlineColor} strokeWidth="2" />
                <circle cx="290" cy="132" r="3" fill="#fff" opacity="0.8" />
              </>)}

              {eyesId === 'eyes_heart' && (<>
                <g transform="translate(205, 140)">
                  <path d="M 0 5 C -3 -3 -12 -8 -12 -2 C -12 3 0 12 0 12 C 0 12 12 3 12 -2 C 12 -8 3 -3 0 5 Z" fill={eyesColor} stroke={outlineColor} strokeWidth="1.5" />
                  <circle cx="-4" cy="-2" r="2" fill="#fff" opacity="0.7" />
                </g>
                <g transform="translate(295, 140)">
                  <path d="M 0 5 C -3 -3 -12 -8 -12 -2 C -12 3 0 12 0 12 C 0 12 12 3 12 -2 C 12 -8 3 -3 0 5 Z" fill={eyesColor} stroke={outlineColor} strokeWidth="1.5" />
                  <circle cx="4" cy="-2" r="2" fill="#fff" opacity="0.7" />
                </g>
              </>)}

              {eyesId === 'eyes_sad' && (<>
                <line x1="186" y1="138" x2="224" y2="128" stroke={outlineColor} strokeWidth="3" strokeLinecap="round" />
                <ellipse cx="205" cy="145" rx="12" ry="14" fill={eyesColor} stroke={outlineColor} strokeWidth="2" />
                <circle cx="205" cy="147" r="5" fill="#111" />
                <circle cx="200" cy="138" r="3" fill="#fff" opacity="0.7" />
                <line x1="276" y1="128" x2="314" y2="138" stroke={outlineColor} strokeWidth="3" strokeLinecap="round" />
                <ellipse cx="295" cy="145" rx="12" ry="14" fill={eyesColor} stroke={outlineColor} strokeWidth="2" />
                <circle cx="295" cy="147" r="5" fill="#111" />
                <circle cx="300" cy="138" r="3" fill="#fff" opacity="0.7" />
              </>)}

              {eyesId === 'eyes_cyber' && (
                <rect x="178" y="135" rx="4" width="144" height="12" fill={eyesColor} opacity="0.9" stroke={outlineColor} strokeWidth="1.5" />
              )}
            </g>

            {/* ── NOSE ── */}
            <ellipse cx="250" cy="163" rx="3" ry="2" fill={skinShadow} />

            {/* ── MOUTH ── */}
            {mouthId === 'mouth_smile' && <path d="M 238 178 Q 250 190 262 178" fill="none" stroke={outlineColor} strokeWidth="2.5" strokeLinecap="round" />}
            {mouthId === 'mouth_open' && (<>
              <ellipse cx="250" cy="180" rx="8" ry="10" fill="#c0392b" stroke={outlineColor} strokeWidth="2" />
              <ellipse cx="250" cy="176" rx="6" ry="4" fill="#e74c3c" />
            </>)}
            {mouthId === 'mouth_sad' && <path d="M 238 185 Q 250 175 262 185" fill="none" stroke={outlineColor} strokeWidth="2.5" strokeLinecap="round" />}
            {mouthId === 'mouth_cat' && <path d="M 236 180 Q 243 186 250 180 Q 257 186 264 180" fill="none" stroke={outlineColor} strokeWidth="2.5" strokeLinecap="round" />}
            {mouthId === 'mouth_vampire' && (<>
              <path d="M 238 180 L 262 180" stroke={outlineColor} strokeWidth="2" strokeLinecap="round" />
              <polygon points="240,180 244,192 248,180" fill="#fff" stroke={outlineColor} strokeWidth="1" />
              <polygon points="252,180 256,192 260,180" fill="#fff" stroke={outlineColor} strokeWidth="1" />
            </>)}

            {/* ── DECALS ── */}
            {decalsId === 'decal_scar' && <path d="M 195 120 L 210 155 M 200 132 L 208 128" stroke={decalsColor} strokeWidth="2.5" strokeLinecap="round" />}
            {decalsId === 'decal_bandage' && <rect x="225" y="155" width="50" height="12" rx="3" fill="#f5f5dc" stroke="#ddd" strokeWidth="1" transform="rotate(-5 250 160)" />}
            {decalsId === 'decal_freckles' && (<>
              <circle cx="185" cy="158" r="2" fill="#b45309" opacity="0.5" />
              <circle cx="195" cy="163" r="2.5" fill="#b45309" opacity="0.5" />
              <circle cx="190" cy="155" r="1.5" fill="#b45309" opacity="0.5" />
              <circle cx="305" cy="158" r="2" fill="#b45309" opacity="0.5" />
              <circle cx="315" cy="163" r="2.5" fill="#b45309" opacity="0.5" />
              <circle cx="310" cy="155" r="1.5" fill="#b45309" opacity="0.5" />
            </>)}
            {decalsId === 'decal_tear' && (
              <path d="M 310 155 Q 314 165 310 175" fill="#93c5fd" stroke="#60a5fa" strokeWidth="1.5" opacity="0.7" />
            )}

            {/* ═══════════════ FRONT HAIR ═══════════════ */}
            <g className={`chibi-hair-${uid}`} clipPath={`url(#headClip-${uid})`}>
              {hairId !== 'hair_bald' && (<>
                {/* Hair cap top */}
                <ellipse cx="250" cy="95" rx="95" ry="55" fill={`url(#hg-${uid})`} />
                {/* Bangs */}
                {hairId === 'hair_short' && (
                  <path d="M 160 120 C 170 85, 200 65, 250 60 C 300 65, 330 85, 340 120 C 330 135, 310 110, 280 125 C 265 108, 235 108, 220 125 C 190 110, 170 135, 160 120 Z"
                        fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                )}
                {(hairId === 'hair_long' || hairId === 'hair_ponytail' || hairId === 'hair_samurai') && (
                  <path d="M 158 130 C 165 90, 195 60, 250 55 C 305 60, 335 90, 342 130 C 330 145, 315 115, 290 135 C 275 115, 225 115, 210 135 C 185 115, 170 145, 158 130 Z"
                        fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                )}
                {hairId === 'hair_twintails' && (
                  <path d="M 155 130 C 162 85, 195 55, 250 50 C 305 55, 338 85, 345 130 C 335 148, 318 120, 295 138 C 278 118, 222 118, 205 138 C 182 120, 165 148, 155 130 Z"
                        fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                )}
                {hairId === 'hair_curly' && (
                  <path d="M 155 135 C 140 80, 200 35, 250 40 C 300 35, 360 80, 345 135 C 350 100, 310 70, 280 95 C 270 70, 230 70, 220 95 C 190 70, 150 100, 155 135 Z"
                        fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                )}
                {hairId === 'hair_mohawk' && (<>
                  <rect x="220" y="40" width="60" height="70" rx="30" fill={hairColor} stroke={outlineColor} strokeWidth="2" />
                  <rect x="230" y="20" width="40" height="50" rx="20" fill={hairLight} />
                </>)}
                {hairId === 'hair_messy' && (
                  <path d="M 150 135 C 145 70, 200 30, 250 35 C 300 30, 355 70, 350 135 C 360 105, 340 60, 300 80 C 310 50, 260 25, 250 55 C 240 25, 190 50, 200 80 C 160 60, 140 105, 150 135 Z"
                        fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                )}
              </>)}
            </g>
            {/* Sideburns (outside clip) */}
            {['hair_long','hair_twintails','hair_ponytail','hair_samurai'].includes(hairId) && (<>
              <path d="M 160 125 C 155 155, 152 185, 155 200 C 160 205, 170 195, 170 180 C 170 155, 168 140, 165 125 Z"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="1.5" />
              <path d="M 340 125 C 345 155, 348 185, 345 200 C 340 205, 330 195, 330 180 C 330 155, 332 140, 335 125 Z"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="1.5" />
            </>)}

            {/* ═══════════════ ACCESSORIES ═══════════════ */}
            {accessoryId === 'acc_catears' && (<>
              <path d="M 170 75 L 190 20 L 215 65 Z" fill="#fbcfe8" stroke="#f472b6" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 180 60 L 190 35 L 205 58 Z" fill="#f9a8d4" />
              <path d="M 330 75 L 310 20 L 285 65 Z" fill="#fbcfe8" stroke="#f472b6" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 320 60 L 310 35 L 295 58 Z" fill="#f9a8d4" />
            </>)}
            {accessoryId === 'acc_halo' && (
              <ellipse cx="250" cy="35" rx="50" ry="12" fill="none" stroke={accessoryColor} strokeWidth="5" opacity="0.75" />
            )}
            {accessoryId === 'acc_crown' && (
              <path d="M 200 68 L 215 25 L 235 55 L 250 20 L 265 55 L 285 25 L 300 68 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
            )}
            {accessoryId === 'acc_horns' && (<>
              <path d="M 175 80 C 165 50, 170 20, 180 10 C 185 15, 188 45, 190 70" fill={accessoryColor} stroke={outlineColor} strokeWidth="2" />
              <path d="M 325 80 C 335 50, 330 20, 320 10 C 315 15, 312 45, 310 70" fill={accessoryColor} stroke={outlineColor} strokeWidth="2" />
            </>)}
            {accessoryId === 'acc_headphones' && (<>
              <path d="M 162 120 C 162 70, 338 70, 338 120" fill="none" stroke="#333" strokeWidth="8" strokeLinecap="round" />
              <rect x="148" y="110" width="22" height="35" rx="8" fill="#444" stroke="#333" strokeWidth="2" />
              <rect x="330" y="110" width="22" height="35" rx="8" fill="#444" stroke="#333" strokeWidth="2" />
              <circle cx="159" cy="128" r="5" fill={accessoryColor} />
              <circle cx="341" cy="128" r="5" fill={accessoryColor} />
            </>)}
            {accessoryId === 'acc_shades' && (<>
              <rect x="180" y="128" width="45" height="26" rx="6" fill="#111" stroke={outlineColor} strokeWidth="2" opacity="0.9" />
              <rect x="275" y="128" width="45" height="26" rx="6" fill="#111" stroke={outlineColor} strokeWidth="2" opacity="0.9" />
              <line x1="225" y1="140" x2="275" y2="140" stroke="#333" strokeWidth="3" />
              <line x1="188" y1="133" x2="210" y2="148" stroke="#fff" strokeWidth="1.5" opacity="0.3" />
              <line x1="283" y1="133" x2="305" y2="148" stroke="#fff" strokeWidth="1.5" opacity="0.3" />
            </>)}

          </g> {/* End HEAD group */}

        </g> {/* End body-type scale group */}
      </svg>
    </div>
  )
}
