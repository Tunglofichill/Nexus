"use client"
import React from 'react';

export default function NexusHub() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a14] relative overflow-hidden">
      {/* 2.5D Isometric Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{
             backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
             transform: 'rotateX(60deg) rotateZ(-45deg) scale(2)',
             transformOrigin: 'center center'
           }}
      ></div>

      {/* The Central Platform */}
      <div className="relative z-10 w-96 h-96 flex items-center justify-center">
         {/* Placeholder for HouseRenderer */}
         <div className="w-full h-full bg-[#141525]/80 backdrop-blur-md rounded-3xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] flex items-center justify-center flex-col">
            <h2 className="text-2xl font-black text-indigo-400 mb-2">Nexus Hub</h2>
            <p className="text-gray-400 text-sm">Chibi Society OS</p>
         </div>
      </div>
    </div>
  );
}
