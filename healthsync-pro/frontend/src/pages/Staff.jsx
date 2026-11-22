import React, { useMemo, useState } from "react";
import { LuSearch, LuStethoscope, LuHeartPulse, LuWind, LuBuilding2, LuPhone, LuUserPlus, LuX } from "react-icons/lu";
import { Card, PageHeader, StatCard, Badge, Avatar } from "../components/ui.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { staff, ROLES } from "../data/staff.js";

const ROLE_META = {
  Physician: { icon: LuStethoscope, tone: "navy", color: "linear-gradient(135deg,#1f3566,#2b4580)" },
  "Registered Nurse": { icon: LuHeartPulse, tone: "teal", color: "linear-gradient(135deg,#0d9488,#14b8a6)" },
  "Respiratory Therapist": { icon: LuWind, tone: "sky", color: "linear-gradient(135deg,#0284c7,#0ea5e9)" },
  "Clinical Administrator": { icon: LuBuilding2, tone: "violet", color: "linear-gradient(135deg,#6d28d9,#8b5cf6)" },
};

export default function Staff({ notify }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const [avail, setAvail] = useState("All");
  const [shift, setShift] = useState("All");

  const shifts = [...new Set(staff.map((s) => s.shift))];
  const avails = [...new Set(staff.map((s) => s.availability))];
  const rows = useMemo(() => staff.filter((s) =>
    (role === "All" || s.role === role) && (avail === "All" || s.availability === avail) && (shift === "All" || s.shift === shift) &&
    (!q || [s.name, s.id, s.department, s.position].some((f) => f.toLowerCase().includes(q.toLowerCase())))), [q, role, avail, shift]);
  const filtersOn = q || role !== "All" || avail !== "All" || shift !== "All";

  const columns = [
    { key: "name", label: "Staff Name", render: (r) => (
      <span className="cell-person"><Avatar name={r.name} color={ROLE_META[r.role].color} /><span><div className="cell-main">{r.name}</div><div className="cell-sub">{r.role}</div></span></span>) },
    { key: "id", label: "Employee ID", render: (r) => <span className="mono">{r.id}</span> },
    { key: "department", label: "Department" },
    { key: "position", label: "Position" },
    { key: "shift", label: "Shift", className: "nowrap" },
    { key: "availability", label: "Availability", render: (r) => <Badge>{r.availability}</Badge> },
    { key: "assigned", label: "Assigned Patients", className: "num", render: (r) => r.assigned ? <b>{r.assigned}</b> : <span className="muted">—</span> },
    { key: "ext", label: "Ext.", render: (r) => <span className="muted" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><LuPhone size={12} />{r.ext}</span> },
  ];

  return (
    <div className="page">
      <PageHeader crumbs={["Staff Directory"]} title="Staff Directory" description="Clinical and administrative staff on the current roster · fictional demonstration data"
        actions={<button className="btn primary" onClick={() => notify("Staff onboarding is disabled in this demo")}><LuUserPlus size={15} />Add staff member</button>} />

      <div className="grid cols-4">
        {ROLES.map((r) => {
          const m = ROLE_META[r];
          const list = staff.filter((s) => s.role === r);
          const on = list.filter((s) => ["On Duty", "In Procedure", "On Break"].includes(s.availability)).length;
          return (
            <button key={r} className="card stat" style={{ textAlign: "left", border: role === r ? "1px solid var(--teal-500)" : undefined, boxShadow: role === r ? "0 0 0 3px rgba(20,184,166,.12)" : undefined }}
              onClick={() => setRole(role === r ? "All" : r)} aria-pressed={role === r}>
              <div className="stat-top"><span className="stat-label">{r}s</span><span className={`stat-icon tone-${m.tone}`}><m.icon size={19} /></span></div>
              <div className="stat-value">{list.length}</div>
              <div className="stat-foot"><span className="delta up">{on} on shift</span><span>{list.reduce((a, s) => a + s.assigned, 0) || "—"} patients assigned</span></div>
            </button>
          );
        })}
      </div>

      <Card className="mt" bodyClass="">
        <div className="toolbar">
          <div className="field">
            <LuSearch size={15} />
            <input className="input with-icon" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, department, position" aria-label="Search staff" />
          </div>
          <select className="select" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
            <option value="All">All roles</option>{ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select className="select" value={shift} onChange={(e) => setShift(e.target.value)} aria-label="Filter by shift">
            <option value="All">All shifts</option>{shifts.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select className="select" value={avail} onChange={(e) => setAvail(e.target.value)} aria-label="Filter by availability">
            <option value="All">Any availability</option>{avails.map((r) => <option key={r}>{r}</option>)}
          </select>
          {filtersOn && <button className="btn ghost sm" onClick={() => { setQ(""); setRole("All"); setAvail("All"); setShift("All"); }}><LuX size={14} />Clear</button>}
        </div>
        <DataTable columns={columns} rows={rows} pageSize={12} emptyTitle="No staff found" emptyMessage="No team members match these filters." />
      </Card>
    </div>
  );
}
