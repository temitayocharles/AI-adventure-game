import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface ModerationItem {
  id: string;
  item_type: string;
  payload: any;
  status: string;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [queue, setQueue] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/moderation/queue?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data.items || []);
      }
    } catch (e) {
      console.error('Failed to fetch moderation queue', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  const handleReview = async (itemId: string, action: 'approve' | 'reject' | 'flag') => {
    try {
      const res = await fetch(`${apiBase}/api/v1/moderation/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, reviewAction: action })
      });
      if (res.ok) {
        setQueue(q => q.filter(item => item.id !== itemId));
      }
    } catch (e) {
      console.error('Review failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">🛡️ Moderation Admin</h1>
          <button
            onClick={fetchQueue}
            disabled={loading}
            className="flex items-center gap-2 bg-hero-purple px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          {(['pending', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                filter === f ? 'bg-hero-purple text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f === 'pending' ? '⏳ Pending' : '📋 All'}
            </button>
          ))}
        </div>

        {/* Queue Items */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={48} className="animate-spin text-hero-blue" />
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg">
            <p className="text-xl font-bold text-slate-300">✨ All clear! No items to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map(item => (
              <div key={item.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {item.item_type}
                    </p>
                    <p className="text-slate-300 text-sm mt-1">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'pending' ? 'bg-yellow-500 text-yellow-900' :
                    item.status === 'approved' ? 'bg-green-500 text-green-900' :
                    item.status === 'rejected' ? 'bg-red-500 text-red-900' :
                    'bg-blue-500 text-blue-900'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                {/* Payload Preview */}
                <div className="bg-slate-900 p-4 rounded mb-4 max-h-32 overflow-y-auto border border-slate-700">
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(item.payload, null, 2)}
                  </pre>
                </div>

                {/* Actions */}
                {item.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(item.id, 'approve')}
                      className="flex items-center gap-2 flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold transition-colors"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button
                      onClick={() => handleReview(item.id, 'reject')}
                      className="flex items-center gap-2 flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold transition-colors"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                    <button
                      onClick={() => handleReview(item.id, 'flag')}
                      className="flex items-center gap-2 flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold transition-colors"
                    >
                      <AlertCircle size={18} /> Flag
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
