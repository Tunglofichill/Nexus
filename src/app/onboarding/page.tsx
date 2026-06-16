'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { saveAvatarData } from './actions'
import { User, Sparkles, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

const AVATAR_OPTIONS = {
  skin: [
    { id: 'skin_light', name: 'Light', color: '#ffdbac' },
    { id: 'skin_medium', name: 'Medium', color: '#e0ac69' },
    { id: 'skin_dark', name: 'Dark', color: '#8d5524' },
    { id: 'skin_cyber', name: 'Cyber Blue', color: '#6366f1' },
  ],
  hair: [
    { id: 'hair_short', name: 'Short Spiky', bg: 'bg-zinc-800' },
    { id: 'hair_long', name: 'Long Flowing', bg: 'bg-purple-600' },
    { id: 'hair_neon', name: 'Neon Cyber', bg: 'bg-cyan-400' },
    { id: 'hair_bald', name: 'Clean', bg: 'bg-transparent border border-white/20' },
  ],
  clothes: [
    { id: 'clothes_casual', name: 'Streetwear', bg: 'bg-orange-500' },
    { id: 'clothes_suit', name: 'Corpo Suit', bg: 'bg-zinc-900 border border-white/10' },
    { id: 'clothes_tech', name: 'Techwear', bg: 'bg-indigo-600' },
    { id: 'clothes_robe', name: 'Hacker Robe', bg: 'bg-green-500' },
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
        
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
            <User size={16} className="text-indigo-300" />
          </div>
          <h2 className="font-bold tracking-widest uppercase text-sm">Chibi Preview</h2>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          {/* Cyberpunk grid background for preview */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(99,102,241,0.5) 0%, transparent 70%)' }}></div>
          
          {/* Mock Chibi Character Assembly */}
          <motion.div 
            className="relative w-64 h-96 flex flex-col items-center justify-end pb-10"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            {/* Hair preview (Back) */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={"hair-back-" + currentHair?.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className={`absolute top-10 w-40 h-40 rounded-full ${currentHair?.bg} blur-[2px] opacity-80`}
              ></motion.div>
            </AnimatePresence>

            {/* Head/Skin preview */}
            <motion.div 
              className="w-32 h-32 rounded-[40px] z-10 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-black/20"
              animate={{ backgroundColor: currentSkin?.color }}
              transition={{ duration: 0.3 }}
            >
              {/* Eyes */}
              <div className="absolute top-14 left-6 w-4 h-6 bg-black rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] overflow-hidden">
                 <div className="w-2 h-2 bg-white rounded-full absolute top-1 right-1"></div>
              </div>
              <div className="absolute top-14 right-6 w-4 h-6 bg-black rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] overflow-hidden">
                 <div className="w-2 h-2 bg-white rounded-full absolute top-1 right-1"></div>
              </div>
            </motion.div>

            {/* Hair preview (Front) */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={"hair-front-" + currentHair?.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute top-6 w-36 h-16 rounded-t-[40px] z-20 ${currentHair?.bg}`}
              ></motion.div>
            </AnimatePresence>

            {/* Body/Clothes preview */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={"clothes-" + currentClothes?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`w-28 h-32 -mt-4 rounded-3xl z-0 relative overflow-hidden shadow-xl ${currentClothes?.bg}`}
              >
                 <div className="w-full h-1/2 bg-black/20 absolute top-0"></div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
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
                      {activeTab === 'skin' && (
                        <div className="w-full h-full" style={{ backgroundColor: (item as any).color }}></div>
                      )}
                      {(activeTab === 'hair' || activeTab === 'clothes') && (
                        <div className={`w-full h-full ${(item as any).bg}`}></div>
                      )}
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
