import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KloudStack MCP Marketplace',
  description: 'Agent-to-agent MCP orchestration platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 font-mono">
        <nav className="border-b border-gray-800 px-6 py-3 flex items-center gap-8">
          <span className="font-bold text-white tracking-tight">KloudStack MCP</span>
          <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</a>
          <a href="/agents" className="text-sm text-gray-400 hover:text-white transition-colors">Agents</a>
          <a href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">Register</a>
          <a href="/docs/api" className="text-sm text-gray-400 hover:text-white transition-colors ml-auto">API Docs</a>
        </nav>
        <main className="px-6 py-8 max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
