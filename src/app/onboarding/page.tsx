'use client'

import { useState } from 'react'
import { saveAvatarData } from './actions'
import { User, Sparkles, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Chibi3D from '@/components/Chibi3D'

const AVATAR_OPTIONS = {
  skin: [
    { id: 'skin_light', name: 'Light', color: '#ffdbac', displayBg: 'bg-[#ffdbac]' },
    { id: 'skin_medium', name: 'Medium', color: '#e0ac69', displayBg: 'bg-[#e0ac69]' },
    { id: 'skin_dark', name: 'Dark', color: '#8d5524', displayBg: 'bg-[#8d5524]' },
    { id: 'skin_cyber', name: 'Cyber Blue', color: '#6366f1', displayBg: 'bg-[#6366f1]' },
  ],
  hair: [
    { id: 'hair_short', name: 'Short Spiky', color: '#27272a', displayBg: 'bg-zinc-800' },
    { id: 'hair_long', name: 'Long Flowing', color: '#9333ea', displayBg: 'bg-purple-600' },
    { id: 'hair_neon', name: 'Neon Cyber', color: '#22d3ee', displayBg: 'bg-cyan-400' },
    { id: 'hair_bald', name: 'Clean', color: 'transparent', displayBg: 'bg-transparent border border-white/20' },
  ],
  clothes: [
    { id: 'clothes_casual', name: 'Streetwear', color: '#f97316', displayBg: 'bg-orange-500' },
    { id: 'clothes_suit', name: 'Corpo Suit', color: '#18181b', displayBg: 'bg-zinc-900 border border-white/10' },
    { id: 'clothes_tech', name: 'Techwear', color: '#4f46e5', displayBg: 'bg-indigo-600' },
    { id: 'clothes_robe', name: 'Hacker Robe', color: '#22c55e', displayBg: 'bg-green-500' },
  ],
  accessory: [
    { id: 'acc_none', name: 'None', color: 'transparent', displayBg: 'bg-transparent border border-white/20' },
    { id: 'acc_visor', name: 'Cyber Visor', color: '#ec4899', displayBg: 'bg-pink-500' },
    { id: 'acc_catears', name: 'Cat Ears', color: '#ffffff', displayBg: 'bg-white' },
    { id: 'acc_halo', name: 'Neon Halo', color: '#eab308', displayBg: 'bg-yellow-500' },
    { id: 'acc_headphones', name: 'Headphones', color: '#22c55e', displayBg: 'bg-green-500' },
  ]
}

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<'skin' | 'hair' | 'clothes' | 'accessory'>('skin')
  const [avatarData, setAvatarData] = useState({
    skin: AVATAR_OPTIONS.skin[0].id,
    hair: AVATAR_OPTIONS.hair[0].id,
    clothes: AVATAR_OPTIONS.clothes[0].id,
    accessory: AVATAR_OPTIONS.accessory[0].id
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
  const currentHair = AVATAR_OPTIONS.hair.find(h => h.id === avatarData.hair)
  const currentClothes = AVATAR_OPTIONS.clothes.find(c => c.id === avatarData.clothes)
  const currentAccessory = AVATAR_OPTIONS.accessory.find(a => a.id === avatarData.accessory)

  return (
    <div className="w-full h-full flex p-6 gap-6 overflow-hidden bg-black/20 text-white">
      
      {/* Left: Avatar Preview Panel */}
      <div className="w-1/2 flex flex-col bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        
        <div className="p-6 border-b border-white/10 flex items-center gap-3 absolute z-20 w-full">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50 backdrop-blur-md">
            <User size={16} className="text-indigo-300" />
          </div>
          <h2 className="font-bold tracking-widest uppercase text-sm drop-shadow-md">Chibi Preview 3D</h2>
        </div>

        <div className="flex-1 w-full h-full relative cursor-move">
          {/* Cyberpunk grid background for preview */}
          <div className="absolute inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(99,102,241,0.5) 0%, transparent 70%)' }}></div>
          
          <div className="absolute inset-0 z-10">
            <Chibi3D 
              skinColor={currentSkin?.color || '#ffdbac'} 
              hairColor={currentHair?.color || '#27272a'} 
              clothesColor={currentClothes?.color || '#f97316'} 
              hairId={avatarData.hair}
              accessoryId={avatarData.accessory}
              accessoryColor={currentAccessory?.color || '#ffffff'}
            />
          </div>
          
          <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-white/40 tracking-widest uppercase pointer-events-none z-20">
            Drag to Rotate • Scroll to Zoom
          </div>
        </div>
      </div>

      {/* Right: Controls Panel */}
      <div className="w-1/2 flex flex-col gap-6">
        <div className="bg-black/60 rounded-3xl p-6 border border-indigo-500/20 backdrop-blur-2xl flex-1 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          {/* Tab Navigation */}
          <div className="flex gap-2 p-1.5 bg-black/50 rounded-2xl mb-6 border border-white/5">
            {(['skin', 'hair', 'clothes', 'accessory'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 relative overflow-hidden ${
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
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-2 gap-4">
              {AVATAR_OPTIONS[activeTab].map((item) => {
                const isActive = avatarData[activeTab] === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setAvatarData({ ...avatarData, [activeTab]: item.id })}
                    className={`relative p-5 rounded-2xl text-left transition-all duration-300 overflow-hidden group ${
                      isActive 
                        ? 'bg-indigo-950/40 border border-indigo-500/50' 
                        : 'bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10'
                    }`}
                  >
                    {/* Background Glow based on item color */}
                    <div 
                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}
                      style={{ background: `radial-gradient(circle at top right, ${item.color}, transparent)` }}
                    ></div>

                    {isActive && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                    
                    {/* Visual representation of the item */}
                    <div className="w-14 h-14 rounded-full mb-4 overflow-hidden border-2 flex items-center justify-center relative shadow-lg"
                         style={{ 
                           borderColor: isActive ? item.color : 'rgba(255,255,255,0.1)',
                           boxShadow: isActive ? `0 0 20px ${item.color}40` : 'none'
                         }}>
                      
                      {/* Color Swatch */}
                      <div className={`w-full h-full ${item.displayBg} absolute inset-0`}></div>
                      
                      {/* Inner ring for depth */}
                      <div className="absolute inset-0 rounded-full border border-white/20 m-1"></div>
                      
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30"></div>
                    </div>
                    
                    <h3 className={`font-bold text-sm tracking-wide ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                        {item.id.split('_')[1]}
                      </p>
                    </div>
                    
                    {/* Cyberpunk corner accent */}
                    {isActive && (
                      <>
                        <div className="absolute bottom-0 left-0 w-8 h-1" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                        <div className="absolute bottom-0 left-0 w-1 h-8" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-black tracking-[0.2em] uppercase text-sm shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all flex justify-center items-center gap-3 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
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
