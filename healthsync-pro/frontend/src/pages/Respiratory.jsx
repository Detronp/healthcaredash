import React, { useState } from "react";
import { LuWind, LuDroplets, LuGauge, LuTrendingUp, LuClock, LuTriangleAlert, LuFlaskConical } from "react-icons/lu";
import { Card, PageHeader, StatCard, Badge, Tabs } from "../components/ui.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { LineChart, BarChart } from "../components/charts/index.jsx";
import { ventilators, oxygenTherapy, rtTasks } from "../data/respiratory.js";
import { trend, hours } from "../lib/vitals.js";

const vtPerKg = (v) => Math.round((v.vt / v.pbw) * 10) / 10;
const dp = (v) => v.pplat - v.peep;
const pf = (v) => Math.round(v.abg.pao2 / (v.fio2 / 100));

/** Demonstration-only flags based on commonly cited lung-protective targets. */
function flags(v) {
  const f = [];
  if (v.pplat > 30) f.push("Pplat > 30");
  if (vtPerKg(v) > 8) f.push("VT > 8 mL/kg");
  if (dp(v) > 15) f.push("ΔP > 15");
  if (v.fio2 >= 60) f.push("FiO₂ ≥ 60%");
  if (v.spo2 < 90) f.push("SpO₂ < 90%");
  return f;
}

const Val = ({ v, warn, crit, children }) => (
  <span className={`vital ${crit ? "critical" : warn ? "elevated" : "normal"}`}>{children ?? v}</span>
);

function abgTone(k, v) {
  const r = { ph: [7.35, 7.45, 7.25, 7.55], paco2: [35, 45, 25, 60], pao2: [80, 100, 60, 400], hco3: [22, 26, 16, 34], sao2: [94, 100, 88, 101] }[k];
  if (v < r[2] || v > r[3]) return "critical";
  if (v < r[0] || v > r[1]) return "elevated";
  return "normal";
}

