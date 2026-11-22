import React, { useEffect, useMemo, useState } from "react";
import { LuSearch, LuDownload, LuUserPlus, LuChevronRight, LuEye, LuFilter, LuX } from "react-icons/lu";
import { Card, PageHeader, Badge, Avatar, downloadCsv } from "../components/ui.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { PatientDrawer } from "../components/PatientDrawer.jsx";
import { patients, DEPARTMENTS, STATUSES, ageFrom } from "../data/patients.js";
import { overallLevel } from "../lib/vitals.js";

const mask = (mrn) => `MRN-•••${mrn.slice(-4)}`;

export default function Patients({ globalQuery = "", clearGlobalQuery, notify, openPatientId, maskMrn = false }) {
  const [q, setQ] = useState(globalQuery);
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");
  const [gender, setGender] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => { if (globalQuery) setQ(globalQuery); }, [globalQuery]);
  useEffect(() => {
    if (openPatientId) setProfile(patients.find((p) => p.id === openPatientId) || null);
  }, [openPatientId]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return patients.filter((p) =>
      (dept === "All" || p.department === dept) &&
      (status === "All" || p.status === status) &&
      (gender === "All" || p.gender === gender) &&
      (!s || [p.name, p.id, p.mrn, p.physician, p.diagnosis].some((f) => f.toLowerCase().includes(s))));
  }, [q, dept, status, gender]);

  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, patients.filter((p) => p.status === s).length])), []);
  const filtersOn = q || dept !== "All" || status !== "All" || gender !== "All";
  const reset = () => { setQ(""); setDept("All"); setStatus("All"); setGender("All"); clearGlobalQuery?.(); };

  const columns = [
    { key: "_x", label: "", sortable: false, render: (r) => (
      <button className="icon-btn" style={{ width: 28, height: 28 }} aria-label={expanded === r.id ? "Collapse" : "Expand"} aria-expanded={expanded === r.id}
        onClick={(e) => { e.stopPropagation(); setExpanded(expanded === r.id ? null : r.id); }}>
        <LuChevronRight size={16} className={`chev ${expanded === r.id ? "open" : ""}`} />
      </button>) },
    { key: "name", label: "Patient Name", render: (r) => (
      <span className="cell-person nowrap"><Avatar name={r.name} /><span><div className="cell-main">{r.name}</div><div className="cell-sub">{ageFrom(r.dob)} y · {r.room}</div></span></span>) },
    { key: "dob", label: "DOB / Gender", className: "nowrap", render: (r) => <span><div>{r.dob}</div><div className="cell-sub">{r.gender}</div></span> },
    { key: "mrn", label: "MRN / Patient ID", className: "nowrap", render: (r) => <span><div className="mono">{maskMrn ? mask(r.mrn) : r.mrn}</div><div className="cell-sub mono">{r.id}</div></span> },
    { key: "department", label: "Department" },
    { key: "physician", label: "Attending Physician", className: "nowrap" },
    { key: "admitted", label: "Admitted", className: "nowrap" },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
    { key: "_a", label: "", sortable: false, render: (r) => (
      <button className="btn sm" title="Open profile" aria-label={`Open profile for ${r.name}`} onClick={(e) => { e.stopPropagation(); setProfile(r); }}><LuEye size={14} /></button>) },
  ];

  const expandedView = (r) => {
    const lvl = overallLevel(r.vitals);
    return (
      <div className="expand-inner">
        <div><h4>Diagnosis</h4><div style={{ fontWeight: 600 }}>{r.diagnosis}</div></div>
        <div><h4>Allergies</h4>{r.allergies.length ? <ul>{r.allergies.map((a) => <li key={a.name}>{a.name} — {a.reaction}</li>)}</ul> : <span className="muted">NKDA</span>}</div>
        <div><h4>Active medications</h4><ul>{r.medications.slice(0, 3).map((m) => <li key={m.name}>{m.name} {m.dose}</li>)}</ul></div>
        <div>
          <h4>Latest vitals</h4>
          <div style={{ fontSize: 12.5 }}>HR {r.vitals.hr} · BP {r.vitals.sbp}/{r.vitals.dbp} · SpO₂ {r.vitals.spo2}% · T {r.vitals.temp}°C</div>
          <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}><Badge tone={lvl === "critical" ? "crit" : lvl === "elevated" ? "warn" : "ok"}>{lvl[0].toUpperCase() + lvl.slice(1)}</Badge><button className="link-btn" onClick={() => setProfile(r)}>Open full profile →</button></div>
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <PageHeader crumbs={["Patient Management"]} title="Patient Directory"
        description={`${patients.length} fictional demonstration records · click a row to open the patient profile`}
        actions={<>
          <button className="btn" onClick={() => downloadCsv("healthsync-patients-demo.csv", rows, [
            { key: "id", label: "Patient ID" }, { key: "name", label: "Name" }, { key: "dob", label: "DOB" }, { key: "gender", label: "Gender" },
            { key: "mrn", label: "MRN" }, { key: "department", label: "Department" }, { key: "physician", label: "Attending" },
            { key: "admitted", label: "Admitted" }, { key: "status", label: "Status" }])}><LuDownload size={15} />Export CSV</button>
          <button className="btn primary" onClick={() => notify("New-patient intake is disabled in this demo")}><LuUserPlus size={15} />Register patient</button>
        </>}
      />

      <Card bodyClass="">
        <div className="toolbar">
          <div className="field">
            <LuSearch size={15} />
            <input className="input with-icon" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, MRN, physician, diagnosis" aria-label="Search patients" />
          </div>
          <select className="select" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department">
            <option value="All">All departments</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className="select" value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Filter by gender">
            <option value="All">All genders</option><option>Female</option><option>Male</option>
          </select>
          {filtersOn && <button className="btn ghost sm" onClick={reset}><LuX size={14} />Clear filters</button>}
          <span className="muted" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}><LuFilter size={13} />{rows.length} result{rows.length === 1 ? "" : "s"}</span>
        </div>
        <div className="toolbar" style={{ paddingTop: 0 }}>
          <div className="chips" role="group" aria-label="Filter by status">
            <button className={`chip ${status === "All" ? "active" : ""}`} onClick={() => setStatus("All")}>All<span className="count">{patients.length}</span></button>
            {STATUSES.map((s) => (
              <button key={s} className={`chip ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>{s}<span className="count">{counts[s]}</span></button>
            ))}
          </div>
        </div>
        <DataTable columns={columns} rows={rows} pageSize={10} onRowClick={(r) => setProfile(r)} selectedKey={profile?.id}
          renderExpanded={expandedView} expandedKey={expanded}
          emptyTitle="No patients match your search"
          emptyMessage={q ? `No fictional records match “${q}”. Try a name such as “Hartwell” or an MRN.` : "Try removing a filter."}
          emptyAction={<button className="btn" onClick={reset}>Reset filters</button>} />
      </Card>

      <PatientDrawer patient={profile} onClose={() => setProfile(null)} />
    </div>
  );
}
