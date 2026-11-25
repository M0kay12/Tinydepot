
import { useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  Bell, Boxes, BriefcaseBusiness, ChartNoAxesCombined, Check,
 ChevronLeft, CircleDollarSign, LayoutDashboard,
  Moon, Package, Plus, Search, Settings, Sparkles,
  Sun, Tags, Truck, Users, X
} from 'lucide-react'

type Page = 'Dashboard' | 'Items' | 'Categories' | 'Stock In' | 'Stock Out' | 'Transfers' | 'Suppliers' | 'Reports' | 'AI Assistant' | 'Settings' | 'Upgrade'
type Item = {
  id: number
  name: string
  sku: string
  category: string
  quantity: number
  minimum: number
  price: number
  cost: number
}

const initialItems: Item[] = [
  { id: 1, name: 'Mechanical Keyboard', sku: 'MK-001', category: 'Electronics', quantity: 50, minimum: 10, price: 129.99, cost: 68 },
  { id: 2, name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', quantity: 2, minimum: 10, price: 59.99, cost: 28 },
  { id: 3, name: 'USB Cable', sku: 'USB-C-001', category: 'Accessories', quantity: 5, minimum: 20, price: 14.99, cost: 5 },
  { id: 4, name: 'Notebook A5', sku: 'NB-A5-001', category: 'Office', quantity: 3, minimum: 15, price: 8.99, cost: 3.5 },
  { id: 5, name: 'Monitor 24"', sku: 'MON-24-001', category: 'Electronics', quantity: 12, minimum: 5, price: 349, cost: 198 },
  { id: 6, name: 'Printer Ink Black', sku: 'INK-BK-001', category: 'Office', quantity: 1, minimum: 10, price: 24.99, cost: 9 },
  { id: 7, name: 'Laptop Stand', sku: 'LST-001', category: 'Accessories', quantity: 18, minimum: 8, price: 44.99, cost: 19 },
  { id: 8, name: 'HDMI Cable 2m', sku: 'HDMI-2M-001', category: 'Accessories', quantity: 34, minimum: 15, price: 19.99, cost: 7 },
]

const nav: { name: Page; icon: typeof Package }[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Items', icon: Package },
  { name: 'Categories', icon: Tags },
  { name: 'Stock In', icon: ArrowDownToLine },
  { name: 'Stock Out', icon: ArrowUpFromLine },
  { name: 'Transfers', icon: Truck },
  { name: 'Suppliers', icon: Users },
  { name: 'Reports', icon: ChartNoAxesCombined },
  { name: 'Settings', icon: Settings },
  { name: 'AI Assistant', icon: Sparkles },
]

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function App() {
  const [page, setPage] = useState<Page>('Dashboard')
  const [items, setItems] = useState(initialItems)
  const [dark, setDark] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Item | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [toast, setToast] = useState('')
  const [period, setPeriod] = useState('30d')
  const [aiMode, setAiMode] = useState('Overview')
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', sku: '', category: 'Electronics', quantity: '0', minimum: '5', price: '0', cost: '0' })
  const [stock, setStock] = useState({ item: '1', quantity: '1', notes: '' })

  const lowItems = items.filter(i => i.quantity <= i.minimum)
  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0)
  const inventoryValue = items.reduce((sum, i) => sum + i.quantity * i.cost, 0)
  const filtered = useMemo(() => items.filter(i =>
    `${i.name} ${i.sku} ${i.category}`.toLowerCase().includes(search.toLowerCase())
  ), [items, search])

  function notify(text: string) {
    setToast(text)
    window.setTimeout(() => setToast(''), 2500)
  }

  function addItem() {
    if (!form.name.trim() || !form.sku.trim()) return notify('Enter a product name and SKU.')
    if (items.some(i => i.sku.toLowerCase() === form.sku.toLowerCase())) return notify('That SKU already exists.')
    setItems([...items, {
      id: Date.now(), name: form.name, sku: form.sku, category: form.category,
      quantity: Number(form.quantity), minimum: Number(form.minimum),
      price: Number(form.price), cost: Number(form.cost),
    }])
    setShowAdd(false)
    setForm({ name: '', sku: '', category: 'Electronics', quantity: '0', minimum: '5', price: '0', cost: '0' })
    notify('Item added successfully.')
  }

  function updateStock(direction: 'in' | 'out') {
    const qty = Number(stock.quantity)
    const id = Number(stock.item)
    const item = items.find(i => i.id === id)
    if (!item || !Number.isInteger(qty) || qty < 1) return notify('Enter a valid quantity.')
    if (direction === 'out' && qty > item.quantity) return notify('Not enough stock available.')
    setItems(items.map(i => i.id === id ? { ...i, quantity: i.quantity + (direction === 'in' ? qty : -qty) } : i))
    setStock({ ...stock, quantity: '1', notes: '' })
    notify(direction === 'in' ? 'Stock received successfully.' : 'Stock issued successfully.')
  }

  function exportCSV() {
    const rows = [['Name', 'SKU', 'Category', 'Quantity', 'Minimum', 'Selling Price', 'Unit Cost'],
      ...items.map(i => [i.name, i.sku, i.category, i.quantity, i.minimum, i.price, i.cost])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url; a.download = 'tinydepot-inventory.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const card = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'
  const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900'
  const primary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
  const secondary = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700'

  function Stat({ label, value, icon: Icon, color = 'indigo' }: { label: string; value: string; icon: typeof Package; color?: string }) {
    const colors: Record<string, string> = { indigo: 'bg-indigo-50 text-indigo-600', green: 'bg-green-50 text-green-600', red: 'bg-red-50 text-red-600', purple: 'bg-purple-50 text-purple-600' }
    return <div className={card}>
      <div className="flex items-center justify-between text-sm text-slate-500">{label}<span className={`rounded-lg p-2 ${colors[color]}`}><Icon size={17} /></span></div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-slate-400">Compared with last month</div>
    </div>
  }

  function ItemTable({ rows }: { rows: Item[] }) {
    return <div className={`${card} overflow-hidden p-0`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900">
            <tr>{['Product', 'SKU', 'Category', 'Quantity', 'Min. Qty', 'Selling Price', 'Unit Cost', 'Status'].map(h => <th className="whitespace-nowrap px-4 py-3" key={h}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map(i => <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
              <td className="whitespace-nowrap px-4 py-3 font-semibold"><button onClick={() => setSelected(i)} className="text-left hover:text-indigo-600">{i.name}</button></td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{i.sku}</td>
              <td className="px-4 py-3">{i.category}</td>
              <td className="px-4 py-3">{i.quantity}</td><td className="px-4 py-3">{i.minimum}</td>
              <td className="px-4 py-3">{money(i.price)}</td><td className="px-4 py-3">{money(i.cost)}</td>
              <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-medium ${i.quantity === 0 ? 'bg-red-50 text-red-600' : i.quantity <= i.minimum ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>{i.quantity === 0 ? 'Out of Stock' : i.quantity <= i.minimum ? 'Low Stock' : 'In Stock'}</span></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No matching products found.</p>}
    </div>
  }

  const heading = (title: string, subtitle: string) => <div className="mb-5"><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>

  function renderPage() {
    if (selected) return <>
      <button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-2 text-sm text-indigo-600"><ChevronLeft size={16} /> Back to Items</button>
      {heading(selected.name, selected.sku + ' · ' + selected.category)}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Current Quantity" value={String(selected.quantity)} icon={Boxes} />
        <Stat label="Minimum Quantity" value={String(selected.minimum)} icon={AlertTriangle} color="red" />
        <Stat label="Selling Price" value={money(selected.price)} icon={CircleDollarSign} color="green" />
        <Stat label="Unit Cost" value={money(selected.cost)} icon={Activity} color="purple" />
      </div>
      <div className={`${card} mt-4`}><h3 className="font-semibold">Inventory level</h3><div className="mt-4 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, selected.quantity / Math.max(selected.minimum * 2, 1) * 100)}%` }} /></div><p className="mt-2 text-sm text-slate-500">{selected.quantity} units currently available</p></div>
    </>

    if (page === 'Dashboard') return <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Good morning, Moses</h2><p className="text-sm text-slate-500">Here's what's happening with your inventory today.</p></div><div className="flex gap-2"><button className={secondary} onClick={() => setPage('Stock In')}>Stock In</button><button className={primary} onClick={() => setPage('Stock Out')}>Stock Out</button></div></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Items" value={items.length.toLocaleString()} icon={Package} />
        <Stat label="Total Stock" value={totalUnits.toLocaleString()} icon={Boxes} color="green" />
        <Stat label="Low Stock" value={String(lowItems.length)} icon={AlertTriangle} color="red" />
        <Stat label="Inventory Value" value={money(inventoryValue)} icon={CircleDollarSign} color="purple" />
        <Stat label="Out of Stock" value={String(items.filter(i => i.quantity === 0).length)} icon={ArrowDownToLine} color="red" />
        <Stat label="Total Revenue" value="$48,250" icon={ChartNoAxesCombined} color="green" />
        <Stat label="Profit" value="$12,840" icon={Activity} color="purple" />
        <Stat label="Loss / Expenses" value="$3,420" icon={CircleDollarSign} color="red" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className={`${card} xl:col-span-2`}><div className="flex justify-between"><div><h3 className="font-semibold">Stock Overview</h3><p className="text-xs text-slate-500">Illustrative stock movement</p></div><select className={input + ' w-24'} value={period} onChange={e => setPeriod(e.target.value)}>{['7d', '30d', '3m', '1y'].map(p => <option key={p}>{p}</option>)}</select></div><div className="mt-6 flex h-44 items-end justify-around gap-3 border-b border-slate-200 px-4 dark:border-slate-700">{[30, 42, 55, 47, 70, 82, 95].map((v, i) => <div key={i} className="w-full rounded-t-md bg-indigo-500/80" style={{ height: `${v}%` }} />)}</div><p className="mt-3 text-center text-xs text-slate-400">Sample chart · {period}</p></div>
        <div className={card}><h3 className="font-semibold">Low Stock Alerts</h3>{lowItems.slice(0, 5).map(i => <div key={i.id} className="flex items-center justify-between border-b border-slate-100 py-3 text-sm dark:border-slate-700"><div><p className="font-medium">{i.name}</p><p className="text-xs text-slate-400">{i.sku}</p></div><span className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{i.quantity} left</span></div>)}<button onClick={() => setPage('Items')} className="mt-3 text-sm font-semibold text-indigo-600">View items</button></div>
      </div>
      <div className={`${card} mt-4`}><h3 className="mb-3 font-semibold">Recent Transactions</h3><p className="text-sm text-slate-500">Transaction history will appear here when stock movements are recorded.</p></div>
    </>

    if (page === 'Items') return <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">{heading('Items', `${items.length} products in your inventory`)}<div className="flex gap-2"><button onClick={exportCSV} className={secondary}>Export CSV</button><button onClick={() => setShowAdd(true)} className={primary}><Plus size={16} /> Add Item</button></div></div>
      <ItemTable rows={filtered} />
    </>

    if (page === 'Stock In' || page === 'Stock Out') {
      const incoming = page === 'Stock In'
      return <div className="max-w-xl">{heading(page, incoming ? 'Record incoming inventory from a supplier.' : 'Record outgoing stock, sales, damage, or adjustments.')}
        <div className={card}><label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Product</label><select className={input} value={stock.item} onChange={e => setStock({ ...stock, item: e.target.value })}>{items.map(i => <option value={i.id} key={i.id}>{i.name} · {i.quantity} available</option>)}</select>
          <label className="mb-2 mt-4 block text-xs font-semibold uppercase text-slate-500">Quantity</label><input className={input} type="number" min="1" value={stock.quantity} onChange={e => setStock({ ...stock, quantity: e.target.value })} />
          <label className="mb-2 mt-4 block text-xs font-semibold uppercase text-slate-500">{incoming ? 'Supplier' : 'Reason'}</label><input className={input} placeholder={incoming ? 'Supplier name' : 'Sale, damage, adjustment...'} />
          <label className="mb-2 mt-4 block text-xs font-semibold uppercase text-slate-500">Notes</label><textarea className={input} rows={3} value={stock.notes} onChange={e => setStock({ ...stock, notes: e.target.value })} />
          <button className={`${primary} mt-5 w-full ${incoming ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`} onClick={() => updateStock(incoming ? 'in' : 'out')}>Confirm Stock {incoming ? 'In' : 'Out'}</button>
        </div>
      </div>
    }

    if (page === 'Reports') return <>{heading('Reports', 'Business analytics and performance.') }
      <div className="mb-4 flex gap-2">{['7d', '30d', '3m', '1y'].map(p => <button key={p} onClick={() => setPeriod(p)} className={period === p ? primary : secondary}>{p}</button>)}</div>
      <div className="grid gap-4 sm:grid-cols-3"><Stat label="Revenue" value="$31,500" icon={CircleDollarSign} color="green" /><Stat label="Cost of Goods" value="$13,100" icon={Boxes} color="red" /><Stat label="Gross Profit" value="$18,400" icon={Activity} color="purple" /></div>
      <div className={`${card} mt-4`}><h3 className="font-semibold">Profit & Loss</h3><p className="mt-2 text-sm text-slate-500">Illustrative report values for the selected period: {period}.</p></div>
    </>

    if (page === 'AI Assistant') return <>{heading('AI Assistant', 'Your inventory co-pilot. Demo responses only.')}
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]"><div className={card}><div className="mb-4 flex items-center gap-2 text-indigo-600"><Sparkles /> <b>AI Character</b></div><div className="mb-4 rounded-xl bg-indigo-50 p-5 text-center text-4xl dark:bg-slate-700">💡</div><p className="text-center font-semibold">Aria</p><p className="text-center text-xs text-slate-500">Inventory Co-pilot</p>{['Overview', 'Analyze Inventory', 'Analyze Profit', 'Ask AI'].map(m => <button key={m} onClick={() => setAiMode(m)} className={`mt-2 w-full rounded-lg p-2 text-left text-sm ${aiMode === m ? 'bg-indigo-50 text-indigo-700 dark:bg-slate-700 dark:text-indigo-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{m}</button>)}</div>
        <div className={card}><h3 className="font-semibold">{aiMode}</h3>{aiMode === 'Overview' && <p className="mt-3 text-sm text-slate-500">Choose an action to explore your inventory.</p>}{aiMode === 'Analyze Inventory' && <><p className="mt-3 text-2xl font-bold">72/100 <span className="text-sm font-normal text-slate-500">Inventory health score (demo)</span></p><p className="mt-3 text-sm">{lowItems.length} products need attention.</p>{lowItems.map(i => <p className="mt-2 text-sm text-red-600" key={i.id}>{i.name}: {i.quantity} / {i.minimum} minimum</p>)}</>}{aiMode === 'Analyze Profit' && <p className="mt-3 text-sm">Demo estimate: Monthly revenue $31,500 · Gross profit $15,680.</p>}{aiMode === 'Ask AI' && <><div className="my-4 min-h-32 space-y-2">{chat.map((m, i) => <p key={i} className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-700">{m}</p>)}</div><form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (message.trim()) { setChat([...chat, `You: ${message}`, 'Aria: This is a demo response. Connect an AI service in a future version for live answers.']); setMessage('') } }}><input className={input} value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask about your inventory..." /><button className={primary}>Send</button></form></>}</div></div>
    </>

    if (page === 'Upgrade') return <div className="mx-auto max-w-md">{heading('Upgrade to TinyDepot Pro', 'Built for growing teams.') }<div className="rounded-2xl bg-slate-900 p-7 text-white"><Sparkles className="mb-3 text-indigo-400" /><h2 className="text-2xl font-bold">TinyDepot Pro</h2><p className="mt-2 text-slate-400">Advanced tools for your business.</p><p className="my-5 text-3xl font-bold">$29 <span className="text-sm font-normal">/ month</span></p>{['Unlimited products & SKUs', 'Advanced AI insights', 'Profit & Loss reports', 'Multi-location inventory', 'Team collaboration', 'Priority support', 'CSV & PDF exports'].map(f => <p className="my-3 flex items-center gap-2 text-sm" key={f}><Check size={16} className="text-green-400" />{f}</p>)}<button onClick={() => notify('Upgrade is a demo. No payment was made.')} className="mt-5 w-full rounded-lg bg-indigo-500 p-3 font-semibold">Upgrade Now</button></div></div>

    if (page === 'Settings') return <div className="max-w-xl">{heading('Settings', 'Manage your store preferences.') }<div className={card}><label className="text-xs font-semibold uppercase text-slate-500">Store name</label><input className={`${input} mt-2`} defaultValue="TinyDepot HQ" /><label className="mt-4 block text-xs font-semibold uppercase text-slate-500">Currency</label><select className={`${input} mt-2`}><option>USD</option><option>EUR</option><option>GBP</option><option>TRY</option></select><button onClick={() => notify('Settings saved.')} className={`${primary} mt-5`}>Save Changes</button></div></div>

    return <>{heading(page, 'This section is planned for a future version.') }<div className={`${card} py-12 text-center`}><Boxes size={32} className="mx-auto text-indigo-500" /><h3 className="mt-3 font-semibold">Coming soon</h3><p className="mt-1 text-sm text-slate-500">This feature is not included in the current frontend demo.</p></div></>
  }

  return <div className={dark ? 'dark' : ''}>
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <aside className="hidden w-52 shrink-0 flex-col bg-slate-900 px-3 py-5 text-slate-200 md:flex">
        <div className="mb-7 flex items-center gap-2 px-2"><span className="rounded-lg bg-indigo-600 p-2"><BriefcaseBusiness size={19} /></span><div><b className="block">TinyDepot</b><span className="text-xs text-slate-400">Inventory</span></div></div>
        <nav className="space-y-1">{nav.map(({ name, icon: Icon }) => <button key={name} onClick={() => { setPage(name); setSelected(null) }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${page === name ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Icon size={17} />{name}</button>)}</nav>
        <div className="mt-auto rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-3"><b className="text-sm">TinyDepot Pro</b><p className="my-2 text-xs text-slate-400">Unlock AI insights and more.</p><button onClick={() => setPage('Upgrade')} className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white">Upgrade Now</button></div>
        <div className="mt-5 flex items-center gap-2 border-t border-slate-700 pt-4"><div className="rounded-full bg-indigo-600 p-2 text-xs font-bold">MK</div><div><p className="text-sm font-medium">Moses Kanu</p><p className="text-xs text-slate-400">Administrator</p></div></div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800 md:px-7">
          <div className="flex items-center gap-2"><span className="font-bold md:hidden">TinyDepot</span><h1 className="hidden text-sm font-semibold md:block">{page}</h1></div>
          <div className="flex items-center gap-2">
            <div className="flex w-36 items-center gap-2 rounded-full border border-slate-200 px-3 py-2 dark:border-slate-600 sm:w-60"><Search size={15} className="text-slate-400" /><input className="w-full bg-transparent text-xs outline-none" placeholder="Search items..." value={search} onChange={e => { setSearch(e.target.value); if (page !== 'Items') setPage('Items') }} /></div>
            <button onClick={() => setDark(!dark)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="relative"><button onClick={() => setShowNotifications(!showNotifications)} className="relative rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700"><Bell size={18} /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" /></button>{showNotifications && <div className="absolute right-0 top-11 w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-800"><b>Notifications</b><p className="mt-3 text-slate-500">Printer Ink is almost out.</p><p className="mt-2 text-slate-500">Wireless Mouse is running low.</p><button onClick={() => setShowNotifications(false)} className="mt-3 text-indigo-600">Close</button></div>}</div>
            <span className="hidden text-xs font-semibold sm:block">Admin</span><span className="rounded-full bg-indigo-100 px-2 py-2 text-xs font-bold text-indigo-700">MK</span>
          </div>
        </header>
        <section className="mx-auto max-w-[1600px] p-4 md:p-6">{renderPage()}</section>
      </main>
    </div>
    {showAdd && <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Add Item</h2><button onClick={() => setShowAdd(false)}><X /></button></div><div className="grid gap-3 sm:grid-cols-2">{([['name', 'Product name'], ['sku', 'SKU'], ['quantity', 'Quantity'], ['minimum', 'Minimum quantity'], ['price', 'Selling price'], ['cost', 'Unit cost']] as const).map(([key, label]) => <label key={key} className="text-xs font-semibold text-slate-500">{label}<input className={`${input} mt-1`} type={key === 'name' || key === 'sku' ? 'text' : 'number'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}<label className="text-xs font-semibold text-slate-500 sm:col-span-2">Category<select className={`${input} mt-1`} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Electronics</option><option>Accessories</option><option>Office</option><option>Others</option></select></label></div><div className="mt-5 flex justify-end gap-2"><button onClick={() => setShowAdd(false)} className={secondary}>Cancel</button><button onClick={addItem} className={primary}>Add Item</button></div></div></div>}
    {toast && <div className="fixed right-5 top-20 z-40 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
  </div>
}
