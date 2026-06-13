import { notFound } from 'next/navigation';
import { getAgent, getCallLogs } from '@/lib/registry';
import { fetchRemoteTools } from '@/lib/mcp';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params;
  const [agent, logs, tools] = await Promise.all([
    getAgent(id),
    getCallLogs(id, 20),
    getAgent(id).then(a => a ? fetchRemoteTools(a.endpoint, a.authHeader) : []),
  ]);

  if (!agent) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
            <span className={`text-xs px-2 py-1 rounded ${agent.active ? 'text-green-400 bg-green-400/10' : 'text-gray-500 bg-gray-800'}`}>
              {agent.active ? 'active' : 'inactive'}
            </span>
          </div>
          {agent.description && <p className="text-gray-400 mt-1">{agent.description}</p>}
        </div>
        <a href="/agents" className="text-sm text-gray-500 hover:text-white transition-colors">← Back</a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Endpoint</p>
          <code className="text-xs text-gray-300 break-all">{agent.endpoint}</code>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Tags</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {agent.tags.length === 0
              ? <span className="text-xs text-gray-600">none</span>
              : agent.tags.map(t => <span key={t} className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{t}</span>)
            }
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">
          Tools ({tools.length})
          {tools.length === 0 && <span className="text-xs text-gray-600 ml-2 font-normal">— could not reach agent endpoint</span>}
        </h2>
        <div className="space-y-2">
          {tools.map(tool => (
            <div key={tool.name} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-400">{tool.name}</p>
              <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
              {Object.keys(tool.inputSchema.properties ?? {}).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(tool.inputSchema.properties).map(([key, val]) => (
                    <span key={key} className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">
                      {key}: {(val as { type: string }).type}
                      {tool.inputSchema.required?.includes(key) ? '' : '?'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Calls</h2>
        {logs.length === 0 ? (
          <p className="text-gray-600 text-sm">No calls yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-blue-400">{log.tool}</span>
                <div className="flex items-center gap-3">
                  {log.error
                    ? <span className="text-xs text-red-400" title={log.error}>error</span>
                    : <span className="text-xs text-green-400">ok</span>}
                  {log.durationMs && <span className="text-xs text-gray-600">{log.durationMs}ms</span>}
                  <span className="text-xs text-gray-700">{new Date(log.calledAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
