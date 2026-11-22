import React, { useEffect, useMemo, useState } from "react";
import {
  LuShieldCheck, LuFingerprint, LuUsers, LuTimer, LuLock, LuHistory, LuTriangleAlert, LuInfo, LuSearch,
  LuCheck, LuMinus, LuX, LuMonitor, LuSmartphone, LuKeyRound, LuServer, LuShieldAlert, LuDownload,
} from "react-icons/lu";
import { Card, PageHeader, StatCard, Badge, Tabs, downloadCsv } from "../components/ui.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { BarChart, Ring } from "../components/charts/index.jsx";
import { accessLogs, securityAlerts, rbacMatrix, sessions, loginActivity } from "../data/operations.js";

const FEATURES = [
  { icon: LuFingerprint, name: "Multi-factor authentication", desc: "Prompt required at sign-in for all clinical roles", status: "Configured" },
  { icon: LuUsers, name: "Role-based access control", desc: "4 roles · 8 permission groups (see matrix)", status: "Configured" },
  { icon: LuTimer, name: "Automatic session timeout", desc: "Idle sessions lock after the configured interval", status: "Configured" },
  { icon: LuLock, name: "Data encryption at rest", desc: "Status indicator only — no data is stored by this demo", status: "Demo" },
  { icon: LuServer, name: "Encryption in transit (TLS)", desc: "Provided by your hosting / reverse proxy, not by this UI", status: "Demo" },
  { icon: LuHistory, name: "Audit trail monitoring", desc: "Sample events below are static fictional records", status: "Demo" },
];

const PERM = {
  full: [LuCheck, "Full access"],
  limited: [LuMinus, "Limited / conditional"],
  none: [LuX, "No access"],
};

