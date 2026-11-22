import React, { useEffect, useRef, useState } from "react";
import { LuArrowUpRight, LuArrowDownRight, LuInbox, LuChevronRight, LuCircleCheck } from "react-icons/lu";

export function Card({ title, subtitle, actions, children, className = "", bodyClass = "card-body", style }) {
  return (
    <section className={`card ${className}`} style={style}>
      {(title || actions) && (
        <header className="card-head">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="page-actions">{actions}</div>}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

export function PageHeader({ crumbs = [], title, description, actions }) {
  return (
    <div className="page-head">
      <div>
        <div className="crumbs">
          <span>HealthSync Pro</span>
          {crumbs.map((c) => (
            <React.Fragment key={c}><LuChevronRight size={12} /><span>{c}</span></React.Fragment>
          ))}
        </div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, suffix, delta, deltaDir = "up", good = true, foot, tone = "teal" }) {
  const cls = deltaDir === "flat" ? "flat" : (deltaDir === "up") === good ? "up" : "down";
  return (
    <div className="card stat">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon tone-${tone}`}><Icon size={19} /></span>
      </div>
      <div className="stat-value">{value}{suffix && <small>{suffix}</small>}</div>
      <div className="stat-foot">
        {delta && (
          <span className={`delta ${cls}`}>
            {deltaDir === "up" ? <LuArrowUpRight size={13} /> : deltaDir === "down" ? <LuArrowDownRight size={13} /> : null}
            {delta}
          </span>
        )}
        <span>{foot}</span>
      </div>
    </div>
  );
}

const STATUS_TONE = {
  Admitted: "info", Critical: "crit", Observation: "warn", Stable: "ok", Discharged: "neutral",
  "On Duty": "ok", "Off Duty": "neutral", "On Call": "info", "In Procedure": "warn", "On Break": "warn", Remote: "teal",
  Success: "ok", Denied: "crit", Flagged: "warn",
  Watch: "warn", Weaning: "teal", "On target": "ok", "Below target": "crit", Monitor: "warn",
  normal: "ok", elevated: "warn", critical: "crit",
  Active: "ok", Enabled: "ok", Configured: "teal", Enforced: "ok", Pending: "warn", Demo: "neutral",
};

export function Badge({ children, tone, dot = true }) {
  const t = tone || STATUS_TONE[children] || "neutral";
  return <span className={`badge ${t}`}>{dot && <i />}{children}</span>;
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={value === t} className={`tab ${value === t ? "active" : ""}`} onClick={() => onChange(t)}>{t}</button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = LuInbox, title = "Nothing here yet", message, action }) {
  return (
    <div className="empty">
      <div className="ic"><Icon size={22} /></div>
      <b>{title}</b>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ h = 16, w = "100%", style }) {
  return <div className="skeleton" style={{ height: h, width: w, ...style }} />;
}

/** Placeholder layout shown while a page "loads" its demo data. */
export function PageSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="Loading">
      <Skeleton h={14} w={160} />
      <Skeleton h={26} w={280} style={{ marginTop: 10, marginBottom: 24 }} />
      <div className="grid stats">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="card stat" key={i}><Skeleton h={12} w="60%" /><Skeleton h={28} w="45%" /><Skeleton h={10} w="70%" /></div>
        ))}
      </div>
      <div className="grid cols-2 mt">
        <div className="card card-body"><Skeleton h={14} w="40%" /><Skeleton h={220} style={{ marginTop: 16 }} /></div>
        <div className="card card-body"><Skeleton h={14} w="40%" /><Skeleton h={220} style={{ marginTop: 16 }} /></div>
      </div>
    </div>
  );
}

/** Simulated async load so pages demonstrate loading states. */
export function useDemoLoad(key, ms = 450) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [key, ms]);
  return ready;
}

export function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside(); };
    const k = (e) => { if (e.key === "Escape") onOutside(); };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [onOutside]);
  return ref;
}

export function Switch({ checked, onChange, label }) {
  return <button className="switch" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />;
}

export function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return <div className="toast" role="status"><LuCircleCheck size={18} />{message}</div>;
}

export const initials = (name) =>
  name.replace(/^Dr\.\s*/, "").replace(/,.*$/, "").split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

export function Avatar({ name, size = "sm", color }) {
  return <span className={`avatar ${size}`} style={color ? { background: color } : undefined} aria-hidden="true">{initials(name)}</span>;
}

/** Fake CSV export of in-memory demo rows. */
export function downloadCsv(filename, rows, columns) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [columns.map((c) => esc(c.label)).join(","), ...rows.map((r) => columns.map((c) => esc(typeof c.value === "function" ? c.value(r) : r[c.key])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
