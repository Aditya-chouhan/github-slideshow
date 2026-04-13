import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEXUS AI — Revenue Operating System',
  description: '10 AI agents powered by Claude claude-opus-4-6. Research prospects, write outreach, plan campaigns — in 90 seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0e1a]">
        <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#0a0e1a]/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">N</div>
              <span className="font-bold text-white tracking-tight">NEXUS AI</span>
              <span className="hidden sm:inline text-xs text-[#94a3b8] border border-[#1e293b] rounded-full px-2 py-0.5">Beta</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/sales" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#111827] transition-colors">Sales</Link>
              <Link href="/marketing" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-[#111827] transition-colors">Marketing</Link>
            </nav>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">10 agents online</span>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
