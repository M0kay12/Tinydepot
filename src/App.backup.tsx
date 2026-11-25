

import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChartNoAxesCombined,
  Bot,
  Sparkles,
  Search,
  Bell,
  TrendingUp,
  AlertTriangle,
  Menu,
} from "lucide-react";
import "./App.css";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Items", icon: Package },
  { name: "Stock In", icon: ArrowDownToLine },
  { name: "Stock Out", icon: ArrowUpFromLine },
  { name: "Reports", icon: ChartNoAxesCombined },
  { name: "AI Assistant", icon: Bot },
];

const stats = [
  {
    title: "Stock Increase",
    value: "+12.8%",
    note: "Compared to last month",
    icon: TrendingUp,
    color: "green",
  },
  {
    title: "Total Items",
    value: "1,248",
    note: "Products in inventory",
    icon: Package,
    color: "blue",
  },
  {
    title: "Low Stock",
    value: "18",
    note: "Items need attention",
    icon: AlertTriangle,
    color: "orange",
  },
  {
    title: "Profit / Loss",
    value: "₺24,650",
    note: "Sample monthly figure",
    icon: ChartNoAxesCombined,
    color: "purple",
  },
];

const products = [
  { name: "Wireless Mouse", category: "Electronics", quantity: 8, status: "Low Stock" },
  { name: "Notebook A5", category: "Stationery", quantity: 120, status: "In Stock" },
  { name: "USB-C Cable", category: "Accessories", quantity: 12, status: "Low Stock" },
  { name: "Desk Lamp", category: "Electronics", quantity: 36, status: "In Stock" },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const isDashboard = activePage === "Dashboard";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">T</div>
          <span>Tiny<span className="brand-light">Depot</span></span>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav>
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${activePage === name ? "active" : ""}`}
              onClick={() => {
                setActivePage(name);
                setMobileMenu(false);
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
            </button>
          ))}
        </nav>

        <div className="upgrade-card">
          <Sparkles size={22} />
          <h3>Upgrade to Pro</h3>
          <p>Unlock smarter inventory insights with AI.</p>
          <button onClick={() => setActivePage("Upgrade")}>
            Explore Pro
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">MK</div>
          <div>
            <strong>My Workspace</strong>
            <small>Inventory Manager</small>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-toggle icon-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation"
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">Workspace / {activePage}</div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input placeholder="Search inventory..." />
            </div>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="avatar">MK</div>
          </div>
        </header>

        <div className="page-content">
          {isDashboard ? (
            <>
              <section className="welcome-row">
                <div>
                  <p className="eyebrow">OVERVIEW</p>
                  <h1>Dashboard</h1>
                  <p className="subtitle">
                    Welcome back! Here's what's happening with your inventory.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setActivePage("Stock In")}
                >
                  + Add Stock
                </button>
              </section>

              <section className="stats-grid">
                {stats.map(({ title, value, note, icon: Icon, color }) => (
                  <article className="stat-card" key={title}>
                    <div className="stat-top">
                      <span>{title}</span>
                      <div className={`stat-icon ${color}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <h2>{value}</h2>
                    <p>{note}</p>
                  </article>
                ))}
              </section>

              <section className="content-grid">
                <article className="panel overview-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Inventory Overview</h2>
                      <p>Illustrative stock activity</p>
                    </div>
                    <span className="period-label">Last 7 days</span>
                  </div>

                  <div className="chart">
                    {[42, 65, 48, 78, 56, 88, 70].map((height, i) => (
                      <div className="chart-column" key={i}>
                        <div
                          className="chart-bar"
                          style={{ height: `${height}%` }}
                        />
                        <small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</small>
                      </div>
                    ))}
                  </div>
                  <p className="chart-caption">
                    Sample visualization — connect real inventory data later.
                  </p>
                </article>

                <article className="panel alerts-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Low Stock Alerts</h2>
                      <p>Products to review</p>
                    </div>
                    <span className="alert-count">2</span>
                  </div>

                  {products
                    .filter((product) => product.status === "Low Stock")
                    .map((product) => (
                      <div className="alert-row" key={product.name}>
                        <div className="product-symbol">
                          <Package size={19} />
                        </div>
                        <div className="alert-product">
                          <strong>{product.name}</strong>
                          <small>{product.category}</small>
                        </div>
                        <span className="quantity-badge">
                          {product.quantity} left
                        </span>
                      </div>
                    ))}

                  <button
                    className="text-button"
                    onClick={() => setActivePage("Items")}
                  >
                    View all items →
                  </button>
                </article>
              </section>

              <section className="panel table-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Inventory Items</h2>
                    <p>A quick look at your products</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActivePage("Items")}
                  >
                    View all →
                  </button>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.name}>
                          <td className="product-name">{product.name}</td>
                          <td>{product.category}</td>
                          <td>{product.quantity}</td>
                          <td>
                            <span className={`status ${product.status === "Low Stock" ? "low" : "good"}`}>
                              {product.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <section className="placeholder-page">
              <div className="placeholder-icon">
                {activePage === "Upgrade" ? (
                  <Sparkles size={30} />
                ) : activePage === "AI Assistant" ? (
                  <Bot size={30} />
                ) : (
                  <Package size={30} />
                )}
              </div>
              <p className="eyebrow">TINYDEPOT WORKSPACE</p>
              <h1>{activePage}</h1>
              <p className="subtitle">
                This section is part of the frontend architecture.
                Its interface and functionality will be developed in the next phase.
              </p>
              <button
                className="primary-button"
                onClick={() => setActivePage("Dashboard")}
              >
                Return to Dashboard
              </button>
            </section>
          )}

          <footer className="page-footer">
            TinyDepot · Inventory Management System · Frontend Prototype
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