export default function Respiratory({ openPatient }) {
  const [sel, setSel] = useState(ventilators[0].patientId);
  const [tab, setTab] = useState("Ventilators");
  const v = ventilators.find((x) => x.patientId === sel);
  const seed = parseInt(sel.slice(-3), 10);
  const labels = hours(12, 12);
  const avgFio2 = Math.round(ventilators.reduce((a, x) => a + x.fio2, 0) / ventilators.length);
  const weaning = ventilators.filter((x) => x.status === "Weaning" || (x.fio2 <= 40 && x.peep <= 8)).length;

  const ventCols = [
    { key: "bed", label: "Bed", render: (r) => <b>{r.bed}</b> },
    { key: "name", label: "Patient", render: (r) => <span><div className="cell-main">{r.name}</div><div className="cell-sub mono">{r.patientId} · Vent day {r.day}</div></span> },
    { key: "mode", label: "Mode", render: (r) => <span className="badge neutral" style={{ fontFamily: "var(--mono)" }}>{r.mode}</span> },
    { key: "vt", label: "VT (mL)", className: "num", render: (r) => <span>{r.vt} <span className="muted" style={{ fontSize: 11.5 }}>({vtPerKg(r)}/kg)</span></span> },
    { key: "rate", label: "RR set", className: "num" },
    { key: "peep", label: "PEEP", className: "num", render: (r) => <Val warn={r.peep >= 12} crit={r.peep >= 16} v={r.peep} /> },
    { key: "fio2", label: "FiO₂", className: "num", render: (r) => <Val warn={r.fio2 >= 50} crit={r.fio2 >= 70}>{r.fio2}%</Val> },
    { key: "pip", label: "PIP", className: "num", render: (r) => <Val warn={r.pip > 30} crit={r.pip > 35} v={r.pip} /> },
    { key: "pplat", label: "Pplat", className: "num", render: (r) => <Val warn={r.pplat > 27} crit={r.pplat > 30} v={r.pplat} /> },
    { key: "spo2", label: "SpO₂", className: "num", render: (r) => <Val warn={r.spo2 < 92} crit={r.spo2 < 90}>{r.spo2}%</Val> },
    { key: "status", label: "Monitoring", render: (r) => <Badge>{r.status}</Badge> },
  ];

  const o2Cols = [
    { key: "bed", label: "Bed", render: (r) => <b>{r.bed}</b> },
    { key: "name", label: "Patient", render: (r) => <span className="cell-main">{r.name}</span> },
    { key: "device", label: "Device" },
    { key: "flow", label: "Flow / settings" },
    { key: "fio2", label: "FiO₂", className: "num", render: (r) => `${r.fio2}%` },
    { key: "spo2", label: "SpO₂", className: "num", render: (r) => <Val warn={r.status === "Below target"}>{r.spo2}%</Val> },
    { key: "target", label: "Target" },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];

  return (
    <div className="page">
      <PageHeader crumbs={["Respiratory Therapy"]} title="Respiratory Care Dashboard"
        description="Ventilator census, oxygen therapy and blood-gas review · fictional demonstration data" />

      <div className="grid cols-4">
        <StatCard icon={LuWind} label="Ventilator census" value={ventilators.length} foot={`${ventilators.filter((x) => x.status === "Critical").length} critical`} tone="navy" />
        <StatCard icon={LuDroplets} label="Oxygen therapy" value={oxygenTherapy.length} foot="NC · HFNC · NIV · Venturi" tone="sky" />
        <StatCard icon={LuGauge} label="Mean FiO₂ (ventilated)" value={`${avgFio2}%`} delta="4%" deltaDir="down" foot="vs 06:00" tone="teal" />
        <StatCard icon={LuTrendingUp} label="Weaning candidates" value={weaning} foot="Meet SBT screen criteria" tone="ok" />
      </div>

      <Card className="mt" bodyClass="">
        <Tabs tabs={["Ventilators", "Oxygen therapy", "RT task queue"]} value={tab} onChange={setTab} />
        {tab === "Ventilators" && (
          <DataTable columns={ventCols} rows={ventilators} rowKey={(r) => r.patientId} onRowClick={(r) => setSel(r.patientId)} selectedKey={sel} pageSize={10} />
        )}
        {tab === "Oxygen therapy" && <DataTable columns={o2Cols} rows={oxygenTherapy} rowKey={(r) => r.patientId} pageSize={10} />}
        {tab === "RT task queue" && (
          <ul className="list">
            {rtTasks.map((t) => (
              <li className="list-row" key={t.time + t.bed}>
                <span className="ic tone-teal"><LuClock size={15} /></span>
                <div className="txt"><b>{t.task} · {t.bed}</b><span>{t.owner}</span></div>
                <time>{t.time}</time>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid cols-3 mt">
        <Card title={`Ventilator settings · ${v.bed}`} subtitle={`${v.name} · ${v.mode} · ${v.therapist}`}
          actions={v.patientId.startsWith("P-") ? <button className="btn sm" onClick={() => openPatient(v.patientId)}>Open chart</button> : null}>
          <div className="kv">
            <div><small>Mode</small><span>{v.mode}</span></div>
            <div><small>Set rate / measured</small><span>{v.rate} / {v.rrMeasured} bpm</span></div>
            <div><small>Tidal volume</small><span>{v.vt} mL · {vtPerKg(v)} mL/kg PBW</span></div>
            <div><small>PEEP</small><span>{v.peep} cmH₂O</span></div>
            <div><small>FiO₂</small><span>{v.fio2}%</span></div>
            <div><small>PIP</small><span>{v.pip} cmH₂O</span></div>
            <div><small>Plateau pressure</small><span>{v.pplat} cmH₂O</span></div>
            <div><small>Driving pressure</small><span>{dp(v)} cmH₂O</span></div>
            <div><small>SpO₂</small><span>{v.spo2}%</span></div>
            <div><small>P/F ratio</small><span>{pf(v)}</span></div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {flags(v).length ? flags(v).map((f) => <span key={f} className="badge crit"><LuTriangleAlert size={11} />{f}</span>) : <Badge tone="ok">Within lung-protective targets</Badge>}
          </div>
        </Card>

        <Card title="Arterial blood gas" subtitle={`Most recent · drawn ${v.abg.time}`} actions={<span className="stat-icon tone-violet" style={{ width: 30, height: 30 }}><LuFlaskConical size={15} /></span>}>
          <table className="data">
            <thead><tr><th>Parameter</th><th className="num">Result</th><th className="num">Ref.</th></tr></thead>
            <tbody>
              {[["pH", "ph", v.abg.ph.toFixed(2), "7.35–7.45"], ["PaCO₂", "paco2", v.abg.paco2, "35–45 mmHg"], ["PaO₂", "pao2", v.abg.pao2, "80–100 mmHg"], ["HCO₃⁻", "hco3", v.abg.hco3, "22–26 mEq/L"], ["SaO₂", "sao2", v.abg.sao2, "94–100%"]].map(([l, k, val, ref]) => (
                <tr key={k}><td><b>{l}</b></td><td className="num"><span className={`vital ${abgTone(k, Number(val))}`}>{val}</span></td><td className="num muted">{ref}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Interpretation (demo): {v.abg.ph < 7.35 ? (v.abg.paco2 > 45 ? "Acute respiratory acidosis" : "Metabolic acidosis") : v.abg.ph > 7.45 ? "Alkalemia" : "Acid–base within normal limits"}{pf(v) < 200 ? `; P/F ${pf(v)} suggests moderate–severe hypoxemia.` : "."}
          </div>
        </Card>

        <Card title="Unit P/F ratios" subtitle="Oxygenation by bed">
          <BarChart labels={ventilators.map((x) => x.bed.replace("ICU-", "Bed "))} series={[{ label: "P/F ratio", data: ventilators.map(pf), color: "#0ea5e9" }]} height={230} />
        </Card>
      </div>

      <div className="grid cols-2 mt">
        <Card title="Respiratory trends · 12 h" subtitle={`${v.name} · FiO₂ and PEEP titration`}>
          <LineChart labels={labels} series={[
            { label: "FiO₂ (%)", data: [...trend(v.fio2 + 8, 4, 11, seed).map(Math.round), v.fio2], color: "#2b4580" },
            { label: "PEEP (cmH₂O)", data: [...trend(v.peep, 1.2, 11, seed + 1).map(Math.round), v.peep], color: "#f59e0b" },
          ]} height={230} yMin={0} yMax={100} />
        </Card>
        <Card title="Pressures & saturation · 12 h" subtitle="Plateau pressure (dashed limit 30 cmH₂O) and SpO₂">
          <LineChart labels={labels} series={[
            { label: "SpO₂ (%)", data: [...trend(v.spo2, 2, 11, seed + 2).map((x) => Math.min(100, x)), v.spo2], color: "#0d9488", area: true },
            { label: "Pplat (cmH₂O)", data: [...trend(v.pplat, 2, 11, seed + 3), v.pplat], color: "#ef4444" },
            { label: "Limit", data: labels.map(() => 30), color: "#94a3b8", dashed: true },
          ]} height={230} yMin={0} yMax={100} />
        </Card>
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>Flags and interpretations are illustrative and do not constitute clinical decision support.</p>
    </div>
  );
}
