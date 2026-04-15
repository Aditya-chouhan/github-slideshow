import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEXUS AI — Enterprise AI Brain',
  description: '19 Claude Managed Agents across Sales, Marketing, Revenue Ops, Competitive Intel, and Finance — controlled by one Master Brain.',
};

const NAV_LINKS = [
  { href: '/brain', label: '🧠 Brain', color: 'hover:text-indigo-400' },
  { href: '/sales', label: 'Sales', color: 'hover:text-indigo-300' },
  { href: '/marketing', label: 'Marketing', color: 'hover:text-pink-300' },
  { href: '/revenue', label: 'Revenue', color: 'hover:text-green-300' },
  { href: '/competitive', label: 'Competitive', color: 'hover:text-purple-300' },
  { href: '/finance', label: 'Finance', color: 'hover:text-cyan-300' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0e1a]">
        <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#0a0e1a]/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">N</div>
              <span className="font-bold text-white tracking-tight">NEXUS AI</span>
              <span className="hidden sm:inline text-xs text-[#94a3b8] border border-[#1e293b] rounded-full px-2 py-0.5">Enterprise</span>
            </Link>
            <nav className="flex items-center gap-0.5 overflow-x-auto">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium text-[#94a3b8] ${link.color} hover:bg-[#111827] transition-colors whitespace-nowrap`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">19 agents online</span>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
