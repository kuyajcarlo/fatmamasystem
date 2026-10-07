import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageCircle, RefreshCw, Search, User, Bot, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const fmtTime = (iso) => {
    try { return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return ''; }
};

export default function AdminChats() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const load = useCallback(async () => {
        const { data, error: err } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);
        if (err) {
            setError(err.message);
        } else {
            setError('');
            setRows(data || []);
            setLastUpdated(new Date());
        }
        setLoading(false);
    }, []);

    // live monitoring: refresh every 10 seconds
    useEffect(() => {
        load();
        const t = setInterval(load, 10000);
        return () => clearInterval(t);
    }, [load]);

    const conversations = useMemo(() => {
        const map = new Map();
        for (const r of rows) {
            if (!map.has(r.session_id)) map.set(r.session_id, []);
            map.get(r.session_id).push(r);
        }
        return [...map.entries()].map(([id, msgs]) => {
            const sorted = [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const named = sorted.find((m) => m.user_email);
            const lastUser = [...sorted].reverse().find((m) => m.sender === 'user');
            return {
                id,
                messages: sorted,
                who: named ? (named.user_name || named.user_email) : 'Guest visitor',
                email: named?.user_email || '',
                last: sorted[sorted.length - 1],
                preview: lastUser?.text || sorted[sorted.length - 1]?.text || '',
            };
        }).sort((a, b) => new Date(b.last.created_at) - new Date(a.last.created_at));
    }, [rows]);

    const filtered = conversations.filter((c) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return c.who.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.messages.some((m) => String(m.text).toLowerCase().includes(q));
    });

    const active = conversations.find((c) => c.id === selected) || null;
    const today = new Date().toDateString();
    const chatsToday = conversations.filter((c) => new Date(c.last.created_at).toDateString() === today).length;
    const questionsToday = rows.filter((r) => r.sender === 'user' && new Date(r.created_at).toDateString() === today).length;

    const deleteConversation = async (c) => {
        if (!window.confirm('Delete this whole conversation? This cannot be undone.')) return;
        const { error: err } = await supabase.from('chat_messages').delete().eq('session_id', c.id);
        if (err) { toast.error(`Could not delete: ${err.message}`); return; }
        setSelected(null);
        toast.success('Conversation deleted');
        load();
    };

    const missingTable = error && /chat_messages|relation|schema cache/i.test(error);

    return (<div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 flex items-center gap-2"><MessageCircle className="w-7 h-7 text-[#2C5F4F]"/> Chat Monitor</h1>
          <p className="text-gray-500">Everything customers ask the Fat Mama Assistant, updated every 10 seconds</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4"/> Refresh{lastUpdated ? ` · ${lastUpdated.toLocaleTimeString('en-PH', { timeStyle: 'short' })}` : ''}
        </button>
      </div>

      {missingTable && (<div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
          The <strong>chat_messages</strong> table does not exist yet. Open Supabase → SQL Editor, run the contents of <strong>chat_messages.sql</strong>, then press Refresh.
        </div>)}
      {error && !missingTable && (<div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">Could not load chats: {error}</div>)}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Conversations', conversations.length], ['Active today', chatsToday], ['Questions today', questionsToday]].map(([label, value]) => (<div key={label} className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-[#2C5F4F]">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or message" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]"/>
            </div>
          </div>
          <div className="max-h-[560px] overflow-y-auto divide-y">
            {loading ? (<p className="p-6 text-center text-gray-400 text-sm">Loading…</p>) : filtered.length === 0 ? (<p className="p-6 text-center text-gray-400 text-sm">No conversations yet.</p>) : filtered.map((c) => (<button key={c.id} onClick={() => setSelected(c.id)} className={`w-full text-left p-3 hover:bg-gray-50 ${selected === c.id ? 'bg-emerald-50' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-gray-800 truncate">{c.who}</span>
                  <span className="text-[11px] text-gray-400 shrink-0">{fmtTime(c.last.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{c.preview}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{c.messages.length} messages</p>
              </button>))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm flex flex-col min-h-[300px]">
          {!active ? (<div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-10">Select a conversation to read it</div>) : (<>
              <div className="p-4 border-b flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{active.who}</p>
                  <p className="text-xs text-gray-500 truncate">{active.email || 'Not signed in'} · started {fmtTime(active.messages[0].created_at)}</p>
                </div>
                <button onClick={() => deleteConversation(active)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete conversation"><Trash2 className="w-4 h-4"/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 max-h-[500px]">
                {active.messages.map((m) => (<div key={m.id} className={`flex gap-2 ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                    {m.sender === 'user' && <User className="w-5 h-5 text-gray-400 mt-1 shrink-0"/>}
                    <div className={`max-w-[78%] px-3 py-2 rounded-lg text-sm ${m.sender === 'user' ? 'bg-white border border-gray-200 text-gray-800' : 'bg-[#D4A843] text-white'}`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.sender === 'user' ? 'text-gray-400' : 'text-amber-100'}`}>{fmtTime(m.created_at)}</p>
                    </div>
                    {m.sender === 'bot' && <Bot className="w-5 h-5 text-[#D4A843] mt-1 shrink-0"/>}
                  </div>))}
              </div>
            </>)}
        </div>
      </div>
    </div>);
}
