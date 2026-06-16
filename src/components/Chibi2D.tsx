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
// UTILITIES
// ────────────────────────────────────────────────────────────────
const darken = (hex: string, amount: number) => {
  let color = hex.replace('#', '')
  if (color.length === 3) color = color.split('').map(c => c + c).join('')
  const num = parseInt(color, 16)
  let r = (num >> 16) - Math.round(255 * amount)
  let g = ((num >> 8) & 0x00FF) - Math.round(255 * amount)
  let b = (num & 0x0000FF) - Math.round(255 * amount)
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`
}

const lighten = (hex: string, amount: number) => {
  return darken(hex, -amount)
}

// ────────────────────────────────────────────────────────────────
// MAIN SVG COMPONENT
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

  const skinDark = useMemo(() => darken(skinColor, 0.15), [skinColor])
  const skinShadow = useMemo(() => darken(skinColor, 0.25), [skinColor])
  const hairDark = useMemo(() => darken(hairColor, 0.2), [hairColor])
  const hairLight = useMemo(() => lighten(hairColor, 0.2), [hairColor])
  const clothesDark = useMemo(() => darken(clothesColor, 0.2), [clothesColor])
  const bottomsDark = useMemo(() => darken(bottomsColor, 0.2), [bottomsColor])
  const eyeDark = useMemo(() => darken(eyesColor, 0.4), [eyesColor])
  const eyeLight = useMemo(() => lighten(eyesColor, 0.3), [eyesColor])

  // Scale modifications based on body type
  let scaleY = 1
  let scaleX = 1
  if (bodyId === 'body_chubby') { scaleX = 1.15; scaleY = 0.95 }
  if (bodyId === 'body_tall') { scaleX = 0.95; scaleY = 1.15 }
  if (bodyId === 'body_muscular') { scaleX = 1.2; scaleY = 1.05 }

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      
      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes breathe {
          0%, 100% { transform: scaleY(1) translateY(0); }
          50% { transform: scaleY(1.02) translateY(-2px); }
        }
        @keyframes blink {
          0%, 96%, 98%, 100% { transform: scaleY(1); opacity: 1; }
          97%, 99% { transform: scaleY(0.1); opacity: 0.8; }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .anim-float { animation: float 4s ease-in-out infinite; }
        .anim-breathe { animation: breathe 3s ease-in-out infinite; transform-origin: 250px 300px; }
        .anim-blink { animation: blink 5s infinite; transform-origin: center; }
        .anim-sway { animation: sway 6s ease-in-out infinite; transform-origin: 250px 100px; }
      `}</style>

      {/* ── BACKGROUND STAGE ── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <svg viewBox="0 0 500 500" className="w-full h-full opacity-60">
          <defs>
            <radialGradient id="stageGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--stage-color, #a855f7)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--stage-color, #a855f7)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {stageId === 'stage_holo' && <ellipse cx="250" cy="400" rx="160" ry="40" fill="url(#stageGlow)" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" />}
          {stageId === 'stage_ring' && <ellipse cx="250" cy="400" rx="140" ry="35" fill="none" stroke="#06b6d4" strokeWidth="6" />}
          {stageId === 'stage_pedestal' && <path d="M 120 400 C 120 420, 380 420, 380 400 L 360 430 C 360 450, 140 450, 140 430 Z" fill="#18181b" stroke="#ec4899" strokeWidth="4" />}
          {stageId === 'stage_magic' && <ellipse cx="250" cy="400" rx="180" ry="45" fill="url(#stageGlow)" stroke="#a855f7" strokeWidth="2" strokeDasharray="10 5" />}
          {/* Default soft shadow */}
          {stageId === 'stage_none' && <ellipse cx="250" cy="410" rx="90" ry="18" fill="rgba(0,0,0,0.15)" filter="blur(4px)" />}
        </svg>
      </div>

      {/* ── MAIN AVATAR SVG ── */}
      <svg 
        viewBox="0 0 500 500" 
        className="anim-float w-full h-full max-w-[600px] max-h-[600px] z-10 filter drop-shadow-2xl"
        style={{ transform: `scale(${scaleX}, ${scaleY})` }}
      >
        <defs>
          {/* Anime Hair Gradients */}
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hairLight} />
            <stop offset="50%" stopColor={hairColor} />
            <stop offset="100%" stopColor={hairDark} />
          </linearGradient>
          
          <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={eyeDark} />
            <stop offset="60%" stopColor={eyesColor} />
            <stop offset="100%" stopColor={eyeLight} />
          </linearGradient>

          {/* Skin shading overlay */}
          <linearGradient id="skinShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </linearGradient>

          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        <g className="anim-breathe">
          {/* ═══════════════ BACK HAIR ═══════════════ */}
          <g className="anim-sway">
            {hairId === 'hair_long' && (
              <path d="M 160 150 C 120 250, 130 350, 150 380 C 250 390, 350 390, 350 380 C 370 350, 380 250, 340 150 Z" fill="url(#hairGrad)" />
            )}
            {hairId === 'hair_twintails' && (
              <>
                <path d="M 140 140 C 60 200, 40 320, 80 380 C 100 350, 120 280, 140 140" fill="url(#hairGrad)" />
                <path d="M 360 140 C 440 200, 460 320, 420 380 C 400 350, 380 280, 360 140" fill="url(#hairGrad)" />
              </>
            )}
            {hairId === 'hair_ponytail' && (
              <path d="M 250 120 C 180 180, 160 300, 220 380 C 260 360, 270 240, 250 120" fill="url(#hairGrad)" />
            )}
            {hairId === 'hair_curly' && (
              <circle cx="250" cy="180" r="110" fill="url(#hairGrad)" />
            )}
          </g>

          {/* ═══════════════ LEGS & BOTTOMS ═══════════════ */}
          <g>
            {/* Left Leg */}
            <line x1="215" y1="280" x2="215" y2="370" stroke={skinColor} strokeWidth="26" strokeLinecap="round" />
            {bottomsId === 'bottom_shorts' && <line x1="215" y1="280" x2="215" y2="320" stroke={bottomsColor} strokeWidth="28" strokeLinecap="round" />}
            {bottomsId === 'bottom_jeans' && <line x1="215" y1="280" x2="215" y2="360" stroke={bottomsColor} strokeWidth="28" strokeLinecap="round" />}
            {/* Shoe */}
            <path d="M 195 370 C 195 350, 235 350, 235 370 C 240 385, 190 385, 195 370 Z" fill="#1c1917" />
            <ellipse cx="205" cy="375" rx="5" ry="3" fill="#fff" opacity="0.2" transform="rotate(-15 205 375)" />

            {/* Right Leg */}
            <line x1="285" y1="280" x2="285" y2="370" stroke={skinColor} strokeWidth="26" strokeLinecap="round" />
            {bottomsId === 'bottom_shorts' && <line x1="285" y1="280" x2="285" y2="320" stroke={bottomsColor} strokeWidth="28" strokeLinecap="round" />}
            {bottomsId === 'bottom_jeans' && <line x1="285" y1="280" x2="285" y2="360" stroke={bottomsColor} strokeWidth="28" strokeLinecap="round" />}
            {/* Shoe */}
            <path d="M 265 370 C 265 350, 305 350, 305 370 C 310 385, 260 385, 265 370 Z" fill="#1c1917" />
            <ellipse cx="295" cy="375" rx="5" ry="3" fill="#fff" opacity="0.2" transform="rotate(15 295 375)" />
          </g>

          {/* ═══════════════ TORSO & ARMS ═══════════════ */}
          <g>
            {/* Back Skirt (if applicable) */}
            {bottomsId === 'bottom_skirt' && (
              <line x1="250" y1="290" x2="250" y2="330" stroke={bottomsDark} strokeWidth="120" strokeLinecap="round" />
            )}

            {/* Left Arm */}
            <line x1="200" y1="240" x2="175" y2="310" stroke={clothesId === 'clothes_casual' || clothesId === 'clothes_ninja' ? skinColor : clothesDark} strokeWidth="22" strokeLinecap="round" />
            {clothesId !== 'clothes_casual' && clothesId !== 'clothes_ninja' && <line x1="200" y1="240" x2="190" y2="270" stroke={clothesColor} strokeWidth="24" strokeLinecap="round" />}

            {/* Right Arm */}
            <line x1="300" y1="240" x2="325" y2="310" stroke={clothesId === 'clothes_casual' || clothesId === 'clothes_ninja' ? skinColor : clothesDark} strokeWidth="22" strokeLinecap="round" />
            {clothesId !== 'clothes_casual' && clothesId !== 'clothes_ninja' && <line x1="300" y1="240" x2="310" y2="270" stroke={clothesColor} strokeWidth="24" strokeLinecap="round" />}

            {/* Neck */}
            <rect x="235" y="200" width="30" height="30" rx="15" fill={skinDark} />

            {/* Front Skirt */}
            {bottomsId === 'bottom_skirt' && (
              <line x1="250" y1="290" x2="250" y2="320" stroke={bottomsColor} strokeWidth="120" strokeLinecap="round" filter="url(#softShadow)" />
            )}

            {/* Torso Base (The Thick Stick) */}
            <line x1="250" y1="250" x2="250" y2="290" stroke={clothesColor} strokeWidth="90" strokeLinecap="round" />
            
            {/* Clothes Details */}
            {clothesId === 'clothes_casual' && (
              <path d="M 230 225 L 270 225 L 250 240 Z" fill="#fff" opacity="0.8" />
            )}
            {clothesId === 'clothes_suit' && (
              <>
                <path d="M 230 215 L 270 215 L 250 245 Z" fill="#fff" />
                <path d="M 245 225 L 255 225 L 250 260 Z" fill="#ef4444" />
                <path d="M 215 230 L 250 260 L 240 300" fill="none" stroke={clothesDark} strokeWidth="4" />
                <path d="M 285 230 L 250 260 L 260 300" fill="none" stroke={clothesDark} strokeWidth="4" />
              </>
            )}
            {clothesId === 'clothes_hoodie' && (
              <>
                <circle cx="250" cy="225" r="45" fill={clothesDark} />
                <rect x="225" y="270" width="50" height="25" rx="10" fill={clothesDark} opacity="0.5" />
              </>
            )}
          </g>

          {/* ═══════════════ HEAD & FACE ═══════════════ */}
          <g className="anim-sway">
            
            {/* Base Skull / Face shape */}
            <ellipse cx="250" cy="140" rx="95" ry="85" fill={skinColor} filter="url(#softShadow)" />
            <ellipse cx="250" cy="140" rx="95" ry="85" fill="url(#skinShade)" />

            {/* Blush */}
            <ellipse cx="180" cy="165" rx="18" ry="10" fill="#f9a8d4" opacity="0.6" />
            <ellipse cx="320" cy="165" rx="18" ry="10" fill="#f9a8d4" opacity="0.6" />

            {/* Eyes */}
            <g className="anim-blink">
              {eyesId === 'eyes_normal' || eyesId === 'eyes_big' ? (
                <>
                  {/* Left Eye */}
                  <g transform="translate(180, 140)">
                    <ellipse cx="0" cy="0" rx="18" ry="22" fill="#fff" />
                    <ellipse cx="0" cy="2" rx="15" ry="18" fill="url(#eyeGrad)" />
                    <circle cx="0" cy="4" r="8" fill="#111" />
                    <circle cx="-5" cy="-6" r="6" fill="#fff" />
                    <circle cx="6" cy="8" r="3" fill="#fff" />
                    <path d="M -22 -15 Q 0 -30 22 -15" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                  </g>
                  {/* Right Eye */}
                  <g transform="translate(320, 140)">
                    <ellipse cx="0" cy="0" rx="18" ry="22" fill="#fff" />
                    <ellipse cx="0" cy="2" rx="15" ry="18" fill="url(#eyeGrad)" />
                    <circle cx="0" cy="4" r="8" fill="#111" />
                    <circle cx="5" cy="-6" r="6" fill="#fff" />
                    <circle cx="-6" cy="8" r="3" fill="#fff" />
                    <path d="M -22 -15 Q 0 -30 22 -15" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                  </g>
                </>
              ) : null}

              {eyesId === 'eyes_closed' && (
                <>
                  <path d="M 160 145 Q 180 160 200 145" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 300 145 Q 320 160 340 145" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                </>
              )}

              {eyesId === 'eyes_angry' && (
                <>
                  <path d="M 160 135 L 200 145" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="180" cy="150" r="12" fill={eyesColor} />
                  <path d="M 300 145 L 340 135" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="320" cy="150" r="12" fill={eyesColor} />
                </>
              )}

              {eyesId === 'eyes_star' && (
                <>
                  <polygon points="180,125 185,138 198,138 188,146 191,158 180,150 169,158 172,146 162,138 175,138" fill={eyesColor} stroke="#111" strokeWidth="2" />
                  <polygon points="320,125 325,138 338,138 328,146 331,158 320,150 309,158 312,146 302,138 315,138" fill={eyesColor} stroke="#111" strokeWidth="2" />
                </>
              )}
            </g>

            {/* Nose */}
            <circle cx="250" cy="165" r="3" fill={skinShadow} />

            {/* Mouth */}
            {mouthId === 'mouth_smile' && <path d="M 240 185 Q 250 195 260 185" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />}
            {mouthId === 'mouth_open' && <ellipse cx="250" cy="185" rx="8" ry="12" fill="#ef4444" stroke="#111" strokeWidth="2" />}
            {mouthId === 'mouth_sad' && <path d="M 240 190 Q 250 180 260 190" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />}
            {mouthId === 'mouth_cat' && <path d="M 240 185 Q 245 190 250 185 Q 255 190 260 185" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />}
            {mouthId === 'mouth_vampire' && (
              <g transform="translate(250, 185)">
                <path d="M -10 0 L 10 0" stroke="#111" strokeWidth="2" />
                <polygon points="-8,0 -4,8 0,0" fill="#fff" />
                <polygon points="8,0 4,8 0,0" fill="#fff" />
              </g>
            )}

            {/* Decals */}
            {decalsId === 'decal_scar' && <path d="M 170 120 L 190 160 M 175 135 L 185 130" stroke={decalsColor} strokeWidth="3" strokeLinecap="round" />}
            {decalsId === 'decal_bandage' && <rect x="220" y="155" width="60" height="15" rx="4" fill="#f5f5f5" transform="rotate(-5 250 160)" opacity="0.9" />}
            {decalsId === 'decal_freckles' && (
              <g fill="#b45309" opacity="0.6">
                <circle cx="170" cy="160" r="2" /><circle cx="180" cy="165" r="2.5" /><circle cx="190" cy="160" r="1.5" />
                <circle cx="330" cy="160" r="2" /><circle cx="320" cy="165" r="2.5" /><circle cx="310" cy="160" r="1.5" />
              </g>
            )}

            {/* ═══════════════ FRONT HAIR / BANGS ═══════════════ */}
            {hairId !== 'hair_bald' && (
              <g filter="url(#softShadow)">
                {/* Cute Anime Bangs (Spiky zig-zag base) */}
                {!['hair_mohawk'].includes(hairId) && (
                  <path d="M 155 120 A 95 95 0 0 1 345 120 Q 330 160 310 120 Q 280 170 250 120 Q 220 170 190 120 Q 170 160 155 120 Z" fill="url(#hairGrad)" />
                )}
                {/* Specific bang details */}
                {hairId === 'hair_short' && <path d="M 170 90 A 80 80 0 0 1 330 90 Q 340 140 320 120 Q 290 150 250 110 Q 210 150 180 120 Q 160 140 170 90 Z" fill="url(#hairGrad)" opacity="0.5" />}
                {hairId === 'hair_messy' && (
                  <>
                    <path d="M 180 60 L 160 30 M 250 50 L 260 20 M 320 70 L 350 40" stroke="url(#hairGrad)" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 190 120 Q 210 160 230 120 M 270 120 Q 290 160 310 120" fill="none" stroke="url(#hairGrad)" strokeWidth="12" strokeLinecap="round" />
                  </>
                )}
                {/* Sideburns / Frame */}
                {['hair_long', 'hair_twintails', 'hair_ponytail', 'hair_samurai'].includes(hairId) && (
                  <>
                    <path d="M 155 120 Q 160 180 140 200 Q 170 160 170 120" fill="url(#hairGrad)" />
                    <path d="M 345 120 Q 340 180 360 200 Q 330 160 330 120" fill="url(#hairGrad)" />
                  </>
                )}
              </g>
            )}

            {/* ═══════════════ ACCESSORIES ═══════════════ */}
            {accessoryId === 'acc_catears' && (
              <g fill="#fbcfe8" stroke="#f472b6" strokeWidth="2">
                <path d="M 160 70 L 180 20 L 210 60 Z" />
                <path d="M 340 70 L 320 20 L 290 60 Z" />
              </g>
            )}
            {accessoryId === 'acc_halo' && (
              <ellipse cx="250" cy="30" rx="60" ry="15" fill="none" stroke={accessoryColor} strokeWidth="6" opacity="0.8" filter="url(#softShadow)" />
            )}
            {accessoryId === 'acc_shades' && (
              <g fill="#111" opacity="0.9">
                <rect x="160" y="130" width="80" height="30" rx="5" />
                <rect x="260" y="130" width="80" height="30" rx="5" />
                <line x1="240" y1="140" x2="260" y2="140" stroke="#111" strokeWidth="4" />
                {/* Reflection */}
                <line x1="170" y1="135" x2="200" y2="155" stroke="#fff" strokeWidth="2" opacity="0.5" />
                <line x1="270" y1="135" x2="300" y2="155" stroke="#fff" strokeWidth="2" opacity="0.5" />
              </g>
            )}
            {accessoryId === 'acc_crown' && (
              <path d="M 210 60 L 220 20 L 250 40 L 280 20 L 290 60 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            )}

          </g> {/* End Head Group */}

        </g> {/* End Breathe Animation Group */}
      </svg>
    </div>
  )
}
