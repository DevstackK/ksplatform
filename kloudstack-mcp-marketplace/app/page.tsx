import { listAgents, getCallLogs } from '@/lib/registry';
import KeyGenerator from '@/app/components/KeyGenerator';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [agents, logs] = await Promise.all([
    listAgents(false),
    getCallLogs(undefined, 10),
  ]);

  const active = agents.filter(a => a.active).length;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const callsToday = logs.filter(l => new Date(l.calledAt) >= todayStart).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Agent-to-agent MCP orchestration platform</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Agents', value: agents.length },
          { label: 'Active Agents', value: active },
          { label: "Calls Today", value: callsToday },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">MCP Endpoint</h2>
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Live</span>
        </div>
        <code className="text-xs text-gray-400 block">
          {process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/mcp
        </code>
        <p className="text-xs text-gray-600 mt-2">Add this to your Claude Code .mcp.json — see <a href="/docs/api" className="text-blue-400 hover:underline">API Docs</a></p>
      </div>

      <KeyGenerator />

      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Calls</h2>
        {logs.length === 0 ? (
          <p className="text-gray-600 text-sm">No calls yet. Connect Claude Code to start orchestrating.</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm text-white">{log.agent.name}</span>
                  <span className="text-gray-600 mx-2">&#8594;</span>
                  <span className="text-sm text-blue-400">{log.tool}</span>
                </div>
                <div className="flex items-center gap-3">
                  {log.error
                    ? <span className="text-xs text-red-400">error</span>
                    : <span className="text-xs text-green-400">ok</span>}
                  {log.durationMs && <span className="text-xs text-gray-600">{log.durationMs}ms</span>}
                  <span className="text-xs text-gray-700">{new Date(log.calledAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
