import React, { useState } from "react";
import { LuClock, LuRefreshCw, LuBedDouble, LuSmile, LuDownload, LuFileText, LuCalendar } from "react-icons/lu";
import { Card, PageHeader, StatCard, Badge, downloadCsv } from "../components/ui.jsx";
import { LineChart, BarChart, DonutChart } from "../components/charts/index.jsx";

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const DATA = {
  "6 months": {
    labels: MONTHS,
    los: [5.1, 4.9, 4.8, 4.7, 4.6, 4.4],
    readmit: [12.4, 12.1, 11.8, 11.2, 10.9, 10.6],
    edWait: [48, 44, 46, 41, 38, 36],
    admissions: [1180, 1224, 1252, 1198, 1306, 1284],
  },
  "Quarter": {
    labels: ["Sep", "Oct", "Nov"],
    los: [4.7, 4.6, 4.4], readmit: [11.2, 10.9, 10.6], edWait: [41, 38, 36], admissions: [1198, 1306, 1284],
  },
};

const REPORTS = [
  { name: "Daily census summary", owner: "Bed Management", freq: "Daily 06:00", last: "Nov 22, 06:00", status: "Ready" },
  { name: "Clinical quality indicators", owner: "Quality Office", freq: "Weekly", last: "Nov 18, 07:00", status: "Ready" },
  { name: "Ventilator utilization", owner: "Respiratory Care", freq: "Weekly", last: "Nov 18, 07:15", status: "Ready" },
  { name: "Readmission analysis (30-day)", owner: "Population Health", freq: "Monthly", last: "Nov 01, 08:00", status: "Ready" },
  { name: "Access audit summary", owner: "Compliance", freq: "Monthly", last: "Nov 01, 08:30", status: "Ready" },
  { name: "Staffing variance", owner: "Nursing Admin", freq: "Per shift", last: "Generating…", status: "Pending" },
];

export default function Reports({ notify }) {
  const [period, setPeriod] = useState("6 months");
  const d = DATA[period];

  return (
    <div className="page">
      <PageHeader crumbs={["Reports & Analytics"]} title="Reports & Analytics" description="Operational and quality performance indicators · fictional demonstration data"
        actions={<>
          <div className="chips">{Object.keys(DATA).map((p) => <button key={p} className={`chip ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>{p}</button>)}</div>
          <button className="btn primary" onClick={() => downloadCsv("healthsync-kpis-demo.csv", d.labels.map((m, i) => ({ month: m, los: d.los[i], readmit: d.readmit[i], ed: d.edWait[i], adm: d.admissions[i] })), [
            { key: "month", label: "Month" }, { key: "adm", label: "Admissions" }, { key: "los", label: "Avg LOS (days)" }, { key: "readmit", label: "30-day readmission %" }, { key: "ed", label: "ED wait (min)" }])}>
            <LuDownload size={15} />Export KPIs
          </button>
        </>} />

      <div className="grid cols-4">
        <StatCard icon={LuClock} label="Avg length of stay" value={d.los.at(-1)} suffix="days" delta="0.2 d" deltaDir="down" foot="vs prior month" tone="navy" />
        <StatCard icon={LuRefreshCw} label="30-day readmissions" value={`${d.readmit.at(-1)}%`} delta="0.3 pts" deltaDir="down" foot="target ≤ 11%" tone="teal" />
        <StatCard icon={LuBedDouble} label="Bed turnover time" value="2.6" suffix="hrs" delta="18 min" deltaDir="down" foot="clean-to-occupied" tone="sky" />
        <StatCard icon={LuSmile} label="Patient satisfaction" value="91" suffix="/ 100" delta="2 pts" deltaDir="up" foot="HCAHPS-style survey (demo)" tone="ok" />
      </div>

      <div className="grid cols-2 mt">
        <Card title="Monthly admissions" subtitle="Total inpatient admissions">
          <BarChart labels={d.labels} series={[{ label: "Admissions", data: d.admissions, color: "#2b4580" }]} height={240} />
        </Card>
        <Card title="Quality indicators" subtitle="Length of stay (days) and readmission rate (%)">
          <LineChart labels={d.labels} series={[
            { label: "Avg LOS (days)", data: d.los, color: "#0d9488", area: true },
            { label: "Readmission (%)", data: d.readmit, color: "#ef4444" },
          ]} height={240} yMin={0} yMax={15} />
        </Card>
      </div>

      <div className="grid cols-3 mt">
        <Card title="ED door-to-provider" subtitle="Median minutes">
          <LineChart labels={d.labels} series={[{ label: "Minutes", data: d.edWait, color: "#0ea5e9", area: true }]} height={200} yMin={0} yMax={60} unit=" min" />
        </Card>
        <Card title="Payer mix" subtitle="Share of current encounters">
          <DonutChart data={[{ label: "Medicare", value: 41 }, { label: "Commercial", value: 34 }, { label: "Medicaid", value: 17 }, { label: "Self-pay", value: 8 }]} size={150} thickness={22} centerLabel="% encounters" />
        </Card>
        <Card title="Discharge disposition" subtitle="Last 30 days">
          <DonutChart data={[{ label: "Home", value: 612 }, { label: "Home health", value: 188 }, { label: "SNF / rehab", value: 141 }, { label: "Transfer", value: 39 }]} size={150} thickness={22} centerLabel="Discharges" />
        </Card>
      </div>

      <Card className="mt" title="Scheduled reports" subtitle="Automated report library" bodyClass="card-body flush">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Report</th><th>Owner</th><th>Frequency</th><th>Last run</th><th>Status</th><th /></tr></thead>
            <tbody>
              {REPORTS.map((r) => (
                <tr key={r.name}>
                  <td><span className="cell-person"><span className="stat-icon tone-sky" style={{ width: 30, height: 30 }}><LuFileText size={15} /></span><b>{r.name}</b></span></td>
                  <td>{r.owner}</td>
                  <td><span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><LuCalendar size={13} className="muted" />{r.freq}</span></td>
                  <td className="muted">{r.last}</td>
                  <td><Badge tone={r.status === "Ready" ? "ok" : "warn"}>{r.status}</Badge></td>
                  <td><button className="btn sm" disabled={r.status !== "Ready"} onClick={() => notify(`“${r.name}” queued for download (demo)`)}><LuDownload size={13} />Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
