import React, { useEffect, useMemo, useState } from "react";
import { LuTriangleAlert, LuCircleCheck, LuActivity, LuUsers, LuPause, LuPlay, LuSearch } from "react-icons/lu";
import { Card, PageHeader, StatCard, Badge, Avatar } from "../components/ui.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { VitalTile, vitalTiles } from "../components/PatientDrawer.jsx";
import { LineChart, Sparkline } from "../components/charts/index.jsx";
import { patients } from "../data/patients.js";
import { levelOf, overallLevel, trend, hours } from "../lib/vitals.js";

const monitored = patients.filter((p) => p.status !== "Discharged");
const ORDER = { critical: 0, elevated: 1, normal: 2 };

/** Small bounded jitter so the "live" feed looks plausible but stays in range. */
const jitter = (v, amt, lo, hi, dp = 0) => {
  const n = v + (Math.random() - 0.5) * amt;
  const f = Math.pow(10, dp);
  return Math.round(Math.max(lo, Math.min(hi, n)) * f) / f;
};

export default function Clinical({ openPatient }) {
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [vitals, setVitals] = useState(() => Object.fromEntries(monitored.map((p) => [p.id, p.vitals])));
  const [selected, setSelected] = useState(monitored.find((p) => p.status === "Critical")?.id || monitored[0].id);
  const [level, setLevel] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!live) return undefined;
    const t = setInterval(() => {
      setTick((x) => x + 1);
      setVitals((prev) => Object.fromEntries(Object.entries(prev).map(([id, v]) => {
        const base = monitored.find((p) => p.id === id).vitals;
        return [id, {
          ...v,
          hr: jitter((v.hr + base.hr) / 2, 6, 40, 180),
          spo2: jitter((v.spo2 + base.spo2) / 2, 2, 80, 100),
          rr: jitter((v.rr + base.rr) / 2, 2, 8, 40),
          sbp: jitter((v.sbp + base.sbp) / 2, 6, 70, 200),
        }];
      })));
    }, 3000);
    return () => clearInterval(t);
  }, [live]);

  const rows = useMemo(() => monitored.map((p) => ({ ...p, v: vitals[p.id], level: overallLevel(vitals[p.id]) }))
    .filter((r) => (level === "All" || r.level === level.toLowerCase()) && (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.room.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => ORDER[a.level] - ORDER[b.level]), [vitals, level, q]);

  const all = monitored.map((p) => overallLevel(vitals[p.id]));
  const count = (l) => all.filter((x) => x === l).length;
  const sel = monitored.find((p) => p.id === selected);
  const sv = vitals[selected];
  const seed = parseInt(selected.slice(-3), 10);
  const labels = hours(12, 12);

  const V = ({ k, v, text }) => <span className={`vital ${levelOf(k, v)}`}>{text ?? v}</span>;
  const columns = [
    { key: "name", label: "Patient", render: (r) => (
      <span className="cell-person"><Avatar name={r.name} /><span><div className="cell-main">{r.name}</div><div className="cell-sub">{r.room} · {r.department}</div></span></span>) },
    { key: "hr", label: "HR", sortValue: (r) => r.v.hr, render: (r) => <V k="hr" v={r.v.hr} /> },
    { key: "bp", label: "BP", sortValue: (r) => r.v.sbp, render: (r) => <V k="sbp" v={r.v.sbp} text={`${r.v.sbp}/${r.v.dbp}`} /> },
    { key: "rr", label: "RR", sortValue: (r) => r.v.rr, render: (r) => <V k="rr" v={r.v.rr} /> },
    { key: "spo2", label: "SpO₂", sortValue: (r) => r.v.spo2, render: (r) => <V k="spo2" v={r.v.spo2} text={`${r.v.spo2}%`} /> },
    { key: "temp", label: "Temp", sortValue: (r) => r.v.temp, render: (r) => <V k="temp" v={r.v.temp} text={`${r.v.temp.toFixed(1)}°`} /> },
    { key: "pain", label: "Pain", sortValue: (r) => r.v.pain, render: (r) => <V k="pain" v={r.v.pain} /> },
    { key: "trend", label: "HR trend", sortable: false, render: (r) => <Sparkline data={trend(r.vitals.hr, 10, 12, parseInt(r.id.slice(-3), 10))} color={r.level === "critical" ? "#dc2626" : r.level === "elevated" ? "#f59e0b" : "#0d9488"} /> },
    { key: "level", label: "Status", sortValue: (r) => ORDER[r.level], render: (r) => <Badge>{r.level === "critical" ? "Critical" : r.level === "elevated" ? "Elevated" : "Normal"}</Badge> },
  ];

  return (
    <div className="page">
      <PageHeader crumbs={["Clinical Monitoring"]} title="Clinical Monitoring"
        description="Bedside vital signs across monitored inpatients · fictional demonstration feed"
        actions={<button className={`btn ${live ? "navy" : ""}`} onClick={() => setLive(!live)} aria-pressed={live}>
          {live ? <><LuPause size={15} />Pause live feed</> : <><LuPlay size={15} />Resume live feed</>}
        </button>}
      />

      <div className="grid cols-4">
        <StatCard icon={LuUsers} label="Monitored patients" value={monitored.length} foot={live ? `Live · refreshed ${tick ? "3s ago" : "just now"}` : "Feed paused"} tone="navy" />
        <StatCard icon={LuTriangleAlert} label="Critical" value={count("critical")} foot="Immediate review" tone="crit" />
        <StatCard icon={LuActivity} label="Elevated" value={count("elevated")} foot="Outside reference range" tone="warn" />
        <StatCard icon={LuCircleCheck} label="Within range" value={count("normal")} foot="All parameters normal" tone="ok" />
      </div>

      <Card className="mt" title={<span style={{ display: "flex", alignItems: "center", gap: 10 }}>{sel.name} {overallLevel(sv) === "critical" && <span className="pulse" />}</span>}
        subtitle={`${sel.room} · ${sel.department} · ${sel.diagnosis}`}
        actions={<>
          <select className="select" value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Select patient to monitor">
            {monitored.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.room}</option>)}
          </select>
          <button className="btn" onClick={() => openPatient(selected)}>Open chart</button>
        </>}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {vitalTiles(sv).map((t) => <VitalTile key={t.k} {...t} />)}
        </div>
        <div className="grid cols-2 mt">
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Heart rate & respiratory rate · 12 h</div>
            <LineChart labels={labels} series={[
              { label: "HR (bpm)", data: [...trend(sel.vitals.hr, 10, 11, seed), sv.hr], color: "#ef4444" },
              { label: "RR (/min)", data: [...trend(sel.vitals.rr, 3, 11, seed + 3), sv.rr], color: "#2b4580" },
            ]} height={210} yMin={0} yMax={160} bands={[{ from: 50, to: 100, color: "rgba(13,148,136,0.06)" }]} />
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Oxygen saturation · 12 h <span className="muted" style={{ fontWeight: 400 }}>(shaded = target ≥ 94%)</span></div>
            <LineChart labels={labels} series={[
              { label: "SpO₂ (%)", data: [...trend(sel.vitals.spo2, 2.5, 11, seed + 5).map((v) => Math.min(100, v)), sv.spo2], color: "#0d9488", area: true },
            ]} height={210} yMin={80} yMax={100} unit="%" bands={[{ from: 94, to: 100, color: "rgba(13,148,136,0.08)" }, { from: 80, to: 90, color: "rgba(220,38,38,0.05)" }]} />
          </div>
        </div>
      </Card>

      <Card className="mt" title="Patient monitoring table" subtitle="Sorted by acuity · click a row to focus the bedside view" bodyClass=""
        actions={<div className="legend-key">
          <span className="vital normal" style={{ border: "1px solid var(--border)" }}>Normal</span>
          <span className="vital elevated">Elevated</span>
          <span className="vital critical">Critical</span>
        </div>}>
        <div className="toolbar">
          <div className="field">
            <LuSearch size={15} />
            <input className="input with-icon" placeholder="Filter by patient or bed" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter monitoring table" />
          </div>
          <div className="chips">
            {["All", "Critical", "Elevated", "Normal"].map((l) => <button key={l} className={`chip ${level === l ? "active" : ""}`} onClick={() => setLevel(l)}>{l}</button>)}
          </div>
        </div>
        <DataTable columns={columns} rows={rows} pageSize={20} onRowClick={(r) => { setSelected(r.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} selectedKey={selected}
          emptyTitle="No patients in this category" emptyMessage="No monitored patients currently match this filter." />
      </Card>
      <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>Reference ranges are simplified adult values for interface demonstration and are not clinical decision support.</p>
    </div>
  );
}
