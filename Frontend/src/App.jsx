import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-purple-500 selection:text-white">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08),transparent_45%)] pointer-events-none"></div>

      <main className="relative z-10 max-w-2xl text-center space-y-8">
        {/* Glow Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          Valorant Edition
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Tournament Engine
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-lg mx-auto font-medium">
            Manage teams, brackets, and real-time Map & Agent drafting for your next Esports tournament.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <a
            href="#explore"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Launch Live Lobby
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 font-semibold transition-colors duration-200"
          >
            Documentation
          </a>
        </div>
      </main>

      <footer className="absolute bottom-6 text-slate-600 text-xs font-medium">
        Esports Tournament Assistance Engine © 2026
      </footer>
    </div>
  )
}

export default App
