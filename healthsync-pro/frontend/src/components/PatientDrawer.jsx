import React, { useEffect, useRef, useState } from "react";
import {
  LuX, LuCalendar, LuMapPin, LuHospital, LuStethoscope, LuPill, LuTriangleAlert, LuClipboardList,
  LuHistory, LuStickyNote, LuHeartPulse, LuDroplets, LuWind, LuThermometer, LuGauge, LuActivity, LuPrinter,
} from "react-icons/lu";
import { Avatar, Badge, Tabs, Card, EmptyState } from "./ui.jsx";
import { LineChart } from "./charts/index.jsx";
import { ageFrom } from "../data/patients.js";
import { levelOf, RANGES, trend, hours } from "../lib/vitals.js";

export function VitalTile({ icon: Icon, k, value, display, unit }) {
  const level = levelOf(k, value);
  const r = RANGES[k];
  const range = [r.warnLow, r.warnHigh].every((v) => v != null) ? `${r.warnLow}–${r.warnHigh}` : r.warnLow != null ? `≥ ${r.warnLow}` : `≤ ${r.warnHigh}`;
  return (
    <div className={`vital-tile ${level}`}>
      <div className="vt-label">
        <Icon size={15} />{r.label}
        <span style={{ marginLeft: "auto" }}>{level === "critical" ? <span className="pulse" aria-label="critical" /> : null}</span>
      </div>
      <div className="vt-value">{display ?? value}<small>{unit ?? r.unit}</small></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="vt-range">Ref {range}</span>
        <Badge tone={level === "critical" ? "crit" : level === "elevated" ? "warn" : "ok"}>{level[0].toUpperCase() + level.slice(1)}</Badge>
      </div>
    </div>
  );
}

export function vitalTiles(v) {
  return [
    { icon: LuHeartPulse, k: "hr", value: v.hr },
    { icon: LuGauge, k: "sbp", value: v.sbp, display: `${v.sbp}/${v.dbp}`, unit: "mmHg" },
    { icon: LuWind, k: "rr", value: v.rr },
    { icon: LuDroplets, k: "spo2", value: v.spo2 },
    { icon: LuThermometer, k: "temp", value: v.temp },
    { icon: LuActivity, k: "pain", value: v.pain },
  ];
}

const TABS = ["Overview", "Vitals", "Medications", "Clinical Notes"];

