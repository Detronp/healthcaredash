import React, { useCallback, useState } from "react";
import {
  LuLayoutDashboard, LuUsers, LuHeartPulse, LuWind, LuStethoscope, LuChartBar, LuShieldCheck, LuSettings,
  LuBell, LuSearch, LuMenu, LuChevronDown, LuUserCog, LuLogOut, LuKeyRound, LuInfo, LuActivity,
  LuTriangleAlert, LuFlaskConical, LuCircleCheck, LuLock, LuX, LuCircleAlert,
} from "react-icons/lu";
import { useClickOutside, Avatar } from "./ui.jsx";
import { notifications as seedNotifications } from "../data/operations.js";

export const NAV = [
  { path: "dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { path: "patients", label: "Patient Management", icon: LuUsers },
  { path: "clinical", label: "Clinical Monitoring", icon: LuHeartPulse, badge: 3 },
  { path: "respiratory", label: "Respiratory Therapy", icon: LuWind },
  { path: "staff", label: "Staff Directory", icon: LuStethoscope },
  { path: "reports", label: "Reports & Analytics", icon: LuChartBar },
  { path: "security", label: "Security & Compliance", icon: LuShieldCheck },
  { path: "settings", label: "Settings", icon: LuSettings },
];

export const USER = { name: "Dr. Evelyn Carter", role: "Chief Medical Information Officer", id: "E-1007", email: "e.carter@healthsync.demo" };

export function Logo() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <LuActivity size={19} strokeWidth={2.6} />
    </span>
  );
}

export function Sidebar({ route, navigate, open, onClose }) {
  const go = (p) => { navigate(p); onClose(); };
  return (
    <>
      <div className={`scrim ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Primary">
        <div className="brand">
          <Logo />
          <div>
            <div className="brand-name">HealthSync <span>Pro</span></div>
            <div className="brand-sub">Connected Care Platform</div>
          </div>
        </div>
        <nav className="nav">
          <div className="nav-label">Clinical workspace</div>
          {NAV.slice(0, 5).map((n) => <NavItem key={n.path} item={n} active={route === n.path} onClick={() => go(n.path)} />)}
          <div className="nav-label">Administration</div>
          {NAV.slice(5).map((n) => <NavItem key={n.path} item={n} active={route === n.path} onClick={() => go(n.path)} />)}
        </nav>
        <div className="sidebar-foot">
          <div className="demo-pill">
            <LuInfo size={14} />
            <span>Demonstration environment. All patients, staff and events shown are fictional.</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick} aria-current={active ? "page" : undefined}>
      <Icon size={18} />
      <span>{item.label}</span>
      {item.badge ? <span className="nav-badge" aria-label={`${item.badge} critical`}>{item.badge}</span> : null}
    </button>
  );
}

const NOTIF_ICON = {
  critical: [LuTriangleAlert, "tone-crit"],
  info: [LuFlaskConical, "tone-sky"],
  success: [LuCircleCheck, "tone-ok"],
  security: [LuLock, "tone-navy"],
};

export function Topbar({ onMenu, navigate, onSearch }) {
  const [open, setOpen] = useState(null); // "notif" | "profile" | null
  const [items, setItems] = useState(seedNotifications);
  const [q, setQ] = useState("");
  const close = useCallback(() => setOpen(null), []);
  const notifRef = useClickOutside(open === "notif" ? close : () => {});
  const profRef = useClickOutside(open === "profile" ? close : () => {});
  const unread = items.filter((n) => n.unread).length;

  const submit = (e) => {
    e.preventDefault();
    onSearch(q.trim());
    navigate("patients");
  };

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open navigation"><LuMenu size={20} /></button>
      <form className="global-search" onSubmit={submit} role="search">
        <LuSearch size={16} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients by name, MRN or ID…" aria-label="Search patients" />
        <span className="kbd">Enter</span>
      </form>
      <div className="topbar-right">
        <span className="env-chip"><i />Demo · Fictional data</span>

        <div className="dropdown" ref={notifRef}>
          <button className="icon-btn" aria-label={`Notifications (${unread} unread)`} aria-expanded={open === "notif"} onClick={() => setOpen(open === "notif" ? null : "notif")}>
            <LuBell size={19} />
            {unread > 0 && <span className="dot" />}
          </button>
          {open === "notif" && (
            <div className="menu" role="menu">
              <div className="menu-head">
                <b>Notifications {unread > 0 && <span className="badge crit" style={{ marginLeft: 6 }}>{unread} new</span>}</b>
                <button className="link-btn" onClick={() => setItems(items.map((n) => ({ ...n, unread: false })))}>Mark all read</button>
              </div>
              {items.length === 0 ? (
                <div className="empty" style={{ padding: 28 }}><b>You're all caught up</b><p>No notifications right now.</p></div>
              ) : (
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {items.map((n) => {
                    const [Icon, tone] = NOTIF_ICON[n.kind] || [LuCircleAlert, "tone-sky"];
                    return (
                      <div key={n.id} className={`notif ${n.unread ? "unread" : ""}`}>
                        <span className={`notif-icon ${tone}`}><Icon size={16} /></span>
                        <div style={{ flex: 1 }}>
                          <b>{n.title}</b>
                          <p>{n.body}</p>
                          <small>{n.time}</small>
                        </div>
                        <button className="icon-btn" style={{ width: 26, height: 26 }} aria-label="Dismiss" onClick={() => setItems(items.filter((x) => x.id !== n.id))}><LuX size={14} /></button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="menu-head" style={{ borderTop: "1px solid var(--border)", borderBottom: 0, justifyContent: "center" }}>
                <button className="link-btn" onClick={() => { navigate("clinical"); close(); }}>View all clinical alerts</button>
              </div>
            </div>
          )}
        </div>

        <div className="dropdown" ref={profRef}>
          <button className="profile-btn" aria-expanded={open === "profile"} aria-label="User menu" onClick={() => setOpen(open === "profile" ? null : "profile")}>
            <Avatar name={USER.name} />
            <span className="profile-meta"><b>{USER.name}</b><small>CMIO · Administrator</small></span>
            <LuChevronDown size={15} className="muted" />
          </button>
          {open === "profile" && (
            <div className="menu narrow" role="menu">
              <div className="menu-user">
                <Avatar name={USER.name} />
                <div><b>{USER.name}</b><small>{USER.email}</small></div>
              </div>
              <div style={{ padding: "4px 0" }}>
                <button className="menu-item" onClick={() => { navigate("settings"); close(); }}><LuUserCog size={16} />Profile & preferences</button>
                <button className="menu-item" onClick={() => { navigate("security"); close(); }}><LuKeyRound size={16} />Security & MFA</button>
                <button className="menu-item" onClick={() => { navigate("settings"); close(); }}><LuSettings size={16} />Settings</button>
                <div className="menu-sep" />
                <button className="menu-item" onClick={() => { close(); window.dispatchEvent(new CustomEvent("hs:signout")); }}><LuLogOut size={16} />Sign out (demo)</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
