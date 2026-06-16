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
  ]
}

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<'skin' | 'hair' | 'clothes'>('skin')
  const [avatarData, setAvatarData] = useState({
    skin: AVATAR_OPTIONS.skin[0].id,
    hair: AVATAR_OPTIONS.hair[0].id,
    clothes: AVATAR_OPTIONS.clothes[0].id
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
            />
          </div>
          
          <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-white/40 tracking-widest uppercase pointer-events-none z-20">
            Drag to Rotate • Scroll to Zoom
          </div>
        </div>
      </div>

      {/* Right: Controls Panel */}
      <div className="w-1/2 flex flex-col gap-6">
        <div className="bg-black/40 rounded-3xl p-6 border border-white/5 backdrop-blur-xl flex-1 flex flex-col">
          <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-6">
            {(['skin', 'hair', 'clothes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-2 gap-4">
              {AVATAR_OPTIONS[activeTab].map((item) => {
                const isActive = avatarData[activeTab] === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAvatarData({ ...avatarData, [activeTab]: item.id })}
                    className={`relative p-4 rounded-2xl border text-left transition-all overflow-hidden group ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-500/10' 
                        : 'border-white/10 bg-black/40 hover:border-white/30'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    
                    {/* Visual representation of the item */}
                    <div className="w-12 h-12 rounded-xl mb-3 overflow-hidden border border-white/10 flex items-center justify-center bg-black/50">
                      <div className={`w-full h-full ${item.displayBg}`}></div>
                    </div>
                    
                    <h3 className={`font-bold text-sm ${isActive ? 'text-indigo-300' : 'text-zinc-300'}`}>
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1">ID: {item.id.split('_')[1]}</p>
                    
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
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
          className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-black tracking-widest uppercase text-sm shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all flex justify-center items-center gap-3 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles size={18} />
            {isSaving ? 'Saving...' : 'Deploy Avatar to Nexus'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </button>
      </div>

    </div>
  )
}
