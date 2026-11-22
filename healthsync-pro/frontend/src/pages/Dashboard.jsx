import React, { useState } from "react";
import {
  LuUsers, LuBedDouble, LuUserCheck, LuFlaskConical, LuTriangleAlert, LuHospital, LuDownload, LuRefreshCw,
  LuUserPlus, LuArrowUpRight, LuStickyNote, LuPill, LuWind, LuLogOut,
} from "react-icons/lu";
import { Card, PageHeader, StatCard, Badge, Tabs } from "../components/ui.jsx";
import { LineChart, BarChart, DonutChart, HBarList } from "../components/charts/index.jsx";
import {
  overview, days, admissionsTrend, dischargeTrend, weekDays, dailyDischarges, bedOccupancy,
  departmentDistribution, recentActivity, clinicalAlerts,
} from "../data/operations.js";

const ACT_ICON = {
  admit: [LuUserPlus, "tone-sky"], lab: [LuFlaskConical, "tone-violet"], transfer: [LuArrowUpRight, "tone-navy"],
  note: [LuStickyNote, "tone-teal"], rt: [LuWind, "tone-teal"], discharge: [LuLogOut, "tone-ok"], med: [LuPill, "tone-warn"],
};
const SEV = { critical: ["crit", LuTriangleAlert], warning: ["warn", LuTriangleAlert], info: ["info", LuFlaskConical] };

