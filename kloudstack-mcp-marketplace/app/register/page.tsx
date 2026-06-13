'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      endpoint: fd.get('endpoint') as string,
      authHeader: fd.get('authHeader') as string || undefined,
      tags: (fd.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
    };

    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': (fd.get('apiKey') as string) ?? '',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const agent = await res.json() as { id: string };
      router.push(`/agents/${agent.id}`);
    } else {
      const { error: msg } = await res.json() as { error: string };
      setError(msg);
      setLoading(false);
    }
  }

  const field = (label: string, name: string, opts?: { type?: string; placeholder?: string; required?: boolean; hint?: string }) => (
    <div>
      <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">
        {label}{opts?.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        name={name}
        type={opts?.type ?? 'text'}
        placeholder={opts?.placeholder}
        required={opts?.required}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
      />
      {opts?.hint && <p className="text-xs text-gray-600 mt-1">{opts.hint}</p>}
    </div>
  );

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-6">Register Agent</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {field('Agent Name', 'name', { required: true, placeholder: 'e.g. deploy-agent' })}
        {field('Description', 'description', { placeholder: 'What does this agent do?' })}
        {field('MCP Endpoint URL', 'endpoint', {
          required: true,
          placeholder: 'https://your-agent.vercel.app/api/mcp',
          hint: 'Must accept POST requests with JSON-RPC 2.0 payload',
        })}
        {field('Auth Header', 'authHeader', {
          placeholder: 'Bearer sk-... (leave blank if no auth required)',
          hint: 'Sent as Authorization header when calling this agent',
        })}
        {field('Tags', 'tags', {
          placeholder: 'deploy, github, vercel (comma-separated)',
          hint: 'Used for agent discovery filtering',
        })}
        {field('Marketplace API Key', 'apiKey', {
          type: 'password',
          required: true,
          hint: 'Your MARKETPLACE_API_KEY from .env',
        })}

        {error && <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Registering…' : 'Register Agent'}
        </button>
      </form>
    </div>
  );
}
