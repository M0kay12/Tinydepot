
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowLeftRight,
  ArrowUpFromLine, BarChart3, Bell, Boxes, BriefcaseBusiness,
  Check, ChevronDown, CircleDollarSign, Download, LayoutDashboard,
  LogIn, LogOut, Moon, Package, Pencil, Plus, Search, Settings,
  Sparkles, Sun, Tags, Trash2, Truck, Users, X
} from 'lucide-react'

type Page =
  | 'Dashboard' | 'Items' | 'Categories' | 'Stock In'
  | 'Stock Out' | 'Transfers' | 'Suppliers' | 'Reports'
  | 'AI Assistant' | 'Settings' | 'Upgrade'

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

type Transaction = {
  id: number
  itemId: number
  itemName: string
  type: 'Stock In' | 'Stock Out' | 'Transfer'
  quantity: number
  date: string
  detail: string
}

type Supplier = {
  id: number
  name: string
  contact: string
  email: string
}

type Account = {
  name: string
  email: string
  password: string
}

const readStore = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(`tinydepot-${key}`)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount)

const initialItems: Item[] = [
  { id: 1, name: 'Mechanical Keyboard', sku: 'TD-001', category: 'Electronics', quantity: 50, minimum: 10, price: 1200, cost: 800 },
  { id: 2, name: 'Wireless Mouse', sku: 'TD-002', category: 'Electronics', quantity: 2, minimum: 10, price: 650, cost: 400 },
  { id: 3, name: 'USB Cable', sku: 'TD-003', category: 'Accessories', quantity: 5, minimum: 15, price: 180, cost: 90 },
  { id: 4, name: 'Notebook A5', sku: 'TD-004', category: 'Stationery', quantity: 3, minimum: 10, price: 90, cost: 45 },
  { id: 5, name: 'Monitor 24 inch', sku: 'TD-005', category: 'Electronics', quantity: 12, minimum: 5, price: 4200, cost: 3200 },
  { id: 6, name: 'Printer Ink Black', sku: 'TD-006', category: 'Office Supplies', quantity: 1, minimum: 5, price: 750, cost: 500 },
  { id: 7, name: 'Laptop Stand', sku: 'TD-007', category: 'Accessories', quantity: 18, minimum: 5, price: 950, cost: 600 },
  { id: 8, name: 'HDMI Cable 2m', sku: 'TD-008', category: 'Accessories', quantity: 34, minimum: 10, price: 250, cost: 130 }
]

const initialCategories = [
  'Electronics', 'Accessories', 'Stationery', 'Office Supplies'
]

const navigation: { name: Page; icon: typeof LayoutDashboard }[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Items', icon: Package },
  { name: 'Categories', icon: Tags },
  { name: 'Stock In', icon: ArrowDownToLine },
  { name: 'Stock Out', icon: ArrowUpFromLine },
  { name: 'Transfers', icon: ArrowLeftRight },
  { name: 'Suppliers', icon: Truck },
  { name: 'Reports', icon: BarChart3 },
  { name: 'AI Assistant', icon: Sparkles },
  { name: 'Settings', icon: Settings }
]

const buttonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'

const buttonSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900'

