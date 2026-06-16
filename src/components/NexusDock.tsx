"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Compass, User, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function NexusDock() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dockItems = [
    { icon: <Home size={24} />, label: 'My Hub', href: '/' },
    { icon: <Compass size={24} />, label: 'Discover', href: '/explore' },
    { icon: <MessageSquare size={24} />, label: 'District Chat', href: '/messages' },
    { icon: <User size={24} />, label: 'Profile', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-end gap-2 px-4 h-[72px] pb-2 bg-[#1a1b2e]/70 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative group/dock">
         {dockItems.map((item, index) => {
            const isActive = pathname ? (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')) : false;
            const isHovered = hoveredIndex === index;
            const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;
            
            let scale = 1;
            let translateY = 0;
            if (isHovered) { scale = 1.4; translateY = -12; }
            else if (isNeighbor) { scale = 1.15; translateY = -6; }

            return (
              <Link 
                key={index} 
                href={item.href}
                className="relative flex flex-col items-center justify-end"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                 {isHovered && (
                   <div className="absolute -top-12 px-3 py-1 bg-black/90 backdrop-blur border border-white/10 rounded-lg text-xs font-bold text-white shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in duration-200">
                      {item.label}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 border-b border-r border-white/10 rotate-45"></div>
                   </div>
                 )}

                 <div 
                   className="flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-200 ease-out origin-bottom shadow-lg"
                   style={{
                     width: 48,
                     height: 48,
                     transform: `scale(${scale}) translateY(${translateY}px)`,
                     backgroundColor: isActive ? 'rgba(99, 102, 241, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                     border: isActive ? '1px solid rgba(129, 140, 248, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
                     color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)'
                   }}
                 >
                    {item.icon}
                 </div>
                 
                 {isActive && (
                   <div className="absolute -bottom-1.5 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_5px_#818cf8]"></div>
                 )}
              </Link>
            )
         })}
      </div>
    </div>
  );
}
