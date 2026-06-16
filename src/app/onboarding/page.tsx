'use client'

import { useState } from 'react'
import { saveAvatarData } from './actions'
import { User, Sparkles, Check, Palette } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Chibi2D from '@/components/Chibi2D'

const AVATAR_OPTIONS = {
  skin: [
    { id: 'skin_light', name: 'Light', color: '#ffdbac', icon: '🖐🏻' },
    { id: 'skin_medium', name: 'Medium', color: '#e0ac69', icon: '🖐🏽' },
    { id: 'skin_dark', name: 'Dark', color: '#8d5524', icon: '🖐🏿' },
    { id: 'skin_cyber', name: 'Cyber Blue', color: '#6366f1', icon: '👽' },
    { id: 'skin_alien', name: 'Alien Green', color: '#4ade80', icon: '👾' },
  ],
  hair: [
    { id: 'hair_default', name: 'Capsule Hair', icon: '💇' },
  ],
  clothes: [
    { id: 'clothes_default', name: 'Capsule Suit', icon: '👕' },
  ],
  eyes: [
    { id: 'eyes_normal', name: 'Normal', icon: '👁️' },
    { id: 'eyes_big', name: 'Big Anime', icon: '🥺' },
    { id: 'eyes_closed', name: 'Closed', icon: '😌' },
    { id: 'eyes_angry', name: 'Angry', icon: '😠' },
    { id: 'eyes_star', name: 'Star', icon: '🤩' },
  ],
  mouth: [
    { id: 'mouth_smile', name: 'Smile', icon: '😊' },
    { id: 'mouth_open', name: 'Open', icon: '😃' },
    { id: 'mouth_sad', name: 'Sad', icon: '😢' },
    { id: 'mouth_cat', name: 'Cat :3', icon: '😸' },
    { id: 'mouth_vampire', name: 'Fangs', icon: '🧛' },
  ],
  accessory: [
    { id: 'acc_none', name: 'None', icon: '🚫' },
    { id: 'acc_catears', name: 'Cat Ears', icon: '🐱' },
    { id: 'acc_halo', name: 'Halo', icon: '😇' },
    { id: 'acc_shades', name: 'Shades', icon: '🕶️' },
    { id: 'acc_crown', name: 'Crown', icon: '👑' },
    { id: 'acc_sprout', name: 'Sprout', icon: '🌱' },
    { id: 'acc_horns', name: 'Demon Horns', icon: '😈' },
    { id: 'acc_flower', name: 'Flower', icon: '🌸' },
    { id: 'acc_cap', name: 'Baseball Cap', icon: '🧢' },
    { id: 'acc_beanie', name: 'Beanie', icon: '🪖' },
    { id: 'acc_headphones', name: 'Headphones', icon: '🎧' },
    { id: 'acc_wings', name: 'Angel Wings', icon: '🪽' },
    { id: 'acc_glasses', name: 'Glasses', icon: '👓' },
  ],
  decals: [
    { id: 'decal_none', name: 'None', icon: '🚫' },
    { id: 'decal_scar', name: 'Scar', icon: '⚡' },
    { id: 'decal_freckles', name: 'Freckles', icon: '😚' },
    { id: 'decal_bandaid', name: 'Bandaid', icon: '🩹' },
    { id: 'decal_blush', name: 'Heavy Blush', icon: '😳' },
    { id: 'decal_star', name: 'Star Sticker', icon: '⭐' },
    { id: 'decal_heart', name: 'Heart Sticker', icon: '💖' },
    { id: 'decal_tears', name: 'Crying Tears', icon: '😭' },
  ],
}

const HUGE_PALETTE = [
  '#000000', '#27272a', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#f4f4f5', '#ffffff',
  '#451a03', '#78350f', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#ffdbac',
  '#7f1d1d', '#b91c1c', '#ef4444', '#f87171', '#fca5a5', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#ec4899', '#f472b6', '#fbcfe8',
  '#4c1d95', '#6d28d9', '#8b5cf6', '#a78bfa', '#c4b5fd', '#d8b4fe', '#c084fc', '#a855f7', '#7e22ce',
  '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#0c4a6e',
  '#164e63', '#0e7490', '#06b6d4', '#22d3ee', '#67e8f9', '#5eead4', '#2dd4bf', '#14b8a6', '#0f766e', '#134e4a',
  '#064e3b', '#047857', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#14532d',
  '#7c2d12', '#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fef08a', '#fde047', '#eab308', '#ca8a04', '#854d0e', '#422006'
];

