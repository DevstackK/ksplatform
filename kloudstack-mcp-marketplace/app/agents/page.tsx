import { listAgents } from '@/lib/registry';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const agents = await listAgents(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Agents</h1>
        <a href="/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
          + Register Agent
        </a>
      </div>

      {agents.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500">No agents registered yet.</p>
          <a href="/register" className="text-blue-400 hover:underline text-sm mt-2 block">Register your first agent</a>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map(agent => (
            <a key={agent.id} href={`/agents/${agent.id}`} className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg p-4 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{agent.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${agent.active ? 'text-green-400 bg-green-400/10' : 'text-gray-500 bg-gray-800'}`}>
                      {agent.active ? 'active' : 'inactive'}
                    </span>
                  </div>
                  {agent.description && <p className="text-sm text-gray-400 mt-1">{agent.description}</p>}
                  <p className="text-xs text-gray-600 mt-1 truncate max-w-lg">{agent.endpoint}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end ml-4">
                  {agent.tags.map(tag => (
                    <span key={tag} className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
