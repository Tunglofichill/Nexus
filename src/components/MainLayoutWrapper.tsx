"use client"
import { usePathname } from 'next/navigation';
import NexusDock from './NexusDock';
import DraggableWindow from './DraggableWindow';
import NexusHub from './NexusHub';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith('/login') || false;
  const isOnboarding = pathname?.startsWith('/onboarding') || false;
  const isHome = pathname === '/';

  // Fullscreen pages — no Base, no Dock, no OS chrome
  if (isLogin || isOnboarding) {
     return <div className="w-full min-h-screen bg-[#0f101a]">{children}</div>;
  }

  let windowTitle = "Nexus Application";
  if (pathname?.startsWith('/explore')) windowTitle = "Khám Phá";
  else if (pathname?.startsWith('/messages')) windowTitle = "Trạm Liên Lạc";
  else if (pathname?.startsWith('/profile')) windowTitle = "Hồ Sơ";

  return (
    <>
      <div className="w-full h-screen overflow-hidden relative bg-[#111222]">
        {/* Layer 1: The Interactive 3D Room (Nexus Hub) */}
        <div className={`absolute inset-0 ${isHome ? 'z-10' : 'z-0 pointer-events-none'}`}>
           <NexusHub />
        </div>

        {/* Layer 2: Floating Application Windows */}
        <div className={`absolute inset-0 z-20 pointer-events-none ${isHome ? 'hidden' : ''}`}>
           <div className="pointer-events-auto">
              <DraggableWindow title={windowTitle}>
                 {children}
              </DraggableWindow>
           </div>
        </div>

        {/* Layer 3: System HUD & Dock */}
        <div className="absolute top-6 left-6 flex items-center gap-3 z-50 pointer-events-none">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/20 backdrop-blur">
              N
           </div>
           <div className="flex flex-col">
              <span className="text-white font-black tracking-widest text-lg drop-shadow-md leading-tight">NEXUS TV</span>
              <span className="text-indigo-300 text-[10px] font-bold tracking-widest uppercase">Operating System</span>
           </div>
        </div>

        <NexusDock />
      </div>
    </>
  );
}