export default function Dashboard({ navigate, notify }) {
  const [range, setRange] = useState("14 days");
  const [alertFilter, setAlertFilter] = useState("All");
  const n = range === "7 days" ? 7 : 14;
  const occTotal = bedOccupancy.reduce((a, b) => a + b.occupied, 0);
  const bedTotal = bedOccupancy.reduce((a, b) => a + b.total, 0);
  const alerts = clinicalAlerts.filter((a) => alertFilter === "All" || a.severity === alertFilter.toLowerCase());

  return (
    <div className="page">
      <PageHeader
        crumbs={["Dashboard"]}
        title="Good afternoon, Dr. Carter"
        description="Hospital-wide operations snapshot · Sunday, November 22, 2026 · Updated 2 minutes ago"
        actions={<>
          <button className="btn" onClick={() => notify("Dashboard data refreshed (demo)")}><LuRefreshCw size={15} />Refresh</button>
          <button className="btn primary" onClick={() => navigate("reports")}><LuDownload size={15} />Export report</button>
        </>}
      />

      <div className="grid stats">
        <StatCard icon={LuUsers} label="Total Patients" value={overview.totalPatients.toLocaleString()} delta="4.2%" deltaDir="up" foot="vs last month" tone="navy" />
        <StatCard icon={LuHospital} label="Active Admissions" value={overview.activeAdmissions} delta="12" deltaDir="up" good={false} foot="since yesterday" tone="sky" />
        <StatCard icon={LuBedDouble} label="Available Beds" value={overview.availableBeds} suffix={`/ ${overview.totalBeds}`} delta="87% occupied" deltaDir="flat" foot="" tone="teal" />
        <StatCard icon={LuUserCheck} label="Discharged Today" value={overview.discharged} delta="16%" deltaDir="up" foot="vs 7-day avg" tone="ok" />
        <StatCard icon={LuFlaskConical} label="Pending Lab Results" value={overview.pendingLabs} delta="9" deltaDir="down" foot="fewer than 08:00" tone="violet" />
        <StatCard icon={LuTriangleAlert} label="Active Clinical Alerts" value={overview.activeAlerts} delta="3 critical" deltaDir="flat" foot="" tone="crit" />
      </div>

      <div className="grid cols-3 mt">
        <Card className="span-2" title="Patient admission trends" subtitle="Admissions vs discharges per day"
          actions={<div className="chips">{["7 days", "14 days"].map((r) => <button key={r} className={`chip ${range === r ? "active" : ""}`} onClick={() => setRange(r)}>{r}</button>)}</div>}>
          <LineChart labels={days.slice(-n)} series={[
            { label: "Admissions", data: admissionsTrend.slice(-n), color: "#2b4580", area: true },
            { label: "Discharges", data: dischargeTrend.slice(-n), color: "#0d9488" },
          ]} height={340} />
        </Card>
        <Card title="Patients by department" subtitle="Current inpatient census">
          <DonutChart data={departmentDistribution} centerLabel="Inpatients" size={168} />
        </Card>
      </div>

      <div className="grid cols-3 mt">
        <Card title="Daily discharge statistics" subtitle="This week, by disposition">
          <BarChart labels={weekDays} series={Object.entries(dailyDischarges).map(([label, data], i) => ({ label, data, color: ["#0d9488", "#ef4444", "#0ea5e9"][i] }))} stacked height={230} />
        </Card>
        <Card title="Bed occupancy" subtitle={`${occTotal} of ${bedTotal} staffed beds · ${Math.round((occTotal / bedTotal) * 100)}%`}
          actions={<div className="legend"><span><i style={{ background: "#0d9488" }} />&lt;85%</span><span><i style={{ background: "#f59e0b" }} />85–94%</span><span><i style={{ background: "#dc2626" }} />≥95%</span></div>}>
          <HBarList rows={bedOccupancy.map((b) => ({ label: b.unit, pct: Math.round((b.occupied / b.total) * 100), ...b }))} format={(r) => `${r.occupied}/${r.total}`} />
        </Card>
        <Card title="Clinical alerts" subtitle={`${clinicalAlerts.filter((a) => a.severity === "critical").length} critical require attention`} bodyClass="card-body flush">
          <Tabs tabs={["All", "Critical", "Warning", "Info"]} value={alertFilter} onChange={setAlertFilter} />
          <ul className="list" style={{ maxHeight: 268, overflowY: "auto" }}>
            {alerts.map((a) => {
              const [tone, Icon] = SEV[a.severity];
              return (
                <li key={a.id} className={`list-row alert-row ${a.severity}`}>
                  <span className={`ic tone-${tone}`}><Icon size={15} /></span>
                  <div className="txt"><b>{a.title}</b><span>{a.patient} · {a.bed}</span></div>
                  <time>{a.time}</time>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid cols-2 mt">
        <Card title="Recent patient activity" subtitle="Live feed across all units" bodyClass="card-body flush"
          actions={<button className="btn sm ghost" onClick={() => navigate("patients")}>Open directory</button>}>
          <ul className="list">
            {recentActivity.map((a, i) => {
              const [Icon, tone] = ACT_ICON[a.type];
              return (
                <li key={i} className="list-row">
                  <span className={`ic ${tone}`}><Icon size={15} /></span>
                  <div className="txt"><b>{a.text}</b><span>{a.who}</span></div>
                  <time>{a.time}</time>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="Unit status board" subtitle="Staffing and throughput by unit" bodyClass="card-body flush">
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Unit</th><th className="num">Census</th><th className="num">Pending</th><th className="num">RN ratio</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  ["ICU", 26, 3, "1:2", "Critical"],
                  ["Emergency", 34, 7, "1:4", "Watch"],
                  ["Cardiology", 44, 2, "1:4", "Stable"],
                  ["Medical/Surgical", 98, 5, "1:5", "Stable"],
                  ["Orthopedics", 32, 1, "1:5", "Watch"],
                  ["Pediatrics", 22, 0, "1:3", "Stable"],
                ].map(([u, c, p, r, s]) => (
                  <tr key={u}>
                    <td><b>{u}</b></td><td className="num">{c}</td><td className="num">{p}</td><td className="num">{r}</td>
                    <td><Badge tone={s === "Critical" ? "crit" : s === "Watch" ? "warn" : "ok"}>{s === "Critical" ? "At capacity" : s === "Watch" ? "Near capacity" : "Normal"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