export default function Security({ timeoutMinutes = 15 }) {
  const [tab, setTab] = useState("Access logs");
  const [result, setResult] = useState("All");
  const [q, setQ] = useState("");
  const total = timeoutMinutes * 60;
  const [left, setLeft] = useState(total);

  // Demonstrates idle-timeout UX: resets on interaction, counts down otherwise.
  useEffect(() => {
    setLeft(total);
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    const reset = () => setLeft(total);
    ["mousemove", "keydown", "click"].forEach((e) => window.addEventListener(e, reset));
    return () => { clearInterval(t); ["mousemove", "keydown", "click"].forEach((e) => window.removeEventListener(e, reset)); };
  }, [total]);

  const logs = useMemo(() => accessLogs.filter((l) => (result === "All" || l.result === result) &&
    (!q || [l.user, l.role, l.activity, l.ip].some((f) => f.toLowerCase().includes(q.toLowerCase())))), [result, q]);

  const logCols = [
    { key: "user", label: "User ID", render: (r) => <span className="mono">{r.user}</span> },
    { key: "role", label: "User Role" },
    { key: "activity", label: "Activity" },
    { key: "ts", label: "Timestamp", className: "nowrap", render: (r) => <span className="mono">{r.ts}</span> },
    { key: "result", label: "Access Result", render: (r) => <Badge>{r.result}</Badge> },
    { key: "ip", label: "IP Address", render: (r) => <span className="mono">{r.ip}</span> },
  ];

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const failed = loginActivity.failed.reduce((a, b) => a + b, 0);

  return (
    <div className="page">
      <PageHeader crumbs={["Security & Compliance"]} title="Security & Compliance"
        description="Access governance, authentication posture and audit visibility" />

      <div className="disclaimer" role="note">
        <LuInfo size={18} />
        <div>
          <b>Static demonstration interface.</b> This page visualizes how a security and compliance console could look. HealthSync Pro (demo) does not
          itself provide authentication, encryption, access control or audit logging, and it is not certified or represented as HIPAA compliant.
          All users, sessions, IP addresses and events below are fictional.
        </div>
      </div>

      <div className="grid cols-4">
        <StatCard icon={LuShieldCheck} label="Configured controls" value="6" suffix="/ 6" foot="Shown in status panel" tone="teal" />
        <StatCard icon={LuMonitor} label="Active sessions" value={sessions.length} foot={`${sessions.filter((s) => !s.mfa).length} without MFA`} tone="navy" />
        <StatCard icon={LuKeyRound} label="Failed logins (today)" value={failed} delta="5 from one IP" deltaDir="flat" foot="" tone="warn" />
        <StatCard icon={LuShieldAlert} label="Open security alerts" value={securityAlerts.length} foot={`${securityAlerts.filter((a) => a.severity === "critical").length} critical`} tone="crit" />
      </div>

      <div className="grid cols-3 mt">
        <Card title="Security status panel" subtitle="Configured features (demonstration values)" className="span-2">
          <div className="grid cols-2" style={{ gap: "0 28px" }}>
            {[FEATURES.slice(0, 3), FEATURES.slice(3)].map((col, i) => (
              <div key={i}>
                {col.map((f) => (
                  <div className="sec-feature" key={f.name}>
                    <span className={`ic ${f.status === "Demo" ? "tone-navy" : "tone-teal"}`}><f.icon size={17} /></span>
                    <div><b>{f.name}</b><span>{f.desc}</span></div>
                    <Badge>{f.status}</Badge>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Automatic session timeout" subtitle={`Idle lock after ${timeoutMinutes} min · move the mouse to reset`}>
          <Ring value={(left / total) * 100} color={left < 60 ? "#dc2626" : "#0d9488"} size={132}>
            <span><b>{mm}:{ss}</b><small>until lock</small></span>
          </Ring>
          <p className="muted" style={{ fontSize: 12, textAlign: "center", margin: "12px 0 0" }}>Client-side countdown that illustrates idle-timeout UX. Change the interval in Settings.</p>
        </Card>
      </div>

      <div className="grid cols-3 mt">
        <Card title="Login activity" subtitle="Successful vs failed sign-ins today" className="span-2">
          <BarChart labels={loginActivity.labels} series={[{ label: "Successful", data: loginActivity.success, color: "#0d9488" }, { label: "Failed", data: loginActivity.failed, color: "#ef4444" }]} height={220} />
        </Card>
        <Card title="Security alerts" bodyClass="card-body flush">
          <ul className="list">
            {securityAlerts.map((a) => (
              <li key={a.title} className={`list-row alert-row ${a.severity}`}>
                <span className={`ic tone-${a.severity === "critical" ? "crit" : a.severity === "warning" ? "warn" : "sky"}`}>{a.severity === "info" ? <LuInfo size={15} /> : <LuTriangleAlert size={15} />}</span>
                <div className="txt"><b>{a.title}</b></div>
                <time>{a.time}</time>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt" bodyClass="">
        <Tabs tabs={["Access logs", "Role-based access", "Active sessions"]} value={tab} onChange={setTab} />
        {tab === "Access logs" && (
          <>
            <div className="toolbar">
              <div className="field"><LuSearch size={15} /><input className="input with-icon" placeholder="Search user, activity or IP" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search access logs" /></div>
              <div className="chips">{["All", "Success", "Flagged", "Denied"].map((r) => <button key={r} className={`chip ${result === r ? "active" : ""}`} onClick={() => setResult(r)}>{r}</button>)}</div>
              <button className="btn sm" style={{ marginLeft: "auto" }} onClick={() => downloadCsv("healthsync-access-log-demo.csv", logs, [
                { key: "user", label: "User ID" }, { key: "role", label: "Role" }, { key: "activity", label: "Activity" }, { key: "ts", label: "Timestamp" }, { key: "result", label: "Result" }, { key: "ip", label: "IP" }])}><LuDownload size={13} />Export</button>
            </div>
            <DataTable columns={logCols} rows={logs} rowKey={(r) => r.ts + r.user} pageSize={8} initialSort={{ key: "ts", dir: "desc" }}
              emptyTitle="No log entries" emptyMessage="No audit events match the current filters." />
          </>
        )}
        {tab === "Role-based access" && (
          <div className="table-wrap" style={{ paddingTop: 8 }}>
            <table className="data matrix">
              <thead><tr><th>Permission</th>{rbacMatrix.roles.map((r) => <th key={r}>{r}</th>)}</tr></thead>
              <tbody>
                {rbacMatrix.permissions.map((p) => (
                  <tr key={p.name}>
                    <td><b>{p.name}</b></td>
                    {p.grants.map((g, i) => {
                      const [Icon, label] = PERM[g];
                      return <td key={i}><span className={`perm ${g}`} title={label} aria-label={label}><Icon size={14} /></span></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-foot" style={{ justifyContent: "flex-start", gap: 16 }}>
              {Object.entries(PERM).map(([k, [Icon, label]]) => <span key={k} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span className={`perm ${k}`} style={{ width: 20, height: 20 }}><Icon size={11} /></span>{label}</span>)}
            </div>
          </div>
        )}
        {tab === "Active sessions" && (
          <div className="table-wrap" style={{ paddingTop: 8 }}>
            <table className="data">
              <thead><tr><th>User ID</th><th>Role</th><th>Device</th><th>Started</th><th>Idle</th><th>MFA</th></tr></thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.user}>
                    <td className="mono">{s.user}</td><td>{s.role}</td>
                    <td><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>{s.device.startsWith("Mobile") ? <LuSmartphone size={14} /> : <LuMonitor size={14} />}{s.device}</span></td>
                    <td>{s.started}</td><td>{s.idle}</td>
                    <td>{s.mfa ? <Badge tone="ok">Verified</Badge> : <Badge tone="warn">Not verified</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
