import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, Plus, Download, Trash2, Pencil, ArrowDownLeft, ArrowUpRight, Search, X, Moon, Sun } from 'lucide-react';
import { parseDisplayDate, isValidMoneyAmount } from './validation.js';

const currentMonth = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const displayDate = iso => { if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return iso || ''; const [y, m, d] = iso.split('-'); return `${m}/${d}/${y}`; };
const empty = () => ({ date: today(), type: 'EXPENSE', category: 'Food', amount: '', merchant: '', notes: '' });
const categories = { EXPENSE: ['Food', 'Transportation', 'Shopping', 'Bills', 'Housing', 'Health', 'Entertainment', 'Other'], INCOME: ['Salary', 'Freelance', 'Gift', 'Other'] };
const colors = ['#556de8', '#37b7a7', '#e7a746', '#ba81e9', '#ee7e8b', '#7fb2e9', '#8997aa', '#d78362'];
const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n ?? 0));
const api = async (path, options = {}) => {
  const res = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (!res.ok) { const data = await res.json().catch(() => ({})); throw Error(data.error || `Request failed (${res.status})`); }
  return res.status === 204 ? null : res.json();
};
export default function App() {
  const [month, setMonth] = useState(currentMonth);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('finance-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } });
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('finance-theme', theme); } catch { } }, [theme]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty());
  const [formDate, setFormDate] = useState(displayDate(today()));
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(key => key + 1);
  useEffect(() => {
    // Ignore previous requests after the selected month, filter, or refresh changes.
    const controller = new AbortController();
    const load = async () => {
      try {
        const params = new URLSearchParams({ month, ...(category && { category }), ...(search && { search }) });
        const [rows, totals] = await Promise.all([
          api(`/transactions?${params}`, { signal: controller.signal }),
          api(`/summary?month=${encodeURIComponent(month)}`, { signal: controller.signal })
        ]);
        if (controller.signal.aborted) return;
        setTransactions(rows); setSummary(totals); setError('');
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message + '. Confirm the Java backend is running.');
      }
    };
    load();
    return () => controller.abort();
  }, [month, category, search, refreshKey]);
  const startAdd = () => { setEditing(null); setForm({ ...empty(), date: `${month}-01` }); setFormDate(displayDate(`${month}-01`)); setShowForm(true); setFormError(''); };
  const startEdit = t => { setEditing(t.id); setForm({ ...t, amount: String(t.amount) }); setFormDate(displayDate(t.date)); setShowForm(true); setFormError(''); };
  const submit = async e => {
    e.preventDefault();
    const dateIso = parseDisplayDate(formDate);
    if (!dateIso) { setFormError('Enter a valid date as MM/DD/YYYY (for example 11/17/2026).'); return; }
    const amount = String(form.amount).trim();
    if (!isValidMoneyAmount(amount)) {
      setFormError('Enter an amount of at least $0.01 with no more than two decimal places.');
      return;
    }
    setBusy(true); setFormError('');
    try {
      const body = JSON.stringify({ ...form, date: dateIso, amount: Number(amount), id: undefined });
      await api(editing ? `/transactions/${editing}` : '/transactions', { method: editing ? 'PUT' : 'POST', body });
      setShowForm(false); setEditing(null); refresh();
    } catch (err) { setFormError(err.message); } finally { setBusy(false); }
  };
  const remove = async id => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await api(`/transactions/${id}`, { method: 'DELETE' }); refresh(); } catch (err) { setError(err.message); }
  };
  const exportCsv = async () => {
    try {
      const res = await fetch(`/api/export?month=${month}`); if (!res.ok) throw Error('CSV export failed');
      const url = URL.createObjectURL(await res.blob()); const a = document.createElement('a'); a.href = url; a.download = `${month.slice(5, 7)}-${month.slice(0, 4)} - Finances.csv`; a.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err.message); }
  };
  const daily = useMemo(() => Object.entries(summary?.dailyExpenses || {}).map(([date, amount]) => ({ day: date.slice(8), amount: Number(amount) })), [summary]);
  const pie = useMemo(() => Object.entries(summary?.byCategory || {}).map(([name, value]) => ({ name, value: Number(value) })), [summary]);
  return <div className="shell">
    <aside className="sidebar"><div className="brand"><span className="brandIcon"><Wallet size={21} /></span><span>Finance<span className="brandAccent">Tracker</span><small>JAVA EDITION</small></span></div>
      <div className="sidebarSection">WORKSPACE</div><div className="navActive">▦ &nbsp; Dashboard</div>
      <div className="sidebarFoot">Built with React + Java<br />Spring Boot REST API</div>
    </aside>
    <main className="main">
      <header className="top"><div><span className="eyebrow">PERSONAL FINANCE TRACKER</span><h1>Personal Finance Tracker</h1><p>Budget your income and track your expenses.</p></div><div className="topActions"><button type="button" className="themeToggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}<span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button><input aria-label="Select month" type="month" value={month} onChange={e => setMonth(e.target.value)} /><button className="primary" onClick={startAdd}><Plus size={17} /> Add transaction</button></div></header>
      {error && <div className="error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss"><X size={16} /></button></div>}
      <section className="stats">
        <div className="stat"><div className="statLabel"><span>Total income</span><span className="statIcon green"><ArrowDownLeft size={19} /></span></div><strong>{money(summary?.income)}</strong><small>Selected month</small></div>
        <div className="stat"><div className="statLabel"><span>Total expenses</span><span className="statIcon red"><ArrowUpRight size={19} /></span></div><strong>{money(summary?.expenses)}</strong><small>Selected month</small></div>
        <div className="stat balance"><div className="statLabel"><span>Net balance</span><span className="statIcon light"><Wallet size={19} /></span></div><strong>{money(summary?.balance)}</strong><small>Income minus expenses</small></div>
      </section>
      <section className="charts"><article className="panel trend"><div className="panelHead"><div><h2>Daily spending</h2><p>Expenses over the selected month</p></div></div>
        {daily.length ? <ResponsiveContainer width="100%" height={230}><AreaChart data={daily} margin={{ top: 15, right: 10, bottom: 0, left: -18 }}><defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5c73eb" stopOpacity=".25" /><stop offset="100%" stopColor="#5c73eb" stopOpacity="0" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eef0f6" /><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis tickFormatter={n => `$${n}`} tickLine={false} axisLine={false} /><Tooltip formatter={v => money(v)} contentStyle={{ backgroundColor: "#ffffff", color: "#111827", border: "1px solid #d1d5db", borderRadius: 8 }} labelStyle={{ color: "#111827", fontWeight: 600 }} itemStyle={{ color: "#1d4ed8" }} /><Area type="monotone" dataKey="amount" stroke="#5c73eb" fill="url(#shade)" strokeWidth={3} /></AreaChart></ResponsiveContainer> : <div className="emptyChart">Add an expense to see your spending trend.</div>}
      </article><article className="panel breakdown"><div className="panelHead"><div><h2>Spending by category</h2><p>Where your money goes</p></div></div>
          {pie.length ? <><ResponsiveContainer width="100%" height={174}><PieChart><Pie data={pie} dataKey="value" innerRadius={53} outerRadius={78} paddingAngle={3}>{pie.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip formatter={v => money(v)} contentStyle={{ backgroundColor: "#ffffff", color: "#111827", border: "1px solid #d1d5db", borderRadius: 8 }} labelStyle={{ color: "#111827", fontWeight: 600 }} itemStyle={{ color: "#1d4ed8" }} /></PieChart></ResponsiveContainer><div className="legend">{pie.map((p, i) => <div key={p.name}><span style={{ background: colors[i % colors.length] }} />{p.name}<b>{money(p.value)}</b></div>)}</div></> : <div className="emptyChart">No expenses in this month yet.</div>}
        </article></section>
      <section className="panel transactions"><div className="panelHead rowWrap"><div><h2>Transactions</h2><p>Manage your income and expenses</p></div><button className="outline" onClick={exportCsv}><Download size={16} /> Export CSV</button></div>
        <div className="filters"><div className="searchBox"><Search size={16} /><input aria-label="Search transactions" placeholder="Search merchant, category or notes..." value={search} onChange={e => setSearch(e.target.value)} /></div><select aria-label="Filter category" value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{[...new Set(Object.values(categories).flat())].sort().map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="tableWrap"><table><thead><tr><th>Date</th><th>Merchant / Notes</th><th>Category</th><th>Type</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{transactions.map(t => <tr key={t.id}><td>{displayDate(t.date)}</td><td><strong>{t.merchant || 'No merchant'}</strong>{t.notes && <small>{t.notes}</small>}</td><td><span className="tag">{t.category}</span></td><td><span className={t.type === 'INCOME' ? 'incomeText' : 'expenseText'}>{t.type === 'INCOME' ? 'Income' : 'Expense'}</span></td><td className={t.type === 'INCOME' ? 'incomeText' : ''}>{t.type === 'INCOME' ? '+' : '-'}{money(t.amount)}</td><td><div className="actionBtns"><button title="Edit" aria-label="Edit transaction" onClick={() => startEdit(t)}><Pencil size={16} /></button><button title="Delete" aria-label="Delete transaction" onClick={() => remove(t.id)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{!transactions.length && <div className="emptyRows">No transactions found. Add one to get started!</div>}</div>
      </section>
    </main>
    {showForm && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false); }}><div className="modal" role="dialog" aria-modal="true" aria-label={editing ? 'Edit transaction' : 'Add transaction'}><div className="modalHead"><div><h2>{editing ? 'Edit transaction' : 'Add transaction'}</h2><p>Enter the transaction details below.</p></div><button aria-label="Close" className="close" onClick={() => setShowForm(false)}><X /></button></div>{formError && <div className="error modalError" role="alert">{formError}<button type="button" onClick={() => setFormError('')} aria-label="Dismiss form error"><X size={16} /></button></div>}<form onSubmit={submit}>
      <label>Type<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, category: categories[e.target.value][0] })}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></label>
      <div className="two"><label>Amount ($)<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></label><label>Date (MM/DD/YYYY)<input required type="text" inputMode="numeric" placeholder="MM/DD/YYYY" pattern="[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}" title="Enter a date as MM/DD/YYYY" value={formDate} onChange={e => setFormDate(e.target.value)} /></label></div>
      <label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories[form.type].map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Merchant / Source<input maxLength="100" placeholder="e.g. Grocery store" value={form.merchant ?? ''} onChange={e => setForm({ ...form, merchant: e.target.value })} /></label>
      <label>Notes<textarea maxLength="500" rows="2" placeholder="Optional details" value={form.notes ?? ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
      <div className="modalActions"><button type="button" className="outline" onClick={() => setShowForm(false)}>Cancel</button><button className="primary" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Add transaction'}</button></div>
    </form></div></div>}
  </div>;
}