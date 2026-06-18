'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { createClient } from '@/utils/supabase/client'
import { Home, Building2, Castle, MapPin, Coins, Ruler, Sparkles } from 'lucide-react'

const BASE_OPTIONS = [
  {
    id: 'studio',
    name: 'Studio Apartment',
    nameVi: 'Chung Cư Mini',
    icon: '🏢',
    description: 'Căn hộ nhỏ gọn ngay trung tâm thành phố. Tiện lợi, sầm uất, dễ gặp gỡ bạn bè!',
    roomW: 6, roomD: 5,
    startCoins: 1500,
    color: '#818cf8',
    gradient: 'from-indigo-600 to-violet-600',
    bgGlow: 'rgba(99, 102, 241, 0.15)',
    pros: ['Trung tâm thành phố', 'Dễ gặp hàng xóm', 'Trang trí nhanh'],
    cons: ['Diện tích nhỏ'],
  },
  {
    id: 'house',
    name: 'Suburban House',
    nameVi: 'Nhà Phố',
    icon: '🏠',
    description: 'Ngôi nhà ấm cúng trong khu dân cư yên bình. Cân bằng giữa không gian và vị trí.',
    roomW: 8, roomD: 6,
    startCoins: 1000,
    color: '#34d399',
    gradient: 'from-emerald-600 to-teal-600',
    bgGlow: 'rgba(52, 211, 153, 0.15)',
    pros: ['Diện tích vừa đủ', 'Khu yên tĩnh', 'Cân bằng tốt'],
    cons: ['Hơi xa trung tâm'],
  },
  {
    id: 'mansion',
    name: 'Country Estate',
    nameVi: 'Biệt Thự Ngoại Ô',
    icon: '🏡',
    description: 'Biệt thự rộng rãi ngoại thành. Không gian thoải mái nhưng xa bạn bè hơn.',
    roomW: 12, roomD: 8,
    startCoins: 500,
    color: '#fb923c',
    gradient: 'from-orange-500 to-amber-600',
    bgGlow: 'rgba(251, 146, 60, 0.15)',
    pros: ['Siêu rộng rãi', 'View đẹp', 'Sáng tạo tự do'],
    cons: ['Xa thành phố', 'Ít tiền hơn'],
  },
]

function MiniGrid({ w, d, color }: { w: number; d: number; color: string }) {
  const cells = []
  for (let r = 0; r < d; r++) {
    for (let c = 0; c < w; c++) {
      cells.push(
        <div
          key={`${r}-${c}`}
          className="border border-white/10 rounded-[2px]"
          style={{ backgroundColor: `${color}15` }}
        />
      )
    }
  }
  return (
    <div
      className="grid gap-[1px] max-w-[140px] mx-auto"
      style={{ gridTemplateColumns: `repeat(${w}, 1fr)`, aspectRatio: `${w}/${d}` }}
    >
      {cells}
    </div>
  )
}

export default function BaseSelectPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const option = BASE_OPTIONS.find(o => o.id === selected)!
      const supabase = createClient()
      // Assign floor for apartment types (first come first served simulation)
      const floor = option.id === 'studio' ? Math.floor(Math.random() * 20) + 1 : 0
      await supabase.auth.updateUser({
        data: {
          base_type: option.id,
          base_room_w: option.roomW,
          base_room_d: option.roomD,
          base_floor: floor,
          coins: option.startCoins,
          base_data: [],
        }
      })
      toast.success(`Chào mừng đến ${option.nameVi}!`)
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi rồi!')
      setSaving(false)
    }
  }

  const selectedOption = BASE_OPTIONS.find(o => o.id === selected)

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-6 relative z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300 tracking-widest uppercase">Bước 2/2</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Chọn <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Căn Nhà</span> Đầu Tiên
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Mỗi căn nhà có ưu và nhược điểm riêng. Bạn có thể nâng cấp hoặc chuyển nhà sau này!
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 flex items-center justify-center gap-5 px-8 pb-6">
        {BASE_OPTIONS.map((opt) => {
          const isSelected = selected === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`relative flex flex-col rounded-2xl border-2 transition-all duration-300 overflow-hidden w-[280px] h-[420px] group ${
                isSelected
                  ? `border-[${opt.color}] shadow-2xl scale-[1.03]`
                  : 'border-slate-700/50 hover:border-slate-600 hover:scale-[1.01]'
              }`}
              style={{
                borderColor: isSelected ? opt.color : undefined,
                boxShadow: isSelected ? `0 0 40px ${opt.bgGlow}, 0 0 80px ${opt.bgGlow}` : undefined,
              }}
            >
              {/* Glow bg */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at center, ${opt.bgGlow}, transparent 70%)` }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-5">
                {/* Icon + Name */}
                <div className="text-center mb-4">
                  <span className="text-5xl block mb-3">{opt.icon}</span>
                  <h3 className="text-lg font-black">{opt.nameVi}</h3>
                  <p className="text-xs text-slate-400 mt-1">{opt.name}</p>
                </div>

                {/* Mini Grid Preview */}
                <div className="mb-4">
                  <MiniGrid w={Math.min(opt.roomW, 8)} d={Math.min(opt.roomD, 8)} color={opt.color} />
                </div>

                {/* Stats */}
                <div className="flex justify-between text-xs mb-3 px-2">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Coins size={13} />
                    <span className="font-bold">{opt.startCoins}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Ruler size={13} />
                    <span className="font-bold">{opt.roomW}×{opt.roomD}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">{opt.description}</p>

                {/* Pros/Cons */}
                <div className="space-y-1">
                  {opt.pros.map(p => (
                    <div key={p} className="text-xs flex items-center gap-1.5">
                      <span className="text-green-400">✓</span>
                      <span className="text-slate-300">{p}</span>
                    </div>
                  ))}
                  {opt.cons.map(c => (
                    <div key={c} className="text-xs flex items-center gap-1.5">
                      <span className="text-red-400">✗</span>
                      <span className="text-slate-400">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected badge */}
              {isSelected && (
                <div className={`absolute top-3 right-3 bg-gradient-to-r ${opt.gradient} text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg`}>
                  Đã chọn
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom Action */}
      <div className="pb-8 flex flex-col items-center gap-3">
        <button
          onClick={handleConfirm}
          disabled={!selected || saving}
          className={`px-10 py-3 rounded-2xl font-black text-lg tracking-wide transition-all duration-300 ${
            selected
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {saving ? 'Đang dọn nhà...' : selected ? `Chuyển đến ${selectedOption?.nameVi}` : 'Chọn một căn nhà'}
        </button>
        <p className="text-[11px] text-slate-500">
          💡 Bạn có thể nâng cấp hoặc đổi nhà bất cứ lúc nào
        </p>
      </div>
    </div>
  )
}
