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
  const rawId = useId()
  const uid = rawId.replace(/:/g, '')

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
            {/* Hair volume (back) — NOT a perfect ellipse, has a peaked top */}
            {hairId !== 'hair_bald' && (
              <path d="M 155 140 C 155 100, 170 55, 250 48 C 330 55, 345 100, 345 140 C 348 160, 345 175, 340 180 L 160 180 C 155 175, 152 160, 155 140 Z"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2.5" />
            )}
            {/* Long hair flowing down back */}
            {hairId === 'hair_long' && (
              <path d="M 160 160 C 148 230, 150 310, 175 365 Q 250 380 325 365 C 350 310, 352 230, 340 160"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2" />
            )}
            {hairId === 'hair_twintails' && (<>
              <path d="M 160 140 C 120 180, 85 280, 105 355 C 120 365, 140 340, 150 280 C 155 220, 158 170, 160 140"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2" />
              <path d="M 340 140 C 380 180, 415 280, 395 355 C 380 365, 360 340, 350 280 C 345 220, 342 170, 340 140"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2" />
            </>)}
            {hairId === 'hair_ponytail' && (
              <path d="M 235 70 C 210 85, 210 200, 225 340 C 240 358, 260 358, 275 340 C 290 200, 290 85, 265 70"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2" />
            )}
          </g>

          {/* ═══════════════ LEGS ═══════════════ */}
          <g>
            {/* Left leg */}
            <path d="M 215 310 C 212 335, 210 360, 213 378 C 216 384, 228 384, 231 378 C 234 360, 232 335, 229 310 Z"
                  fill={`url(#sk-${uid})`} stroke={outlineColor} strokeWidth="2" />
            {/* Right leg */}
            <path d="M 271 310 C 268 335, 266 360, 269 378 C 272 384, 284 384, 287 378 C 290 360, 288 335, 285 310 Z"
                  fill={`url(#sk-${uid})`} stroke={outlineColor} strokeWidth="2" />

            {/* Pants */}
            {bottomsId === 'bottom_jeans' && (<>
              <path d="M 214 310 C 211 332, 210 358, 212 372 C 215 378, 229 378, 232 372 C 234 358, 233 332, 230 310 Z"
                    fill={`url(#bg-${uid})`} stroke={outlineColor} strokeWidth="1.5" />
              <path d="M 270 310 C 267 332, 266 358, 268 372 C 271 378, 285 378, 288 372 C 290 358, 289 332, 286 310 Z"
                    fill={`url(#bg-${uid})`} stroke={outlineColor} strokeWidth="1.5" />
            </>)}
            {bottomsId === 'bottom_shorts' && (<>
              <path d="M 214 310 C 213 322, 213 332, 215 338 C 218 342, 227 342, 230 338 C 232 332, 232 322, 230 310 Z"
                    fill={`url(#bg-${uid})`} stroke={outlineColor} strokeWidth="1.5" />
              <path d="M 270 310 C 269 322, 269 332, 271 338 C 274 342, 283 342, 286 338 C 288 332, 288 322, 286 310 Z"
                    fill={`url(#bg-${uid})`} stroke={outlineColor} strokeWidth="1.5" />
            </>)}

            {/* Shoes — round cute sneakers */}
            <ellipse cx="222" cy="388" rx="16" ry="9" fill="#292524" stroke={outlineColor} strokeWidth="1.5" />
            <ellipse cx="222" cy="386" rx="11" ry="5" fill="#44403c" />
            <ellipse cx="278" cy="388" rx="16" ry="9" fill="#292524" stroke={outlineColor} strokeWidth="1.5" />
            <ellipse cx="278" cy="386" rx="11" ry="5" fill="#44403c" />
          </g>

          {/* ═══════════════ BODY ═══════════════ */}
          <g>
            {/* Left arm — short rounded sausage */}
            <path d="M 193 245 C 180 258, 172 280, 175 298 C 178 305, 186 305, 189 298 C 192 282, 194 265, 200 250"
                  fill={clothesId === 'clothes_casual' ? `url(#sk-${uid})` : `url(#cg-${uid})`}
                  stroke={outlineColor} strokeWidth="2" />
            <circle cx="182" cy="302" r="9" fill={skinColor} stroke={outlineColor} strokeWidth="1.5" />

            {/* Right arm */}
            <path d="M 307 245 C 320 258, 328 280, 325 298 C 322 305, 314 305, 311 298 C 308 282, 306 265, 300 250"
                  fill={clothesId === 'clothes_casual' ? `url(#sk-${uid})` : `url(#cg-${uid})`}
                  stroke={outlineColor} strokeWidth="2" />
            <circle cx="318" cy="302" r="9" fill={skinColor} stroke={outlineColor} strokeWidth="1.5" />

            {/* Neck */}
            <ellipse cx="250" cy="215" rx="14" ry="12" fill={skinDark} />

            {/* Skirt */}
            {bottomsId === 'bottom_skirt' && (
              <path d="M 200 295 Q 250 300 300 295 L 315 340 Q 250 355 185 340 Z"
                    fill={bottomsColor} stroke={outlineColor} strokeWidth="2" />
            )}

            {/* Torso — rounded bean shape */}
            <ellipse cx="250" cy="268" rx="58" ry="42" fill={`url(#cg-${uid})`} stroke={outlineColor} strokeWidth="2.5" />

            {/* Clothes details */}
            {clothesId === 'clothes_casual' && (<>
              <path d="M 232 232 L 250 248 L 268 232" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            </>)}
            {clothesId === 'clothes_suit' && (<>
              <path d="M 237 232 L 250 248 L 263 232" fill="#fff" opacity="0.9" />
              <path d="M 247 242 L 250 285 L 253 242" fill="#ef4444" />
              <line x1="250" y1="235" x2="220" y2="300" stroke={clothesDark} strokeWidth="2" />
              <line x1="250" y1="235" x2="280" y2="300" stroke={clothesDark} strokeWidth="2" />
            </>)}
            {clothesId === 'clothes_hoodie' && (<>
              <ellipse cx="250" cy="238" rx="28" ry="12" fill={clothesDark} stroke={outlineColor} strokeWidth="1.5" />
              <path d="M 225 275 Q 250 285 275 275" fill="none" stroke={clothesDark} strokeWidth="2" />
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
                {/* Left Eye — big anime eyes are KEY to cuteness */}
                <g transform="translate(200, 142)">
                  <ellipse cx="0" cy="0" rx={eyesId === 'eyes_big' ? 24 : 20} ry={eyesId === 'eyes_big' ? 28 : 24} fill="#fff" stroke={outlineColor} strokeWidth="2.5" />
                  <ellipse cx="0" cy="2" rx={eyesId === 'eyes_big' ? 18 : 15} ry={eyesId === 'eyes_big' ? 22 : 19} fill={`url(#eg-${uid})`} />
                  <circle cx="0" cy="5" r={eyesId === 'eyes_big' ? 9 : 7} fill="#111" />
                  <circle cx="-6" cy="-7" r="6" fill="#fff" opacity="0.95" />
                  <circle cx="5" cy="7" r="3" fill="#fff" opacity="0.6" />
                  <path d={`M ${eyesId === 'eyes_big' ? -26 : -22} -${eyesId === 'eyes_big' ? 22 : 18} Q 0 -${eyesId === 'eyes_big' ? 35 : 30} ${eyesId === 'eyes_big' ? 26 : 22} -${eyesId === 'eyes_big' ? 22 : 18}`}
                        fill="none" stroke={outlineColor} strokeWidth="4" strokeLinecap="round" />
                </g>
                {/* Right Eye */}
                <g transform="translate(300, 142)">
                  <ellipse cx="0" cy="0" rx={eyesId === 'eyes_big' ? 24 : 20} ry={eyesId === 'eyes_big' ? 28 : 24} fill="#fff" stroke={outlineColor} strokeWidth="2.5" />
                  <ellipse cx="0" cy="2" rx={eyesId === 'eyes_big' ? 18 : 15} ry={eyesId === 'eyes_big' ? 22 : 19} fill={`url(#eg-${uid})`} />
                  <circle cx="0" cy="5" r={eyesId === 'eyes_big' ? 9 : 7} fill="#111" />
                  <circle cx="6" cy="-7" r="6" fill="#fff" opacity="0.95" />
                  <circle cx="-5" cy="7" r="3" fill="#fff" opacity="0.6" />
                  <path d={`M -${eyesId === 'eyes_big' ? 26 : 22} -${eyesId === 'eyes_big' ? 22 : 18} Q 0 -${eyesId === 'eyes_big' ? 35 : 30} ${eyesId === 'eyes_big' ? 26 : 22} -${eyesId === 'eyes_big' ? 22 : 18}`}
                        fill="none" stroke={outlineColor} strokeWidth="4" strokeLinecap="round" />
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
            <g className={`chibi-hair-${uid}`}>
              {hairId !== 'hair_bald' && (<>
                {/* Hair top volume (visible above head outline) */}
                <path d="M 160 130 C 160 95, 180 55, 250 48 C 320 55, 340 95, 340 130"
                      fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="2" />
                {/* Highlight streak */}
                <path d="M 220 65 C 235 55, 260 55, 275 68" fill="none" stroke={hairLight} strokeWidth="4" opacity="0.4" strokeLinecap="round" />

                {/* === BANGS (individual strands that end ABOVE the eyes) === */}
                {hairId === 'hair_short' && (<>
                  {/* 3 chunky bang strands */}
                  <path d="M 170 90 C 175 70, 200 60, 215 60 C 215 80, 200 105, 185 115 C 175 110, 168 100, 170 90 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 210 70 C 220 55, 245 50, 260 50 C 258 70, 245 95, 230 110 C 220 105, 210 90, 210 70 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 255 50 C 275 52, 300 60, 310 75 C 312 90, 305 105, 295 112 C 282 100, 268 80, 255 50 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 305 75 C 320 80, 330 90, 335 105 C 330 112, 318 115, 310 112 C 305 100, 305 85, 305 75 Z" fill={hairDark} stroke={outlineColor} strokeWidth="1.5" />
                </>)}
                {(hairId === 'hair_long' || hairId === 'hair_ponytail' || hairId === 'hair_samurai') && (<>
                  <path d="M 165 100 C 170 75, 195 58, 220 55 C 218 78, 205 100, 190 115 C 178 110, 165 105, 165 100 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 215 60 C 235 50, 260 48, 275 52 C 272 75, 258 100, 240 115 C 228 105, 218 85, 215 60 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 270 52 C 290 55, 310 65, 320 80 C 318 100, 308 112, 295 118 C 285 105, 275 80, 270 52 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 318 80 C 330 88, 338 100, 340 115 C 335 120, 325 118, 318 112 C 315 100, 318 88, 318 80 Z" fill={hairDark} stroke={outlineColor} strokeWidth="1.5" />
                </>)}
                {hairId === 'hair_twintails' && (<>
                  <path d="M 158 105 C 165 78, 190 58, 220 52 C 218 75, 200 100, 185 115 C 172 110, 158 108, 158 105 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 215 55 C 238 48, 262 48, 285 55 C 280 78, 265 100, 250 112 C 235 100, 220 78, 215 55 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 280 52 C 310 58, 335 78, 342 105 C 342 108, 328 110, 315 115 C 300 100, 282 75, 280 52 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                </>)}
                {hairId === 'hair_curly' && (<>
                  <circle cx="185" cy="85" r="25" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <circle cx="220" cy="68" r="28" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <circle cx="260" cy="62" r="30" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <circle cx="300" cy="72" r="26" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <circle cx="325" cy="95" r="22" fill={hairDark} stroke={outlineColor} strokeWidth="1.5" />
                </>)}
                {hairId === 'hair_mohawk' && (<>
                  <path d="M 220 100 C 220 50, 235 10, 250 0 C 265 10, 280 50, 280 100 Z" fill={hairColor} stroke={outlineColor} strokeWidth="2" />
                  <path d="M 232 80 C 232 45, 242 15, 250 8 C 258 15, 268 45, 268 80 Z" fill={hairLight} />
                </>)}
                {hairId === 'hair_messy' && (<>
                  <path d="M 155 110 C 160 75, 190 50, 215 48 C 210 72, 195 100, 180 115 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 200 55 C 225 40, 255 38, 270 45 C 262 70, 245 100, 228 112 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 260 42 C 290 45, 320 65, 330 90 C 322 108, 305 115, 290 110 Z" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 325 85 C 340 95, 348 110, 345 125 C 338 118, 328 112, 325 100 Z" fill={hairDark} stroke={outlineColor} strokeWidth="1.5" />
                  {/* Spiky bits sticking up */}
                  <path d="M 190 55 L 175 25 L 205 48" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 250 42 L 255 10 L 265 40" fill={hairLight} stroke={outlineColor} strokeWidth="1.5" />
                  <path d="M 310 60 L 330 35 L 325 65" fill={hairColor} stroke={outlineColor} strokeWidth="1.5" />
                </>)}
              </>)}
            </g>
            {/* Sideburns (outside clip) */}
            {['hair_long','hair_twintails','hair_ponytail','hair_samurai'].includes(hairId) && (<>
              <path d="M 162 130 C 155 155, 150 185, 155 208 C 160 215, 172 205, 172 185 C 172 160, 170 145, 167 130 Z"
                    fill={`url(#hg-${uid})`} stroke={outlineColor} strokeWidth="1.5" />
              <path d="M 338 130 C 345 155, 350 185, 345 208 C 340 215, 328 205, 328 185 C 328 160, 330 145, 333 130 Z"
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