function App() {
  // Authentication
  const [accounts, setAccounts] = useState<Account[]>(() =>
    readStore('accounts', [])
  )
  const [currentUser, setCurrentUser] = useState<Account | null>(() =>
    readStore('current-user', null)
  )
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  // Application state
  const [page, setPage] = useState<Page>('Dashboard')
  const [items, setItems] = useState<Item[]>(() =>
    readStore('items', initialItems)
  )
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    readStore('transactions', [])
  )
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    readStore('suppliers', [])
  )
  const [categories, setCategories] = useState<string[]>(() =>
    readStore('categories', initialCategories)
  )
  const [dark, setDark] = useState(() => readStore('dark', false))
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState('')
  const [movementQuantity, setMovementQuantity] = useState('1')
  const [movementDetail, setMovementDetail] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [supplierForm, setSupplierForm] = useState({
    name: '', contact: '', email: ''
  })
  const [currency, setCurrency] = useState(() =>
    readStore('currency', 'TRY')
  )
  const [storeName, setStoreName] = useState(() =>
    readStore('store-name', 'TinyDepot Store')
  )
  const [itemForm, setItemForm] = useState({
    name: '', sku: '', category: 'Electronics',
    quantity: '0', minimum: '5', price: '0', cost: '0'
  })

  // Persist application data
  useEffect(() => {
    localStorage.setItem('tinydepot-accounts', JSON.stringify(accounts))
  }, [accounts])

  useEffect(() => {
    localStorage.setItem('tinydepot-current-user', JSON.stringify(currentUser))
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem('tinydepot-items', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem('tinydepot-transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('tinydepot-suppliers', JSON.stringify(suppliers))
  }, [suppliers])

  useEffect(() => {
    localStorage.setItem('tinydepot-categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('tinydepot-dark', JSON.stringify(dark))
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    localStorage.setItem('tinydepot-currency', JSON.stringify(currency))
  }, [currency])

  useEffect(() => {
    localStorage.setItem('tinydepot-store-name', JSON.stringify(storeName))
  }, [storeName])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  // Authentication handlers
  const handleSignUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError('')
    setAuthSuccess('')

    const name = authName.trim()
    const email = authEmail.trim().toLowerCase()

    if (!name || !email || !authPassword || !confirmPassword) {
      setAuthError('Please complete all fields.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError('Please enter a valid email address.')
      return
    }

    if (authPassword.length < 6) {
      setAuthError('Your password must contain at least 6 characters.')
      return
    }

    if (authPassword !== confirmPassword) {
      setAuthError('Your passwords do not match.')
      return
    }

    if (accounts.some(account => account.email.toLowerCase() === email)) {
      setAuthError('An account with this email already exists.')
      return
    }

    const newAccount: Account = {
      name,
      email,
      password: authPassword
    }

    setAccounts(previous => [...previous, newAccount])
    setAuthMode('signin')
    setAuthName('')
    setAuthPassword('')
    setConfirmPassword('')
    setAuthSuccess('Your account has been created. You can now sign in.')
  }

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError('')
    setAuthSuccess('')

    const email = authEmail.trim().toLowerCase()
    const account = accounts.find(
      user =>
        user.email.toLowerCase() === email &&
        user.password === authPassword
    )

    if (!account) {
      setAuthError('Incorrect email or password. Please try again.')
      return
    }

    setCurrentUser(account)
    setPage('Dashboard')
    setAuthEmail('')
    setAuthPassword('')
  }

  const handleSignOut = () => {
    setCurrentUser(null)
    setPage('Dashboard')
    setSearch('')
    setShowNotifications(false)
    setToast('You have signed out successfully.')
  }

  // Inventory calculations
  const lowItems = items.filter(item => item.quantity <= item.minimum)
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)
  const inventoryValue = items.reduce(
    (sum, item) => sum + item.quantity * item.cost, 0
  )
  const salesValue = transactions
    .filter(transaction => transaction.type === 'Stock Out')
    .reduce((sum, transaction) => {
      const item = items.find(entry => entry.id === transaction.itemId)
      return sum + transaction.quantity * (item?.price ?? 0)
    }, 0)
  const stockCost = transactions
    .filter(transaction => transaction.type === 'Stock Out')
    .reduce((sum, transaction) => {
      const item = items.find(entry => entry.id === transaction.itemId)
      return sum + transaction.quantity * (item?.cost ?? 0)
    }, 0)
  const profit = salesValue - stockCost

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase()
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }, [items, search])

  const notify = (message: string) => setToast(message)

  const resetItemForm = () => {
    setItemForm({
      name: '', sku: '', category: categories[0] || 'Electronics',
      quantity: '0', minimum: '5', price: '0', cost: '0'
    })
    setEditing(null)
    setShowItemForm(false)
  }

  const openAddItem = () => {
    setEditing(null)
    setItemForm({
      name: '', sku: '', category: categories[0] || 'Electronics',
      quantity: '0', minimum: '5', price: '0', cost: '0'
    })
    setShowItemForm(true)
  }

  const openEditItem = (item: Item) => {
    setEditing(item.id)
    setItemForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: String(item.quantity),
      minimum: String(item.minimum),
      price: String(item.price),
      cost: String(item.cost)
    })
    setShowItemForm(true)
  }

  const saveItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!itemForm.name.trim() || !itemForm.sku.trim()) {
      notify('Please enter an item name and SKU.')
      return
    }

    const savedItem: Item = {
      id: editing ?? Date.now(),
      name: itemForm.name.trim(),
      sku: itemForm.sku.trim(),
      category: itemForm.category,
      quantity: Math.max(0, Number(itemForm.quantity)),
      minimum: Math.max(0, Number(itemForm.minimum)),
      price: Math.max(0, Number(itemForm.price)),
      cost: Math.max(0, Number(itemForm.cost))
    }

    if (editing !== null) {
      setItems(previous =>
        previous.map(item => item.id === editing ? savedItem : item)
      )
      notify('Item updated successfully.')
    } else {
      setItems(previous => [...previous, savedItem])
      notify('New item added successfully.')
    }

    resetItemForm()
  }

  const deleteItem = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    setItems(previous => previous.filter(item => item.id !== id))
    notify('Item deleted.')
  }

  const recordMovement = (
    event: FormEvent<HTMLFormElement>,
    type: 'Stock In' | 'Stock Out' | 'Transfer'
  ) => {
    event.preventDefault()

    const item = items.find(entry => entry.id === Number(selectedItem))
    const quantity = Number(movementQuantity)

    if (!item) {
      notify('Please select an item.')
      return
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      notify('Enter a valid quantity.')
      return
    }

    if (type !== 'Stock In' && quantity > item.quantity) {
      notify('There is not enough stock available.')
      return
    }

    setItems(previous => previous.map(entry => {
      if (entry.id !== item.id) return entry
      return {
        ...entry,
        quantity: type === 'Stock In'
          ? entry.quantity + quantity
          : entry.quantity - quantity
      }
    }))

    setTransactions(previous => [{
      id: Date.now(),
      itemId: item.id,
      itemName: item.name,
      type,
      quantity,
      date: new Date().toLocaleString(),
      detail: movementDetail.trim() || 'No additional details'
    }, ...previous])

    setSelectedItem('')
    setMovementQuantity('1')
    setMovementDetail('')
    notify(`${type} recorded successfully.`)
  }

  const addCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = categoryName.trim()

    if (!name) return
    if (categories.some(category => category.toLowerCase() === name.toLowerCase())) {
      notify('This category already exists.')
      return
    }

    setCategories(previous => [...previous, name])
    setCategoryName('')
    notify('Category added.')
  }

  const deleteCategory = (name: string) => {
    if (items.some(item => item.category === name)) {
      notify('This category is being used by an item.')
      return
    }
    setCategories(previous => previous.filter(category => category !== name))
    notify('Category deleted.')
  }

  const addSupplier = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!supplierForm.name.trim()) {
      notify('Please enter the supplier name.')
      return
    }

    setSuppliers(previous => [...previous, {
      id: Date.now(),
      name: supplierForm.name.trim(),
      contact: supplierForm.contact.trim(),
      email: supplierForm.email.trim()
    }])

    setSupplierForm({ name: '', contact: '', email: '' })
    notify('Supplier added successfully.')
  }

  const deleteSupplier = (id: number) => {
    setSuppliers(previous => previous.filter(supplier => supplier.id !== id))
    notify('Supplier deleted.')
  }

  const exportCSV = () => {
    const rows = [
      ['Name', 'SKU', 'Category', 'Quantity', 'Minimum Stock', 'Selling Price', 'Cost'],
      ...items.map(item => [
        item.name, item.sku, item.category, item.quantity,
        item.minimum, item.price, item.cost
      ])
    ]

    const csv = rows.map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tinydepot-inventory.csv'
    link.click()
    URL.revokeObjectURL(url)
    notify('Inventory CSV exported.')
  }

  const exportTransactions = () => {
    const rows = [
      ['Date', 'Item', 'Type', 'Quantity', 'Details'],
      ...transactions.map(transaction => [
        transaction.date, transaction.itemName,
        transaction.type, transaction.quantity, transaction.detail
      ])
    ]

    const csv = rows.map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tinydepot-transactions.csv'
    link.click()
    URL.revokeObjectURL(url)
    notify('Transactions exported.')
  }

  const card =
    'rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

  const heading =
    'text-lg font-bold text-slate-900 dark:text-white'

  const muted = 'text-sm text-slate-500 dark:text-slate-400'

  // Reusable statistics card
  function Stat({
    title, value, icon: Icon, color, note
  }: {
    title: string
    value: string
    icon: typeof Package
    color: string
    note: string
  }) {
    return (
      <div className={card}>
        <div className="flex items-center justify-between">
          <p className={muted}>{title}</p>
          <div className={`rounded-lg p-2 ${color}`}>
            <Icon size={19} />
          </div>
        </div>
        <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {note}
        </p>
      </div>
    )
  }

  function ItemTable() {
    return (
      <div className={`${card} overflow-hidden p-0`}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h3 className={heading}>Inventory Items</h3>
            <p className={muted}>Manage your products and stock levels.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCSV} className={buttonSecondary}>
              <Download size={16} /> Export
            </button>
            <button onClick={openAddItem} className={buttonPrimary}>
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>

        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 text-slate-400" size={17} />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search name, SKU or category..."
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Selling Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="text-slate-700 dark:text-slate-300">
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="px-5 py-4">{item.sku}</td>
                  <td className="px-5 py-4">{item.category}</td>
                  <td className="px-5 py-4 font-semibold">{item.quantity}</td>
                  <td className="px-5 py-4">{money(item.price, currency)}</td>
                  <td className="px-5 py-4">
                    {item.quantity === 0 ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Out of stock</span>
                    ) : item.quantity <= item.minimum ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Low stock</span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">In stock</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEditItem(item)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800" title="Edit item">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800" title="Delete item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  function MovementForm({ type }: { type: 'Stock In' | 'Stock Out' | 'Transfer' }) {
    return (
      <div className={`${card} max-w-2xl`}>
        <h3 className={heading}>Record {type}</h3>
        <p className={`${muted} mb-5`}>Enter the details of this inventory movement.</p>
        <form onSubmit={event => recordMovement(event, type)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Select Item</label>
            <select
              className={inputClass}
              value={selectedItem}
              onChange={event => setSelectedItem(event.target.value)}
              required
            >
              <option value="">Choose an item</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} — Available: {item.quantity}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
            <input
              type="number"
              min="1"
              className={inputClass}
              value={movementQuantity}
              onChange={event => setMovementQuantity(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Notes / Reference</label>
            <input
              className={inputClass}
              value={movementDetail}
              onChange={event => setMovementDetail(event.target.value)}
              placeholder="Optional details"
            />
          </div>
          <button className={buttonPrimary} type="submit">
            <Check size={16} /> Save {type}
          </button>
        </form>
      </div>
    )
  }

  function TransactionsTable() {
    return (
      <div className={`${card} overflow-hidden p-0`}>
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <h3 className={heading}>Recent Transactions</h3>
            <p className={muted}>Your latest inventory movements.</p>
          </div>
          <button onClick={exportTransactions} className={buttonSecondary}>
            <Download size={16} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map(transaction => (
                <tr key={transaction.id} className="text-slate-700 dark:text-slate-300">
                  <td className="px-5 py-4">{transaction.date}</td>
                  <td className="px-5 py-4 font-medium">{transaction.itemName}</td>
                  <td className="px-5 py-4">{transaction.type}</td>
                  <td className="px-5 py-4">{transaction.quantity}</td>
                  <td className="px-5 py-4">{transaction.detail}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No transactions recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  function renderPage() {
    switch (page) {
      case 'Dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
              <p className={muted}>Here is what is happening with your inventory today.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat title="Total Items" value={String(items.length)} icon={Package} color="bg-blue-100 text-blue-700" note="Different products in inventory" />
              <Stat title="Total Stock Units" value={String(totalUnits)} icon={Boxes} color="bg-indigo-100 text-indigo-700" note="Units currently available" />
              <Stat title="Low Stock Items" value={String(lowItems.length)} icon={AlertTriangle} color="bg-amber-100 text-amber-700" note="Items requiring attention" />
              <Stat title="Inventory Value" value={money(inventoryValue, currency)} icon={CircleDollarSign} color="bg-green-100 text-green-700" note="Based on item purchase costs" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className={card}>
                <h3 className={heading}>Profit / Loss Overview</h3>
                <p className={`${muted} mt-1`}>Based on recorded stock-out transactions.</p>
                <p className={`mt-5 text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {money(profit, currency)}
                </p>
                <p className={muted}>Estimated profit or loss</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className={muted}>Sales value</p>
                    <p className="mt-1 font-bold text-slate-900 dark:text-white">{money(salesValue, currency)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className={muted}>Cost of goods</p>
                    <p className="mt-1 font-bold text-slate-900 dark:text-white">{money(stockCost, currency)}</p>
                  </div>
                </div>
              </div>

              <div className={card}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className={heading}>Low Stock Alerts</h3>
                    <p className={muted}>Items at or below their minimum quantity.</p>
                  </div>
                  <AlertTriangle className="text-amber-500" />
                </div>
                {lowItems.length === 0 ? (
                  <p className={muted}>No low stock items. Everything looks good!</p>
                ) : (
                  <div className="space-y-3">
                    {lowItems.slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.name}</p>
                          <p className="text-xs text-slate-500">Minimum: {item.minimum}</p>
                        </div>
                        <span className="font-bold text-amber-600">{item.quantity} left</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage('Stock In')} className={buttonPrimary}><ArrowDownToLine size={16} /> Stock In</button>
              <button onClick={() => setPage('Stock Out')} className={buttonSecondary}><ArrowUpFromLine size={16} /> Stock Out</button>
              <button onClick={openAddItem} className={buttonSecondary}><Plus size={16} /> Add New Item</button>
            </div>

            <TransactionsTable />
          </div>
        )

      case 'Items':
        return <ItemTable />

      case 'Stock In':
        return <MovementForm type="Stock In" />

      case 'Stock Out':
        return <MovementForm type="Stock Out" />

      case 'Transfers':
        return (
          <div className="space-y-5">
            <div>
              <h2 className={heading}>Stock Transfers</h2>
              <p className={muted}>Record stock movements between locations.</p>
            </div>
            <MovementForm type="Transfer" />
            <TransactionsTable />
          </div>
        )

      case 'Categories':
        return (
          <div className="space-y-5">
            <div>
              <h2 className={heading}>Categories</h2>
              <p className={muted}>Organise your inventory into categories.</p>
            </div>
            <div className={`${card} max-w-xl`}>
              <form onSubmit={addCategory} className="flex flex-col gap-3 sm:flex-row">
                <input className={inputClass} placeholder="Enter category name" value={categoryName} onChange={event => setCategoryName(event.target.value)} />
                <button type="submit" className={buttonPrimary}><Plus size={16} /> Add Category</button>
              </form>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(category => (
                <div key={category} className={`${card} flex items-center justify-between`}>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{category}</p>
                    <p className={muted}>{items.filter(item => item.category === category).length} items</p>
                  </div>
                  <button onClick={() => deleteCategory(category)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'Suppliers':
        return (
          <div className="space-y-5">
            <div>
              <h2 className={heading}>Suppliers</h2>
              <p className={muted}>Keep track of your supplier information.</p>
            </div>
            <div className={`${card} max-w-2xl`}>
              <h3 className={`${heading} mb-4`}>Add Supplier</h3>
              <form onSubmit={addSupplier} className="grid gap-3 sm:grid-cols-2">
                <input className={inputClass} placeholder="Supplier name" value={supplierForm.name} onChange={event => setSupplierForm({ ...supplierForm, name: event.target.value })} required />
                <input className={inputClass} placeholder="Phone / Contact" value={supplierForm.contact} onChange={event => setSupplierForm({ ...supplierForm, contact: event.target.value })} />
                <input className={inputClass} type="email" placeholder="Email address" value={supplierForm.email} onChange={event => setSupplierForm({ ...supplierForm, email: event.target.value })} />
                <button type="submit" className={buttonPrimary}><Plus size={16} /> Add Supplier</button>
              </form>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {suppliers.map(supplier => (
                <div key={supplier.id} className={`${card} flex items-start justify-between`}>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{supplier.name}</p>
                    <p className={muted}>{supplier.contact || 'No contact added'}</p>
                    <p className={muted}>{supplier.email || 'No email added'}</p>
                  </div>
                  <button onClick={() => deleteSupplier(supplier.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800"><Trash2 size={17} /></button>
                </div>
              ))}
              {suppliers.length === 0 && <p className={muted}>No suppliers added yet.</p>}
            </div>
          </div>
        )

      case 'Reports':
        return (
          <div className="space-y-5">
            <div>
              <h2 className={heading}>Inventory Reports</h2>
              <p className={muted}>Review your inventory performance and activity.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat title="Total Items" value={String(items.length)} icon={Package} color="bg-blue-100 text-blue-700" note="Registered products" />
              <Stat title="Stock Units" value={String(totalUnits)} icon={Boxes} color="bg-indigo-100 text-indigo-700" note="Available units" />
              <Stat title="Transactions" value={String(transactions.length)} icon={Activity} color="bg-purple-100 text-purple-700" note="Recorded movements" />
              <Stat title="Low Stock" value={String(lowItems.length)} icon={AlertTriangle} color="bg-amber-100 text-amber-700" note="Items needing restock" />
            </div>
            <div className={card}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className={heading}>Inventory Valuation</h3>
                  <p className={muted}>Estimated value using purchase costs.</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{money(inventoryValue, currency)}</p>
              </div>
            </div>
            <div className={card}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className={heading}>Item Stock Summary</h3>
                <button onClick={exportCSV} className={buttonSecondary}><Download size={16} /> Export CSV</button>
              </div>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className={muted}>{item.quantity} units</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full rounded-full ${item.quantity <= item.minimum ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, item.quantity / Math.max(1, ...items.map(entry => entry.quantity)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <TransactionsTable />
          </div>
        )

      case 'AI Assistant':
        return (
          <div className="mx-auto max-w-3xl space-y-5">
            <div className={`${card} text-center`}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">TinyDepot AI Assistant</h2>
              <p className={`${muted} mx-auto mt-2 max-w-lg`}>
                Your smart inventory assistant. Get help understanding stock levels, inventory trends and business performance.
              </p>
              <div className="mt-6 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-5 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                <Sparkles className="mx-auto mb-2" size={22} />
                AI integration will be connected by the backend development team.
                <p className="mt-2 text-xs opacity-75">This screen is currently a frontend demonstration.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Which items are running low?',
                'How much inventory value do I have?',
                'Show me my stock summary.',
                'Which products need restocking?'
              ].map(question => (
                <div key={question} className={`${card} flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300`}>
                  <Sparkles size={17} className="shrink-0 text-blue-600" />
                  {question}
                </div>
              ))}
            </div>
          </div>
        )

      case 'Upgrade':
        return (
          <div className="mx-auto max-w-3xl">
            <div className={`${card} text-center`}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upgrade TinyDepot</h2>
              <p className={`${muted} mt-2`}>Unlock more tools for your growing business.</p>
              <div className="mx-auto mt-6 max-w-md rounded-xl border-2 border-blue-500 p-6 text-left">
                <p className="text-lg font-bold text-slate-900 dark:text-white">TinyDepot Pro</p>
                <p className="mt-1 text-sm text-slate-500">Advanced inventory management</p>
                <p className="my-5 text-3xl font-bold text-blue-600">Pro Plan</p>
                <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex gap-2"><Check size={17} className="text-green-600" /> AI inventory assistant</li>
                  <li className="flex gap-2"><Check size={17} className="text-green-600" /> Advanced reports</li>
                  <li className="flex gap-2"><Check size={17} className="text-green-600" /> Improved inventory insights</li>
                  <li className="flex gap-2"><Check size={17} className="text-green-600" /> Priority support</li>
                </ul>
                <button onClick={() => notify('Upgrade payment will be connected later.')} className={`${buttonPrimary} mt-6 w-full`}>Upgrade Now</button>
              </div>
              <p className={`${muted} mt-4 text-xs`}>Demonstration only. No payment will be taken.</p>
            </div>
          </div>
        )

      case 'Settings':
        return (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className={heading}>Settings</h2>
              <p className={muted}>Customise your TinyDepot workspace.</p>
            </div>
            <div className={card}>
              <h3 className={`${heading} mb-4`}>Store Information</h3>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Store Name</label>
              <input className={inputClass} value={storeName} onChange={event => setStoreName(event.target.value)} />
              <label className="mb-1.5 mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
              <select className={inputClass} value={currency} onChange={event => setCurrency(event.target.value)}>
                <option value="TRY">Turkish Lira (TRY)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            <div className={card}>
              <h3 className={`${heading} mb-4`}>Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">Dark Mode</p>
                  <p className={muted}>Change the appearance of your workspace.</p>
                </div>
                <button onClick={() => setDark(!dark)} className={buttonSecondary}>
                  {dark ? <Sun size={17} /> : <Moon size={17} />}
                  {dark ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
            <div className={card}>
              <h3 className={`${heading} mb-2`}>Account</h3>
              <p className={muted}>{currentUser?.name}</p>
              <p className={muted}>{currentUser?.email}</p>
              <button onClick={handleSignOut} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // SIGN IN AND CREATE ACCOUNT SCREENS
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <Boxes size={30} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">TinyDepot</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Inventory management made simple.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="mb-6">
              <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin')
                    setAuthError('')
                    setAuthSuccess('')
                  }}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition ${authMode === 'signin' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup')
                    setAuthError('')
                    setAuthSuccess('')
                  }}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition ${authMode === 'signup' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {authMode === 'signin' ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to manage your inventory.</p>
                </div>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input type="email" className={inputClass} placeholder="you@example.com" value={authEmail} onChange={event => setAuthEmail(event.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <input type="password" className={inputClass} placeholder="Enter your password" value={authPassword} onChange={event => setAuthPassword(event.target.value)} required />
                  </div>

                  {authError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40">{authError}</p>}
                  {authSuccess && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40">{authSuccess}</p>}

                  <button type="submit" className={`${buttonPrimary} w-full py-3`}>
                    <LogIn size={17} /> Sign In
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button onClick={() => {
                    setAuthMode('signup')
                    setAuthError('')
                    setAuthSuccess('')
                  }} className="font-semibold text-blue-600 hover:text-blue-700">
                    Create Account
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create your account</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started with your TinyDepot workspace.</p>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input className={inputClass} placeholder="Enter your full name" value={authName} onChange={event => setAuthName(event.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input type="email" className={inputClass} placeholder="you@example.com" value={authEmail} onChange={event => setAuthEmail(event.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <input type="password" minLength={6} className={inputClass} placeholder="At least 6 characters" value={authPassword} onChange={event => setAuthPassword(event.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                    <input type="password" minLength={6} className={inputClass} placeholder="Enter your password again" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required />
                  </div>

                  {authError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40">{authError}</p>}
                  {authSuccess && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40">{authSuccess}</p>}

                  <button type="submit" className={`${buttonPrimary} w-full py-3`}>
                    <Users size={17} /> Create Account
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button onClick={() => {
                    setAuthMode('signin')
                    setAuthError('')
                    setAuthSuccess('')
                  }} className="font-semibold text-blue-600 hover:text-blue-700">
                    Sign In
                  </button>
                </p>
              </>
            )}
          </div>
          <p className="mt-5 text-center text-xs text-slate-400">
            TinyDepot Inventory Management System
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            Demonstration authentication — connect to a secure backend before production use.
          </p>
        </div>
      </div>
    )
  }

  // MAIN APPLICATION
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 px-4 py-6 text-white lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="rounded-xl bg-blue-600 p-2.5"><Boxes size={23} /></div>
          <div>
            <h1 className="text-xl font-bold">TinyDepot</h1>
            <p className="text-xs text-slate-400">Inventory Management</p>
          </div>
        </div>

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Workspace</p>
        <nav className="flex-1 space-y-1">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setPage(name)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${page === name ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </nav>

        <button onClick={() => setPage('Upgrade')} className="mb-5 rounded-xl border border-blue-500/30 bg-blue-600/10 p-4 text-left transition hover:bg-blue-600/20">
          <Sparkles size={20} className="mb-2 text-blue-400" />
          <p className="text-sm font-semibold">Upgrade to Pro</p>
          <p className="mt-1 text-xs text-slate-400">Explore more features.</p>
        </button>

        <div className="flex items-center gap-3 border-t border-slate-800 px-2 pt-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{currentUser.name}</p>
            <p className="truncate text-xs text-slate-400">Administrator</p>
          </div>
          <button onClick={handleSignOut} title="Sign out" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2 text-white lg:hidden"><Boxes size={20} /></div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{storeName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{page}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setDark(!dark)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" title="Toggle theme">
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" title="Notifications">
                <Bell size={19} />
                {lowItems.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-30 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <p className="mb-3 font-semibold text-slate-900 dark:text-white">Notifications</p>
                  {lowItems.length === 0 ? (
                    <p className={muted}>No new notifications.</p>
                  ) : (
                    lowItems.map(item => (
                      <div key={item.id} className="border-t border-slate-100 py-2 text-sm dark:border-slate-800">
                        <p className="font-medium text-slate-800 dark:text-white">{item.name}</p>
                        <p className="text-xs text-amber-600">Only {item.quantity} units remaining.</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-white">{currentUser.name}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <button onClick={handleSignOut} className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:inline-flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navigation.map(({ name, icon: Icon }) => (
              <button key={name} onClick={() => setPage(name)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${page === name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                <Icon size={15} /> {name}
              </button>
            ))}
            <button onClick={() => setPage('Upgrade')} className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Upgrade</button>
            <button onClick={handleSignOut} className="shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950">Sign Out</button>
          </div>
        </div>

        <div className="mx-auto max-w-[1600px] p-4 sm:p-7">
          {renderPage()}
        </div>
      </main>

      {showItemForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editing !== null ? 'Edit Item' : 'Add New Item'}</h2>
                <p className={muted}>Enter the product information below.</p>
              </div>
              <button onClick={resetItemForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
            </div>
            <form onSubmit={saveItem} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Item Name</label>
                <input className={inputClass} value={itemForm.name} onChange={event => setItemForm({ ...itemForm, name: event.target.value })} placeholder="Product name" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">SKU</label>
                <input className={inputClass} value={itemForm.sku} onChange={event => setItemForm({ ...itemForm, sku: event.target.value })} placeholder="TD-009" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select className={inputClass} value={itemForm.category} onChange={event => setItemForm({ ...itemForm, category: event.target.value })}>
                  {categories.map(category => <option key={category}>{category}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
                <input type="number" min="0" className={inputClass} value={itemForm.quantity} onChange={event => setItemForm({ ...itemForm, quantity: event.target.value })} required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Minimum Stock</label>
                <input type="number" min="0" className={inputClass} value={itemForm.minimum} onChange={event => setItemForm({ ...itemForm, minimum: event.target.value })} required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Selling Price</label>
                <input type="number" min="0" step="0.01" className={inputClass} value={itemForm.price} onChange={event => setItemForm({ ...itemForm, price: event.target.value })} required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Purchase Cost</label>
                <input type="number" min="0" step="0.01" className={inputClass} value={itemForm.cost} onChange={event => setItemForm({ ...itemForm, cost: event.target.value })} required />
              </div>
              <div className="mt-2 flex justify-end gap-3 sm:col-span-2">
                <button type="button" onClick={resetItemForm} className={buttonSecondary}>Cancel</button>
                <button type="submit" className={buttonPrimary}><Check size={16} /> {editing !== null ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
          <Check size={18} className="text-green-400" />
          {toast}
          <button onClick={() => setToast('')} className="ml-2 text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}
    </div>
  )
}

export default App
