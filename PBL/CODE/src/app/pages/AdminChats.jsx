import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageCircle, RefreshCw, Search, User, Bot, Trash2, LayoutGrid, List, X } from 'lucide-react';
import { toast } from 'sonner';

const fmtTime = (iso) => {
    try { return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return ''; }
};
const isLive = (iso) => Date.now() - new Date(iso).getTime() < 2 * 60 * 1000;

function Bubble({ m }) {
    return (<div className={`flex gap-2 ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
      {m.sender === 'user' && <User className="w-4 h-4 text-gray-400 mt-1 shrink-0"/>}
      <div className={`max-w-[82%] px-3 py-1.5 rounded-lg text-sm ${m.sender === 'user' ? 'bg-white border border-gray-200 text-gray-800' : 'bg-[#D4A843] text-white'}`}>
        <p className="whitespace-pre-wrap break-words">{m.text}</p>
        <p className={`text-[10px] mt-0.5 ${m.sender === 'user' ? 'text-gray-400' : 'text-amber-100'}`}>{fmtTime(m.created_at)}</p>
      </div>
      {m.sender === 'bot' && <Bot className="w-4 h-4 text-[#D4A843] mt-1 shrink-0"/>}
    </div>);
}

export default function AdminChats() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [view, setView] = useState('wall'); // 'wall' = every customer at once, 'inbox' = list + one thread
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const load = useCallback(async () => {
        const { data, error: err } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(2000);
        if (err) setError(err.message);
        else { setError(''); setRows(data || []); setLastUpdated(new Date()); }
        setLoading(false);
    }, []);

    // live monitoring of ALL customers: refresh every 8 seconds
    useEffect(() => {
        load();
        const t = setInterval(load, 8000);
        return () => clearInterval(t);
    }, [load]);

    // one entry per customer (signed-in customers by email, visitors by chat session)
    const customers = useMemo(() => {
        const map = new Map();
        for (const r of rows) {
            const key = r.user_email ? `email:${r.user_email.toLowerCase()}` : `guest:${r.session_id}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(r);
        }
        return [...map.entries()].map(([key, msgs], idx) => {
            const sorted = [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const named = sorted.find((m) => m.user_email);
            return {
                key,
                messages: sorted,
                sessions: new Set(sorted.map((m) => m.session_id)).size,
                who: named ? (named.user_name || named.user_email) : 'Guest visitor',
                email: named?.user_email || '',
                guest: !named,
                last: sorted[sorted.length - 1],
            };
        }).sort((a, b) => new Date(b.last.created_at) - new Date(a.last.created_at));
    }, [rows]);

    const filtered = customers.filter((c) => {
        const q = search.trim().toLowerCase();
        return !q || c.who.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.messages.some((m) => String(m.text).toLowerCase().includes(q));
    });

    const active = customers.find((c) => c.key === selected) || null;
    const today = new Date().toDateString();
    const stats = [
        ['Customers who chatted', customers.length],
        ['Active in last 2 min', customers.filter((c) => isLive(c.last.created_at)).length],
        ['Questions today', rows.filter((r) => r.sender === 'user' && new Date(r.created_at).toDateString() === today).length],
    ];

    const deleteCustomerChats = async (c) => {
        if (!window.confirm(`Delete all chats of ${c.who}? This cannot be undone.`)) return;
        const ids = [...new Set(c.messages.map((m) => m.session_id))];
        const { error: err } = await supabase.from('chat_messages').delete().in('session_id', ids);
        if (err) { toast.error(`Could not delete: ${err.message}`); return; }
        setSelected(null);
        toast.success('Chats deleted');
        load();
    };

    const missingTable = error && /chat_messages|relation|schema cache/i.test(error);

    const Thread = ({ c }) => {
        let lastSession = null;
        return (<div className="space-y-2">
          {c.messages.map((m) => {
              const header = m.session_id !== lastSession && c.sessions > 1;
              lastSession = m.session_id;
              return (<div key={m.id}>
                {header && <p className="text-center text-[11px] text-gray-400 my-2">— new chat · {fmtTime(m.created_at)} —</p>}
                <Bubble m={m}/>
              </div>);
          })}
        </div>);
    };

    return (<div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 flex items-center gap-2"><MessageCircle className="w-7 h-7 text-[#2C5F4F]"/> Chat Monitor</h1>
          <p className="text-gray-500">Every customer talking to the Fat Mama Assistant, live — refreshes every 8 seconds</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            <button onClick={() => setView('wall')} className={`px-3 py-2 flex items-center gap-1.5 ${view === 'wall' ? 'bg-[#2C5F4F] text-white' : 'bg-white hover:bg-gray-50'}`}><LayoutGrid className="w-4 h-4"/> All customers</button>
            <button onClick={() => setView('inbox')} className={`px-3 py-2 flex items-center gap-1.5 ${view === 'inbox' ? 'bg-[#2C5F4F] text-white' : 'bg-white hover:bg-gray-50'}`}><List className="w-4 h-4"/> Inbox</button>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4"/>{lastUpdated ? lastUpdated.toLocaleTimeString('en-PH', { timeStyle: 'short' }) : 'Refresh'}</button>
        </div>
      </div>

      {missingTable && (<div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">The <strong>chat_messages</strong> table does not exist yet. Open Supabase → SQL Editor, run <strong>chat_messages.sql</strong>, then press Refresh.</div>)}
      {error && !missingTable && (<div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">Could not load chats: {error}</div>)}

      <div className="grid grid-cols-3 gap-4 mb-5">
        {stats.map(([label, value]) => (<div key={label} className="bg-white rounded-xl shadow-sm p-4"><p className="text-2xl font-bold text-[#2C5F4F]">{value}</p><p className="text-sm text-gray-500">{label}</p></div>))}
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer name, email or message" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] bg-white"/>
      </div>

      {loading ? (<p className="text-center text-gray-400 py-16">Loading…</p>) : filtered.length === 0 ? (<p className="text-center text-gray-400 py-16 bg-white rounded-xl shadow-sm">No customer chats yet. They will appear here as soon as someone messages the assistant.</p>) : view === 'wall' ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (<div key={c.key} className="bg-white rounded-xl shadow-sm flex flex-col overflow-hidden border border-gray-100">
              <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate flex items-center gap-2">
                    {isLive(c.last.created_at) && <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></span>}
                    {c.who}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{c.email || 'Not signed in'} · {c.messages.length} messages</p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">{fmtTime(c.last.created_at)}</span>
              </div>
              <div className="flex-1 bg-gray-50 p-3 space-y-2 h-64 overflow-y-auto">
                {c.messages.slice(-8).map((m) => <Bubble key={m.id} m={m}/>)}
              </div>
              <button onClick={() => { setSelected(c.key); }} className="px-4 py-2 text-sm text-[#2C5F4F] font-medium hover:bg-emerald-50 border-t">Open full conversation</button>
            </div>))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden max-h-[600px] overflow-y-auto divide-y">
            {filtered.map((c) => (<button key={c.key} onClick={() => setSelected(c.key)} className={`w-full text-left p-3 hover:bg-gray-50 ${selected === c.key ? 'bg-emerald-50' : ''}`}>
                <div className="flex items-center justify-between gap-2"><span className="font-medium text-sm truncate">{c.who}</span><span className="text-[11px] text-gray-400 shrink-0">{fmtTime(c.last.created_at)}</span></div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{c.last.text}</p>
              </button>))}
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm min-h-[300px]">
            {!active ? (<div className="h-full flex items-center justify-center text-gray-400 text-sm p-10">Select a customer to read the conversation</div>) : (<>
                <div className="p-4 border-b flex items-center justify-between"><div><p className="font-semibold">{active.who}</p><p className="text-xs text-gray-500">{active.email || 'Not signed in'}</p></div>
                  <button onClick={() => deleteCustomerChats(active)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete chats"><Trash2 className="w-4 h-4"/></button></div>
                <div className="p-4 bg-gray-50 max-h-[520px] overflow-y-auto"><Thread c={active}/></div>
              </>)}
          </div>
        </div>
      )}

      {/* full conversation popup (from the "All customers" wall) */}
      {view === 'wall' && active && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between gap-3">
              <div className="min-w-0"><p className="font-semibold truncate">{active.who}</p><p className="text-xs text-gray-500 truncate">{active.email || 'Not signed in'} · {active.sessions} chat{active.sessions > 1 ? 's' : ''}</p></div>
              <div className="flex gap-1">
                <button onClick={() => deleteCustomerChats(active)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete chats"><Trash2 className="w-4 h-4"/></button>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4"/></button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 overflow-y-auto"><Thread c={active}/></div>
          </div>
        </div>)}
    </div>);
}
