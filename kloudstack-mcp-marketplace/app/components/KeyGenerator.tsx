'use client';

import { useState } from 'react';

export default function KeyGenerator() {
  const [key, setKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    setKey(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
    setCopied(false);
  }

  async function copy() {
    if (!key) return;
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300">Generate Marketplace API Key</h2>
        <button
          onClick={generate}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
        >
          Generate Key
        </button>
      </div>

      {key && (
        <div className="flex items-center gap-2">
          <code className="text-xs text-green-400 bg-gray-950 border border-gray-800 rounded px-3 py-2 flex-1 break-all">
            {key}
          </code>
          <button
            onClick={copy}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded transition-colors whitespace-nowrap"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-600">
        Share this with a team member to set as their{' '}
        <code className="text-gray-500">MARKETPLACE_API_KEY</code>. Each click generates a new unique key.
      </p>
    </div>
  );
}
