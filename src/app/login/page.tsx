'use client'

import { login, signup } from './actions'
import { motion } from 'framer-motion'
import { Terminal, Lock, Mail, ArrowRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-nexus-window border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.15)] backdrop-blur-md relative overflow-hidden">
      {/* Decorative Cyberpunk Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nexus-accent to-transparent"></div>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-nexus-accent/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>

      <div className="flex items-center justify-center mb-8 gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
          <Terminal className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            NEXUS OS
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">System Login</p>
        </div>
      </div>

      <form className="flex flex-col gap-5 relative z-10">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-indigo-200 uppercase flex items-center gap-2">
            <Mail size={14} /> Identity (Email)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="px-4 py-3 bg-black/40 border border-indigo-500/30 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition-all text-white font-mono"
            placeholder="hacker@nexus.tv"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-indigo-200 uppercase flex items-center gap-2">
            <Lock size={14} /> Passcode (Password)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="px-4 py-3 bg-black/40 border border-indigo-500/30 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition-all text-white font-mono"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-mono text-center">
            [ERROR] {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <button
            formAction={login}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 overflow-hidden transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Access System <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          <button
            formAction={signup}
            className="w-full flex justify-center py-3 px-4 border border-indigo-500/30 rounded-xl text-sm font-bold uppercase tracking-widest text-indigo-300 bg-transparent hover:bg-indigo-500/10 hover:text-white hover:border-indigo-500/50 focus:outline-none transition-all"
          >
            Create Identity
          </button>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-nexus-bg relative overflow-hidden">
      {/* Background grid */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full flex justify-center px-4"
      >
        <Suspense fallback={<div className="text-indigo-400 font-mono animate-pulse">Loading System...</div>}>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