const COLOR_PALETTES: Record<string, string[]> = {
  hair: HUGE_PALETTE,
  clothes: HUGE_PALETTE,
  eyes: HUGE_PALETTE,
  accessory: HUGE_PALETTE,
  decals: HUGE_PALETTE
}

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof AVATAR_OPTIONS>('skin')
  
  const [avatarData, setAvatarData] = useState({
    skin: AVATAR_OPTIONS.skin[0].id,
    hair: AVATAR_OPTIONS.hair[0].id,
    hairColor: COLOR_PALETTES.hair[0],
    clothes: AVATAR_OPTIONS.clothes[0].id,
    clothesColor: COLOR_PALETTES.clothes[0],
    eyes: AVATAR_OPTIONS.eyes[0].id,
    eyesColor: COLOR_PALETTES.eyes[0],
    mouth: AVATAR_OPTIONS.mouth[0].id,
    accessory: AVATAR_OPTIONS.accessory[0].id,
    accessoryColor: COLOR_PALETTES.accessory[0],
    decals: AVATAR_OPTIONS.decals[0].id,
    decalsColor: COLOR_PALETTES.decals[0],
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveAvatarData(avatarData)
      toast.success('Avatar configured! Welcome to Nexus OS.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save avatar')
      setIsSaving(false)
    }
  }

  // Find active items for preview
  const currentSkin = AVATAR_OPTIONS.skin.find(s => s.id === avatarData.skin)

  const hasColorPalette = Object.keys(COLOR_PALETTES).includes(activeTab)

  return (
    <div className="w-full h-full flex p-6 gap-6 overflow-hidden bg-gradient-to-br from-sky-200 via-pink-100 to-purple-200 text-slate-800">
      
      {/* Left: Avatar Preview Panel */}
      <div className="w-2/5 flex flex-col bg-white/40 shadow-xl border-white/50 rounded-3xl border border-white/5 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        
        <div className="p-6 border-b border-slate-200/50 flex items-center gap-3 absolute z-20 w-full">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border-indigo-500/20 flex items-center justify-center border border-indigo-500/50 backdrop-blur-md">
            <User size={16} className="text-indigo-300" />
          </div>
          <h2 className="font-bold tracking-widest uppercase text-sm drop-shadow-md">Chibi Preview 2D</h2>
        </div>

        <div className="flex-1 w-full h-full relative cursor-move">
          {/* Cyberpunk grid background for preview */}
          <div className="absolute inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(99,102,241,0.5) 0%, transparent 70%)' }}></div>
          
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
            <Chibi2D 
              skinColor={currentSkin?.color || '#ffdbac'} 
              hairColor={avatarData.hairColor} 
              clothesColor={avatarData.clothesColor} 
              eyesId={avatarData.eyes}
              eyesColor={avatarData.eyesColor}
              mouthId={avatarData.mouth}
              accessoryId={avatarData.accessory}
              accessoryColor={avatarData.accessoryColor}
              decalsId={avatarData.decals}
              decalsColor={avatarData.decalsColor}
            />
          </div>
          
          <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-slate-500 tracking-widest uppercase pointer-events-none z-20">
            Live 2D Avatar
          </div>
        </div>
      </div>

      {/* Right: Controls Panel */}
      <div className="w-3/5 flex flex-col gap-6">
        <div className="bg-white/60 shadow-[0_10px_50px_rgba(0,0,0,0.1)] border-white/60 rounded-3xl p-6 border border-indigo-500/20 backdrop-blur-2xl flex-1 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Tab Navigation (Scrollable horizontally) */}
          <div className="flex gap-2 p-1.5 bg-white/50 rounded-2xl mb-6 border border-white/5 overflow-x-auto custom-scrollbar flex-nowrap shrink-0">
            {(Object.keys(AVATAR_OPTIONS) as Array<keyof typeof AVATAR_OPTIONS>).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-none px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 relative overflow-hidden ${
                  activeTab === tab 
                    ? 'text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                    : 'text-zinc-500 hover:text-indigo-300 hover:bg-white/5'
                }`}
              >
                {/* Active Tab Background */}
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-80"></div>
                )}
                <span className="relative z-10">{tab}</span>
                
                {/* Active Tab Bottom Glow */}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-white rounded-t-full shadow-[0_0_10px_white]"></div>
                )}
              </button>
            ))}
          </div>

          {/* Options Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {AVATAR_OPTIONS[activeTab].map((item) => {
                const isActive = avatarData[activeTab] === item.id;
                // If the tab is skin, we use item.color, otherwise we use the active color palette color
                const itemPreviewColor = activeTab === 'skin' 
                  ? (item as any).color 
                  : (hasColorPalette ? (avatarData as any)[`${activeTab}Color`] : '#3f3f46');
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setAvatarData({ ...avatarData, [activeTab]: item.id })}
                    className={`relative p-5 rounded-2xl text-left transition-all duration-300 overflow-hidden group flex flex-col items-center text-center ${
                      isActive 
                        ? 'bg-indigo-950/40 border border-indigo-500/50' 
                        : 'bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10'
                    }`}
                  >
                    {/* Background Glow */}
                    <div 
                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}
                      style={{ background: `radial-gradient(circle at center, ${itemPreviewColor}, transparent)` }}
                    ></div>

                    {isActive && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                    
                    {/* Visual representation of the item */}
                    <div className="w-14 h-14 rounded-full mb-4 overflow-hidden border-2 flex items-center justify-center relative shadow-lg shrink-0 transition-colors duration-300"
                         style={{ 
                           borderColor: isActive ? 'white' : 'rgba(255,255,255,0.1)',
                           backgroundColor: itemPreviewColor,
                           boxShadow: isActive ? `0 0 20px ${itemPreviewColor}40` : 'none'
                         }}>
                      
                      {/* Icon / Emoji */}
                      <span className="text-2xl relative z-10 drop-shadow-md">
                        {(item as any).icon}
                      </span>
                      
                      {/* Inner ring for depth */}
                      <div className="absolute inset-0 rounded-full border border-white/20 m-1"></div>
                      
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30"></div>
                    </div>
                    
                    <h3 className={`font-bold text-xs tracking-wide w-full leading-tight ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {item.name}
                    </h3>
                    
                    {/* Cyberpunk corner accent */}
                    {isActive && (
                      <>
                        <div className="absolute bottom-0 left-0 w-8 h-1" style={{ backgroundColor: itemPreviewColor, boxShadow: `0 0 10px ${itemPreviewColor}` }}></div>
                        <div className="absolute bottom-0 left-0 w-1 h-8" style={{ backgroundColor: itemPreviewColor, boxShadow: `0 0 10px ${itemPreviewColor}` }}></div>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color Palette (Only shows if the active tab has a color palette) */}
          {hasColorPalette && (
            <div className="mt-auto pt-4 border-t border-slate-200/50 shrink-0">
              <div className="flex items-center gap-2 mb-3 text-zinc-400">
                <Palette size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Select Color</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {COLOR_PALETTES[activeTab].map((color) => {
                  const isActiveColor = (avatarData as any)[`${activeTab}Color`] === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setAvatarData({ ...avatarData, [`${activeTab}Color`]: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        isActiveColor ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: color,
                        boxShadow: isActiveColor ? `0 0 15px ${color}` : 'none'
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-black tracking-[0.2em] uppercase text-sm shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all flex justify-center items-center gap-3 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200/50 shrink-0"
        >
          <span className="relative z-10 flex items-center gap-2 text-white">
            <Sparkles size={18} className="animate-pulse" />
            {isSaving ? 'Deploying...' : 'Deploy Avatar to Nexus'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </button>
      </div>

    </div>
  )
}
