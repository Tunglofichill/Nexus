"use client"
import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function DraggableWindow({ children, title = "Application" }: { children: React.ReactNode, title?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [pathname]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const closeWindow = () => {
    router.push('/');
  };

  return (
    <div 
      ref={windowRef}
      className="fixed z-40 flex flex-col bg-[#141525]/85 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden"
      style={{
        width: '900px',
        height: '600px',
        left: '50%',
        top: '45%',
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      <div 
        className="h-12 bg-white/5 border-b border-white/5 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 w-20">
           <button onClick={closeWindow} className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center group hover:bg-[#ff5f56] transition-colors">
              <X size={10} className="text-black/60 opacity-0 group-hover:opacity-100" />
           </button>
           <button className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center group hover:bg-[#ffbd2e] transition-colors">
              <Minus size={10} className="text-black/60 opacity-0 group-hover:opacity-100" />
           </button>
           <button className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center group hover:bg-[#27c93f] transition-colors">
              <Square size={8} className="text-black/60 opacity-0 group-hover:opacity-100" />
           </button>
        </div>
        
        <div className="text-xs font-bold tracking-wider text-white uppercase pointer-events-none drop-shadow-md">
           {title}
        </div>
        
        <div className="w-20"></div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-transparent p-6">
         {children}
      </div>
    </div>
  );
}