export function PatientDrawer({ patient, onClose }) {
  const [tab, setTab] = useState("Overview");
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => { setTab("Overview"); }, [patient?.id]);
  useEffect(() => {
    if (!patient) return undefined;
    const k = (e) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [patient]);
  if (!patient) return null;
  const p = patient;
  const seed = parseInt(p.id.slice(-3), 10);
  const labels = hours(12, 12);

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Patient profile: ${p.name}`}>
        <div className="drawer-head" style={{ position: "relative" }}>
          <button className="icon-btn drawer-close" onClick={onClose} aria-label="Close profile"><LuX size={18} /></button>
          <div className="drawer-title">
            <Avatar name={p.name} size="lg" />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <h2>{p.name}</h2><Badge>{p.status}</Badge>
              </div>
              <div className="drawer-meta">
                <span className="mono">{p.mrn}</span>
                <span>{ageFrom(p.dob)} y · {p.gender}</span>
                <span><LuHospital size={13} />{p.department}</span>
                <span><LuMapPin size={13} />{p.room}</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, marginLeft: -22, marginRight: -22 }}>
            <Tabs tabs={TABS} value={tab} onChange={setTab} />
          </div>
        </div>

        <div className="drawer-body">
          {p.allergies.some((a) => a.severity === "Severe") && (
            <div className="allergy" style={{ marginBottom: 14 }}>
              <LuTriangleAlert size={18} color="#dc2626" />
              <span><b>Severe allergy alert:</b> {p.allergies.filter((a) => a.severity === "Severe").map((a) => `${a.name} (${a.reaction})`).join(", ")}</span>
            </div>
          )}

          {tab === "Overview" && (
            <div className="grid" style={{ gap: 14 }}>
              <div className="dx"><small>Primary diagnosis</small><div>{p.diagnosis}</div></div>
              <Card title="Demographics">
                <div className="kv">
                  <div><small>Patient ID</small><span className="mono">{p.id}</span></div>
                  <div><small>Date of birth</small><span>{p.dob}</span></div>
                  <div><small>Blood type</small><span>{p.blood}</span></div>
                  <div><small>Phone (fictional)</small><span>{p.phone}</span></div>
                  <div><small>Attending</small><span>{p.physician}</span></div>
                  <div><small>Admitted</small><span>{p.admitted}</span></div>
                  <div><small>Coverage</small><span>{p.insurance}</span></div>
                  <div><small>Code status</small><span>Full code</span></div>
                </div>
              </Card>
              <div className="grid cols-2" style={{ gap: 14 }}>
                <Card title="Allergies">
                  {p.allergies.length === 0 ? <Badge tone="ok">No known allergies</Badge> : p.allergies.map((a) => (
                    <div key={a.name} className={`allergy ${a.severity}`}>
                      <LuTriangleAlert size={15} />
                      <div style={{ flex: 1 }}><b>{a.name}</b><div className="muted" style={{ fontSize: 12 }}>{a.reaction}</div></div>
                      <Badge tone={a.severity === "Severe" ? "crit" : a.severity === "Moderate" ? "warn" : "neutral"}>{a.severity}</Badge>
                    </div>
                  ))}
                </Card>
                <Card title="Medical history">
                  <ul className="plan">{p.history.map((h) => <li key={h}>{h}</li>)}</ul>
                </Card>
              </div>
              <Card title="Treatment plan" actions={<span className="badge teal"><LuClipboardList size={12} /> Active</span>}>
                <ol className="plan">{p.plan.map((x) => <li key={x}>{x}</li>)}</ol>
              </Card>
              <Card title="Latest vital signs" subtitle="Most recent charted set">
                <div className="grid cols-3 vitals-grid" style={{ gap: 10 }}>
                  {vitalTiles(p.vitals).map((t) => <VitalTile key={t.k} {...t} />)}
                </div>
              </Card>
            </div>
          )}

          {tab === "Vitals" && (
            <div className="grid" style={{ gap: 14 }}>
              <div className="grid cols-3 vitals-grid" style={{ gap: 10 }}>
                {vitalTiles(p.vitals).map((t) => <VitalTile key={t.k} {...t} />)}
              </div>
              <Card title="Heart rate & SpO₂ — last 12 hours">
                <LineChart labels={labels} series={[
                  { label: "Heart rate (bpm)", data: trend(p.vitals.hr, 10, 12, seed), color: "#ef4444" },
                  { label: "SpO₂ (%)", data: trend(p.vitals.spo2, 3, 12, seed + 4).map((v) => Math.min(100, v)), color: "#0d9488" },
                ]} height={220} yMin={40} yMax={140} />
              </Card>
              <Card title="Blood pressure — last 12 hours">
                <LineChart labels={labels} series={[
                  { label: "Systolic", data: trend(p.vitals.sbp, 12, 12, seed + 1), color: "#2b4580", area: true },
                  { label: "Diastolic", data: trend(p.vitals.dbp, 8, 12, seed + 2), color: "#0ea5e9" },
                ]} height={200} yMin={30} yMax={200} unit=" mmHg" />
              </Card>
            </div>
          )}

          {tab === "Medications" && (
            <Card title="Current medications" subtitle={`${p.medications.length} active orders`} bodyClass="card-body flush">
              <div className="table-wrap">
                <table className="data">
                  <thead><tr><th>Medication</th><th>Dose / route</th><th>Frequency</th><th>Status</th></tr></thead>
                  <tbody>
                    {p.medications.map((m) => (
                      <tr key={m.name}>
                        <td><span className="cell-person"><span className="stat-icon tone-violet" style={{ width: 28, height: 28 }}><LuPill size={14} /></span><b>{m.name}</b></span></td>
                        <td>{m.dose}</td><td>{m.freq}</td>
                        <td>{m.dose === "Held" ? <Badge tone="warn">Held</Badge> : <Badge tone="ok">Active</Badge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "Clinical Notes" && (
            p.notes.length ? p.notes.map((n) => (
              <div className="note" key={n.time}>
                <div className="note-head"><span><b>{n.author}</b> · {n.role}</span><span><LuCalendar size={12} /> {n.time}</span></div>
                <div>{n.text}</div>
              </div>
            )) : <EmptyState icon={LuStickyNote} title="No notes yet" message="Clinical notes will appear here once documented." />
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => window.print()}><LuPrinter size={15} />Print summary</button>
            <span className="muted" style={{ fontSize: 12, alignSelf: "center" }}><LuHistory size={12} /> Fictional record for demonstration · Chart view logged to demo audit trail</span>
          </div>
        </div>
      </aside>
    </>
  );
}
